import {
  IRoadmap,
  IRoadmapMilestone,
  IRoadmapAdjustInput,
  LearningPace,
} from "@/types/roadmap";
import { calculateRoadmapProgress } from "./progress-calculator";

/**
 * Adjusts future milestones of an active roadmap while strictly preserving completed milestones.
 */
export function adjustActiveRoadmapMilestones(
  roadmap: IRoadmap,
  input: IRoadmapAdjustInput
): {
  adjustedMilestones: IRoadmapMilestone[];
  newEstimatedDuration: string;
  newTotalEstimatedHours: number;
  newProgressPercentage: number;
} {
  const newStudyHoursPerDay = input.newStudyHoursPerDay || roadmap.studyHoursPerDay || 2;
  const newStudyDaysPerWeek = input.newStudyDaysPerWeek || roadmap.studyDaysPerWeek || 5;
  const newLearningPace = input.newLearningPace || roadmap.learningPace || "moderate";

  const paceMultiplier =
    newLearningPace === "relaxed" ? 0.8 : newLearningPace === "intensive" ? 1.3 : 1.0;

  const completedMilestones: IRoadmapMilestone[] = [];
  const pendingMilestones: IRoadmapMilestone[] = [];

  for (const m of roadmap.milestones) {
    if (m.status === "completed" || m.status === "skipped") {
      completedMilestones.push(m);
    } else {
      pendingMilestones.push(m);
    }
  }

  // Calculate starting week for pending milestones
  let nextWeekNumber = completedMilestones.length > 0
    ? Math.max(...completedMilestones.map((m) => m.weekNumber || 1)) + 1
    : 1;

  let totalHours = completedMilestones.reduce((sum, m) => sum + (m.estimatedHours || 0), 0);

  const adjustedPendingMilestones: IRoadmapMilestone[] = pendingMilestones.map((m, idx) => {
    const baseHours =
      m.priority === "critical" ? 14 : m.priority === "high" ? 10 : 8;
    const estimatedHours = Math.round(baseHours * paceMultiplier);
    totalHours += estimatedHours;

    const weekNumber = nextWeekNumber + idx;

    return {
      ...m,
      weekNumber,
      estimatedHours,
      estimatedDuration: `${estimatedHours} hours (Week ${weekNumber})`,
      title: `Week ${weekNumber}: Master ${m.skillName}`,
    };
  });

  const combinedMilestones = [...completedMilestones, ...adjustedPendingMilestones];
  const newProgressPercentage = calculateRoadmapProgress(combinedMilestones);
  const totalWeeks = combinedMilestones.length;
  const newEstimatedDuration = `${totalWeeks} weeks (${totalHours} hours total)`;

  return {
    adjustedMilestones: combinedMilestones,
    newEstimatedDuration,
    newTotalEstimatedHours: totalHours,
    newProgressPercentage,
  };
}

