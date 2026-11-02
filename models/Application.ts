import mongoose, { Schema, Model } from "mongoose";
import { IApplication } from "@/types/application";
import {
  APPLICATION_STATUSES,
  APPLICATION_METHODS,
} from "@/features/applications/schemas/applicationSchema";

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      required: [true, "Opportunity ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "saved",
      required: true,
      index: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    appliedAt: {
      type: Date,
      default: null,
    },
    applicationMethod: {
      type: String,
      enum: APPLICATION_METHODS,
      default: undefined,
    },
    applicationUrl: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
      default: "",
    },
    deadline: {
      type: Date,
      default: null,
    },
    nextFollowUpDate: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "applications",
  }
);

// One application tracking record per student and opportunity
ApplicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });

// Compound indexes for fast dashboard queries
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, nextFollowUpDate: 1 });
ApplicationSchema.index({ userId: 1, updatedAt: -1 });

export const Application: Model<IApplication> =
  mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
