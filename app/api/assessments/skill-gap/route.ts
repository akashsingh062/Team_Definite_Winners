import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getSkillAssessmentCorrelations } from "@/services/assessment/assessment-skill-gap.service";

/**
 * GET /api/assessments/skill-gap
 * Correlates student self-reported skills against verified assessment outcomes.
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const correlations = await getSkillAssessmentCorrelations(session.user.id);

    return NextResponse.json({
      success: true,
      data: correlations,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("GET /api/assessments/skill-gap error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to correlate assessment skill gaps.",
      },
      { status: 500 }
    );
  }
}

