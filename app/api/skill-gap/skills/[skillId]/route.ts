import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getSingleSkillGapDetail } from "@/services/skill-gap/skill-gap.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ skillId: string }> }
) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;
    const { skillId } = await params;

    const decodedSkill = decodeURIComponent(skillId);

    const detail = await getSingleSkillGapDetail(studentId, decodedSkill);

    return NextResponse.json({
      success: true,
      data: detail,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to access skill details." },
        { status: 401 }
      );
    }
    console.error("Skill gap detail API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to load skill details.",
      },
      { status: err.statusCode || 500 }
    );
  }
}

