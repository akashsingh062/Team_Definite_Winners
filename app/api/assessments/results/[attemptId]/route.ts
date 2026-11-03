import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { getAttemptResult } from "@/services/assessment/assessment.service";

interface RouteParams {
  params: Promise<{
    attemptId: string;
  }>;
}

/**
 * GET /api/assessments/results/[attemptId]
 * Retrieves post-submission result review with detailed explanations and topic metrics.
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const { attemptId } = await params;
    const isAdmin = (session.user as { role?: string })?.role === "admin";
    const result = await getAttemptResult(attemptId, session.user.id, isAdmin);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("GET /api/assessments/results/[attemptId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load assessment results.",
      },
      { status: 400 }
    );
  }
}

