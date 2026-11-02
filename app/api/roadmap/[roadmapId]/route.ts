import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import {
  getRoadmapById,
  deleteRoadmap,
} from "@/services/roadmap/roadmap.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roadmapId: string }> }
) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;
    const { roadmapId } = await params;

    const roadmap = await getRoadmapById(studentId, roadmapId);

    return NextResponse.json({
      success: true,
      data: roadmap,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    console.error("Roadmap detail API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to load roadmap details.",
      },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ roadmapId: string }> }
) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;
    const { roadmapId } = await params;

    await deleteRoadmap(studentId, roadmapId);

    return NextResponse.json({
      success: true,
      message: "Roadmap deleted successfully.",
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    console.error("Roadmap delete API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to delete roadmap.",
      },
      { status: err.statusCode || 500 }
    );
  }
}
