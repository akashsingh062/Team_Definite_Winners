import mongoose, { Schema, Model, Document } from "mongoose";
import { IMentorshipReport } from "@/types/mentor";

export interface MentorshipReportDocument
  extends Omit<IMentorshipReport, "_id" | "id">,
    Document {}

const MentorshipReportSchema = new Schema<MentorshipReportDocument>(
  {
    reporterId: {
      type: String,
      required: true,
      index: true,
    },
    reportedId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
    },
    reason: {
      type: String,
      required: [true, "Report reason is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Report description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MentorshipReport: Model<MentorshipReportDocument> =
  mongoose.models.MentorshipReport ||
  mongoose.model<MentorshipReportDocument>(
    "MentorshipReport",
    MentorshipReportSchema
  );

export default MentorshipReport;

