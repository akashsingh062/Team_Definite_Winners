import mongoose, { Schema, Model } from "mongoose";
import { IOpportunity } from "@/types/opportunity";

const OpportunitySchema = new Schema<IOpportunity>(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, "Opportunity title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    companyName: {
      type: String,
      required: [true, "Company or organization name is required"],
      trim: true,
      maxlength: [120, "Company name cannot exceed 120 characters"],
    },
    companyLogo: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Opportunity description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["internship", "job", "skill-development"],
        message: "{VALUE} is not a supported opportunity category",
      },
      index: true,
    },
    employmentType: {
      type: String,
      required: [true, "Employment type is required"],
      enum: ["full-time", "part-time", "internship", "contract", "training"],
      default: "internship",
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
      default: "Technology",
    },

    // Skills and Requirements
    requiredSkills: {
      type: [{ type: String, trim: true }],
      required: true,
      validate: [
        (val: string[]) => val.length > 0,
        "At least one required skill must be specified",
      ],
    },
    preferredSkills: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    minimumExperience: {
      type: String,
      trim: true,
      default: "Freshers welcome / 0-1 years",
    },
    eligibilityCriteria: {
      type: String,
      trim: true,
      default: "Open to eligible students and early career graduates.",
    },
    educationRequirements: {
      type: String,
      trim: true,
      default: "Undergraduate degree in Computer Science, IT, or related fields.",
    },
    minimumCGPA: {
      type: Number,
      min: 0,
      max: 10,
    },

    // Location Information
    workMode: {
      type: String,
      required: true,
      enum: ["remote", "onsite", "hybrid"],
      default: "hybrid",
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      default: "Remote / Multiple Locations",
    },
    eligibleRegions: {
      type: [{ type: String, trim: true }],
      default: [],
    },
    state: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    district: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    city: {
      type: String,
      trim: true,
      default: "",
      index: true,
    },
    locationName: {
      type: String,
      trim: true,
      default: "",
    },
    remoteEligibility: {
      type: Boolean,
      default: false,
    },
    relocationAvailable: {
      type: Boolean,
      default: false,
    },
    coordinates: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
    },
    opportunitySource: {
      type: String,
      enum: [
        "direct_employer",
        "regional_employer",
        "skill_india",
        "naps",
        "ncs",
        "state_mission",
        "govt_portal",
        "partner",
      ],
      default: "direct_employer",
      index: true,
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
    isGovernmentProgram: {
      type: Boolean,
      default: false,
      index: true,
    },
    governmentProgramDetails: {
      schemeName: { type: String, trim: true, default: "" },
      ministryOrDepartment: { type: String, trim: true, default: "" },
      stipendProvided: { type: Boolean, default: false },
      certificationOffered: { type: Boolean, default: false },
      targetBeneficiaries: { type: String, trim: true, default: "" },
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    isOutdated: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Compensation
    stipend: {
      type: String,
      trim: true,
      default: "",
    },
    salaryRange: {
      type: String,
      trim: true,
      default: "",
    },
    currency: {
      type: String,
      trim: true,
      default: "USD",
    },
    isPaid: {
      type: Boolean,
      default: true,
    },

    // Additional Information
    duration: {
      type: String,
      trim: true,
      default: "",
    },
    applicationDeadline: {
      type: Date,
      index: true,
    },
    externalApplicationUrl: {
      type: String,
      trim: true,
      default: "",
    },
    applicationInstructions: {
      type: String,
      trim: true,
      default:
        "Submit your application through the verified link or review the requirements before applying.",
    },
    benefits: {
      type: [{ type: String, trim: true }],
      default: [],
    },

    // Verification and Publishing
    status: {
      type: String,
      required: true,
      enum: ["draft", "pending", "published", "rejected", "expired"],
      default: "draft",
      index: true,
    },
    verificationStatus: {
      type: String,
      required: true,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
      index: true,
    },
    verificationNotes: {
      type: String,
      trim: true,
      default: "",
    },
    createdBy: {
      type: String,
      required: true,
      index: true,
    },
    verifiedBy: {
      type: String,
      default: null,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    isDemoData: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "opportunities",
  }
);

// Compound indexes for public searching, filtering, and sorting
OpportunitySchema.index({ status: 1, verificationStatus: 1, publishedAt: -1 });
OpportunitySchema.index({
  status: 1,
  verificationStatus: 1,
  category: 1,
  workMode: 1,
});

// Full-text search index for job titles, company, descriptions, and required skills
OpportunitySchema.index({
  title: "text",
  companyName: "text",
  description: "text",
  requiredSkills: "text",
});

export const Opportunity: Model<IOpportunity> =
  mongoose.models.Opportunity ||
  mongoose.model<IOpportunity>("Opportunity", OpportunitySchema);

export default Opportunity;
