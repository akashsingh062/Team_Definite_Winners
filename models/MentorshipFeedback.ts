import mongoose, { Schema, Model, Document } from "mongoose";
import { IMentorshipFeedback } from "@/types/mentor";

export interface MentorshipFeedbackDocument
  extends Omit<IMentorshipFeedback, "_id" | "id">,
    Document {}

const MentorshipFeedbackSchema = new Schema<MentorshipFeedbackDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    mentorId: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    helpfulness: {
      type: String,
      enum: [
        "extremely_helpful",
        "very_helpful",
        "moderately_helpful",
        "slightly_helpful",
        "not_helpful",
      ],
      default: "very_helpful",
    },
    feedback: {
      type: String,
      trim: true,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

export const MentorshipFeedback: Model<MentorshipFeedbackDocument> =
  mongoose.models.MentorshipFeedback ||
  mongoose.model<MentorshipFeedbackDocument>(
    "MentorshipFeedback",
    MentorshipFeedbackSchema
  );

export default MentorshipFeedback;

