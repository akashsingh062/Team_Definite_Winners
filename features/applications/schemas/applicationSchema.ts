import { z } from "zod";

export const APPLICATION_STATUSES = [
  "saved",
  "planning",
  "applied",
  "assessment",
  "interview",
  "offer_received",
  "selected",
  "rejected",
  "withdrawn",
  "expired",
] as const;

export const APPLICATION_METHODS = [
  "company_website",
  "referral",
  "email",
  "campus_placement",
  "other",
] as const;

export const saveOpportunitySchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
});

export const recordApplicationSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required"),
  appliedAt: z
    .string()
    .or(z.date())
    .optional(),
  applicationMethod: z
    .enum(APPLICATION_METHODS, {
      message: "Please select a valid application method",
    })
    .default("company_website"),
  applicationUrl: z
    .string()
    .url("Application URL must be a valid web address (http:// or https://)")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES, {
    message: "Invalid application status",
  }),
  note: z
    .string()
    .max(500, "Status transition note cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const updateApplicationDetailsSchema = z.object({
  status: z.enum(APPLICATION_STATUSES).optional(),
  notes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  nextFollowUpDate: z
    .string()
    .nullable()
    .optional(),
  appliedAt: z
    .string()
    .nullable()
    .optional(),
  applicationMethod: z.enum(APPLICATION_METHODS).optional(),
  applicationUrl: z
    .string()
    .url("Application URL must be a valid web address")
    .optional()
    .or(z.literal("")),
  note: z
    .string()
    .max(500, "Activity note cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const createActivitySchema = z.object({
  previousStatus: z.enum(APPLICATION_STATUSES).optional(),
  newStatus: z.enum(APPLICATION_STATUSES, {
    message: "Valid status is required for activity recording",
  }),
  note: z
    .string()
    .max(500, "Activity note cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type SaveOpportunityInput = z.infer<typeof saveOpportunitySchema>;
export type RecordApplicationInput = z.infer<typeof recordApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>;
export type UpdateApplicationDetailsInput = z.infer<
  typeof updateApplicationDetailsSchema
>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
