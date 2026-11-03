import { z } from "zod";

const stringOrEmpty = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => (v ? v.trim() : ""));

const stringArray = z
  .union([z.array(z.string().trim()), z.null()])
  .optional()
  .transform((v) => (Array.isArray(v) ? v.filter(Boolean) : []));

export const resumePersonalInfoSchema = z.object({
  fullName: stringOrEmpty,
  email: stringOrEmpty,
  phone: stringOrEmpty,
  linkedin: stringOrEmpty,
  github: stringOrEmpty,
  portfolio: stringOrEmpty,
});

export const resumeEducationSchema = z.object({
  institution: stringOrEmpty,
  degree: stringOrEmpty,
  branch: stringOrEmpty,
  startYear: z.union([z.number(), z.string(), z.null()]).optional().transform((v) => v ?? undefined),
  graduationYear: z.union([z.number(), z.string(), z.null()]).optional().transform((v) => v ?? undefined),
  cgpa: z.union([z.number(), z.string(), z.null()]).optional().transform((v) => v ?? undefined),
});

export const resumeTechnicalSkillsSchema = z.object({
  programmingLanguages: stringArray,
  frontend: stringArray,
  backend: stringArray,
  databases: stringArray,
  frameworks: stringArray,
  tools: stringArray,
  cloud: stringArray,
  other: stringArray,
});

export const resumeProjectSchema = z.object({
  title: stringOrEmpty,
  description: stringOrEmpty,
  technologies: stringArray,
  githubUrl: stringOrEmpty.optional(),
  liveDeploymentUrl: stringOrEmpty.optional(),
  responsibilities: stringArray.optional(),
});

export const resumeExperienceSchema = z.object({
  company: stringOrEmpty,
  jobTitle: stringOrEmpty,
  employmentType: stringOrEmpty.optional(),
  startDate: stringOrEmpty.optional(),
  endDate: stringOrEmpty.optional(),
  responsibilities: stringArray,
  technologies: stringArray.optional(),
});

export const resumeCertificationSchema = z.object({
  name: stringOrEmpty,
  issuer: stringOrEmpty.optional(),
  issueDate: stringOrEmpty.optional(),
  credentialUrl: stringOrEmpty.optional(),
});

export const resumeQualityAnalysisSchema = z.object({
  completenessAssessment: stringOrEmpty.optional(),
  strengths: stringArray,
  missingInformation: stringArray,
  suggestions: stringArray,
  formattingObservations: stringArray,
});

export const resumeParsedDataSchema = z.object({
  personalInfo: resumePersonalInfoSchema.default({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
  }),
  education: z.array(resumeEducationSchema).default([]),
  technicalSkills: resumeTechnicalSkillsSchema.default({
    programmingLanguages: [],
    frontend: [],
    backend: [],
    databases: [],
    frameworks: [],
    tools: [],
    cloud: [],
    other: [],
  }),
  softSkills: stringArray,
  projects: z.array(resumeProjectSchema).default([]),
  experience: z.array(resumeExperienceSchema).default([]),
  certifications: z.array(resumeCertificationSchema).default([]),
  resumeAnalysis: resumeQualityAnalysisSchema.default({
    strengths: [],
    missingInformation: [],
    suggestions: [],
    formattingObservations: [],
  }),
});

export const resumeMergeOptionsSchema = z.object({
  mergeTechnicalSkills: z.boolean().default(true),
  addProjects: z.boolean().default(true),
  updateEducation: z.boolean().default(true),
  addCertifications: z.boolean().default(true),
  addExperience: z.boolean().default(true),
  replacePersonalInfo: z.boolean().default(false),
});

export type ResumeParsedDataInput = z.infer<typeof resumeParsedDataSchema>;
export type ResumeMergeOptionsInput = z.infer<typeof resumeMergeOptionsSchema>;

