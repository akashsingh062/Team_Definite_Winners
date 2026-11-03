import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { MentorAdminService } from "@/services/mentor/mentor-admin.service";
import { MentorVerificationStatus } from "@/types/mentor";

/**
 * PATCH /api/admin/mentors/[mentorId]/verification
 * Admin action to approve, reject, or suspend a mentor.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ mentorId: string }> }
) {
  try {
    const adminSession = await requireAdmin();
    const { mentorId } = await params;
    const body = await req.json();

    const validStatuses: MentorVerificationStatus[] = [
      "pending",
      "under_review",
      "verified",
      "rejected",
      "suspended",
    ];

    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const updated = await MentorAdminService.updateVerificationStatus(
      adminSession.user.id,
      mentorId,
      body.status,
      body.notes
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Mentor verification status updated to ${body.status}.`,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Internal Error";
    const status =
      errMessage === "UNAUTHORIZED" ? 401 : errMessage === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: errMessage }, { status });
  }
}
