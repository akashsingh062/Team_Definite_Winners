import mongoose, { Schema, Model } from "mongoose";
import { IResume } from "@/types/resume";

const ResumeSchema = new Schema<IResume>(
  {
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      index: true,
    },
    originalFileName: {
      type: String,
      required: [true, "Original file name is required"],
      trim: true,
    },
    fileStorageKey: {
      type: String,
      required: [true, "File storage key is required"],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, "File size is required"],
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
      default: "application/pdf",
    },
    extractedText: {
      type: String,
      default: "",
    },
    pageCount: {
      type: Number,
      default: 1,
    },
    parsedData: {
      personalInfo: {
        fullName: { type: String, default: "" },
        email: { type: String, default: "" },
        phone: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
        portfolio: { type: String, default: "" },
      },
      education: {
        type: [
          {
            institution: { type: String, default: "" },
            degree: { type: String, default: "" },
            branch: { type: String, default: "" },
            startYear: { type: Schema.Types.Mixed },
            graduationYear: { type: Schema.Types.Mixed },
            cgpa: { type: Schema.Types.Mixed },
          },
        ],
        default: [],
      },
      technicalSkills: {
        programmingLanguages: [{ type: String }],
        frontend: [{ type: String }],
        backend: [{ type: String }],
        databases: [{ type: String }],
        frameworks: [{ type: String }],
        tools: [{ type: String }],
        cloud: [{ type: String }],
        other: [{ type: String }],
      },
      softSkills: [{ type: String }],
      projects: {
        type: [
          {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            technologies: [{ type: String }],
            githubUrl: { type: String, default: "" },
            liveDeploymentUrl: { type: String, default: "" },
            responsibilities: [{ type: String }],
          },
        ],
        default: [],
      },
      experience: {
        type: [
          {
            company: { type: String, default: "" },
            jobTitle: { type: String, default: "" },
            employmentType: { type: String, default: "" },
            startDate: { type: String, default: "" },
            endDate: { type: String, default: "" },
            responsibilities: [{ type: String }],
            technologies: [{ type: String }],
          },
        ],
        default: [],
      },
      certifications: {
        type: [
          {
            name: { type: String, default: "" },
            issuer: { type: String, default: "" },
            issueDate: { type: String, default: "" },
            credentialUrl: { type: String, default: "" },
          },
        ],
        default: [],
      },
      resumeAnalysis: {
        completenessAssessment: { type: String, default: "" },
        strengths: [{ type: String }],
        missingInformation: [{ type: String }],
        suggestions: [{ type: String }],
        formattingObservations: [{ type: String }],
      },
    },
    analysisStatus: {
      type: String,
      enum: ["uploaded", "processing", "completed", "failed", "approved"],
      default: "uploaded",
      index: true,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    isCurrent: {
      type: Boolean,
      default: true,
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "resumes",
  }
);

ResumeSchema.index({ studentId: 1, isCurrent: 1 });
ResumeSchema.index({ studentId: 1, analysisStatus: 1 });

export const Resume: Model<IResume> =
  mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);

export default Resume;

