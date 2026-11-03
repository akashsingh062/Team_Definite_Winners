import { connectToDatabase } from "@/lib/db/mongodb";
import { MentorProfile } from "@/models/MentorProfile";
import { MentorshipReport } from "@/models/MentorshipReport";
import { User } from "@/models/User";
import {
  IMentorProfile,
  IMentorshipReport,
  MentorVerificationStatus,
} from "@/types/mentor";
import { InAppNotificationService } from "./in-app-notification.service";

export class MentorAdminService {
  /**
   * Fetch all mentors for administrative moderation and review.
   */
  static async getMentorsForAdmin(status?: MentorVerificationStatus): Promise<IMentorProfile[]> {
    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (status) {
      query.verificationStatus = status;
    }

    const mentors = await MentorProfile.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return mentors as unknown as IMentorProfile[];
  }

  /**
   * Approve, reject, or suspend a mentor profile.
   * Only accessible by authorized administrators.
   */
  static async updateVerificationStatus(
    adminId: string,
    mentorId: string,
    status: MentorVerificationStatus,
    notes?: string
  ): Promise<IMentorProfile> {
    await connectToDatabase();

    const mentor = await MentorProfile.findOne({
      $or: [{ _id: mentorId.match(/^[0-9a-fA-F]{24}$/) ? mentorId : null }, { userId: mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    });

    if (!mentor) {
      throw new Error("Mentor profile not found");
    }

    mentor.verificationStatus = status;
    mentor.verificationNotes = notes || undefined;
    if (status === "verified") {
      mentor.verifiedAt = new Date();
      mentor.verifiedBy = adminId;
      // Mark credentials verified
      if (mentor.credentials && mentor.credentials.length > 0) {
        mentor.credentials.forEach((c) => (c.verified = true));
      }
    } else if (status === "rejected" || status === "suspended") {
      mentor.availability.isAcceptingRequests = false;
    }

    await mentor.save();

    // Dispatch notification to mentor
    const statusReadable =
      status === "verified"
        ? "Approved and Verified"
        : status === "rejected"
        ? "Declined"
        : status === "suspended"
        ? "Suspended"
        : status.replace("_", " ");

    await InAppNotificationService.sendNotification({
      userId: mentor.userId,
      type: "verification_status_updated",
      title: `Mentor Verification ${statusReadable}`,
      message:
        status === "verified"
          ? "Congratulations! Your mentor profile has been verified and is now live for students to discover."
          : `Your mentor verification status has been updated to "${statusReadable}". Reason/Notes: ${notes || "None provided"}`,
      link: `/mentor/profile`,
    });

    return mentor.toObject() as unknown as IMentorProfile;
  }

  /**
   * Get all conduct reports for moderation.
   */
  static async getConductReports(): Promise<IMentorshipReport[]> {
    await connectToDatabase();
    const reports = await MentorshipReport.find()
      .sort({ createdAt: -1 })
      .lean();

    return reports as unknown as IMentorshipReport[];
  }

  /**
   * Resolve or dismiss a conduct report.
   */
  static async resolveReport(
    adminId: string,
    reportId: string,
    status: "resolved" | "dismissed",
    adminNotes?: string
  ): Promise<IMentorshipReport> {
    await connectToDatabase();

    const report = await MentorshipReport.findById(reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    report.status = status;
    report.adminNotes = adminNotes || `Reviewed by admin ${adminId}`;
    await report.save();

    return report.toObject() as unknown as IMentorshipReport;
  }
}
