import mongoose, { Schema, Model } from "mongoose";

export interface IOpportunityExplanationDoc {
  _id?: string;
  userId: string;
  opportunityId: string;
  matchResultReference: {
    score: number;
    calculatedAt: Date;
  };
  scoringVersion: string;
  structuredExplanation: any;
  generatedExplanation: any;
  dataCompleteness: number;
  createdAt: Date;
  updatedAt: Date;
}

const OpportunityExplanationSchema = new Schema<IOpportunityExplanationDoc>(
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
    matchResultReference: {
      score: { type: Number, required: true },
      calculatedAt: { type: Date, default: Date.now },
    },
    scoringVersion: {
      type: String,
      required: true,
      default: "v1.0-stage4",
    },
    structuredExplanation: {
      type: Schema.Types.Mixed,
      required: true,
    },
    generatedExplanation: {
      type: Schema.Types.Mixed,
      required: true,
    },
    dataCompleteness: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
    collection: "opportunity_explanations",
  }
);

// Compound unique index: one cached explanation per user + opportunity
OpportunityExplanationSchema.index(
  { userId: 1, opportunityId: 1 },
  { unique: true }
);

export const OpportunityExplanation: Model<IOpportunityExplanationDoc> =
  mongoose.models.OpportunityExplanation ||
  mongoose.model<IOpportunityExplanationDoc>(
    "OpportunityExplanation",
    OpportunityExplanationSchema
  );

export default OpportunityExplanation;

