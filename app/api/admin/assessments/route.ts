import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { Assessment } from "@/models/Assessment";
import { createAdminAssessment } from "@/services/assessment/assessment-admin.service";
import { ensureAssessmentsSeeded } from "@/services/assessment/assessment.service";

/**
 * GET /api/admin/assessments
 * Lists all assessments (drafts, published, archived) for administrators.
 */
export async function GET() {
  try {
    await requireAdmin();
    await ensureAssessmentsSeeded();

    const assessments = await Assessment.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      return NextResponse.json(
        { success: false, error: "Administrative authorization required." },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("GET /api/admin/assessments error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load assessments.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/assessments
 * Creates a new assessment configuration.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const assessment = await createAdminAssessment(session.user.id, body);

    return NextResponse.json({
      success: true,
      data: assessment,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      return NextResponse.json(
        { success: false, error: "Administrative authorization required." },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("POST /api/admin/assessments error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create assessment.",
      },
      { status: 400 }
    );
  }
}

