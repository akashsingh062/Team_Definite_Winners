import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import {
  getRegionalSkillDemand,
  getRegionalSkillGapAnalysis,
} from "@/services/local/local-opportunity.service";

/**
 * GET /api/local-opportunities/skills
 * Regional skill demand intelligence and student gap analysis.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);

    const state = searchParams.get("state") || undefined;
    const district = searchParams.get("district") || undefined;

    const demand = await getRegionalSkillDemand(state, district);

    let studentGapAnalysis = null;
    if (session?.user?.id) {
      studentGapAnalysis = await getRegionalSkillGapAnalysis(
        session.user.id,
        state,
        district
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        demand,
        studentGapAnalysis,
      },
    });
  } catch (error) {
    console.error("GET /api/local-opportunities/skills error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load regional skill intelligence.",
      },
      { status: 500 }
    );
  }
}

