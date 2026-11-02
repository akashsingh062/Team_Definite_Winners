import mongoose, { Schema, Model } from "mongoose";
import { IExplanationFeedbackDoc } from "@/types/explanation";

const ExplanationFeedbackSchema = new Schema<IExplanationFeedbackDoc>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    opportunityId: {
      type: String,
      required: [true, "Opportunity ID is required"],
      index: true,
    },
    feedbackType: {
      type: String,
      enum: ["helpful", "not_helpful"],
      required: [true, "Feedback type is required"],
    },
    reason: {
      type: String,
      trim: true,
      default: undefined,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      default: undefined,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "explanation_feedbacks",
  }
);

// One feedback record per user and opportunity
ExplanationFeedbackSchema.index(
  { userId: 1, opportunityId: 1 },
  { unique: true }
);

export const ExplanationFeedback: Model<IExplanationFeedbackDoc> =
  mongoose.models.ExplanationFeedback ||
  mongoose.model<IExplanationFeedbackDoc>(
    "ExplanationFeedback",
    ExplanationFeedbackSchema
  );

export default ExplanationFeedback;

