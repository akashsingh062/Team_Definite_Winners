import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val || val === "") return true;
      try {
        const url = new URL(val);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Must be a valid web URL starting with http:// or https://" }
  )
  .optional()
  .or(z.literal(""));

export const opportunityFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Opportunity title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  companyName: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(120, "Company name cannot exceed 120 characters"),
  companyLogo: optionalUrl,
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  category: z.enum(["internship", "job", "skill-development"], {
    errorMap: () => ({ message: "Please select a valid opportunity category" }),
  }),
  employmentType: z.enum(
    ["full-time", "part-time", "internship", "contract", "training"],
    {
      errorMap: () => ({ message: "Please select a valid employment type" }),
    }
  ),
  industry: z
    .string()
    .trim()
    .min(2, "Industry must be specified (e.g. Technology, Healthcare)"),

  requiredSkills: z
    .array(z.string().trim())
    .min(1, "Specify at least one required skill"),
  preferredSkills: z.array(z.string().trim()).default([]),
  minimumExperience: z
    .string()
    .trim()
    .min(1, "Minimum experience must be specified"),
  eligibilityCriteria: z
    .string()
    .trim()
    .min(3, "Eligibility criteria must be specified"),
  educationRequirements: z
    .string()
    .trim()
    .min(3, "Education requirements must be specified"),
  minimumCGPA: z.coerce
    .number()
    .min(0, "CGPA cannot be negative")
    .max(10, "CGPA cannot exceed 10.0")
    .optional(),

  workMode: z.enum(["remote", "onsite", "hybrid"], {
    errorMap: () => ({ message: "Please select a valid work mode" }),
  }),
  location: z.string().trim().min(2, "Location is required"),
  eligibleRegions: z.array(z.string().trim()).default([]),

  stipend: z.string().trim().optional().or(z.literal("")),
  salaryRange: z.string().trim().optional().or(z.literal("")),
  currency: z.string().trim().default("USD"),
  isPaid: z.boolean().default(true),

  duration: z.string().trim().optional().or(z.literal("")),
  applicationDeadline: z.string().trim().optional().or(z.literal("")),
  externalApplicationUrl: optionalUrl,
  applicationInstructions: z
    .string()
    .trim()
    .min(5, "Please provide clear application instructions"),
  benefits: z.array(z.string().trim()).default([]),

  status: z
    .enum(["draft", "pending", "published", "rejected", "expired"])
    .default("draft"),
  verificationNotes: z.string().trim().optional().or(z.literal("")),
});

export type OpportunityFormData = z.infer<typeof opportunityFormSchema>;
