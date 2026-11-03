import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorshipFeedbackService } from "@/services/mentor/mentorship-feedback.service";

/**
 * GET /api/mentorship/sessions/[sessionId]/notes
 * Fetch notes for a session.
 */
export async function GET(
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
    const notes = await MentorshipFeedbackService.getSessionNotes(
      sessionId,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("GET /api/mentorship/sessions/[sessionId]/notes error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch notes",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mentorship/sessions/[sessionId]/notes
 * Add structured guidance or private notes to a session.
 */
export async function POST(
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

    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, error: "Title and content are required." },
        { status: 400 }
      );
    }

    const note = await MentorshipFeedbackService.addSessionNote(
      session.user.id,
      {
        sessionId,
        category: body.category,
        title: body.title,
        content: body.content,
        actionItems: body.actionItems,
        visibility: body.visibility,
      }
    );

    return NextResponse.json({
      success: true,
      data: note,
      message: "Note added successfully.",
    });
  } catch (error) {
    console.error("POST /api/mentorship/sessions/[sessionId]/notes error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to add note",
      },
      { status: 400 }
    );
  }
}
