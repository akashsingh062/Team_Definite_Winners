import { z } from "zod";

export const explanationFeedbackSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
  feedbackType: z.enum(["helpful", "not_helpful"], {
    message: "Feedback type must be either 'helpful' or 'not_helpful'",
  }),
  reason: z
    .enum(
      [
        "Incorrect information",
        "Missing information",
        "Explanation is unclear",
        "Score breakdown is confusing",
        "Other",
      ],
      {
        message: "Please select a valid feedback reason",
      }
    )
    .optional(),
  comment: z
    .string()
    .max(500, "Comment cannot exceed 500 characters")
    .optional(),
});

export type ExplanationFeedbackFormData = z.infer<
  typeof explanationFeedbackSchema
>;

export const geminiExplanationAiOutputSchema = z.object({
  summary: z.string().min(10, "Summary must be at least 10 characters"),
  topMatchingFactors: z
    .array(z.string().min(3))
    .min(1, "At least one top matching factor is required"),
  keyProfileEvidence: z
    .array(z.string().min(3))
    .min(1, "At least one profile evidence item is required"),
  limitationsDisclaimer: z
    .string()
    .min(10, "Limitations disclaimer is required"),
});

export type GeminiExplanationAiOutput = z.infer<
  typeof geminiExplanationAiOutputSchema
>;

