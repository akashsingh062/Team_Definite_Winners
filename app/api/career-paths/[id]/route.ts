import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { getCareerPathByIdOrSlug } from "@/services/career/career-path.service";
import {
  getAggregatedStudentProfile,
  calculateCareerReadiness,
} from "@/services/career/career-readiness.service";
import { generateCareerPathExplanation } from "@/services/career/career-ai.service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const careerPath = await getCareerPathByIdOrSlug(id);

    if (!careerPath) {
      return NextResponse.json(
        { success: false, error: "Career path not found." },
        { status: 404 }
      );
    }

    // Optional student personalized alignment if signed in
    const session = await getCurrentSession();
    let alignment = null;
    let aiExplanation = null;

    if (session?.user?.id) {
      const studentData = await getAggregatedStudentProfile(session.user.id);
      alignment = calculateCareerReadiness(careerPath, studentData, []);
      aiExplanation = await generateCareerPathExplanation(
        careerPath,
        studentData,
        alignment
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        careerPath,
        alignment,
        aiExplanation,
      },
    });
  } catch (error) {
    console.error("GET /api/career-paths/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve career path details.",
      },
      { status: 500 }
    );
  }
}

