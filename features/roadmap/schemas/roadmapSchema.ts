import { z } from "zod";

export const learningPaceEnum = z.enum(["relaxed", "moderate", "intensive"]);
export const milestoneStatusEnum = z.enum([
  "not_started",
  "in_progress",
  "completed",
  "skipped",
]);

export const generateRoadmapSchema = z.object({
  targetRole: z.string().optional(),
  selectedOpportunityIds: z.array(z.string()).default([]),
  studyHoursPerDay: z.coerce.number().min(1, "Minimum 1 hour per day").max(12, "Maximum 12 hours per day").default(2),
  studyDaysPerWeek: z.coerce.number().min(1, "Minimum 1 day per week").max(7, "Maximum 7 days per week").default(5),
  learningPace: learningPaceEnum.default("moderate"),
  currentSkillLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  targetCompletionWeeks: z.coerce.number().min(1).max(52).optional(),
});

export type GenerateRoadmapInput = z.infer<typeof generateRoadmapSchema>;

export const updateMilestoneSchema = z.object({
  status: milestoneStatusEnum.optional(),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional(),
});

export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;

export const toggleTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  isCompleted: z.boolean(),
});

export type ToggleTaskInput = z.infer<typeof toggleTaskSchema>;

export const adjustRoadmapSchema = z.object({
  newStudyHoursPerDay: z.coerce.number().min(1).max(12).optional(),
  newStudyDaysPerWeek: z.coerce.number().min(1).max(7).optional(),
  newLearningPace: learningPaceEnum.optional(),
  notes: z.string().max(1000).optional(),
});

export type AdjustRoadmapInput = z.infer<typeof adjustRoadmapSchema>;

// Schema to validate structured Gemini AI output
export const geminiMilestoneOutputSchema = z.object({
  skillName: z.string().min(1),
  title: z.string().min(2),
  description: z.string().min(5),
  estimatedHours: z.number().min(1),
  objectives: z.array(z.string()).min(1),
  tasks: z.array(
    z.object({
      title: z.string().min(2),
      description: z.string().optional(),
    })
  ).min(2),
  assignment: z.object({
    title: z.string().min(2),
    objective: z.string().min(5),
    description: z.string().min(5),
    difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
    expectedDeliverable: z.string().min(2),
    completionCriteria: z.string().min(2),
  }),
});

export const geminiRoadmapAiOutputSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  milestones: z.array(geminiMilestoneOutputSchema).min(1),
});
