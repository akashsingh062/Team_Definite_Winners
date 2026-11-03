import mongoose, { Schema, Model } from "mongoose";
import { IStudentProfile } from "@/types/student";

const TechnicalSkillSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: [
        "Programming languages",
        "Frontend technologies",
        "Backend technologies",
        "Databases",
        "Development tools",
        "Other technical skills",
      ],
      default: "Programming languages",
    },
    proficiency: {
      type: String,
      required: true,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
  },
  { _id: false }
);

const ProjectItemSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    technologies: [{ type: String, trim: true }],
    githubUrl: { type: String, trim: true, default: "" },
    liveDeploymentUrl: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const CertificationSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    issuer: { type: String, trim: true, default: "" },
    issueDate: { type: String, trim: true, default: "" },
    url: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const ExperienceSchema = new Schema(
  {
    id: { type: String, required: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    duration: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    personalInfo: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phoneNumber: { type: String, trim: true, default: "" },
      profilePhotograph: { type: String, trim: true, default: "" },
    },
    academicInfo: {
      collegeName: { type: String, trim: true, default: "" },
      degree: { type: String, trim: true, default: "" },
      branch: { type: String, trim: true, default: "" },
      currentAcademicYear: { type: String, trim: true, default: "" },
      graduationYear: { type: Number, default: new Date().getFullYear() + 2 },
      cgpa: { type: Number, min: 0, max: 10, default: undefined },
    },
    skills: {
      type: [TechnicalSkillSchema],
      default: [],
    },
    projects: {
      type: [ProjectItemSchema],
      default: [],
    },
    careerPreferences: {
      preferredJobRole: { type: String, trim: true, default: "" },
      preferredEmploymentType: {
        type: String,
        enum: ["Internship", "Full-time", "Part-time", "Fellowship"],
        default: "Internship",
      },
      workPreference: {
        type: String,
        enum: ["Remote", "On-site", "Hybrid"],
        default: "Hybrid",
      },
      preferredLocation: { type: String, trim: true, default: "" },
      expectedStipend: { type: String, trim: true, default: "" },
    },
    locationPreferences: {
      state: { type: String, trim: true, default: "" },
      district: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
      preferredRadiusKm: { type: Number, default: 50 },
      willingToRelocate: { type: Boolean, default: false },
      preferredWorkMode: {
        type: String,
        enum: ["remote", "hybrid", "onsite", "any"],
        default: "any",
      },
      preferRemote: { type: Boolean, default: false },
    },
    additionalInfo: {
      certifications: {
        type: [CertificationSchema],
        default: [],
      },
      experience: {
        type: [ExperienceSchema],
        default: [],
      },
      linkedinUrl: { type: String, trim: true, default: "" },
      githubUrl: { type: String, trim: true, default: "" },
    },
    profileCompletionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 20,
    },
  },
  {
    timestamps: true,
    collection: "student_profiles",
  }
);

// Prevent model overwrite in development during hot-reloads
export const StudentProfile: Model<IStudentProfile> =
  mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);

export default StudentProfile;
