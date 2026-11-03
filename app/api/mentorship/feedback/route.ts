import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorshipFeedbackService } from "@/services/mentor/mentorship-feedback.service";

/**
 * POST /api/mentorship/feedback
 * Submit feedback for a completed mentorship session.
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

    if (!body.sessionId || body.rating === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID and rating (1-5) are required.",
        },
        { status: 400 }
      );
    }

    const feedback = await MentorshipFeedbackService.submitFeedback(
      session.user.id,
      {
        sessionId: body.sessionId,
        rating: Number(body.rating),
        helpfulness: body.helpfulness || "very_helpful",
        feedback: body.feedback,
        tags: body.tags,
      }
    );

    return NextResponse.json({
      success: true,
      data: feedback,
      message: "Feedback submitted successfully. Thank you!",
    });
  } catch (error) {
    console.error("POST /api/mentorship/feedback error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit feedback",
      },
      { status: 400 }
    );
  }
}

