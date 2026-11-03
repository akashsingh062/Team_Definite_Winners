import { connectToDatabase } from "@/lib/db/mongodb";
import { MentorshipFeedback } from "@/models/MentorshipFeedback";
import { MentorshipNote } from "@/models/MentorshipNote";
import { MentorshipSession } from "@/models/MentorshipSession";
import { MentorProfile } from "@/models/MentorProfile";
import { MentorshipReport } from "@/models/MentorshipReport";
import {
  IMentorshipFeedback,
  IMentorshipNote,
  IMentorshipReport,
  FeedbackHelpfulness,
  NoteCategory,
  NoteVisibility,
} from "@/types/mentor";
import { InAppNotificationService } from "./in-app-notification.service";

export interface SubmitFeedbackInput {
  sessionId: string;
  rating: number;
  helpfulness: FeedbackHelpfulness;
  feedback?: string;
  tags?: string[];
}

export interface AddNoteInput {
  sessionId: string;
  category: NoteCategory;
  title: string;
  content: string;
  actionItems?: string[];
  visibility?: NoteVisibility;
}

export class MentorshipFeedbackService {
  /**
   * Submit post-session feedback and recalculate mentor rating score.
   */
  static async submitFeedback(
    studentId: string,
    input: SubmitFeedbackInput
  ): Promise<IMentorshipFeedback> {
    await connectToDatabase();

    const session = await MentorshipSession.findById(input.sessionId);
    if (!session) {
      throw new Error("Mentorship session not found");
    }

    if (session.studentId !== studentId) {
      throw new Error("Only the student who attended the session can submit feedback");
    }

    if (session.status !== "completed") {
      throw new Error("Feedback can only be submitted for completed sessions");
    }

    const existingFeedback = await MentorshipFeedback.findOne({
      sessionId: input.sessionId,
    });

    if (existingFeedback) {
      throw new Error("Feedback has already been submitted for this session");
    }

    const clampedRating = Math.max(1, Math.min(5, Math.round(input.rating)));

    const feedbackDoc = await MentorshipFeedback.create({
      sessionId: input.sessionId,
      studentId,
      mentorId: session.mentorId,
      rating: clampedRating,
      helpfulness: input.helpfulness || "very_helpful",
      feedback: input.feedback?.trim(),
      tags: input.tags || [],
    });

    // Recalculate mentor rating
    const mentor = await MentorProfile.findOne({
      $or: [{ _id: session.mentorId.match(/^[0-9a-fA-F]{24}$/) ? session.mentorId : null }, { userId: session.mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    });

    if (mentor) {
      const allFeedback = await MentorshipFeedback.find({
        mentorId: { $in: [session.mentorId, mentor.userId, mentor._id?.toString()].filter(Boolean) },
      }).select("rating");

      const totalCount = allFeedback.length;
      const totalSum = allFeedback.reduce((acc, f) => acc + f.rating, 0);
      const newAverage =
        totalCount > 0 ? Math.round((totalSum / totalCount) * 10) / 10 : clampedRating;

      mentor.rating = {
        average: newAverage,
        count: totalCount,
      };
      await mentor.save();

      // Notify mentor
      await InAppNotificationService.sendNotification({
        userId: mentor.userId,
        type: "feedback_received",
        title: "New Student Feedback Received",
        message: `A student rated your recent session ${clampedRating}/5 stars.`,
        link: `/mentor/sessions`,
      });
    }

    return feedbackDoc.toObject() as unknown as IMentorshipFeedback;
  }

  /**
   * Add a private or shared guidance note to a session.
   */
  static async addSessionNote(
    authorId: string,
    input: AddNoteInput
  ): Promise<IMentorshipNote> {
    await connectToDatabase();

    const session = await MentorshipSession.findById(input.sessionId);
    if (!session) {
      throw new Error("Mentorship session not found");
    }

    const mentor = await MentorProfile.findOne({
      $or: [{ _id: session.mentorId.match(/^[0-9a-fA-F]{24}$/) ? session.mentorId : null }, { userId: session.mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    });

    const isMentor =
      mentor && (mentor.userId === authorId || mentor._id?.toString() === authorId);
    const isStudent = session.studentId === authorId;

    if (!isMentor && !isStudent) {
      throw new Error("Unauthorized to add notes to this session");
    }

    const note = await MentorshipNote.create({
      sessionId: input.sessionId,
      studentId: session.studentId,
      mentorId: session.mentorId,
      authorId,
      category: input.category || "general_note",
      title: input.title.trim(),
      content: input.content.trim(),
      actionItems: input.actionItems || [],
      visibility: input.visibility || "private_mentor_student",
    });

    return note.toObject() as unknown as IMentorshipNote;
  }

  /**
   * Get notes for a session.
   * If caller is the student, excludes mentor_only notes.
   */
  static async getSessionNotes(
    sessionId: string,
    callerId: string
  ): Promise<IMentorshipNote[]> {
    await connectToDatabase();

    const session = await MentorshipSession.findById(sessionId);
    if (!session) {
      throw new Error("Mentorship session not found");
    }

    const mentor = await MentorProfile.findOne({
      $or: [{ _id: session.mentorId.match(/^[0-9a-fA-F]{24}$/) ? session.mentorId : null }, { userId: session.mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    });

    const isMentor =
      mentor && (mentor.userId === callerId || mentor._id?.toString() === callerId);
    const isStudent = session.studentId === callerId;

    if (!isMentor && !isStudent) {
      throw new Error("Unauthorized to view notes for this session");
    }

    const query: Record<string, unknown> = { sessionId };
    if (!isMentor) {
      // Students can only see notes visible to both
      query.visibility = "private_mentor_student";
    }

    const notes = await MentorshipNote.find(query)
      .sort({ createdAt: 1 })
      .lean();

    return notes as unknown as IMentorshipNote[];
  }

  /**
   * File a moderation report regarding inappropriate conduct.
   */
  static async reportConduct(
    reporterId: string,
    input: {
      reportedId: string;
      sessionId?: string;
      reason: string;
      description: string;
    }
  ): Promise<IMentorshipReport> {
    await connectToDatabase();

    const report = await MentorshipReport.create({
      reporterId,
      reportedId: input.reportedId,
      sessionId: input.sessionId,
      reason: input.reason.trim(),
      description: input.description.trim(),
      status: "pending",
    });

    return report.toObject() as unknown as IMentorshipReport;
  }
}
