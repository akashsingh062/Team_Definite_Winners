import { NextRequest, NextResponse } from "next/server";
import { getCareerPaths } from "@/services/career/career-path.service";
import { CareerDifficulty } from "@/types/career-path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const difficulty = (searchParams.get("difficulty") as CareerDifficulty) || undefined;

    const careerPaths = await getCareerPaths({ category, search, difficulty });

    return NextResponse.json({
      success: true,
      data: careerPaths,
      count: careerPaths.length,
    });
  } catch (error) {
    console.error("GET /api/career-paths error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve career paths.",
      },
      { status: 500 }
    );
  }
}

