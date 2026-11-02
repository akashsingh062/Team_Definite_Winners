import { connectToDatabase } from "@/lib/db/mongodb";
import { StudentProfile } from "@/models/StudentProfile";
import { Resume } from "@/models/Resume";
import { Opportunity } from "@/models/Opportunity";
import { StudentSkillProgress } from "@/models/StudentSkillProgress";
import {
  normalizeSkill,
  areSkillsEquivalent,
} from "../matching/skill-normalizer";
import {
  extractApprovedStudentSkills,
  hasSkill,
  calculateSkillCoverage,
} from "./skill-comparator";
import {
  analyzeMultiOpportunityDemand,
  inferSkillCategory,
} from "./demand-analyzer";
import { calculateSkillPriority } from "./priority-calculator";
import {
  getLearningResourcesForSkill,
  seedLearningResourcesIfNeeded,
} from "./learning-resource.service";
import { generateSkillGapExplanation } from "./gap-explanation.service";
import {
  ISkillGapAnalysisResult,
  ISkillGapItem,
  IStudentSkillProgress,
  SkillProgressStatus,
} from "@/types/skill-gap";
import { matchingService } from "../matching/matching.service";

export class SkillGapServiceError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
    this.name = "SkillGapServiceError";
  }
}

/**
 * Performs combined skill gap analysis across selected opportunities for a student.
 */
