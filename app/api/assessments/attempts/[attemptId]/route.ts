import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";
import { saveAttemptAnswers } from "@/services/assessment/assessment.service";

interface RouteParams {
  params: Promise<{
    attemptId: string;
  }>;
}

/**
 * GET /api/assessments/attempts/[attemptId]
 * Retrieves current active attempt status.
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await requireAuth();
    const { attemptId } = await params;

    const attempt = await AssessmentAttempt.findById(attemptId);
    if (!attempt) {
      return NextResponse.json(
        { success: false, error: "Attempt not found." },
        { status: 404 }
      );
    }

    if (attempt.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to this assessment attempt." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("GET /api/assessments/attempts/[attemptId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load attempt.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/assessments/attempts/[attemptId]
 * Auto-saves student answers during active attempt.
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await requireAuth();
    const { attemptId } = await params;
    const body = await req.json();

    const answers = body.answers || {};
    const updated = await saveAttemptAnswers(attemptId, session.user.id, answers);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("PATCH /api/assessments/attempts/[attemptId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save answers.",
      },
      { status: 400 }
    );
  }
}

