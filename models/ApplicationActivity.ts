import mongoose, { Schema, Model } from "mongoose";
import { IApplicationActivity } from "@/types/application";
import { APPLICATION_STATUSES } from "@/features/applications/schemas/applicationSchema";

const ApplicationActivitySchema = new Schema<IApplicationActivity>(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: [true, "Application ID is required"],
      index: true,
    },
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    previousStatus: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: undefined,
    },
    newStatus: {
      type: String,
      enum: APPLICATION_STATUSES,
      required: [true, "New status is required"],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, "Note cannot exceed 500 characters"],
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    collection: "application_activities",
  }
);

ApplicationActivitySchema.index({ applicationId: 1, createdAt: -1 });
ApplicationActivitySchema.index({ userId: 1, createdAt: -1 });

export const ApplicationActivity: Model<IApplicationActivity> =
  mongoose.models.ApplicationActivity ||
  mongoose.model<IApplicationActivity>(
    "ApplicationActivity",
    ApplicationActivitySchema
  );

export default ApplicationActivity;

