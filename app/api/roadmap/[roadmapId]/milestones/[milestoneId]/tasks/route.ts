import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { toggleTaskSchema } from "@/features/roadmap/schemas/roadmapSchema";
import { toggleMilestoneTask } from "@/services/roadmap/roadmap.service";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roadmapId: string; milestoneId: string }> }
) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;
    const { roadmapId, milestoneId } = await params;

    const body = await req.json();
    const parsed = toggleTaskSchema.parse(body);

    const updatedRoadmap = await toggleMilestoneTask(
      studentId,
      roadmapId,
      milestoneId,
      parsed.taskId,
      parsed.isCompleted
    );

    return NextResponse.json({
      success: true,
      message: parsed.isCompleted ? "Task marked completed!" : "Task marked incomplete",
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
        { success: false, message: "Invalid task update inputs", errors: err.errors },
        { status: 400 }
      );
    }
    console.error("Task toggle API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to update task.",
      },
      { status: err.statusCode || 500 }
    );
  }
}
