import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { generateRoadmapSchema } from "@/features/roadmap/schemas/roadmapSchema";
import { generatePersonalizedRoadmap } from "@/services/roadmap/roadmap.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;

    const body = await req.json();
    const parsed = generateRoadmapSchema.parse(body);

    const roadmap = await generatePersonalizedRoadmap(studentId, parsed);

    return NextResponse.json({
      success: true,
      message: "Personalized learning roadmap generated successfully!",
      data: roadmap,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to generate roadmap." },
        { status: 401 }
      );
    }
    if (err.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Invalid roadmap generation inputs", errors: err.errors },
        { status: 400 }
      );
    }
    console.error("Roadmap generation API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to generate learning roadmap.",
      },
      { status: err.statusCode || 500 }
    );
  }
}
