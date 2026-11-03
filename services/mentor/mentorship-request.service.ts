import { connectToDatabase } from "@/lib/db/mongodb";
import { MentorshipRequest } from "@/models/MentorshipRequest";
import { MentorProfile } from "@/models/MentorProfile";
import { User } from "@/models/User";
import { IMentorshipRequest } from "@/types/mentor";
import { InAppNotificationService } from "./in-app-notification.service";

export interface CreateRequestInput {
  mentorId: string;
  careerGoal: string;
  topic: string;
  introduction: string;
  preferredLanguage?: string;
  preferredSessionType?: IMentorshipRequest["preferredSessionType"];
  preferredDates?: string[];
  resourceReferences?: IMentorshipRequest["resourceReferences"];
}

export class MentorshipRequestService {
  /**
   * Submit a mentorship request from a student to a verified mentor.
   */
  static async createRequest(
    studentId: string,
    input: CreateRequestInput
  ): Promise<IMentorshipRequest> {
    await connectToDatabase();

    // 1. Verify that mentor exists and is verified
    const mentor = await MentorProfile.findOne({
      $or: [{ _id: input.mentorId.match(/^[0-9a-fA-F]{24}$/) ? input.mentorId : null }, { userId: input.mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    if (mentor.verificationStatus !== "verified") {
      throw new Error("Mentorship requests can only be sent to verified mentors");
    }

    if (!mentor.availability?.isAcceptingRequests) {
      throw new Error("Mentor is currently not accepting new mentorship requests");
    }

    // 2. Prevent duplicate active requests (pending or accepted) to this mentor
    const targetMentorId = mentor._id ? mentor._id.toString() : mentor.userId;
    const existingActiveRequest = await MentorshipRequest.findOne({
      studentId,
      mentorId: { $in: [targetMentorId, mentor.userId] },
      status: { $in: ["pending", "accepted"] },
    });

    if (existingActiveRequest) {
      throw new Error(
        `You already have an active ${existingActiveRequest.status} mentorship request with this mentor`
      );
    }

    // 3. Create request
    const request = await MentorshipRequest.create({
      studentId,
      mentorId: targetMentorId,
      careerGoal: input.careerGoal.trim(),
      topic: input.topic.trim(),
      introduction: input.introduction.trim(),
      preferredLanguage: input.preferredLanguage || "English",
      preferredSessionType: input.preferredSessionType || "1_on_1_advisory",
      preferredDates: input.preferredDates || [],
      resourceReferences: input.resourceReferences || [],
      status: "pending",
    });

    // 4. Notify mentor
    const studentUser = await User.findById(studentId).select("name email").lean();
    const studentName = studentUser?.name || "A student";

    await InAppNotificationService.sendNotification({
      userId: mentor.userId,
      type: "mentorship_request_received",
      title: "New Mentorship Request Received",
      message: `${studentName} requested mentorship on topic: "${input.topic}"`,
      link: `/mentor/requests`,
    });

    return request.toObject() as unknown as IMentorshipRequest;
  }

  /**
   * Get all mentorship requests submitted by a student.
   */
  static async getStudentRequests(studentId: string): Promise<any[]> {
    await connectToDatabase();
    const requests = await MentorshipRequest.find({ studentId })
      .sort({ createdAt: -1 })
      .lean();

    // Populate mentor info
    const enriched = await Promise.all(
      requests.map(async (req) => {
        const mentor = await MentorProfile.findOne({
          $or: [{ _id: req.mentorId.match(/^[0-9a-fA-F]{24}$/) ? req.mentorId : null }, { userId: req.mentorId }].filter(
            (cond) => cond._id !== null || cond.userId !== null
          ),
        })
          .select("displayName headline organization currentRole experienceYears rating verificationStatus")
          .lean();

        return {
          ...req,
          mentor: mentor || null,
        };
      })
    );

    return enriched;
  }

  /**
   * Get requests received by a mentor.
   */
  static async getMentorRequests(mentorUserId: string): Promise<any[]> {
    await connectToDatabase();
    const mentorProfile = await MentorProfile.findOne({ userId: mentorUserId }).lean();
    const mentorIds = [mentorUserId];
    if (mentorProfile?._id) {
      mentorIds.push(mentorProfile._id.toString());
    }

    const requests = await MentorshipRequest.find({
      mentorId: { $in: mentorIds },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Populate student info
    const enriched = await Promise.all(
      requests.map(async (req) => {
        const student = await User.findById(req.studentId)
          .select("name email image")
          .lean();

        return {
          ...req,
          student: student || null,
        };
      })
    );

    return enriched;
  }

  /**
   * Update mentorship request status:
   * - Mentor can "accepted" or "rejected"
   * - Student can "cancelled"
   * - Either can mark "completed"
   */
  static async updateRequestStatus(
    requestId: string,
    actorId: string,
    status: "accepted" | "rejected" | "cancelled" | "completed",
    mentorResponse?: string
  ): Promise<IMentorshipRequest> {
    await connectToDatabase();

    const request = await MentorshipRequest.findById(requestId);
    if (!request) {
      throw new Error("Mentorship request not found");
    }

    // Identify if actor is mentor or student
    const mentorProfile = await MentorProfile.findOne({
      $or: [{ _id: request.mentorId.match(/^[0-9a-fA-F]{24}$/) ? request.mentorId : null }, { userId: request.mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    });

    const isMentor =
      mentorProfile && (mentorProfile.userId === actorId || mentorProfile._id?.toString() === actorId);
    const isStudent = request.studentId === actorId;

    if (!isMentor && !isStudent) {
      throw new Error("Unauthorized to modify this mentorship request");
    }

    if (status === "accepted" || status === "rejected") {
      if (!isMentor) {
        throw new Error("Only the mentor can accept or reject this request");
      }
      request.status = status;
      request.mentorResponse = mentorResponse || undefined;
      request.respondedAt = new Date();

      // Notify student
      const mentorName = mentorProfile?.displayName || "Your mentor";
      await InAppNotificationService.sendNotification({
        userId: request.studentId,
        type:
          status === "accepted"
            ? "mentorship_request_accepted"
            : "mentorship_request_rejected",
        title: `Mentorship Request ${status === "accepted" ? "Accepted" : "Declined"}`,
        message: `${mentorName} has ${status === "accepted" ? "accepted" : "declined"} your mentorship request.`,
        link: `/dashboard/mentorship-requests`,
      });
    } else if (status === "cancelled") {
      if (!isStudent && !isMentor) {
        throw new Error("Unauthorized to cancel this request");
      }
      request.status = "cancelled";

      // If cancelled by student, notify mentor
      if (isStudent && mentorProfile) {
        await InAppNotificationService.sendNotification({
          userId: mentorProfile.userId,
          type: "mentorship_request_cancelled",
          title: "Mentorship Request Cancelled",
          message: "A student cancelled their mentorship request.",
          link: `/mentor/requests`,
        });
      }
    } else if (status === "completed") {
      request.status = "completed";
    }

    await request.save();
    return request.toObject() as unknown as IMentorshipRequest;
  }
}

