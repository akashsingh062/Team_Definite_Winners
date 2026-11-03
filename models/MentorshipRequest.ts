import mongoose, { Schema, Model, Document } from "mongoose";
import { IMentorshipRequest } from "@/types/mentor";

export interface MentorshipRequestDocument
  extends Omit<IMentorshipRequest, "_id" | "id">,
    Document {}

const ResourceReferenceSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["resume", "project", "portfolio", "github"],
      required: true,
    },
    refId: { type: String },
    title: { type: String, required: true },
  },
  { _id: false }
);

const MentorshipRequestSchema = new Schema<MentorshipRequestDocument>(
  {
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
    careerGoal: {
      type: String,
      required: [true, "Career goal is required"],
      trim: true,
    },
    topic: {
      type: String,
      required: [true, "Mentorship topic is required"],
      trim: true,
    },
    introduction: {
      type: String,
      required: [true, "Introduction is required"],
      trim: true,
    },
    preferredLanguage: {
      type: String,
      default: "English",
      trim: true,
    },
    preferredSessionType: {
      type: String,
      enum: [
        "1_on_1_advisory",
        "resume_review",
        "project_critique",
        "mock_interview",
        "general_qa",
      ],
      default: "1_on_1_advisory",
    },
    preferredDates: [{ type: String }],
    resourceReferences: [ResourceReferenceSchema],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
      default: "pending",
      index: true,
    },
    mentorResponse: {
      type: String,
      trim: true,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help query active requests per student and mentor
MentorshipRequestSchema.index({ studentId: 1, mentorId: 1, status: 1 });
MentorshipRequestSchema.index({ mentorId: 1, status: 1, createdAt: -1 });

export const MentorshipRequest: Model<MentorshipRequestDocument> =
  mongoose.models.MentorshipRequest ||
  mongoose.model<MentorshipRequestDocument>(
    "MentorshipRequest",
    MentorshipRequestSchema
  );

export default MentorshipRequest;

