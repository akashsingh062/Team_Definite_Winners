import mongoose, { Schema, Model, Document } from "mongoose";
import { IMentorshipResourceShare } from "@/types/mentor";

export interface MentorshipResourceShareDocument
  extends Omit<IMentorshipResourceShare, "_id" | "id">,
    Document {}

const MentorshipResourceShareSchema =
  new Schema<MentorshipResourceShareDocument>(
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
      resourceType: {
        type: String,
        enum: ["resume", "project", "portfolio", "github"],
        required: true,
        index: true,
      },
      resourceReference: {
        type: Schema.Types.Mixed,
        required: true,
      },
      permissionStatus: {
        type: String,
        enum: ["active", "revoked"],
        default: "active",
        index: true,
      },
      grantedAt: {
        type: Date,
        default: Date.now,
      },
      revokedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

MentorshipResourceShareSchema.index({
  mentorId: 1,
  studentId: 1,
  permissionStatus: 1,
});

export const MentorshipResourceShare: Model<MentorshipResourceShareDocument> =
  mongoose.models.MentorshipResourceShare ||
  mongoose.model<MentorshipResourceShareDocument>(
    "MentorshipResourceShare",
    MentorshipResourceShareSchema
  );

export default MentorshipResourceShare;

