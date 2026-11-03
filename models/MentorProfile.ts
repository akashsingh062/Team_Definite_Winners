import mongoose, { Schema, Model, Document } from "mongoose";
import { IMentorProfile } from "@/types/mentor";

export interface MentorProfileDocument
  extends Omit<IMentorProfile, "_id" | "id">,
    Document {}

const MentorEducationSchema = new Schema(
  {
    degree: { type: String, required: true, trim: true },
    field: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    year: { type: Number },
  },
  { _id: false }
);

const MentorCredentialSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    issuingOrg: { type: String, required: true, trim: true },
    year: { type: Number },
    credentialUrl: { type: String, trim: true },
    verified: { type: Boolean, default: false },
  },
  { _id: false }
);

const MentorTimeSlotSchema = new Schema(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { _id: false }
);

const MentorAvailabilitySchema = new Schema(
  {
    isAcceptingRequests: { type: Boolean, default: true },
    maxActiveMentees: { type: Number, default: 5 },
    weeklyHours: { type: Number, default: 4 },
    preferredDays: [{ type: String }],
    timeSlots: [MentorTimeSlotSchema],
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  { _id: false }
);

const MentorProfileSchema = new Schema<MentorProfileDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: [true, "Mentor display name is required"],
      trim: true,
      index: true,
    },
    headline: {
      type: String,
      required: [true, "Professional headline is required"],
      trim: true,
    },
    organization: {
      type: String,
      required: [true, "Organization is required"],
      trim: true,
      index: true,
    },
    currentRole: {
      type: String,
      required: [true, "Current role is required"],
      trim: true,
    },
    experienceYears: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    expertise: [{ type: String, trim: true, index: true }],
    skills: [{ type: String, trim: true, index: true }],
    languages: [{ type: String, trim: true, index: true }],
    biography: {
      type: String,
      required: [true, "Biography is required"],
      trim: true,
    },
    education: [MentorEducationSchema],
    professionalLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      portfolio: { type: String, trim: true },
      twitter: { type: String, trim: true },
    },
    credentials: [MentorCredentialSchema],
    verificationStatus: {
      type: String,
      enum: ["pending", "under_review", "verified", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    verificationNotes: { type: String, trim: true },
    verifiedAt: { type: Date },
    verifiedBy: { type: String },
    availability: {
      type: MentorAvailabilitySchema,
      default: () => ({
        isAcceptingRequests: true,
        maxActiveMentees: 5,
        weeklyHours: 4,
        preferredDays: ["Saturday", "Sunday"],
        timeSlots: [],
        timezone: "Asia/Kolkata",
      }),
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
  }
);

MentorProfileSchema.index({ verificationStatus: 1, "availability.isAcceptingRequests": 1 });
MentorProfileSchema.index({ expertise: 1, verificationStatus: 1 });
MentorProfileSchema.index({ skills: 1, verificationStatus: 1 });

export const MentorProfile: Model<MentorProfileDocument> =
  mongoose.models.MentorProfile ||
  mongoose.model<MentorProfileDocument>("MentorProfile", MentorProfileSchema);

export default MentorProfile;
