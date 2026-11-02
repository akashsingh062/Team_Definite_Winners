import { z } from "zod";

export const componentScoresSchema = z.object({
  requiredSkills: z.number().min(0).max(100),
  preferredSkills: z.number().min(0).max(100),
  projectsExperience: z.number().min(0).max(100),
  education: z.number().min(0).max(100),
  careerAlignment: z.number().min(0).max(100),
  locationWorkMode: z.number().min(0).max(100),
  compensation: z.number().min(0).max(100),
});

export const eligibilityStatusSchema = z.enum([
  "eligible",
  "potentially_eligible",
  "not_eligible",
  "insufficient_information",
]);

export const opportunityMatchResultSchema = z.object({
  opportunityId: z.string(),
  opportunity: z.object({
    _id: z.string().optional(),
    id: z.string().optional(),
    title: z.string(),
    companyName: z.string(),
    companyLogo: z.string().optional(),
    description: z.string().optional(),
    category: z.enum(["internship", "job", "skill-development"]),
    employmentType: z.string(),
    industry: z.string(),
    workMode: z.enum(["remote", "onsite", "hybrid"]),
    location: z.string(),
    stipend: z.string().optional(),
    salaryRange: z.string().optional(),
    isPaid: z.boolean(),
    duration: z.string().optional(),
    applicationDeadline: z.union([z.string(), z.date()]).optional(),
    externalApplicationUrl: z.string().optional(),
    applicationInstructions: z.string().optional(),
    requiredSkills: z.array(z.string()),
    preferredSkills: z.array(z.string()),
    minimumExperience: z.string(),
    educationRequirements: z.string(),
    minimumCGPA: z.number().optional(),
    benefits: z.array(z.string()).default([]),
    publishedAt: z.union([z.string(), z.date()]).optional(),
  }),
  overallScore: z.number().min(0).max(100),
  eligibilityStatus: eligibilityStatusSchema,
  componentScores: componentScoresSchema,
  matchedSkills: z.array(z.string()),
  missingRequiredSkills: z.array(z.string()),
  missingPreferredSkills: z.array(z.string()),
  eligibilityIssues: z.array(z.string()),
  strengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  explanation: z.string(),
  dataCompleteness: z.number().min(0).max(100),
  relevantProjects: z.array(
    z.object({
      title: z.string(),
      technologies: z.array(z.string()),
    })
  ),
  calculatedAt: z.union([z.string(), z.date()]),
});

export const matchingFiltersSchema = z.object({
  category: z.enum(["all", "internship", "job", "skill-development"]).optional(),
  workMode: z.enum(["all", "remote", "onsite", "hybrid"]).optional(),
  eligibility: z
    .enum(["all", "eligible", "potentially_eligible", "not_eligible"])
    .optional(),
  sortBy: z.enum(["score", "deadline", "newest"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export type OpportunityMatchResultOutput = z.infer<
  typeof opportunityMatchResultSchema
>;
export type MatchingFiltersInput = z.infer<typeof matchingFiltersSchema>;

