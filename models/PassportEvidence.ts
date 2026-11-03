import mongoose, { Schema, Model, Document } from "mongoose";
import { SkillEvidenceType, SkillVerificationStatus } from "@/types/skills-passport";

export interface IPassportEvidenceDoc extends Document {
  passportId: string;
  userId: string;
  evidenceType: SkillEvidenceType;
  itemType: "skill" | "project" | "certification" | "assessment";
  itemId: string;
  itemName: string;
  verificationStatus: SkillVerificationStatus;
  verificationSource: string;
  verifiedAt: Date;
  metadata?: Record<string, unknown>;
}

const PassportEvidenceSchema = new Schema<IPassportEvidenceDoc>(
  {
    passportId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    evidenceType: {
      type: String,
      enum: [
        "self_reported",
        "resume_extracted",
        "project_demonstrated",
        "assessment_verified",
        "externally_verified",
      ],
      required: true,
    },
    itemType: {
      type: String,
      enum: ["skill", "project", "certification", "assessment"],
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    itemName: {
      type: String,
      required: true,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "flagged"],
      default: "unverified",
    },
    verificationSource: {
      type: String,
      required: true,
      trim: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "passport_evidences",
  }
);

PassportEvidenceSchema.index({ passportId: 1, itemType: 1, itemName: 1 });

export const PassportEvidence: Model<IPassportEvidenceDoc> =
  mongoose.models.PassportEvidence ||
  mongoose.model<IPassportEvidenceDoc>("PassportEvidence", PassportEvidenceSchema);

export default PassportEvidence;
