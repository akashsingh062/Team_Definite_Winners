import mongoose, { Schema, Model } from "mongoose";
import { IAnalyticsEvent } from "@/types/analytics";

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      index: true,
    },
    userId: {
      type: String,
      default: null,
      index: true,
    },
    entityType: {
      type: String,
      default: null,
      index: true,
    },
    entityId: {
      type: String,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    collection: "analytics_events",
  }
);

AnalyticsEventSchema.index({ eventType: 1, createdAt: -1 });

export const AnalyticsEvent: Model<IAnalyticsEvent> =
  mongoose.models.AnalyticsEvent ||
  mongoose.model<IAnalyticsEvent>("AnalyticsEvent", AnalyticsEventSchema);

export default AnalyticsEvent;

