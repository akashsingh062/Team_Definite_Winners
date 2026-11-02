import mongoose, { Schema, Model, Document } from "mongoose";
import { ICareerPath, ICareerProject, ICareerEducationRequirement } from "@/types/career-path";

export interface CareerPathDocument extends Omit<ICareerPath, "_id" | "id">, Document {}

const CareerProjectSchema = new Schema<ICareerProject>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skills: [{ type: String, trim: true }],
    deliverable: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const CareerEducationRequirementSchema = new Schema<ICareerEducationRequirement>(
  {
    preferredDegrees: [{ type: String, trim: true }],
    minimumGpa: { type: Number, default: 0 },
    fieldsOfStudy: [{ type: String, trim: true }],
    notes: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const CareerPathSchema = new Schema<CareerPathDocument>(
  {
    title: {
      type: String,
      required: [true, "Career path title is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
    requiredSkills: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: [
        (val: string[]) => Array.isArray(val) && val.length > 0,
        "At least one required skill must be defined",
      ],
    },
    preferredSkills: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    recommendedProjects: {
      type: [CareerProjectSchema],
      default: [],
    },
    responsibilities: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    educationRequirements: {
      type: CareerEducationRequirementSchema,
      default: () => ({}),
    },
    relatedCareerPaths: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    learningDifficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "intermediate",
      index: true,
    },
    careerProgression: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    methodologyVersion: {
      type: String,
      required: true,
      default: "v1.0-career-path",
    },
    sourceInformation: {
      type: String,
      trim: true,
      default: "Curated Industry Competency Framework & Occupational Guidelines",
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "career_paths",
  }
);

CareerPathSchema.index({ category: 1, isActive: 1 });

export const CareerPath: Model<CareerPathDocument> =
  mongoose.models.CareerPath ||
  mongoose.model<CareerPathDocument>("CareerPath", CareerPathSchema);

export default CareerPath;
