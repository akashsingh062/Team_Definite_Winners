import mongoose, { Schema, Model, Document } from "mongoose";
import { IAssessment } from "@/types/assessment";

export interface AssessmentDocument
  extends Omit<IAssessment, "_id" | "id">,
    Document {}

const AssessmentSchema = new Schema<AssessmentDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 5,
      default: 30,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
      default: 100,
    },
    passingThreshold: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 60, // Percentage
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Mixed"],
      default: "Mixed",
      index: true,
    },
    topics: {
      type: [String],
      default: [],
    },
    questionCount: {
      type: Number,
      required: true,
      default: 10,
    },
    questionReferences: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    retakeCooldownHours: {
      type: Number,
      default: 24,
    },
    createdBy: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
    collection: "assessments",
  }
);

AssessmentSchema.index({ subject: 1, status: 1 });

export const Assessment: Model<AssessmentDocument> =
  mongoose.models.Assessment ||
  mongoose.model<AssessmentDocument>("Assessment", AssessmentSchema);

export default Assessment;

