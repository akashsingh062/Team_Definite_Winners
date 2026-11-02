import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { skillProgressCreateSchema } from "@/features/skill-gap/schemas/skillGapSchema";
import {
  getStudentProgressList,
  upsertStudentSkillProgress,
} from "@/services/skill-gap/skill-gap.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;

    const list = await getStudentProgressList(studentId);

    return NextResponse.json({
      success: true,
      data: list,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    console.error("Progress list API error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve learning progress." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;

    const body = await req.json();
    const parsed = skillProgressCreateSchema.parse(body);

    const progress = await upsertStudentSkillProgress(studentId, parsed);

    return NextResponse.json({
      success: true,
      message: `Progress updated for ${parsed.skillName}`,
      data: progress,
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
        { success: false, message: "Invalid progress payload", errors: err.errors },
        { status: 400 }
      );
    }
    console.error("Progress upsert API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to save learning progress.",
      },
      { status: err.statusCode || 500 }
    );
  }
}

