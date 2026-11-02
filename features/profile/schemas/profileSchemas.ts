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

export const personalInfoSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be under 100 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  phoneNumber: z
    .string()
    .trim()
    .max(20, "Phone number is too long")
    .optional()
    .or(z.literal("")),
  profilePhotograph: optionalUrl,
});

export const academicInfoSchema = z.object({
  collegeName: z
    .string()
    .trim()
    .min(2, "College/University name must be at least 2 characters")
    .max(200, "College name must be under 200 characters"),
  degree: z
    .string()
    .trim()
    .min(2, "Degree is required (e.g., B.Tech, B.S., M.S.)")
    .max(100, "Degree must be under 100 characters"),
  branch: z
    .string()
    .trim()
    .min(2, "Branch or department is required (e.g., Computer Science)")
    .max(100, "Branch must be under 100 characters"),
  currentAcademicYear: z.string().trim().min(1, "Current academic year is required"),
  graduationYear: z.coerce
    .number()
    .int("Graduation year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2035, "Year must be 2035 or earlier"),
  cgpa: z.coerce
    .number()
    .min(0, "CGPA cannot be negative")
    .max(10, "CGPA must be 10 or less")
    .optional(),
});

export const technicalSkillItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Skill name is required"),
  category: z.enum([
    "Programming languages",
    "Frontend technologies",
    "Backend technologies",
    "Databases",
    "Development tools",
    "Other technical skills",
  ]),
  proficiency: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

export const projectItemSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .trim()
    .min(2, "Project title must be at least 2 characters")
    .max(150, "Title must be under 150 characters"),
  description: z
    .string()
    .trim()
    .min(5, "Project description must be at least 5 characters")
    .max(2000, "Description must be under 2000 characters"),
  technologies: z
    .array(z.string().trim())
    .min(1, "Specify at least one technology used"),
  githubUrl: optionalUrl,
  liveDeploymentUrl: optionalUrl,
});

export const careerPreferencesSchema = z.object({
  preferredJobRole: z
    .string()
    .trim()
    .min(2, "Preferred job role is required")
    .max(120, "Role must be under 120 characters"),
  preferredEmploymentType: z.enum([
    "Internship",
    "Full-time",
    "Part-time",
    "Fellowship",
  ]),
  workPreference: z.enum(["Remote", "On-site", "Hybrid"]),
  preferredLocation: z
    .string()
    .trim()
    .min(2, "Preferred location is required")
    .max(120, "Location must be under 120 characters"),
  expectedStipend: z.string().trim().optional().or(z.literal("")),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Certification name is required"),
  issuer: z.string().trim().optional().or(z.literal("")),
  issueDate: z.string().trim().optional().or(z.literal("")),
  url: optionalUrl,
});

export const experienceItemSchema = z.object({
  id: z.string(),
  role: z.string().trim().min(1, "Role is required"),
  company: z.string().trim().min(1, "Company is required"),
  duration: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().optional().or(z.literal("")),
});

export const additionalInfoSchema = z.object({
  certifications: z.array(certificationItemSchema).default([]),
  experience: z.array(experienceItemSchema).default([]),
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
});

export const completeProfileSchema = z.object({
  personalInfo: personalInfoSchema,
  academicInfo: academicInfoSchema,
  skills: z.array(technicalSkillItemSchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  careerPreferences: careerPreferencesSchema,
  additionalInfo: additionalInfoSchema.default({
    certifications: [],
    experience: [],
    linkedinUrl: "",
    githubUrl: "",
  }),
});

export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;
