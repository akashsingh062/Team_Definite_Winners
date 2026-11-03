import mongoose, { Schema, Model, Document } from "mongoose";
import { IMentorshipNote } from "@/types/mentor";

export interface MentorshipNoteDocument
  extends Omit<IMentorshipNote, "_id" | "id">,
    Document {}

const MentorshipNoteSchema = new Schema<MentorshipNoteDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      index: true,
    },
    mentorId: {
      type: String,
      required: true,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "resume_feedback",
        "project_feedback",
        "learning_recommendation",
        "career_advice",
        "interview_prep",
        "general_note",
      ],
      default: "general_note",
    },
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
    },
    actionItems: [{ type: String, trim: true }],
    visibility: {
      type: String,
      enum: ["private_mentor_student", "mentor_only"],
      default: "private_mentor_student",
    },
  },
  {
    timestamps: true,
  }
);

MentorshipNoteSchema.index({ sessionId: 1, createdAt: 1 });

export const MentorshipNote: Model<MentorshipNoteDocument> =
  mongoose.models.MentorshipNote ||
  mongoose.model<MentorshipNoteDocument>("MentorshipNote", MentorshipNoteSchema);

export default MentorshipNote;
