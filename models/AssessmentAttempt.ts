import mongoose, { Schema, Model, Document } from "mongoose";
import { IAssessmentAttempt } from "@/types/assessment";

export interface AssessmentAttemptDocument
  extends Omit<IAssessmentAttempt, "_id" | "id">,
    Document {}

const QuestionPublicSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    questionText: { type: String, required: true },
    codeSnippet: { type: String, default: "" },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    questionType: { type: String, required: true },
    options: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],
    marks: { type: Number, required: true, default: 1 },
  },
  { _id: false }
);

const TopicPerformanceSchema = new Schema(
  {
    topic: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const DifficultyPerformanceSchema = new Schema(
  {
    difficulty: { type: String, required: true },
    totalMarks: { type: Number, required: true },
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
  },
  { _id: false }
);

const AssessmentAttemptSchema = new Schema<AssessmentAttemptDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    assessmentId: {
      type: String,
      required: true,
      index: true,
    },
    assessmentTitle: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
      index: true,
    },
    questions: {
      type: [QuestionPublicSchema],
      required: true,
    },
    answers: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "timed_out", "abandoned"],
      default: "in_progress",
      index: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    proficiency: {
      type: String,
      enum: ["Beginner", "Developing", "Proficient", "Advanced"],
      default: "Beginner",
    },
    topicPerformance: {
      type: [TopicPerformanceSchema],
      default: [],
    },
    difficultyPerformance: {
      type: [DifficultyPerformanceSchema],
      default: [],
    },
    correctAnswersCount: {
      type: Number,
      default: 0,
    },
    incorrectAnswersCount: {
      type: Number,
      default: 0,
    },
    unansweredCount: {
      type: Number,
      default: 0,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "assessment_attempts",
  }
);

AssessmentAttemptSchema.index({ userId: 1, assessmentId: 1, createdAt: -1 });

export const AssessmentAttempt: Model<AssessmentAttemptDocument> =
  mongoose.models.AssessmentAttempt ||
  mongoose.model<AssessmentAttemptDocument>(
    "AssessmentAttempt",
    AssessmentAttemptSchema
  );

export default AssessmentAttempt;

