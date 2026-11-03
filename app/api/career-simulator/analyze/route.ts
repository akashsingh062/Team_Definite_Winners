import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { runCareerWhatIfSimulation } from "@/services/career/career-simulator.service";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const body = await req.json();
    const { careerPathId, hypotheticalSkills } = body;

    if (!careerPathId || typeof careerPathId !== "string") {
      return NextResponse.json(
        { success: false, error: "Target careerPathId is required." },
        { status: 400 }
      );
    }

    const simulationResult = await runCareerWhatIfSimulation(
      session.user.id,
      careerPathId,
      Array.isArray(hypotheticalSkills) ? hypotheticalSkills : []
    );

    return NextResponse.json({
      success: true,
      data: simulationResult,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required to run career simulations." },
        { status: 401 }
      );
    }

    console.error("POST /api/career-simulator/analyze error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to run career simulation.",
      },
      { status: 500 }
    );
  }
}

