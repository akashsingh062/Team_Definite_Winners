import { z } from "zod";

export const multiOpportunityAnalysisSchema = z.object({
  opportunityIds: z
    .array(z.string().min(1, "Opportunity ID cannot be empty"))
    .min(1, "Select at least one opportunity to perform skill gap analysis")
    .max(10, "You can select up to 10 opportunities for combined analysis"),
  targetRole: z.string().optional(),
});

export type MultiOpportunityAnalysisInput = z.infer<
  typeof multiOpportunityAnalysisSchema
>;

export const skillProgressStatusEnum = z.enum([
  "not_started",
  "learning",
  "practicing",
  "completed",
]);

export const skillProgressCreateSchema = z.object({
  skillName: z.string().min(1, "Skill name is required").trim(),
  status: skillProgressStatusEnum.default("not_started"),
  learningResourceIds: z.array(z.string()).default([]),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional(),
});

export type SkillProgressCreateInput = z.infer<typeof skillProgressCreateSchema>;

export const skillProgressUpdateSchema = z.object({
  status: skillProgressStatusEnum.optional(),
  learningResourceIds: z.array(z.string()).optional(),
  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional(),
  completedAt: z.union([z.string().datetime(), z.null()]).optional(),
});

export type SkillProgressUpdateInput = z.infer<typeof skillProgressUpdateSchema>;

export const learningResourceSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").trim(),
  skillName: z.string().min(1, "Skill name is required").trim(),
  description: z.string().min(5, "Description must be at least 5 characters").trim(),
  resourceType: z.enum([
    "documentation",
    "course",
    "tutorial",
    "video",
    "practice",
    "project",
  ]),
  provider: z.string().min(2, "Provider is required").trim(),
  url: z.string().url("Must be a valid URL with http or https protocol"),
  difficultyLevel: z.enum(["beginner", "intermediate", "advanced"]),
  isFree: z.boolean().default(true),
  estimatedDuration: z.string().min(1, "Estimated duration is required").trim(),
  verificationStatus: z.enum(["verified", "unverified"]).default("verified"),
});

export type LearningResourceInput = z.infer<typeof learningResourceSchema>;

