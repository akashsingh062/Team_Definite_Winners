import mongoose, { Schema, Model, Document } from "mongoose";
import { ICareerSimulationDoc } from "@/types/career-path";

export interface CareerSimulationDocument
  extends Omit<ICareerSimulationDoc, "_id" | "id">,
    Document {}

const CareerSimulationSchema = new Schema<CareerSimulationDocument>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    careerPathId: {
      type: String,
      required: [true, "Career Path ID is required"],
      index: true,
    },
    targetCareerTitle: {
      type: String,
      required: true,
      trim: true,
    },
    hypotheticalSkills: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    baselineScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    simulatedScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    scoreDelta: {
      type: Number,
      required: true,
    },
    simulationSnapshot: {
      type: Schema.Types.Mixed,
      required: true,
    },
    methodologyVersion: {
      type: String,
      required: true,
      default: "v1.0-career-path",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    collection: "career_simulations",
  }
);

CareerSimulationSchema.index({ userId: 1, createdAt: -1 });
CareerSimulationSchema.index({ userId: 1, careerPathId: 1 });

export const CareerSimulation: Model<CareerSimulationDocument> =
  mongoose.models.CareerSimulation ||
  mongoose.model<CareerSimulationDocument>("CareerSimulation", CareerSimulationSchema);

export default CareerSimulation;

