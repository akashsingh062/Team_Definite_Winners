import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { compareCareerPaths } from "@/services/career/career-comparison.service";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await req.json();
    const { careerPathIds } = body;

    if (!Array.isArray(careerPathIds) || careerPathIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide 1 to 3 careerPathIds to compare." },
        { status: 400 }
      );
    }

    if (careerPathIds.length > 3) {
      return NextResponse.json(
        { success: false, error: "A maximum of 3 career paths can be compared at one time." },
        { status: 400 }
      );
    }

    const comparisonResult = await compareCareerPaths(session.user.id, careerPathIds);

    return NextResponse.json({
      success: true,
      data: comparisonResult,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required to compare career paths." },
        { status: 401 }
      );
    }

    console.error("POST /api/career-simulator/compare error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to compare career paths.",
      },
      { status: 500 }
    );
  }
}

