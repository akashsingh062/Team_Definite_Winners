import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorshipFeedbackService } from "@/services/mentor/mentorship-feedback.service";

/**
 * POST /api/mentorship/reports
 * Submit a conduct or moderation report.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.reportedId || !body.reason || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: "reportedId, reason, and description are required.",
        },
        { status: 400 }
      );
    }

    const report = await MentorshipFeedbackService.reportConduct(
      session.user.id,
      body
    );

    return NextResponse.json({
      success: true,
      data: report,
      message: "Report submitted to administrators for review.",
    });
  } catch (error) {
    console.error("POST /api/mentorship/reports error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit report",
      },
      { status: 400 }
    );
  }
}

