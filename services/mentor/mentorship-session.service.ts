import { connectToDatabase } from "@/lib/db/mongodb";
import { MentorshipSession } from "@/models/MentorshipSession";
import { MentorProfile } from "@/models/MentorProfile";
import { User } from "@/models/User";
import { IMentorshipSession } from "@/types/mentor";
import { InAppNotificationService } from "./in-app-notification.service";

export interface ScheduleSessionInput {
  requestId?: string;
  studentId: string;
  mentorId: string;
  scheduledAt: string | Date;
  durationMinutes?: number;
  sessionType?: IMentorshipSession["sessionType"];
  timezone?: string;
  meetingUrl?: string;
  agenda?: string;
}

export class MentorshipSessionService {
  /**
   * Schedule a new mentorship session between student and mentor.
   */
  static async scheduleSession(
    actorId: string,
    input: ScheduleSessionInput
  ): Promise<IMentorshipSession> {
    await connectToDatabase();

    // Validate mentor
    const mentor = await MentorProfile.findOne({
      $or: [{ _id: input.mentorId.match(/^[0-9a-fA-F]{24}$/) ? input.mentorId : null }, { userId: input.mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    const mentorIdStr = mentor._id ? mentor._id.toString() : mentor.userId;

    // Validate meeting URL if provided
    if (input.meetingUrl && input.meetingUrl.trim()) {
      try {
        const parsed = new URL(input.meetingUrl);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw new Error("Invalid meeting protocol. Must be http or https.");
        }
      } catch {
        throw new Error("Invalid meeting URL format.");
      }
    }

    const scheduledDate = new Date(input.scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      throw new Error("Invalid date and time for scheduled session.");
    }

    const session = await MentorshipSession.create({
      requestId: input.requestId,
      studentId: input.studentId,
      mentorId: mentorIdStr,
      scheduledAt: scheduledDate,
      durationMinutes: input.durationMinutes || 45,
      sessionType: input.sessionType || "1_on_1_advisory",
      timezone: input.timezone || mentor.availability?.timezone || "Asia/Kolkata",
      meetingUrl: input.meetingUrl?.trim(),
      agenda: input.agenda?.trim(),
      status: "scheduled",
    });

    // Notify the other party
    const isActorMentor = mentor.userId === actorId || mentorIdStr === actorId;
    const recipientId = isActorMentor ? input.studentId : mentor.userId;
    const sessionTimeFormatted = scheduledDate.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    await InAppNotificationService.sendNotification({
      userId: recipientId,
      type: "session_scheduled",
      title: "Mentorship Session Scheduled",
      message: `A new session has been scheduled for ${sessionTimeFormatted}`,
      link: isActorMentor
        ? `/dashboard/mentorship-sessions`
        : `/mentor/sessions`,
    });

    return session.toObject() as unknown as IMentorshipSession;
  }

  /**
   * Get all sessions for a student.
   */
  static async getStudentSessions(studentId: string): Promise<any[]> {
    await connectToDatabase();
    const sessions = await MentorshipSession.find({ studentId })
      .sort({ scheduledAt: -1 })
      .lean();

    const enriched = await Promise.all(
      sessions.map(async (sess) => {
        const mentor = await MentorProfile.findOne({
          $or: [{ _id: sess.mentorId.match(/^[0-9a-fA-F]{24}$/) ? sess.mentorId : null }, { userId: sess.mentorId }].filter(
            (cond) => cond._id !== null || cond.userId !== null
          ),
        })
          .select("displayName headline organization currentRole rating")
          .lean();

        return {
          ...sess,
          mentor: mentor || null,
        };
      })
    );

    return enriched;
  }

  /**
   * Get all sessions for a mentor.
   */
  static async getMentorSessions(mentorUserId: string): Promise<any[]> {
    await connectToDatabase();
    const mentorProfile = await MentorProfile.findOne({ userId: mentorUserId }).lean();
    const mentorIds = [mentorUserId];
    if (mentorProfile?._id) {
      mentorIds.push(mentorProfile._id.toString());
    }

    const sessions = await MentorshipSession.find({
      mentorId: { $in: mentorIds },
    })
      .sort({ scheduledAt: -1 })
      .lean();

    const enriched = await Promise.all(
      sessions.map(async (sess) => {
        const student = await User.findById(sess.studentId)
          .select("name email image")
          .lean();

        return {
          ...sess,
          student: student || null,
        };
      })
    );

    return enriched;
  }

  /**
   * Update session status (completed, cancelled, rescheduled).
   */
  static async updateSessionStatus(
    sessionId: string,
    actorId: string,
    status: "completed" | "cancelled" | "rescheduled",
    details?: {
      cancellationReason?: string;
      rescheduledAt?: string | Date;
      meetingUrl?: string;
    }
  ): Promise<IMentorshipSession> {
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
      mentor && (mentor.userId === actorId || mentor._id?.toString() === actorId);
    const isStudent = session.studentId === actorId;

    if (!isMentor && !isStudent) {
      throw new Error("Unauthorized to modify this session");
    }

    if (status === "completed") {
      session.status = "completed";
      session.completedAt = new Date();
    } else if (status === "cancelled") {
      session.status = "cancelled";
      session.cancelledBy = actorId;
      session.cancellationReason = details?.cancellationReason || "No reason specified";

      // Notify other party
      const notifyTarget = isMentor ? session.studentId : mentor?.userId;
      if (notifyTarget) {
        await InAppNotificationService.sendNotification({
          userId: notifyTarget,
          type: "session_cancelled",
          title: "Mentorship Session Cancelled",
          message: `The session on ${new Date(session.scheduledAt).toLocaleDateString()} was cancelled. Reason: ${session.cancellationReason}`,
          link: isMentor ? `/dashboard/mentorship-sessions` : `/mentor/sessions`,
        });
      }
    } else if (status === "rescheduled") {
      if (!details?.rescheduledAt) {
        throw new Error("Rescheduled date and time required");
      }
      const newDate = new Date(details.rescheduledAt);
      session.scheduledAt = newDate;
      session.status = "rescheduled";
      if (details.meetingUrl) {
        session.meetingUrl = details.meetingUrl;
      }

      const notifyTarget = isMentor ? session.studentId : mentor?.userId;
      if (notifyTarget) {
        await InAppNotificationService.sendNotification({
          userId: notifyTarget,
          type: "session_rescheduled",
          title: "Mentorship Session Rescheduled",
          message: `Session rescheduled to ${newDate.toLocaleString()}`,
          link: isMentor ? `/dashboard/mentorship-sessions` : `/mentor/sessions`,
        });
      }
    }

    await session.save();
    return session.toObject() as unknown as IMentorshipSession;
  }
}
