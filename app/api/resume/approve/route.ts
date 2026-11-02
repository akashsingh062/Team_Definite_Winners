import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { approveAndMergeResume, ResumeServiceError } from "@/services/resumeService";

export const dynamic = "force-dynamic";

/**
 * POST /api/resume/approve
 * Approves extracted resume data and safely merges it into the StudentProfile.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const { resumeId, approvedData, mergeOptions } = body;
    if (!resumeId) {
      return NextResponse.json(
        { success: false, message: "resumeId is required for approval." },
        { status: 400 }
      );
    }

    const result = await approveAndMergeResume(
      session.user.id,
      resumeId,
      approvedData,
      mergeOptions
    );

    return NextResponse.json({
      success: true,
      message: "Resume data approved and merged into your student profile successfully!",
      data: result,
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
    console.error("Resume approval error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to approve and merge resume data." },
      { status: 500 }
    );
  }
}

