import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getStudentAssessmentsHistory } from "@/services/assessment/assessment.service";

/**
 * GET /api/assessments/history
 * Retrieves authenticated student's past attempts and verified evidence.
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const history = await getStudentAssessmentsHistory(session.user.id);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("GET /api/assessments/history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load assessment history.",
      },
      { status: 500 }
    );
  }
}

