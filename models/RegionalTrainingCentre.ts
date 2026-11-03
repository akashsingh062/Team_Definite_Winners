import mongoose, { Schema, Model, Document } from "mongoose";
import { IRegionalTrainingCentre } from "@/types/local-opportunity";

export interface RegionalTrainingCentreDocument
  extends Omit<IRegionalTrainingCentre, "_id" | "id">,
    Document {}

const TrainingCourseSchema = new Schema(
  {
    courseName: { type: String, required: true, trim: true },
    duration: { type: String, required: true, trim: true },
    certification: { type: String, default: "" },
    feeType: {
      type: String,
      enum: ["free", "subsidized", "paid"],
      default: "free",
    },
  },
  { _id: false }
);

const RegionalTrainingCentreSchema = new Schema<RegionalTrainingCentreDocument>(
  {
    name: {
      type: String,
      required: [true, "Training centre name is required"],
      trim: true,
      maxlength: [180, "Name cannot exceed 180 characters"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "iti",
        "pmkvy_centre",
        "polytechnic",
        "vocational_centre",
        "community_college",
        "industry_partner",
        "other",
      ],
      default: "iti",
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    pincode: {
      type: String,
      trim: true,
      default: "",
    },
    coordinates: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 },
    },
    contactNumber: {
      type: String,
      trim: true,
      default: "",
    },
    contactEmail: {
      type: String,
      trim: true,
      default: "",
    },
    officialWebsite: {
      type: String,
      trim: true,
      default: "",
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },
    sourceOrganization: {
      type: String,
      trim: true,
      default: "",
    },
    coursesOffered: {
      type: [TrainingCourseSchema],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ["verified", "pending", "unverified"],
      default: "verified",
      index: true,
    },
    lastVerifiedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "regional_training_centres",
  }
);

RegionalTrainingCentreSchema.index({ state: 1, district: 1, verificationStatus: 1 });

export const RegionalTrainingCentre: Model<RegionalTrainingCentreDocument> =
  mongoose.models.RegionalTrainingCentre ||
  mongoose.model<RegionalTrainingCentreDocument>(
    "RegionalTrainingCentre",
    RegionalTrainingCentreSchema
  );

export default RegionalTrainingCentre;

