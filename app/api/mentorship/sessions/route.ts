import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorshipSessionService } from "@/services/mentor/mentorship-session.service";

/**
 * GET /api/mentorship/sessions
 * Returns sessions for current user as student or mentor.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const asMentor = searchParams.get("as") === "mentor";

    const sessions = asMentor
      ? await MentorshipSessionService.getMentorSessions(session.user.id)
      : await MentorshipSessionService.getStudentSessions(session.user.id);

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("GET /api/mentorship/sessions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch sessions",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mentorship/sessions
 * Schedule a new mentorship session.
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

    if (!body.mentorId || !body.studentId || !body.scheduledAt) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: mentorId, studentId, and scheduledAt are required.",
        },
        { status: 400 }
      );
    }

    const created = await MentorshipSessionService.scheduleSession(
      session.user.id,
      body
    );

    return NextResponse.json({
      success: true,
      data: created,
      message: "Session scheduled successfully.",
    });
  } catch (error) {
    console.error("POST /api/mentorship/sessions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to schedule session",
      },
      { status: 400 }
    );
  }
}
