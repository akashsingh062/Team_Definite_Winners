import { connectToDatabase } from "@/lib/db/mongodb";
import { StudentProfile } from "@/models/StudentProfile";
import { Opportunity } from "@/models/Opportunity";
import {
  IOpportunityMatchResult,
  IMatchingFilters,
  IMatchingSummary,
} from "@/types/matching";
import { IOpportunity } from "@/types/opportunity";
import { IStudentProfile } from "@/types/student";
import { matchSkills } from "./skill-matcher";
import { evaluateEligibility } from "./eligibility-checker";
import { calculateMatchScores } from "./score-calculator";
import { generateDeterministicExplanation } from "./explanation-generator";
import { rankAndFilterOpportunities } from "./opportunity-ranker";

// In-memory cache with 5-minute TTL to prevent recalculating identical results on rapid refreshes
interface CacheEntry {
  timestamp: number;
  results: IOpportunityMatchResult[];
}

const matchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Invalidates cached matching results for a student (e.g. after profile updates).
 */
export function invalidateStudentMatchCache(studentId?: string) {
  if (studentId) {
    matchCache.delete(studentId);
  } else {
    matchCache.clear();
  }
}

/**
 * Computes all opportunity matches for a student.
 */
async function computeAllMatchesForStudent(
  studentId: string
): Promise<IOpportunityMatchResult[]> {
  if (!studentId || typeof studentId !== "string" || studentId.trim().length === 0) {
    throw new Error("Student ID is required to calculate recommendations (Unauthorized)");
  }

  await connectToDatabase();

  // 1. Retrieve Student Profile
  const profile = await StudentProfile.findOne({ userId: studentId }).lean();
  if (!profile) {
    throw new Error("Profile not found or incomplete: Student profile does not exist");
  }

  // 2. Retrieve Active, Verified, Published Opportunities
  // Excludes draft, pending, rejected, and expired opportunities
  const now = new Date();
  const opportunities = await Opportunity.find({
    status: "published",
    verificationStatus: "verified",
    $or: [
      { applicationDeadline: { $exists: false } },
      { applicationDeadline: null },
      { applicationDeadline: { $gte: now } },
    ],
  }).lean();

  if (!opportunities || opportunities.length === 0) {
    return [];
  }

  // Gather all unique demonstrated skills: from profile skills + portfolio project tech
  const skillSet = new Set<string>();
  for (const s of profile.skills || []) {
    if (s.name) skillSet.add(s.name);
  }
  for (const p of profile.projects || []) {
    for (const t of p.technologies || []) {
      if (t) skillSet.add(t);
    }
  }
  const allStudentSkills = Array.from(skillSet);

  // 3. Compute Deterministic Match for each Opportunity
  const calculatedResults: IOpportunityMatchResult[] = [];

  for (const opp of opportunities) {
    const oppId = String(opp._id);

    // Skill comparison
    const skillResult = matchSkills(
      allStudentSkills,
      opp.requiredSkills || [],
      opp.preferredSkills || []
    );

    // Eligibility check
    const eligibilityResult = evaluateEligibility(
      profile as Partial<IStudentProfile>,
      opp as Partial<IOpportunity>
    );

    // Scoring calculation
    const scoreResult = calculateMatchScores(
      profile as Partial<IStudentProfile>,
      opp as Partial<IOpportunity>,
      skillResult,
      eligibilityResult
    );

    // Explanation generation
    const explanationResult = generateDeterministicExplanation(
      profile as Partial<IStudentProfile>,
      opp as Partial<IOpportunity>,
      skillResult,
      eligibilityResult,
      scoreResult.componentScores,
      scoreResult.relevantProjects
    );

    calculatedResults.push({
      opportunityId: oppId,
      opportunity: {
        _id: oppId,
        id: oppId,
        title: opp.title,
        companyName: opp.companyName,
        companyLogo: opp.companyLogo,
        description: opp.description,
        category: opp.category,
        employmentType: opp.employmentType,
        industry: opp.industry,
        workMode: opp.workMode,
        location: opp.location,
        stipend: opp.stipend,
        salaryRange: opp.salaryRange,
        isPaid: opp.isPaid,
        duration: opp.duration,
        applicationDeadline: opp.applicationDeadline,
        externalApplicationUrl: opp.externalApplicationUrl,
        applicationInstructions: opp.applicationInstructions,
        requiredSkills: opp.requiredSkills || [],
        preferredSkills: opp.preferredSkills || [],
        minimumExperience: opp.minimumExperience,
        educationRequirements: opp.educationRequirements,
        minimumCGPA: opp.minimumCGPA,
        benefits: opp.benefits || [],
        publishedAt: opp.publishedAt || opp.createdAt,
      },
      overallScore: scoreResult.overallScore,
      eligibilityStatus: eligibilityResult.status,
      componentScores: scoreResult.componentScores,
      matchedSkills: skillResult.matchedRequiredSkills.concat(
        skillResult.matchedPreferredSkills
      ),
      missingRequiredSkills: skillResult.missingRequiredSkills,
      missingPreferredSkills: skillResult.missingPreferredSkills,
      eligibilityIssues: eligibilityResult.issues,
      strengths: explanationResult.strengths,
      improvementAreas: explanationResult.improvementAreas,
      explanation: explanationResult.explanation,
      dataCompleteness: scoreResult.dataCompleteness,
      relevantProjects: scoreResult.relevantProjects,
      calculatedAt: new Date().toISOString(),
    });
  }

  // Cache results
  matchCache.set(studentId, {
    timestamp: Date.now(),
    results: calculatedResults,
  });

  return calculatedResults;
}

/**
 * Gets cached matches or recalculates on demand.
 */
