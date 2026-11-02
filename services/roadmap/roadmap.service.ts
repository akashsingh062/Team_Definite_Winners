import { connectToDatabase } from "@/lib/db/mongodb";
import { StudentProfile } from "@/models/StudentProfile";
import { Roadmap, RoadmapDocument } from "@/models/Roadmap";
import {
  IRoadmap,
  IRoadmapMilestone,
  IRoadmapGenerateInput,
  IRoadmapAdjustInput,
  MilestoneStatus,
} from "@/types/roadmap";
import { analyzeMultiOpportunityGap } from "../skill-gap/skill-gap.service";
import { generatePersonalizedRoadmapPlan } from "./roadmap-generator";
import {
  calculateRoadmapProgress,
  syncSkillProgressWithMilestone,
} from "./progress-calculator";
import { adjustActiveRoadmapMilestones } from "./roadmap-adjuster";
import { getLearningResourcesForSkill } from "../skill-gap/learning-resource.service";
import { ILearningResource } from "@/types/skill-gap";

export class RoadmapServiceError extends Error {
  constructor(message: string, public statusCode = 400) {
    super(message);
    this.name = "RoadmapServiceError";
  }
}

/**
 * Helper to populate learning resources for milestones.
 */
async function populateMilestoneResources(
  milestones: IRoadmapMilestone[]
): Promise<IRoadmapMilestone[]> {
  const populated: IRoadmapMilestone[] = [];

  for (const rawM of milestones) {
    const m = typeof (rawM as any).toObject === "function" ? (rawM as any).toObject() : rawM;
    let resources: ILearningResource[] = m.resources || [];
    if (!resources || resources.length === 0) {
      resources = await getLearningResourcesForSkill(m.skillName, 3);
    }
    populated.push({
      ...m,
      resources,
    });
  }

  return populated;
}

/**
 * Formats a Mongoose Roadmap document into an IRoadmap object.
 */
function formatRoadmapDoc(doc: RoadmapDocument): IRoadmap {
  const plain = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    _id: plain._id.toString(),
    id: plain._id.toString(),
    studentId: plain.studentId,
    title: plain.title,
    description: plain.description,
    targetRole: plain.targetRole,
    selectedOpportunityIds: plain.selectedOpportunityIds || [],
    skillGapSnapshot: plain.skillGapSnapshot || [],
    estimatedDuration: plain.estimatedDuration,
    totalEstimatedHours: plain.totalEstimatedHours,
    studyHoursPerDay: plain.studyHoursPerDay,
    studyDaysPerWeek: plain.studyDaysPerWeek,
    learningPace: plain.learningPace,
    milestones: plain.milestones || [],
    status: plain.status,
    progressPercentage: plain.progressPercentage,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
  };
}

/**
 * Generates and saves a personalized learning roadmap for a student based on Stage 5 skill gaps.
 */
