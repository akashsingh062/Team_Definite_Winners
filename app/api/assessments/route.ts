import { NextRequest, NextResponse } from "next/server";
import { getAssessments } from "@/services/assessment/assessment.service";

/**
 * GET /api/assessments
 * Retrieves published assessments with optional subject, difficulty, and search filters.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const search = searchParams.get("search") || undefined;

    const assessments = await getAssessments({ subject, difficulty, search });

    return NextResponse.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    console.error("GET /api/assessments error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load assessments.",
      },
      { status: 500 }
    );
  }
}