async function getCachedOrComputedMatches(
  studentId: string,
  forceRefresh = false
): Promise<IOpportunityMatchResult[]> {
  if (!forceRefresh) {
    const cached = matchCache.get(studentId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.results;
    }
  }

  return await computeAllMatchesForStudent(studentId);
}

/**
 * Returns ranked, filtered, and paginated recommendations for a student.
 */
export async function getRecommendationsForStudent(
  studentId: string,
  filters: IMatchingFilters = {},
  forceRefresh = false
) {
  const allMatches = await getCachedOrComputedMatches(studentId, forceRefresh);
  return rankAndFilterOpportunities(allMatches, filters);
}

/**
 * Returns deep-dive match analysis for a single opportunity and student.
 */
export async function getOpportunityMatchDetail(
  studentId: string,
  opportunityId: string
): Promise<IOpportunityMatchResult | null> {
  const allMatches = await getCachedOrComputedMatches(studentId);
  const match = allMatches.find((m) => m.opportunityId === opportunityId);

  if (match) return match;

  // If not found in cache, calculate specifically
  await connectToDatabase();
  const profile = await StudentProfile.findOne({ userId: studentId }).lean();
  const opp = await Opportunity.findById(opportunityId).lean();

  if (!profile || !opp) return null;

  // Check if opportunity is eligible for recommendation
  if (
    opp.status !== "published" ||
    opp.verificationStatus !== "verified" ||
    (opp.applicationDeadline && new Date(opp.applicationDeadline) < new Date())
  ) {
    return null;
  }

  const skillSet = new Set<string>();
  for (const s of profile.skills || []) {
    if (s.name) skillSet.add(s.name);
  }
  for (const p of profile.projects || []) {
    for (const t of p.technologies || []) {
      if (t) skillSet.add(t);
    }
  }
  const allStudentSkills = Array.from(skillSet);

  const skillResult = matchSkills(
    allStudentSkills,
    opp.requiredSkills || [],
    opp.preferredSkills || []
  );

  const eligibilityResult = evaluateEligibility(
    profile as Partial<IStudentProfile>,
    opp as Partial<IOpportunity>
  );

  const scoreResult = calculateMatchScores(
    profile as Partial<IStudentProfile>,
    opp as Partial<IOpportunity>,
    skillResult,
    eligibilityResult
  );

  const explanationResult = generateDeterministicExplanation(
    profile as Partial<IStudentProfile>,
    opp as Partial<IOpportunity>,
    skillResult,
    eligibilityResult,
    scoreResult.componentScores,
    scoreResult.relevantProjects
  );

  const oppId = String(opp._id);

  return {
    opportunityId: oppId,
    opportunity: {
      _id: oppId,
      id: oppId,
      title: opp.title,
      companyName: opp.companyName,
      companyLogo: opp.companyLogo,
      description: opp.description,
      category: opp.category,
      employmentType: opp.employmentType,
      industry: opp.industry,
      workMode: opp.workMode,
      location: opp.location,
      stipend: opp.stipend,
      salaryRange: opp.salaryRange,
      isPaid: opp.isPaid,
      duration: opp.duration,
      applicationDeadline: opp.applicationDeadline,
      externalApplicationUrl: opp.externalApplicationUrl,
      applicationInstructions: opp.applicationInstructions,
      requiredSkills: opp.requiredSkills || [],
      preferredSkills: opp.preferredSkills || [],
      minimumExperience: opp.minimumExperience,
      educationRequirements: opp.educationRequirements,
      minimumCGPA: opp.minimumCGPA,
      benefits: opp.benefits || [],
      publishedAt: opp.publishedAt || opp.createdAt,
    },
    overallScore: scoreResult.overallScore,
    eligibilityStatus: eligibilityResult.status,
    componentScores: scoreResult.componentScores,
    matchedSkills: skillResult.matchedRequiredSkills.concat(
      skillResult.matchedPreferredSkills
    ),
    missingRequiredSkills: skillResult.missingRequiredSkills,
    missingPreferredSkills: skillResult.missingPreferredSkills,
    eligibilityIssues: eligibilityResult.issues,
    strengths: explanationResult.strengths,
    improvementAreas: explanationResult.improvementAreas,
    explanation: explanationResult.explanation,
    dataCompleteness: scoreResult.dataCompleteness,
    relevantProjects: scoreResult.relevantProjects,
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Returns a high-level summary of matching opportunities for the student.
 */
export async function getStudentMatchingSummary(
  studentId: string
): Promise<IMatchingSummary> {
  const allMatches = await getCachedOrComputedMatches(studentId);

  let eligibleCount = 0;
  let potentiallyEligibleCount = 0;
  let topScore = 0;
  let scoreSum = 0;

  const byCategory = {
    internship: 0,
    job: 0,
    "skill-development": 0,
  };

  for (const match of allMatches) {
    if (match.eligibilityStatus === "eligible") {
      eligibleCount++;
    } else if (match.eligibilityStatus === "potentially_eligible") {
      potentiallyEligibleCount++;
    }

    if (match.overallScore > topScore) {
      topScore = match.overallScore;
    }
    scoreSum += match.overallScore;

    const cat = match.opportunity.category;
    if (cat in byCategory) {
      byCategory[cat]++;
    }
  }

  const averageScore =
    allMatches.length > 0 ? Math.round(scoreSum / allMatches.length) : 0;

  return {
    totalRecommendations: allMatches.length,
    eligibleCount,
    potentiallyEligibleCount,
    topScore,
    averageScore,
    byCategory,
  };
}

export const matchingService = {
  getRecommendationsForStudent,
  getRecommendationDetail: getOpportunityMatchDetail,
  getMatchingSummary: getStudentMatchingSummary,
  invalidateCache: invalidateStudentMatchCache,
};

