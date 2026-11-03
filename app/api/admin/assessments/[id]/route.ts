import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { updateAdminAssessment } from "@/services/assessment/assessment-admin.service";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * PATCH /api/admin/assessments/[id]
 * Updates an assessment configuration (Admin).
 */
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const updated = await updateAdminAssessment(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Assessment not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      return NextResponse.json(
        { success: false, error: "Administrative authorization required." },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("PATCH /api/admin/assessments/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update assessment.",
      },
      { status: 400 }
    );
  }
}

