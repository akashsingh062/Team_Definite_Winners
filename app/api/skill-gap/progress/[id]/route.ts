import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { skillProgressUpdateSchema } from "@/features/skill-gap/schemas/skillGapSchema";
import {
  updateStudentSkillProgress,
  deleteStudentSkillProgress,
} from "@/services/skill-gap/skill-gap.service";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;
    const { id } = await params;

    const body = await req.json();
    const parsed = skillProgressUpdateSchema.parse(body);

    const updated = await updateStudentSkillProgress(studentId, id, parsed);

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
      data: updated,
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
        { success: false, message: "Invalid update payload", errors: err.errors },
        { status: 400 }
      );
    }
    console.error("Progress update API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to update learning progress.",
      },
      { status: err.statusCode || 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;
    const { id } = await params;

    await deleteStudentSkillProgress(studentId, id);

    return NextResponse.json({
      success: true,
      message: "Progress tracking item deleted successfully",
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    console.error("Progress delete API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to delete progress item.",
      },
      { status: err.statusCode || 500 }
    );
  }
}

