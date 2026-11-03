import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { updateTrainingCentre } from "@/services/local/regional-training-centre.service";

/**
 * PATCH /api/admin/training-centres/[id]
 * Updates a regional training centre (Admin).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();

    const updated = await updateTrainingCentre(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Training centre not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
    ) {
      return NextResponse.json(
        { success: false, error: "Administrative authorization required." },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("PATCH /api/admin/training-centres/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update training centre.",
      },
      { status: 400 }
    );
  }
}

