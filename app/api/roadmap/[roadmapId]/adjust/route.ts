import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { adjustRoadmapSchema } from "@/features/roadmap/schemas/roadmapSchema";
import { adjustActiveRoadmap } from "@/services/roadmap/roadmap.service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roadmapId: string }> }
) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;
    const { roadmapId } = await params;

    const body = await req.json();
    const parsed = adjustRoadmapSchema.parse(body);

    const updatedRoadmap = await adjustActiveRoadmap(
      studentId,
      roadmapId,
      parsed
    );

    return NextResponse.json({
      success: true,
      message: "Roadmap adjusted successfully. Completed milestones preserved.",
      data: updatedRoadmap,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    if (err.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Invalid adjustment inputs", errors: err.errors },
        { status: 400 }
      );
    }
    console.error("Roadmap adjust API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to adjust roadmap.",
      },
      { status: err.statusCode || 500 }
    );
  }
}

