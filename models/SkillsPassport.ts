import mongoose, { Schema, Model, Document } from "mongoose";
import { ISkillsPassport } from "@/types/skills-passport";

export interface SkillsPassportDocument
  extends Omit<ISkillsPassport, "_id">,
    Document {}

const PassportSkillSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, default: "Technical" },
    proficiency: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate",
    },
    evidenceType: {
      type: String,
      enum: [
        "self_reported",
        "resume_extracted",
        "project_demonstrated",
        "assessment_verified",
        "externally_verified",
      ],
      default: "self_reported",
    },
    evidenceReference: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "flagged"],
      default: "unverified",
    },
    verificationDate: { type: Date, default: null },
    issuingSource: { type: String, default: "Self-Reported" },
  },
  { _id: false }
);

const PassportProjectSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    technologies: [{ type: String, trim: true }],
    category: { type: String, default: "General" },
    githubUrl: { type: String, trim: true, default: "" },
    liveDemoUrl: { type: String, trim: true, default: "" },
    images: [{ type: String, trim: true }],
    contribution: { type: String, trim: true, default: "" },
    completionDate: { type: String, default: "" },
    evidenceStatus: {
      type: String,
      enum: [
        "self_reported",
        "project_demonstrated",
        "peer_reviewed",
        "externally_verified",
      ],
      default: "project_demonstrated",
    },
  },
  { _id: false }
);

const PassportCertificationSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    issuingOrganization: { type: String, required: true, trim: true },
    issueDate: { type: String, default: "" },
    expirationDate: { type: String, default: "" },
    credentialId: { type: String, default: "" },
    credentialUrl: { type: String, default: "" },
    supportingDocumentUrl: { type: String, default: "" },
    verificationStatus: {
      type: String,
      enum: ["unverified", "verified", "student_provided", "expired"],
      default: "student_provided",
    },
    verificationMethod: { type: String, default: "student_provided" },
    verificationNotes: { type: String, default: "" },
  },
  { _id: false }
);

const PassportEducationSchema = new Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    branch: { type: String, default: "" },
    graduationYear: { type: Schema.Types.Mixed, default: "" },
    cgpa: { type: Schema.Types.Mixed, default: undefined },
  },
  { _id: false }
);

const PassportAssessmentSchema = new Schema(
  {
    id: { type: String, required: true },
    assessmentTitle: { type: String, required: true, trim: true },
    skillName: { type: String, required: true, trim: true },
    score: { type: Number, default: undefined },
    badge: { type: String, default: "Skill Proficiency" },
    completedAt: { type: Date, default: Date.now },
    verificationReference: { type: String, default: "" },
  },
  { _id: false }
);

const SkillsPassportSchema = new Schema<SkillsPassportDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      trim: true,
      default: "",
    },
    headline: {
      type: String,
      trim: true,
      default: "Aspiring Tech Professional",
    },
    summary: {
      type: String,
      trim: true,
      default: "",
    },
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
      index: true,
    },
    visibleSections: {
      skills: { type: Boolean, default: true },
      projects: { type: Boolean, default: true },
      certifications: { type: Boolean, default: true },
      education: { type: Boolean, default: true },
      assessments: { type: Boolean, default: true },
      contact: { type: Boolean, default: false },
    },
    skills: {
      type: [PassportSkillSchema],
      default: [],
    },
    projects: {
      type: [PassportProjectSchema],
      default: [],
    },
    certifications: {
      type: [PassportCertificationSchema],
      default: [],
    },
    education: {
      type: [PassportEducationSchema],
      default: [],
    },
    assessments: {
      type: [PassportAssessmentSchema],
      default: [],
    },
    portfolioLinks: {
      github: { type: String, trim: true, default: "" },
      linkedin: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
      twitter: { type: String, trim: true, default: "" },
    },
    analytics: {
      viewCount: { type: Number, default: 0 },
      lastViewedAt: { type: Date, default: null },
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    integrityHash: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "skills_passports",
  }
);

export const SkillsPassport: Model<SkillsPassportDocument> =
  mongoose.models.SkillsPassport ||
  mongoose.model<SkillsPassportDocument>(
    "SkillsPassport",
    SkillsPassportSchema
  );

export default SkillsPassport;
