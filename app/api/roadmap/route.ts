import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getActiveRoadmapForStudent } from "@/services/roadmap/roadmap.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;

    const roadmap = await getActiveRoadmapForStudent(studentId);

    return NextResponse.json({
      success: true,
      data: roadmap,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to view roadmap." },
        { status: 401 }
      );
    }
    console.error("Roadmap GET API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to load active roadmap.",
      },
      { status: err.statusCode || 500 }
    );
  }
}
