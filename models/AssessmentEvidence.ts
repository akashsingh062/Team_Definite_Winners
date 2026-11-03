import mongoose, { Schema, Model, Document } from "mongoose";
import { IAssessmentEvidenceDoc } from "@/types/assessment";

export interface AssessmentEvidenceDocument
  extends Omit<IAssessmentEvidenceDoc, "_id">,
    Document {}

const AssessmentEvidenceSchema = new Schema<AssessmentEvidenceDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    assessmentId: {
      type: String,
      required: true,
      index: true,
    },
    assessmentTitle: {
      type: String,
      required: true,
    },
    attemptId: {
      type: String,
      required: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    proficiency: {
      type: String,
      enum: ["Beginner", "Developing", "Proficient", "Advanced"],
      required: true,
    },
    isPassed: {
      type: Boolean,
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "assessment_evidences",
  }
);

AssessmentEvidenceSchema.index({ userId: 1, skill: 1, verifiedAt: -1 });

export const AssessmentEvidence: Model<AssessmentEvidenceDocument> =
  mongoose.models.AssessmentEvidence ||
  mongoose.model<AssessmentEvidenceDocument>(
    "AssessmentEvidence",
    AssessmentEvidenceSchema
  );

export default AssessmentEvidence;

