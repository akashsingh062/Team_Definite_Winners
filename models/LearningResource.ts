import mongoose, { Schema, Model, Document } from "mongoose";
import { ILearningResource, ResourceType, ResourceDifficulty } from "@/types/skill-gap";

export interface LearningResourceDocument
  extends Omit<ILearningResource, "_id" | "id">,
    Document {}

const LearningResourceSchema = new Schema<LearningResourceDocument>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    skillName: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    resourceType: {
      type: String,
      required: true,
      enum: [
        "documentation",
        "course",
        "tutorial",
        "video",
        "practice",
        "project",
      ],
      default: "documentation",
    },
    provider: {
      type: String,
      required: [true, "Provider is required"],
      trim: true,
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
    },
    difficultyLevel: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    isFree: {
      type: Boolean,
      default: true,
      index: true,
    },
    estimatedDuration: {
      type: String,
      required: true,
      trim: true,
      default: "Self-paced",
    },
    verificationStatus: {
      type: String,
      enum: ["verified", "unverified"],
      default: "verified",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

LearningResourceSchema.index({ skillName: 1, isFree: 1 });
LearningResourceSchema.index({ skillName: 1, difficultyLevel: 1 });

export const LearningResource: Model<LearningResourceDocument> =
  mongoose.models.LearningResource ||
  mongoose.model<LearningResourceDocument>(
    "LearningResource",
    LearningResourceSchema
  );

