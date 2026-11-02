import { connectToDatabase } from "@/lib/db/mongodb";
import { StudentProfile } from "@/models/StudentProfile";
import { Opportunity } from "@/models/Opportunity";
import { Resume } from "@/models/Resume";
import { Roadmap } from "@/models/Roadmap";
import { OpportunityExplanation } from "@/models/OpportunityExplanation";
import { ExplanationFeedback } from "@/models/ExplanationFeedback";
import { getOpportunityMatchDetail } from "@/services/matching/matching.service";
import { matchSkills } from "@/services/matching/skill-matcher";
import { evaluateEligibility } from "@/services/matching/eligibility-checker";
import {
  IOpportunityExplanation,
  IExplanationFeedbackInput,
  IExplanationFeedbackDoc,
  IMethodologyInfo,
  ICareerAlignmentExplanation,
  ILocationCompensationExplanation,
} from "@/types/explanation";
import { buildScoreBreakdown } from "./score-breakdown";
import {
  buildSkillsAnalysis,
  buildProjectAndExperienceEvidence,
} from "./evidence-builder";
import { buildEligibilityExplanation } from "./eligibility-explainer";
import { calculateDataCompleteness } from "./confidence-calculator";
import { buildImprovementSuggestions } from "./improvement-suggestions";
import { generateAiExplanation } from "./explanation-ai";
import { DEFAULT_SCORING_WEIGHTS } from "@/services/matching/score-calculator";

const CURRENT_SCORING_VERSION = "v1.0-stage4";

/**
 * Retrieves or builds a complete, evidence-based explainable recommendation for a student and opportunity.
 */
