import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import {
  getStudentCareerSimulations,
  saveCareerSimulation,
} from "@/services/career/career-simulation-history.service";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const simulations = await getStudentCareerSimulations(session.user.id);

    return NextResponse.json({
      success: true,
      data: simulations,
      count: simulations.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("GET /api/career-simulator/history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load simulation history.",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const {
      careerPathId,
      targetCareerTitle,
      hypotheticalSkills,
      baselineScore,
      simulatedScore,
      scoreDelta,
      simulationSnapshot,
      notes,
    } = body;

    if (!careerPathId || !targetCareerTitle || simulationSnapshot === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required simulation fields." },
        { status: 400 }
      );
    }

    const saved = await saveCareerSimulation(session.user.id, {
      careerPathId,
      targetCareerTitle,
      hypotheticalSkills: Array.isArray(hypotheticalSkills) ? hypotheticalSkills : [],
      baselineScore: Number(baselineScore) || 0,
      simulatedScore: Number(simulatedScore) || 0,
      scoreDelta: Number(scoreDelta) || 0,
      simulationSnapshot,
      notes: typeof notes === "string" ? notes : "",
    });

    return NextResponse.json({
      success: true,
      message: "Career simulation saved successfully.",
      data: saved,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("POST /api/career-simulator/history error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save career simulation.",
      },
      { status: 500 }
    );
  }
}

