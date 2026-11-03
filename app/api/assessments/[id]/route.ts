import { NextRequest, NextResponse } from "next/server";
import { getAssessmentById } from "@/services/assessment/assessment.service";
import { getCurrentSession } from "@/lib/auth-server";
import { AssessmentAttempt } from "@/models/AssessmentAttempt";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/assessments/[id]
 * Retrieves single assessment configuration and checks student's recent attempt status.
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const assessment = await getAssessmentById(id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found." },
        { status: 404 }
      );
    }

    const session = await getCurrentSession();
    let userActiveAttempt = null;
    let lastCompletedAttempt = null;

    if (session?.user?.id) {
      userActiveAttempt = await AssessmentAttempt.findOne({
        userId: session.user.id,
        assessmentId: assessment._id.toString(),
        status: "in_progress",
      }).select("_id expiresAt startedAt status");

      lastCompletedAttempt = await AssessmentAttempt.findOne({
        userId: session.user.id,
        assessmentId: assessment._id.toString(),
        status: { $in: ["submitted", "timed_out"] },
      })
        .sort({ submittedAt: -1 })
        .select("_id score percentage isPassed proficiency submittedAt");
    }

    return NextResponse.json({
      success: true,
      data: {
        assessment,
        userActiveAttempt,
        lastCompletedAttempt,
      },
    });
  } catch (error) {
    console.error("GET /api/assessments/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load assessment details.",
      },
      { status: 500 }
    );
  }
}

