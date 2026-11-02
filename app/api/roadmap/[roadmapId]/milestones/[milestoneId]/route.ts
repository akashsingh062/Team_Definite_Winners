import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { updateMilestoneSchema } from "@/features/roadmap/schemas/roadmapSchema";
import { updateMilestoneStatus } from "@/services/roadmap/roadmap.service";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roadmapId: string; milestoneId: string }> }
) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;
    const { roadmapId, milestoneId } = await params;

    const body = await req.json();
    const parsed = updateMilestoneSchema.parse(body);

    const updatedRoadmap = await updateMilestoneStatus(
      studentId,
      roadmapId,
      milestoneId,
      parsed
    );

    return NextResponse.json({
      success: true,
      message: "Milestone status updated successfully",
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
        { success: false, message: "Invalid milestone update inputs", errors: err.errors },
        { status: 400 }
      );
    }
    console.error("Milestone update API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to update milestone.",
      },
      { status: err.statusCode || 500 }
    );
  }
}

