import mongoose, { Schema, Model, Document } from "mongoose";
import { IMentorshipSession } from "@/types/mentor";

export interface MentorshipSessionDocument
  extends Omit<IMentorshipSession, "_id" | "id">,
    Document {}

const MentorshipSessionSchema = new Schema<MentorshipSessionDocument>(
  {
    requestId: {
      type: String,
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
    scheduledAt: {
      type: Date,
      required: [true, "Scheduled date and time is required"],
      index: true,
    },
    durationMinutes: {
      type: Number,
      default: 45,
      min: 15,
      max: 180,
    },
    sessionType: {
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
    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },
    meetingUrl: {
      type: String,
      trim: true,
    },
    agenda: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "rescheduled"],
      default: "scheduled",
      index: true,
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: String,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

MentorshipSessionSchema.index({ studentId: 1, scheduledAt: -1 });
MentorshipSessionSchema.index({ mentorId: 1, scheduledAt: -1 });
MentorshipSessionSchema.index({ status: 1, scheduledAt: 1 });

export const MentorshipSession: Model<MentorshipSessionDocument> =
  mongoose.models.MentorshipSession ||
  mongoose.model<MentorshipSessionDocument>(
    "MentorshipSession",
    MentorshipSessionSchema
  );

export default MentorshipSession;

