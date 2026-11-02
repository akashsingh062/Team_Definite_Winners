import { IRoadmapMilestone } from "@/types/roadmap";
import { StudentSkillProgress } from "@/models/StudentSkillProgress";

/**
 * Calculates overall roadmap progress percentage (0 - 100) based on milestone and task completions.
 */
export function calculateRoadmapProgress(milestones: IRoadmapMilestone[]): number {
  if (!milestones || milestones.length === 0) {
    return 0;
  }

  let totalScore = 0;

  for (const milestone of milestones) {
    if (milestone.status === "completed" || milestone.status === "skipped") {
      totalScore += 100;
      continue;
    }

    if (!milestone.tasks || milestone.tasks.length === 0) {
      if (milestone.status === "in_progress") {
        totalScore += 25;
      }
      continue;
    }

    const completedTasks = milestone.tasks.filter((t) => t.isCompleted).length;
    const taskScore = (completedTasks / milestone.tasks.length) * 100;

    totalScore += taskScore;
  }

  const overall = Math.round(totalScore / milestones.length);
  return Math.min(100, Math.max(0, overall));
}

/**
 * Synchronizes milestone status changes with StudentSkillProgress model.
 */
export async function syncSkillProgressWithMilestone(
  studentId: string,
  skillName: string,
  milestoneStatus: "not_started" | "in_progress" | "completed" | "skipped"
) {
  try {
    const existing = await StudentSkillProgress.findOne({
      studentId,
      skillName: { $regex: new RegExp(`^${skillName}$`, "i") },
    });

    const now = new Date();

    if (milestoneStatus === "completed") {
      if (existing) {
        existing.status = "completed";
        existing.completedAt = now;
        if (!existing.startedAt) existing.startedAt = now;
        await existing.save();
      } else {
        await StudentSkillProgress.create({
          studentId,
          skillName,
          status: "completed",
          startedAt: now,
          completedAt: now,
          notes: "Completed via personalized roadmap milestone",
        });
      }
    } else if (milestoneStatus === "in_progress") {
      if (existing) {
        if (existing.status === "not_started") {
          existing.status = "learning";
          existing.startedAt = now;
          await existing.save();
        }
      } else {
        await StudentSkillProgress.create({
          studentId,
          skillName,
          status: "learning",
          startedAt: now,
          notes: "Started via personalized roadmap milestone",
        });
      }
    }
  } catch (err) {
    console.warn(`Failed to sync StudentSkillProgress for ${skillName}:`, err);
  }
}
