import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import {
  getStudentCurrentResume,
  updateResumeParsedData,
  deleteStudentResume,
  ResumeServiceError,
} from "@/services/resumeService";

export const dynamic = "force-dynamic";

/**
 * GET /api/resume
 * Retrieves current active resume for authenticated student.
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const resume = await getStudentCurrentResume(session.user.id);

    return NextResponse.json({
      success: true,
      data: resume,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: err.message || "Failed to retrieve resume." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/resume
 * Updates draft parsed data after student makes corrections.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const { resumeId, parsedData } = body;
    if (!resumeId || !parsedData) {
      return NextResponse.json(
        { success: false, message: "Both resumeId and parsedData are required." },
        { status: 400 }
      );
    }

    const updated = await updateResumeParsedData(
      session.user.id,
      resumeId,
      parsedData
    );

    return NextResponse.json({
      success: true,
      message: "Resume analysis data updated successfully.",
      data: updated,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    if (err instanceof ResumeServiceError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update resume data." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resume
 * Deletes current student resume and file storage.
 */
export async function DELETE() {
  try {
    const session = await requireAuth();
    const deleted = await deleteStudentResume(session.user.id);

    return NextResponse.json({
      success: true,
      message: deleted
        ? "Resume deleted successfully."
        : "No active resume to delete.",
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete resume." },
      { status: 500 }
    );
  }
}

