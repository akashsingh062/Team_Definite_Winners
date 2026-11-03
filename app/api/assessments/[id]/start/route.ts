import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { startAssessmentAttempt } from "@/services/assessment/assessment.service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/assessments/[id]/start
 * Starts or resumes an active assessment attempt for authenticated student.
 */
export async function POST(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    const attempt = await startAssessmentAttempt(session.user.id, id);

    return NextResponse.json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required to start an assessment." },
        { status: 401 }
      );
    }

    console.error("POST /api/assessments/[id]/start error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to start assessment attempt.",
      },
      { status: 400 }
    );
  }
}

