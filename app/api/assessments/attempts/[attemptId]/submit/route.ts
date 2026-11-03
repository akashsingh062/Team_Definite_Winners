import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { submitAssessmentAttempt } from "@/services/assessment/assessment.service";

interface RouteParams {
  params: Promise<{
    attemptId: string;
  }>;
}

/**
 * POST /api/assessments/attempts/[attemptId]/submit
 * Finalizes and scores the assessment attempt on the server.
 */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await requireAuth();
    const { attemptId } = await params;

    const { attempt, result } = await submitAssessmentAttempt(attemptId, session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        attempt,
        result,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required to submit assessment." },
        { status: 401 }
      );
    }

    console.error("POST /api/assessments/attempts/[attemptId]/submit error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to submit assessment.",
      },
      { status: 400 }
    );
  }
}

