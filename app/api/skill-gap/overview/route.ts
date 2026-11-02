import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getStudentSkillGapOverview } from "@/services/skill-gap/skill-gap.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;

    const overview = await getStudentSkillGapOverview(studentId);

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to access skill gap analysis." },
        { status: 401 }
      );
    }
    console.error("Skill gap overview API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to load skill gap overview.",
      },
      { status: err.statusCode || 500 }
    );
  }
}

