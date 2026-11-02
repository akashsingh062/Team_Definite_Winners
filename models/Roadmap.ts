import mongoose, { Schema, Model, Document } from "mongoose";
import {
  IRoadmap,
  IRoadmapMilestone,
  IRoadmapTask,
  IRoadmapAssignment,
  LearningPace,
  MilestoneStatus,
} from "@/types/roadmap";

export interface RoadmapDocument
  extends Omit<IRoadmap, "_id" | "id">,
    Document {}

const RoadmapTaskSchema = new Schema<IRoadmapTask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const RoadmapAssignmentSchema = new Schema<IRoadmapAssignment>(
  {
    title: { type: String, required: true, trim: true },
    objective: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requiredSkills: [{ type: String, trim: true }],
    difficultyLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    expectedDeliverable: { type: String, required: true, trim: true },
    completionCriteria: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const RoadmapMilestoneSchema = new Schema<IRoadmapMilestone>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skillName: { type: String, required: true, trim: true },
    weekNumber: { type: Number, required: true, default: 1 },
    objectives: [{ type: String, trim: true }],
    tasks: { type: [RoadmapTaskSchema], default: [] },
    resourceIds: [{ type: String, trim: true }],
    assignment: { type: RoadmapAssignmentSchema, default: undefined },
    estimatedDuration: { type: String, required: true, trim: true },
    estimatedHours: { type: Number, required: true, default: 10 },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "skipped"],
      default: "not_started",
    },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    notes: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const SkillGapSnapshotSchema = new Schema(
  {
    skillName: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    category: { type: String, trim: true, default: "Technical" },
  },
  { _id: false }
);

const RoadmapSchema = new Schema<RoadmapDocument>(
  {
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Roadmap title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Roadmap description is required"],
      trim: true,
    },
    targetRole: {
      type: String,
      required: [true, "Target career role is required"],
      trim: true,
    },
    selectedOpportunityIds: {
      type: [String],
      default: [],
    },
    skillGapSnapshot: {
      type: [SkillGapSnapshotSchema],
      default: [],
    },
    estimatedDuration: {
      type: String,
      required: true,
      default: "6 weeks",
    },
    totalEstimatedHours: {
      type: Number,
      required: true,
      default: 60,
    },
    studyHoursPerDay: {
      type: Number,
      required: true,
      default: 2,
    },
    studyDaysPerWeek: {
      type: Number,
      required: true,
      default: 5,
    },
    learningPace: {
      type: String,
      enum: ["relaxed", "moderate", "intensive"],
      default: "moderate",
    },
    milestones: {
      type: [RoadmapMilestoneSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
      index: true,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

RoadmapSchema.index({ studentId: 1, status: 1 });
RoadmapSchema.index({ studentId: 1, createdAt: -1 });

export const Roadmap: Model<RoadmapDocument> =
  mongoose.models.Roadmap ||
  mongoose.model<RoadmapDocument>("Roadmap", RoadmapSchema);