export async function analyzeMultiOpportunityGap(
  studentId: string,
  opportunityIds: string[],
  targetRole?: string
): Promise<ISkillGapAnalysisResult> {
  if (!studentId || studentId.trim().length === 0) {
    throw new SkillGapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  await seedLearningResourcesIfNeeded();

  // 1. Fetch Student Profile and Active Approved Resume
  const profile = await StudentProfile.findOne({ userId: studentId }).lean();
  if (!profile) {
    throw new SkillGapServiceError("Student profile not found. Please complete profile.", 404);
  }

  const resume = await Resume.findOne({
    studentId,
    isCurrent: true,
  }).lean();

  // 2. Extract approved student skills
  const existingSkills = extractApprovedStudentSkills(profile, resume);

  // 3. Fetch Selected Opportunities
  if (!opportunityIds || opportunityIds.length === 0) {
    // If no opportunities selected, fetch top recommended or published opportunities
    const defaultOpps = await Opportunity.find({
      status: "published",
      verificationStatus: "verified",
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();

    opportunityIds = defaultOpps.map((o) => o._id.toString());
  }

  const opportunities = await Opportunity.find({
    _id: { $in: opportunityIds },
    status: "published",
    verificationStatus: "verified",
  }).lean();

  if (!opportunities || opportunities.length === 0) {
    throw new SkillGapServiceError("No verified opportunities found for the selected IDs", 404);
  }

  // 4. Multi-Opportunity Demand Analysis
  const { skillDemands, commonSkills, totalOpportunities } =
    analyzeMultiOpportunityDemand(opportunities);

  // 5. Fetch student's current learning progress across all skills
  const progressDocs = await StudentSkillProgress.find({ studentId }).lean();
  const progressMap = new Map<string, IStudentSkillProgress>();
  for (const p of progressDocs) {
    progressMap.set(p.skillName.toLowerCase(), {
      _id: p._id.toString(),
      id: p._id.toString(),
      studentId: p.studentId,
      skillName: p.skillName,
      status: p.status as SkillProgressStatus,
      learningResourceIds: p.learningResourceIds || [],
      startedAt: p.startedAt,
      completedAt: p.completedAt,
      notes: p.notes,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    });
  }

  // 6. Identify Missing Skills and Classify Priority
  const missingSkills: ISkillGapItem[] = [];
  const allRequiredList: string[] = [];
  const allPreferredList: string[] = [];

  for (const opp of opportunities) {
    if (opp.requiredSkills) allRequiredList.push(...opp.requiredSkills);
    if (opp.preferredSkills) allPreferredList.push(...opp.preferredSkills);
  }

  const priorityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const demand of skillDemands) {
    const isPossessed = hasSkill(existingSkills, demand.skillName);
    if (!isPossessed) {
      const priority = calculateSkillPriority(demand, totalOpportunities);
      priorityCounts[priority]++;

      const skillProgress = progressMap.get(demand.skillName.toLowerCase());

      missingSkills.push({
        skillName: demand.skillName,
        category: demand.category,
        priority,
        demandPercentage: demand.demandPercentage,
        opportunityCount: demand.opportunityCount,
        requiredByCount: demand.requiredByCount,
        preferredByCount: demand.preferredByCount,
        isMandatory: demand.isMandatory,
        relevantOpportunities: demand.relevantOpportunities,
        progress: skillProgress,
      });
    }
  }

  // Sort missing skills by priority (critical -> high -> medium -> low), then demand percentage
  const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  missingSkills.sort((a, b) => {
    const diff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (diff !== 0) return diff;
    return b.demandPercentage - a.demandPercentage;
  });

  // 7. Calculate Skill Coverage
  const coverage = calculateSkillCoverage(
    existingSkills,
    allRequiredList,
    allPreferredList
  );

  const selectedOppMeta = opportunities.map((o) => ({
    id: o._id.toString(),
    title: o.title,
    companyName: o.companyName,
    category: o.category,
  }));

  const determinedTargetRole =
    targetRole ||
    profile.careerPreferences?.preferredJobRole ||
    opportunities[0]?.title ||
    "Software Engineering";

  return {
    targetRole: determinedTargetRole,
    selectedOpportunities: selectedOppMeta,
    existingSkills,
    missingSkills,
    commonSkills,
    coverage,
    priorityCounts,
    analyzedAt: new Date().toISOString(),
  };
}

/**
 * Returns student skill gap overview using recommended opportunities from Stage 4.
 */
export async function getStudentSkillGapOverview(
  studentId: string
): Promise<ISkillGapAnalysisResult> {
  if (!studentId) {
    throw new SkillGapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();

  // Try to use Stage 4 recommendations for contextual analysis
  let selectedIds: string[] = [];
  try {
    const recsResult = await matchingService.getRecommendationsForStudent(
      studentId,
      { limit: 4 }
    );
    if (recsResult && recsResult.items && recsResult.items.length > 0) {
      selectedIds = recsResult.items.map((r) => r.opportunityId);
    }
  } catch (err) {
    console.warn("Could not retrieve recommendations for skill gap, using default opportunities:", err);
  }

  return await analyzeMultiOpportunityGap(studentId, selectedIds);
}

/**
 * Returns deep-dive detail for a single skill gap with AI explanation, resources, and progress.
 */
export async function getSingleSkillGapDetail(
  studentId: string,
  rawSkillName: string
) {
  if (!studentId) {
    throw new SkillGapServiceError("Student ID is required", 401);
  }

  if (!rawSkillName) {
    throw new SkillGapServiceError("Skill name is required", 400);
  }

  await connectToDatabase();
  const canonical = normalizeSkill(rawSkillName);
  const category = inferSkillCategory(canonical);

  // 1. Fetch Profile and Active Resume
  const profile = await StudentProfile.findOne({ userId: studentId }).lean();
  const resume = await Resume.findOne({ studentId, isCurrent: true }).lean();
  const existingSkills = extractApprovedStudentSkills(profile, resume);
  const isPossessed = hasSkill(existingSkills, canonical);

  // 2. Fetch opportunities that require or prefer this skill
  const opportunities = await Opportunity.find({
    status: "published",
    verificationStatus: "verified",
    $or: [
      { requiredSkills: { $regex: new RegExp(`^${canonical}$`, "i") } },
      { preferredSkills: { $regex: new RegExp(`^${canonical}$`, "i") } },
    ],
  }).lean();

  // Also query demand stats across all published opportunities to calculate realistic market demand
  const totalVerifiedOpportunities = await Opportunity.countDocuments({
    status: "published",
    verificationStatus: "verified",
  });

  const relevantOpportunities = opportunities.map((o) => {
    const isRequired = (o.requiredSkills || []).some((s: string) =>
      areSkillsEquivalent(s, canonical)
    );
    return {
      id: o._id.toString(),
      title: o.title,
      companyName: o.companyName,
      isRequired,
    };
  });

  const requiredCount = relevantOpportunities.filter((o) => o.isRequired).length;
  const preferredCount = relevantOpportunities.length - requiredCount;
  const demandPercentage =
    totalVerifiedOpportunities > 0
      ? Math.round((opportunities.length / totalVerifiedOpportunities) * 100)
      : 0;

  // Priority classification
  const demandData = {
    skillName: canonical,
    category,
    opportunityCount: opportunities.length,
    requiredByCount: requiredCount,
    preferredByCount: preferredCount,
    demandPercentage,
    isMandatory: requiredCount > 0,
    relevantOpportunities,
  };

  const priority = calculateSkillPriority(demandData, totalVerifiedOpportunities);

  // 3. Learning Resources
  const learningResources = await getLearningResourcesForSkill(canonical);

  // 4. Progress record
  let progressDoc = await StudentSkillProgress.findOne({
    studentId,
    skillName: { $regex: new RegExp(`^${canonical}$`, "i") },
  }).lean();

  let progress: IStudentSkillProgress | null = null;
  if (progressDoc) {
    progress = {
      _id: progressDoc._id.toString(),
      id: progressDoc._id.toString(),
      studentId: progressDoc.studentId,
      skillName: progressDoc.skillName,
      status: progressDoc.status as SkillProgressStatus,
      learningResourceIds: progressDoc.learningResourceIds || [],
      startedAt: progressDoc.startedAt,
      completedAt: progressDoc.completedAt,
      notes: progressDoc.notes,
      createdAt: progressDoc.createdAt,
      updatedAt: progressDoc.updatedAt,
    };
  }

  // 5. Contextual Explanation (Gemini API with deterministic fallback)
  const targetRole = profile?.careerPreferences?.preferredJobRole;
  const explanation = await generateSkillGapExplanation(
    canonical,
    category,
    relevantOpportunities,
    targetRole
  );

  return {
    skillName: canonical,
    category,
    priority,
    isPossessed,
    demandPercentage,
    opportunityCount: opportunities.length,
    requiredByCount: requiredCount,
    preferredByCount: preferredCount,
    relevantOpportunities,
    explanation,
    learningResources,
    progress,
  };
}

/**
 * Retrieves all progress items tracked by the student.
 */
export async function getStudentProgressList(
  studentId: string
): Promise<IStudentSkillProgress[]> {
  if (!studentId) {
    throw new SkillGapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const docs = await StudentSkillProgress.find({ studentId })
    .sort({ updatedAt: -1 })
    .lean();

  return docs.map((d) => ({
    _id: d._id.toString(),
    id: d._id.toString(),
    studentId: d.studentId,
    skillName: d.skillName,
    status: d.status as SkillProgressStatus,
    learningResourceIds: d.learningResourceIds || [],
    startedAt: d.startedAt,
    completedAt: d.completedAt,
    notes: d.notes,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }));
}

/**
 * Creates or updates student's learning progress for a skill.
 */
export async function upsertStudentSkillProgress(
  studentId: string,
  input: {
    skillName: string;
    status: SkillProgressStatus;
    learningResourceIds?: string[];
    notes?: string;
  }
): Promise<IStudentSkillProgress> {
  if (!studentId) {
    throw new SkillGapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const canonical = normalizeSkill(input.skillName);

  let existing = await StudentSkillProgress.findOne({
    studentId,
    skillName: { $regex: new RegExp(`^${canonical}$`, "i") },
  });

  const now = new Date();
  let startedAt = existing?.startedAt || null;
  let completedAt = existing?.completedAt || null;

  if (input.status === "learning" && !startedAt) {
    startedAt = now;
  } else if (input.status === "completed") {
    if (!startedAt) startedAt = now;
    completedAt = now;
  } else if (input.status !== "completed") {
    completedAt = null;
  }

  if (existing) {
    existing.status = input.status;
    if (input.learningResourceIds !== undefined) {
      existing.learningResourceIds = input.learningResourceIds;
    }
    if (input.notes !== undefined) {
      existing.notes = input.notes;
    }
    existing.startedAt = startedAt;
    existing.completedAt = completedAt;
    await existing.save();

    return {
      _id: existing._id.toString(),
      id: existing._id.toString(),
      studentId: existing.studentId,
      skillName: existing.skillName,
      status: existing.status as SkillProgressStatus,
      learningResourceIds: existing.learningResourceIds,
      startedAt: existing.startedAt,
      completedAt: existing.completedAt,
      notes: existing.notes,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    };
  }

  const created = await StudentSkillProgress.create({
    studentId,
    skillName: canonical,
    status: input.status,
    learningResourceIds: input.learningResourceIds || [],
    notes: input.notes || "",
    startedAt,
    completedAt,
  });

  return {
    _id: created._id.toString(),
    id: created._id.toString(),
    studentId: created.studentId,
    skillName: created.skillName,
    status: created.status as SkillProgressStatus,
    learningResourceIds: created.learningResourceIds,
    startedAt: created.startedAt,
    completedAt: created.completedAt,
    notes: created.notes,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
  };
}

/**
 * Updates a specific progress item verifying ownership.
 */
export async function updateStudentSkillProgress(
  studentId: string,
  progressId: string,
  input: {
    status?: SkillProgressStatus;
    learningResourceIds?: string[];
    notes?: string;
  }
): Promise<IStudentSkillProgress> {
  if (!studentId) {
    throw new SkillGapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const existing = await StudentSkillProgress.findById(progressId);

  if (!existing) {
    throw new SkillGapServiceError("Progress record not found", 404);
  }

  // Ownership verification: A student can only edit their own progress
  if (existing.studentId !== studentId) {
    throw new SkillGapServiceError("Unauthorized: You do not have permission to modify this progress item", 403);
  }

  const now = new Date();
  if (input.status) {
    existing.status = input.status;
    if (input.status === "learning" && !existing.startedAt) {
      existing.startedAt = now;
    } else if (input.status === "completed") {
      if (!existing.startedAt) existing.startedAt = now;
      existing.completedAt = now;
    } else if (input.status !== "completed") {
      existing.completedAt = null;
    }
  }

  if (input.learningResourceIds !== undefined) {
    existing.learningResourceIds = input.learningResourceIds;
  }

  if (input.notes !== undefined) {
    existing.notes = input.notes;
  }

  await existing.save();

  return {
    _id: existing._id.toString(),
    id: existing._id.toString(),
    studentId: existing.studentId,
    skillName: existing.skillName,
    status: existing.status as SkillProgressStatus,
    learningResourceIds: existing.learningResourceIds,
    startedAt: existing.startedAt,
    completedAt: existing.completedAt,
    notes: existing.notes,
    createdAt: existing.createdAt,
    updatedAt: existing.updatedAt,
  };
}

/**
 * Deletes a specific progress item verifying ownership.
 */
export async function deleteStudentSkillProgress(
  studentId: string,
  progressId: string
): Promise<boolean> {
  if (!studentId) {
    throw new SkillGapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const existing = await StudentSkillProgress.findById(progressId);

  if (!existing) {
    throw new SkillGapServiceError("Progress record not found", 404);
  }

  // Ownership verification
  if (existing.studentId !== studentId) {
    throw new SkillGapServiceError("Unauthorized: You do not have permission to delete this progress item", 403);
  }

  await StudentSkillProgress.findByIdAndDelete(progressId);
  return true;
}

export const skillGapService = {
  analyzeMultiOpportunityGap,
  getStudentSkillGapOverview,
  getSingleSkillGapDetail,
  getStudentProgressList,
  upsertStudentSkillProgress,
  updateStudentSkillProgress,
  deleteStudentSkillProgress,
};

