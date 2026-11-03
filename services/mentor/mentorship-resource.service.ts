import { connectToDatabase } from "@/lib/db/mongodb";
import { MentorshipResourceShare } from "@/models/MentorshipResourceShare";
import { MentorProfile } from "@/models/MentorProfile";
import { User } from "@/models/User";
import {
  IMentorshipResourceShare,
  ResourceShareType,
} from "@/types/mentor";
import { InAppNotificationService } from "./in-app-notification.service";

export interface ShareResourceInput {
  mentorId: string;
  resourceType: ResourceShareType;
  resourceReference: Record<string, unknown>;
}

export class MentorshipResourceService {
  /**
   * Explicitly share a student's resource with a designated mentor.
   */
  static async shareResource(
    studentId: string,
    input: ShareResourceInput
  ): Promise<IMentorshipResourceShare> {
    await connectToDatabase();

    const mentor = await MentorProfile.findOne({
      $or: [{ _id: input.mentorId.match(/^[0-9a-fA-F]{24}$/) ? input.mentorId : null }, { userId: input.mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    });

    if (!mentor) {
      throw new Error("Target mentor not found");
    }

    const mentorIdStr = mentor._id ? mentor._id.toString() : mentor.userId;

    // Check if identical resource is already actively shared with this mentor
    const existing = await MentorshipResourceShare.findOne({
      studentId,
      mentorId: { $in: [mentorIdStr, mentor.userId] },
      resourceType: input.resourceType,
      permissionStatus: "active",
    });

    if (existing) {
      // Update reference in-place
      existing.resourceReference = input.resourceReference;
      existing.grantedAt = new Date();
      await existing.save();
      return existing.toObject() as unknown as IMentorshipResourceShare;
    }

    const share = await MentorshipResourceShare.create({
      studentId,
      mentorId: mentorIdStr,
      resourceType: input.resourceType,
      resourceReference: input.resourceReference,
      permissionStatus: "active",
      grantedAt: new Date(),
    });

    // Notify mentor
    const student = await User.findById(studentId).select("name").lean();
    await InAppNotificationService.sendNotification({
      userId: mentor.userId,
      type: "resource_shared",
      title: "Student Shared a Resource With You",
      message: `${student?.name || "A student"} shared their ${input.resourceType} for your review.`,
      link: `/mentor/dashboard`,
    });

    return share.toObject() as unknown as IMentorshipResourceShare;
  }

  /**
   * Revoke access to a previously shared resource.
   * Immediately denies future access by the mentor.
   */
  static async revokeResourceAccess(
    studentId: string,
    shareId: string
  ): Promise<IMentorshipResourceShare> {
    await connectToDatabase();

    const share = await MentorshipResourceShare.findOne({
      _id: shareId,
      studentId,
    });

    if (!share) {
      throw new Error("Shared resource record not found or unauthorized");
    }

    share.permissionStatus = "revoked";
    share.revokedAt = new Date();
    await share.save();

    // Notify mentor
    const mentor = await MentorProfile.findOne({
      $or: [{ _id: share.mentorId.match(/^[0-9a-fA-F]{24}$/) ? share.mentorId : null }, { userId: share.mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    });

    if (mentor) {
      await InAppNotificationService.sendNotification({
        userId: mentor.userId,
        type: "resource_revoked",
        title: "Resource Access Revoked",
        message: `Student revoked access to their previously shared ${share.resourceType}.`,
        link: `/mentor/dashboard`,
      });
    }

    return share.toObject() as unknown as IMentorshipResourceShare;
  }

  /**
   * Get active shared resources accessible by a mentor for a specific student.
   * PRIVACY INVARIANT: Revoked resources are NEVER returned.
   */
  static async getSharedResourcesForMentor(
    mentorUserId: string,
    studentId?: string
  ): Promise<IMentorshipResourceShare[]> {
    await connectToDatabase();

    const mentor = await MentorProfile.findOne({ userId: mentorUserId });
    const mentorIds = [mentorUserId];
    if (mentor?._id) {
      mentorIds.push(mentor._id.toString());
    }

    const query: Record<string, unknown> = {
      mentorId: { $in: mentorIds },
      permissionStatus: "active", // STRICT: Only active
    };

    if (studentId) {
      query.studentId = studentId;
    }

    const shares = await MentorshipResourceShare.find(query)
      .sort({ grantedAt: -1 })
      .lean();

    return shares as unknown as IMentorshipResourceShare[];
  }

  /**
   * Get all shared resources created by a student (both active and revoked)
   * for audit and management purposes.
   */
  static async getStudentResourceShares(
    studentId: string
  ): Promise<any[]> {
    await connectToDatabase();

    const shares = await MentorshipResourceShare.find({ studentId })
      .sort({ grantedAt: -1 })
      .lean();

    const enriched = await Promise.all(
      shares.map(async (share) => {
        const mentor = await MentorProfile.findOne({
          $or: [{ _id: share.mentorId.match(/^[0-9a-fA-F]{24}$/) ? share.mentorId : null }, { userId: share.mentorId }].filter(
            (cond) => cond._id !== null || cond.userId !== null
          ),
        })
          .select("displayName headline organization")
          .lean();

        return {
          ...share,
          mentor: mentor || null,
        };
      })
    );

    return enriched;
  }
}
