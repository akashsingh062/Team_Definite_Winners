import { SkillPriority, ILearningResource } from "./skill-gap";

export type LearningPace = "relaxed" | "moderate" | "intensive";

export type MilestoneStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export interface IRoadmapTask {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: Date | string | null;
}

export interface IRoadmapAssignment {
  title: string;
  objective: string;
  description: string;
  requiredSkills: string[];
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  expectedDeliverable: string;
  completionCriteria: string;
}

export interface IRoadmapMilestone {
  id: string;
  title: string;
  description: string;
  skillName: string;
  weekNumber: number;
  objectives: string[];
  tasks: IRoadmapTask[];
  resourceIds: string[];
  resources?: ILearningResource[];
  assignment?: IRoadmapAssignment;
  estimatedDuration: string;
  estimatedHours: number;
  priority: SkillPriority;
  status: MilestoneStatus;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  notes?: string;
}

export interface ISkillGapSnapshotItem {
  skillName: string;
  priority: SkillPriority;
  category: string;
}

export interface IRoadmap {
  _id?: string;
  id?: string;
  studentId: string;
  title: string;
  description: string;
  targetRole: string;
  selectedOpportunityIds: string[];
  skillGapSnapshot: ISkillGapSnapshotItem[];
  estimatedDuration: string;
  totalEstimatedHours: number;
  studyHoursPerDay: number;
  studyDaysPerWeek: number;
  learningPace: LearningPace;
  milestones: IRoadmapMilestone[];
  status: "active" | "completed" | "archived";
  progressPercentage: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IRoadmapGenerateInput {
  targetRole?: string;
  selectedOpportunityIds?: string[];
  studyHoursPerDay?: number;
  studyDaysPerWeek?: number;
  learningPace?: LearningPace;
  currentSkillLevel?: "beginner" | "intermediate" | "advanced";
  targetCompletionWeeks?: number;
}

export interface IRoadmapAdjustInput {
  newStudyHoursPerDay?: number;
  newStudyDaysPerWeek?: number;
  newLearningPace?: LearningPace;
  notes?: string;
}
