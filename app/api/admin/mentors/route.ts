import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { MentorAdminService } from "@/services/mentor/mentor-admin.service";
import { MentorVerificationStatus } from "@/types/mentor";

/**
 * GET /api/admin/mentors
 * Admin list of mentors across all verification states.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") as MentorVerificationStatus) || undefined;

    const mentors = await MentorAdminService.getMentorsForAdmin(status);

    return NextResponse.json({
      success: true,
      data: mentors,
      count: mentors.length,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Internal Error";
    const status =
      errMessage === "UNAUTHORIZED" ? 401 : errMessage === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: errMessage }, { status });
  }
}

