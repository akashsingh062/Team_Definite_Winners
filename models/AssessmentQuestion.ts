import mongoose, { Schema, Model, Document } from "mongoose";
import { IAssessmentQuestion } from "@/types/assessment";

export interface AssessmentQuestionDocument
  extends Omit<IAssessmentQuestion, "_id" | "id">,
    Document {}

const QuestionOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const AssessmentQuestionSchema = new Schema<AssessmentQuestionDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    codeSnippet: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      required: true,
      index: true,
    },
    questionType: {
      type: String,
      enum: ["multiple_choice", "output_prediction", "code_debugging"],
      default: "multiple_choice",
      index: true,
    },
    options: {
      type: [QuestionOptionSchema],
      required: true,
      validate: [
        (val: unknown[]) => val.length >= 2,
        "A question must have at least 2 options",
      ],
    },
    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
    marks: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },
    createdBy: {
      type: String,
      default: "system",
    },
  },
  {
    timestamps: true,
    collection: "assessment_questions",
  }
);

AssessmentQuestionSchema.index({ subject: 1, status: 1, difficulty: 1 });

export const AssessmentQuestion: Model<AssessmentQuestionDocument> =
  mongoose.models.AssessmentQuestion ||
  mongoose.model<AssessmentQuestionDocument>(
    "AssessmentQuestion",
    AssessmentQuestionSchema
  );

export default AssessmentQuestion;

