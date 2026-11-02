import mongoose, { Schema, Model, Document } from "mongoose";
import {
  IStudentSkillProgress,
  SkillProgressStatus,
} from "@/types/skill-gap";

export interface StudentSkillProgressDocument
  extends Omit<IStudentSkillProgress, "_id" | "id">,
    Document {}

const StudentSkillProgressSchema = new Schema<StudentSkillProgressDocument>(
  {
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      index: true,
    },
    skillName: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["not_started", "learning", "practicing", "completed"],
      default: "not_started",
      index: true,
    },
    learningResourceIds: {
      type: [String],
      default: [],
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index ensuring one progress record per student per canonical skill
StudentSkillProgressSchema.index(
  { studentId: 1, skillName: 1 },
  { unique: true }
);

export const StudentSkillProgress: Model<StudentSkillProgressDocument> =
  mongoose.models.StudentSkillProgress ||
  mongoose.model<StudentSkillProgressDocument>(
    "StudentSkillProgress",
    StudentSkillProgressSchema
  );

