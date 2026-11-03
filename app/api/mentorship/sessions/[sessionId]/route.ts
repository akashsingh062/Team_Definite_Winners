import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorshipSessionService } from "@/services/mentor/mentorship-session.service";

/**
 * PATCH /api/mentorship/sessions/[sessionId]
 * Update session status: completed, cancelled, rescheduled.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { sessionId } = await params;
    const body = await req.json();

    if (!["completed", "cancelled", "rescheduled"].includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Must be completed, cancelled, or rescheduled.",
        },
        { status: 400 }
      );
    }

    const updated = await MentorshipSessionService.updateSessionStatus(
      sessionId,
      session.user.id,
      body.status,
      {
        cancellationReason: body.cancellationReason,
        rescheduledAt: body.rescheduledAt,
        meetingUrl: body.meetingUrl,
      }
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Session updated to ${body.status}.`,
    });
  } catch (error) {
    console.error("PATCH /api/mentorship/sessions/[sessionId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update session",
      },
      { status: 400 }
    );
  }
}

