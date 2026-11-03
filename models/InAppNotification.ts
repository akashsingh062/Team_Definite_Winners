import mongoose, { Schema, Model, Document } from "mongoose";
import { IInAppNotification } from "@/types/mentor";

export interface InAppNotificationDocument
  extends Omit<IInAppNotification, "_id" | "id">,
    Document {}

const InAppNotificationSchema = new Schema<InAppNotificationDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

InAppNotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const InAppNotification: Model<InAppNotificationDocument> =
  mongoose.models.InAppNotification ||
  mongoose.model<InAppNotificationDocument>(
    "InAppNotification",
    InAppNotificationSchema
  );

export default InAppNotification;