export async function getOpportunityExplanation(
  userId: string,
  opportunityId: string
): Promise<IOpportunityExplanation> {
  if (!userId || typeof userId !== "string") {
    throw new Error("Student ID is required to retrieve explanation (Unauthorized)");
  }
  if (!opportunityId || typeof opportunityId !== "string") {
    throw new Error("Opportunity ID is required to retrieve explanation");
  }

  await connectToDatabase();

  // 1. Fetch Student Profile
  const profile = await StudentProfile.findOne({ userId }).lean();
  if (!profile) {
    throw new Error("Student profile not found. Please complete profile setup first.");
  }

  // 2. Fetch Opportunity
  const opportunity = await Opportunity.findById(opportunityId).lean();
  if (!opportunity) {
    throw new Error("Opportunity not found or no longer available.");
  }

  // 3. Fetch Approved Resume & Active Roadmap if available
  const resume = await Resume.findOne({
    studentId: userId,
    $or: [{ analysisStatus: "approved" }, { isCurrent: true }],
  })
    .sort({ approvedAt: -1, createdAt: -1 })
    .lean();

  const activeRoadmap = await Roadmap.findOne({
    studentId: userId,
    status: "active",
  }).lean();

  // 4. Retrieve or compute Stage 4 Match Result (Deterministic Source of Truth)
  const matchResult = await getOpportunityMatchDetail(userId, opportunityId);
  if (!matchResult) {
    throw new Error("Opportunity match calculation failed or opportunity is not active.");
  }

  // Gather unique student skills
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
    opportunity.requiredSkills || [],
    opportunity.preferredSkills || []
  );

  const eligibilityResult = evaluateEligibility(profile, opportunity);

  // 5. Build Score Breakdown (Exact Stage 4 weights)
  const scoreBreakdown = buildScoreBreakdown(
    profile,
    opportunity,
    matchResult.componentScores,
    skillResult,
    eligibilityResult
  );

  // 6. Build Skills Analysis (Matching, Missing Required, Missing Preferred, Verification Needed)
  const {
    matchingSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    skillsRequiringVerification,
  } = buildSkillsAnalysis(profile, resume, opportunity, skillResult);

  // 7. Build Project & Experience Relevance
  const { projectRelevance, experienceRelevance, certificationsRelevance } =
    buildProjectAndExperienceEvidence(profile, resume, opportunity, skillResult);

  // 8. Build Eligibility Explanation
  const eligibilityExplanation = buildEligibilityExplanation(
    profile,
    opportunity,
    eligibilityResult
  );

  // 9. Calculate Data Completeness (Indicator separate from match score)
  const dataCompleteness = calculateDataCompleteness(
    profile,
    resume,
    opportunity
  );

  // 10. Build Career Alignment Explanation
  const studentRole = profile.careerPreferences?.preferredJobRole || "";
  const oppTitle = opportunity.title || "";
  const roleMatches = Boolean(
    studentRole &&
      studentRole
        .toLowerCase()
        .split(/\s+/)
        .some((tok) => tok.length > 2 && oppTitle.toLowerCase().includes(tok))
  );

  const studentPrefType = profile.careerPreferences?.preferredEmploymentType || "";
  const oppCategory = opportunity.category || "";
  const typeMatches = Boolean(
    studentPrefType &&
      ((studentPrefType.toLowerCase().includes("intern") && oppCategory === "internship") ||
        (studentPrefType.toLowerCase().includes("full") && oppCategory === "job"))
  );

  const careerAlignment: ICareerAlignmentExplanation = {
    roleAlignment: {
      studentRole: studentRole || "Not specified",
      opportunityTitle: oppTitle,
      matches: roleMatches,
      explanation: studentRole
        ? roleMatches
          ? `Your preferred role "${studentRole}" closely matches this position title.`
          : `Your preferred role is "${studentRole}", which differs from "${oppTitle}".`
        : "Preferred role not specified in your profile settings.",
    },
    employmentType: {
      studentPreference: studentPrefType || "Not specified",
      opportunityType: opportunity.employmentType || oppCategory,
      matches: typeMatches,
      explanation: studentPrefType
        ? typeMatches
          ? `Matches your preferred employment category (${studentPrefType}).`
          : `Opportunity category (${opportunity.employmentType || oppCategory}) differs from preferred ${studentPrefType}.`
        : "Employment preference not specified in your profile.",
    },
    industry: {
      studentPreference: "General software & technology",
      opportunityIndustry: opportunity.industry || "Technology",
      explanation: `Position operates within ${opportunity.industry || "Technology"} sector.`,
    },
    overallExplanation:
      roleMatches || typeMatches
        ? `Strong functional alignment with your stated career targets.`
        : `Opportunity is related to your technical skill set with open role transition potential.`,
  };

  // 11. Build Location & Compensation Explanation
  const studentWorkMode = profile.careerPreferences?.workPreference || "";
  const oppWorkMode = opportunity.workMode || "On-site";
  const studentLoc = profile.careerPreferences?.preferredLocation || "";
  const oppLoc = opportunity.location || "Office";

  const isCompensationDisclosed = Boolean(
    opportunity.stipend || opportunity.salaryRange || opportunity.isPaid
  );
  const compensationText = opportunity.stipend
    ? `Stipend: ${opportunity.stipend}`
    : opportunity.salaryRange
      ? `Salary: ${opportunity.salaryRange}`
      : opportunity.isPaid
        ? "Paid position (details during offer)"
        : opportunity.category === "skill-development"
          ? "Educational / Free learning opportunity"
          : "Not disclosed";

  const locationCompensation: ILocationCompensationExplanation = {
    workMode: {
      studentPreference: studentWorkMode || "Not specified",
      opportunityMode: oppWorkMode,
      matches:
        oppWorkMode.toLowerCase() === "remote" ||
        oppWorkMode.toLowerCase() === studentWorkMode.toLowerCase(),
      explanation:
        oppWorkMode.toLowerCase() === "remote"
          ? "Remote opportunity - open to students from anywhere with reliable internet."
          : studentWorkMode
            ? oppWorkMode.toLowerCase() === studentWorkMode.toLowerCase()
              ? `Matches your preferred work arrangement (${oppWorkMode}).`
              : `Opportunity is ${oppWorkMode}, while your preference is ${studentWorkMode}.`
            : `Opportunity is ${oppWorkMode}. Update profile to specify your preference.`,
    },
    location: {
      studentPreference: studentLoc || "Not specified",
      opportunityLocation: oppLoc,
      matches:
        oppWorkMode.toLowerCase() === "remote" ||
        (Boolean(studentLoc) && oppLoc.toLowerCase().includes(studentLoc.toLowerCase())),
      explanation:
        oppWorkMode.toLowerCase() === "remote"
          ? "Location flexible (Remote role)."
          : studentLoc
            ? `Opportunity is located in ${oppLoc}; your preferred location is ${studentLoc}.`
            : `Opportunity located in ${oppLoc}. Location preference not entered in profile.`,
    },
    compensation: {
      studentPreference: profile.careerPreferences?.expectedStipend || "Not specified",
      opportunityCompensation: compensationText,
      isDisclosed: isCompensationDisclosed,
      isPaid: Boolean(opportunity.isPaid),
      explanation: isCompensationDisclosed
        ? `Compensation structure: ${compensationText}.`
        : "Compensation details have not been disclosed by the poster.",
    },
  };

  // 12. Build Actionable Improvement Suggestions (Stage 5 & Stage 6 Links)
  const improvementSuggestions = buildImprovementSuggestions(
    profile,
    opportunity,
    missingRequiredSkills,
    missingPreferredSkills,
    eligibilityResult,
    activeRoadmap as any
  );

  // 13. AI Narrative Explanation (with 100% Deterministic Fallback)
  const { narrative, aiGenerated } = await generateAiExplanation(
    oppTitle,
    opportunity.companyName,
    matchResult.overallScore,
    scoreBreakdown,
    matchingSkills,
    missingRequiredSkills,
    eligibilityExplanation,
    dataCompleteness
  );

  // 14. Fetch Existing Feedback if any
  const existingFeedback = await ExplanationFeedback.findOne({
    userId,
    opportunityId,
  }).lean();

  const userFeedback = existingFeedback
    ? {
        feedbackType: existingFeedback.feedbackType,
        reason: existingFeedback.reason,
        comment: existingFeedback.comment,
        createdAt: existingFeedback.createdAt,
      }
    : undefined;

  const result: IOpportunityExplanation = {
    opportunityId,
    opportunity: {
      id: opportunityId,
      title: oppTitle,
      companyName: opportunity.companyName,
      companyLogo: opportunity.companyLogo,
      category: opportunity.category,
      workMode: opportunity.workMode,
      location: opportunity.location,
      stipend: opportunity.stipend,
      salaryRange: opportunity.salaryRange,
      isPaid: Boolean(opportunity.isPaid),
      applicationDeadline: opportunity.applicationDeadline,
      externalApplicationUrl: opportunity.externalApplicationUrl,
      minimumExperience: opportunity.minimumExperience,
      educationRequirements: opportunity.educationRequirements,
      minimumCGPA: opportunity.minimumCGPA,
    },
    overallScore: matchResult.overallScore,
    eligibilityStatus: matchResult.eligibilityStatus,
    scoringVersion: CURRENT_SCORING_VERSION,
    scoreBreakdown,
    skillsAnalysis: {
      matchingSkills,
      missingRequiredSkills,
      missingPreferredSkills,
      skillsRequiringVerification,
    },
    eligibilityExplanation,
    projectRelevance,
    experienceRelevance,
    certificationsRelevance,
    careerAlignment,
    locationCompensation,
    dataCompleteness,
    improvementSuggestions,
    narrativeExplanation: narrative,
    aiGenerated,
    userFeedback,
    calculatedAt: new Date().toISOString(),
  };

  // 15. Cache in OpportunityExplanation collection (upsert)
  try {
    await OpportunityExplanation.findOneAndUpdate(
      { userId, opportunityId },
      {
        matchResultReference: {
          score: matchResult.overallScore,
          calculatedAt: new Date(),
        },
        scoringVersion: CURRENT_SCORING_VERSION,
        structuredExplanation: {
          scoreBreakdown,
          skillsAnalysis: result.skillsAnalysis,
          eligibilityExplanation,
          projectRelevance,
          careerAlignment,
          locationCompensation,
        },
        generatedExplanation: narrative,
        dataCompleteness: dataCompleteness.completenessScore,
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.warn("Could not cache explanation document:", err);
  }

  return result;
}

/**
 * Saves or updates student feedback on an explanation.
 */
export async function saveExplanationFeedback(
  userId: string,
  input: IExplanationFeedbackInput
): Promise<IExplanationFeedbackDoc> {
  if (!userId) {
    throw new Error("Unauthorized: Student ID is required to submit feedback");
  }

  await connectToDatabase();

  const feedback = await ExplanationFeedback.findOneAndUpdate(
    { userId, opportunityId: input.opportunityId },
    {
      feedbackType: input.feedbackType,
      reason: input.reason,
      comment: input.comment,
      createdAt: new Date(),
    },
    { upsert: true, new: true }
  ).lean();

  return feedback as IExplanationFeedbackDoc;
}

/**
 * Returns methodology overview, exact scoring factors, weights, fairness guarantees, and limitations.
 */
export function getMethodologyInfo(): IMethodologyInfo {
  return {
    scoringVersion: CURRENT_SCORING_VERSION,
    factors: [
      {
        name: "Required Technical Skills",
        weight: Math.round(DEFAULT_SCORING_WEIGHTS.requiredSkills * 100),
        description:
          "Core non-negotiable competencies mandated by the employer or program organizer.",
      },
      {
        name: "Preferred Technical Skills",
        weight: Math.round(DEFAULT_SCORING_WEIGHTS.preferredSkills * 100),
        description:
          "Value-add technologies and bonus skills that increase candidate competitiveness.",
      },
      {
        name: "Projects & Practical Experience",
        weight: Math.round(DEFAULT_SCORING_WEIGHTS.projectsExperience * 100),
        description:
          "Demonstrated practical code and system implementation in portfolio projects and internships.",
      },
      {
        name: "Education & Eligibility",
        weight: Math.round(DEFAULT_SCORING_WEIGHTS.education * 100),
        description:
          "Degree, academic major, graduation timeline, and minimum CGPA compliance.",
      },
      {
        name: "Career Role Alignment",
        weight: Math.round(DEFAULT_SCORING_WEIGHTS.careerAlignment * 100),
        description:
          "Semantic overlap between student target career role and opportunity specifications.",
      },
      {
        name: "Work Mode & Location",
        weight: Math.round(DEFAULT_SCORING_WEIGHTS.locationWorkMode * 100),
        description:
          "Compatibility with student preferences for Remote, Hybrid, or On-site environments.",
      },
      {
        name: "Compensation Alignment",
        weight: Math.round(DEFAULT_SCORING_WEIGHTS.compensation * 100),
        description:
          "Stipend or salary compatibility with candidate career expectations.",
      },
    ],
    methodologyOverview:
      "CareerBridge AI employs a transparent, deterministic matching engine where mathematical formulas calculate candidate alignment directly from verified database records. AI models are used solely to generate student-friendly explanations and are strictly prohibited from calculating or modifying scores.",
    fairnessGuarantees: [
      "Pedigree Neutrality: University tier, college prestige, and institutional rankings are strictly omitted from matching calculations.",
      "Socio-Economic Blindness: Matching formulas do not process gender, caste, religion, family income, disability, or personal demographic attributes.",
      "Non-Punitive Incomplete Profile Policy: Missing optional profile information results in neutral evaluation rather than punitive zeroes.",
      "Deterministic Decision Boundaries: Match scores and eligibility criteria are computed mathematically with zero subjective bias.",
    ],
    limitations: [
      "This match score represents mathematical alignment between your available profile information and the opportunity requirements.",
      "It is not a probability of selection, an employer endorsement, or a guarantee of employment.",
      "Employers conduct their own independent evaluations, interviews, and hiring decisions.",
      "Calculations depend entirely on information entered on your profile and approved resume.",
    ],
  };
}

/**
 * Invalidates cached explanations for a student (e.g. after profile updates).
 */
export async function invalidateExplanationCache(
  userId: string,
  opportunityId?: string
): Promise<void> {
  await connectToDatabase();
  const query: any = { userId };
  if (opportunityId) {
    query.opportunityId = opportunityId;
  }
  await OpportunityExplanation.deleteMany(query);
}
