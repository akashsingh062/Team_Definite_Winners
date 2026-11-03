import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import {
  createAdminQuestion,
  getAdminQuestions,
} from "@/services/assessment/assessment-admin.service";
import { ensureAssessmentsSeeded } from "@/services/assessment/assessment.service";

/**
 * GET /api/admin/assessments/questions
 * Lists questions for administration with optional subject and status filters.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await ensureAssessmentsSeeded();

    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject") || undefined;
    const status = searchParams.get("status") || undefined;

    const questions = await getAdminQuestions({ subject, status });

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      return NextResponse.json(
        { success: false, error: "Administrative authorization required." },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("GET /api/admin/assessments/questions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load questions.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/assessments/questions
 * Creates a new question in the question bank.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const question = await createAdminQuestion(session.user.id, body);

    return NextResponse.json({
      success: true,
      data: question,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      return NextResponse.json(
        { success: false, error: "Administrative authorization required." },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("POST /api/admin/assessments/questions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create question.",
      },
      { status: 400 }
    );
  }
}