export async function generatePersonalizedRoadmap(
  studentId: string,
  input: IRoadmapGenerateInput = {}
): Promise<IRoadmap> {
  if (!studentId || studentId.trim().length === 0) {
    throw new RoadmapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();

  // 1. Verify student profile
  const profile = await StudentProfile.findOne({ userId: studentId }).lean();
  if (!profile) {
    throw new RoadmapServiceError(
      "Student profile not found. Please complete your profile first.",
      404
    );
  }

  // 2. Run Stage 5 Skill Gap Analysis
  const opportunityIds = input.selectedOpportunityIds || [];
  const targetRole =
    input.targetRole ||
    profile.careerPreferences?.preferredJobRole ||
    "Software Engineer";

  const gapAnalysis = await analyzeMultiOpportunityGap(
    studentId,
    opportunityIds,
    targetRole
  );

  const missingSkills = gapAnalysis.missingSkills;
  if (!missingSkills || missingSkills.length === 0) {
    throw new RoadmapServiceError(
      "No skill gaps found for the selected opportunities. You already meet the technical requirements!",
      400
    );
  }

  // Cap at top 8 missing skills to keep the roadmap achievable
  const skillsToLearn = missingSkills.slice(0, 8).map((s) => ({
    skillName: s.skillName,
    priority: s.priority,
    category: s.category,
  }));

  const existingSkills = gapAnalysis.existingSkills.map((s) => s.name);

  // 3. Generate structured AI/deterministic roadmap plan
  const plan = await generatePersonalizedRoadmapPlan(
    targetRole,
    skillsToLearn,
    existingSkills,
    input
  );

  // 4. Archive previous active roadmaps for this student
  await Roadmap.updateMany(
    { studentId, status: "active" },
    { $set: { status: "archived" } }
  );

  // 5. Create new Roadmap document
  const studyHoursPerDay = input.studyHoursPerDay || 2;
  const studyDaysPerWeek = input.studyDaysPerWeek || 5;
  const learningPace = input.learningPace || "moderate";

  const initialProgress = calculateRoadmapProgress(plan.milestones);

  const createdDoc = await Roadmap.create({
    studentId,
    title: plan.title,
    description: plan.description,
    targetRole,
    selectedOpportunityIds: gapAnalysis.selectedOpportunities.map((o) => o.id),
    skillGapSnapshot: skillsToLearn,
    estimatedDuration: plan.estimatedDuration,
    totalEstimatedHours: plan.totalEstimatedHours,
    studyHoursPerDay,
    studyDaysPerWeek,
    learningPace,
    milestones: plan.milestones,
    status: "active",
    progressPercentage: initialProgress,
  });

  // Sync first milestone with StudentSkillProgress
  if (plan.milestones.length > 0) {
    await syncSkillProgressWithMilestone(
      studentId,
      plan.milestones[0].skillName,
      "in_progress"
    );
  }

  const formatted = formatRoadmapDoc(createdDoc);
  formatted.milestones = await populateMilestoneResources(formatted.milestones);
  return formatted;
}

/**
 * Returns the currently active roadmap for a student.
 */
export async function getActiveRoadmapForStudent(
  studentId: string
): Promise<IRoadmap | null> {
  if (!studentId) {
    throw new RoadmapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const doc = await Roadmap.findOne({ studentId, status: "active" })
    .sort({ createdAt: -1 });

  if (!doc) return null;

  const formatted = formatRoadmapDoc(doc);
  formatted.milestones = await populateMilestoneResources(formatted.milestones);
  return formatted;
}

/**
 * Returns a specific roadmap by ID verifying student ownership.
 */
export async function getRoadmapById(
  studentId: string,
  roadmapId: string
): Promise<IRoadmap> {
  if (!studentId) {
    throw new RoadmapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const doc = await Roadmap.findById(roadmapId);

  if (!doc) {
    throw new RoadmapServiceError("Roadmap not found", 404);
  }

  // Ownership verification
  if (doc.studentId !== studentId) {
    throw new RoadmapServiceError("Unauthorized to view this roadmap", 403);
  }

  const formatted = formatRoadmapDoc(doc);
  formatted.milestones = await populateMilestoneResources(formatted.milestones);
  return formatted;
}

/**
 * Updates a milestone's status or notes, recalculating progress and advancing milestones.
 */
export async function updateMilestoneStatus(
  studentId: string,
  roadmapId: string,
  milestoneId: string,
  input: { status?: MilestoneStatus; notes?: string }
): Promise<IRoadmap> {
  if (!studentId) {
    throw new RoadmapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const doc = await Roadmap.findById(roadmapId);

  if (!doc) {
    throw new RoadmapServiceError("Roadmap not found", 404);
  }

  if (doc.studentId !== studentId) {
    throw new RoadmapServiceError("Unauthorized to modify this roadmap", 403);
  }

  const milestoneIndex = doc.milestones.findIndex((m) => m.id === milestoneId);
  if (milestoneIndex === -1) {
    throw new RoadmapServiceError("Milestone not found in roadmap", 404);
  }

  const targetMilestone = doc.milestones[milestoneIndex];
  const now = new Date();

  if (input.notes !== undefined) {
    targetMilestone.notes = input.notes;
  }

  if (input.status) {
    targetMilestone.status = input.status;

    if (input.status === "in_progress") {
      if (!targetMilestone.startedAt) targetMilestone.startedAt = now;
      targetMilestone.completedAt = null;
      await syncSkillProgressWithMilestone(
        studentId,
        targetMilestone.skillName,
        "in_progress"
      );
    } else if (input.status === "completed") {
      if (!targetMilestone.startedAt) targetMilestone.startedAt = now;
      targetMilestone.completedAt = now;

      // Mark all tasks in this milestone as completed
      for (const t of targetMilestone.tasks) {
        t.isCompleted = true;
        if (!t.completedAt) t.completedAt = now;
      }

      await syncSkillProgressWithMilestone(
        studentId,
        targetMilestone.skillName,
        "completed"
      );

      // Advance next "not_started" milestone to "in_progress"
      const nextMilestone = doc.milestones.find((m) => m.status === "not_started");
      if (nextMilestone) {
        nextMilestone.status = "in_progress";
        nextMilestone.startedAt = now;
        await syncSkillProgressWithMilestone(
          studentId,
          nextMilestone.skillName,
          "in_progress"
        );
      }
    } else if (input.status === "skipped") {
      targetMilestone.completedAt = now;
    }
  }

  // Recalculate progress
  doc.progressPercentage = calculateRoadmapProgress(doc.milestones);
  if (doc.progressPercentage >= 100) {
    doc.status = "completed";
  }

  await doc.save();

  const formatted = formatRoadmapDoc(doc);
  formatted.milestones = await populateMilestoneResources(formatted.milestones);
  return formatted;
}

/**
 * Toggles completion for a specific task within a milestone.
 */
export async function toggleMilestoneTask(
  studentId: string,
  roadmapId: string,
  milestoneId: string,
  taskId: string,
  isCompleted: boolean
): Promise<IRoadmap> {
  if (!studentId) {
    throw new RoadmapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const doc = await Roadmap.findById(roadmapId);

  if (!doc) {
    throw new RoadmapServiceError("Roadmap not found", 404);
  }

  if (doc.studentId !== studentId) {
    throw new RoadmapServiceError("Unauthorized to modify this roadmap", 403);
  }

  const milestone = doc.milestones.find((m) => m.id === milestoneId);
  if (!milestone) {
    throw new RoadmapServiceError("Milestone not found in roadmap", 404);
  }

  const task = milestone.tasks.find((t) => t.id === taskId);
  if (!task) {
    throw new RoadmapServiceError("Task not found in milestone", 404);
  }

  task.isCompleted = isCompleted;
  task.completedAt = isCompleted ? new Date() : null;

  // If milestone was not_started, transition to in_progress
  if (isCompleted && milestone.status === "not_started") {
    milestone.status = "in_progress";
    milestone.startedAt = new Date();
    await syncSkillProgressWithMilestone(
      studentId,
      milestone.skillName,
      "in_progress"
    );
  }

  // If all tasks are completed, optionally mark milestone completed
  const allTasksDone = milestone.tasks.every((t) => t.isCompleted);
  if (allTasksDone && milestone.tasks.length > 0) {
    milestone.status = "completed";
    milestone.completedAt = new Date();
    await syncSkillProgressWithMilestone(
      studentId,
      milestone.skillName,
      "completed"
    );

    // Advance next milestone
    const nextMilestone = doc.milestones.find((m) => m.status === "not_started");
    if (nextMilestone) {
      nextMilestone.status = "in_progress";
      nextMilestone.startedAt = new Date();
      await syncSkillProgressWithMilestone(
        studentId,
        nextMilestone.skillName,
        "in_progress"
      );
    }
  }

  doc.progressPercentage = calculateRoadmapProgress(doc.milestones);
  if (doc.progressPercentage >= 100) {
    doc.status = "completed";
  }

  await doc.save();

  const formatted = formatRoadmapDoc(doc);
  formatted.milestones = await populateMilestoneResources(formatted.milestones);
  return formatted;
}

/**
 * Adjusts future milestones of an active roadmap preserving completed progress.
 */
export async function adjustActiveRoadmap(
  studentId: string,
  roadmapId: string,
  input: IRoadmapAdjustInput
): Promise<IRoadmap> {
  if (!studentId) {
    throw new RoadmapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const doc = await Roadmap.findById(roadmapId);

  if (!doc) {
    throw new RoadmapServiceError("Roadmap not found", 404);
  }

  if (doc.studentId !== studentId) {
    throw new RoadmapServiceError("Unauthorized to adjust this roadmap", 403);
  }

  const roadmapData = formatRoadmapDoc(doc);
  const adjusted = adjustActiveRoadmapMilestones(roadmapData, input);

  doc.milestones = adjusted.adjustedMilestones;
  doc.estimatedDuration = adjusted.newEstimatedDuration;
  doc.totalEstimatedHours = adjusted.newTotalEstimatedHours;
  doc.progressPercentage = adjusted.newProgressPercentage;

  if (input.newStudyHoursPerDay) doc.studyHoursPerDay = input.newStudyHoursPerDay;
  if (input.newStudyDaysPerWeek) doc.studyDaysPerWeek = input.newStudyDaysPerWeek;
  if (input.newLearningPace) doc.learningPace = input.newLearningPace;

  await doc.save();

  const formatted = formatRoadmapDoc(doc);
  formatted.milestones = await populateMilestoneResources(formatted.milestones);
  return formatted;
}

/**
 * Deletes a roadmap verifying student ownership.
 */
export async function deleteRoadmap(
  studentId: string,
  roadmapId: string
): Promise<boolean> {
  if (!studentId) {
    throw new RoadmapServiceError("Student ID is required", 401);
  }

  await connectToDatabase();
  const doc = await Roadmap.findById(roadmapId);

  if (!doc) {
    throw new RoadmapServiceError("Roadmap not found", 404);
  }

  if (doc.studentId !== studentId) {
    throw new RoadmapServiceError("Unauthorized to delete this roadmap", 403);
  }

  await Roadmap.findByIdAndDelete(roadmapId);
  return true;
}

export const roadmapService = {
  generatePersonalizedRoadmap,
  getActiveRoadmapForStudent,
  getRoadmapById,
  updateMilestoneStatus,
  toggleMilestoneTask,
  adjustActiveRoadmap,
  deleteRoadmap,
};
