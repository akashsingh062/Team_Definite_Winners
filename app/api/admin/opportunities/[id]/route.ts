import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import {
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} from "@/services/opportunityService";
import { opportunityFormSchema } from "@/features/opportunity/schemas/opportunitySchema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/opportunities/[id]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const opportunity = await getOpportunityById(id, true);
    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            error.message === "UNAUTHORIZED"
              ? "Authentication required."
              : "Forbidden: Administrator privileges required.",
        },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/opportunities/[id]
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const validation = opportunityFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed. Please check form fields.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const updated = await updateOpportunity(id, validation.data);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Opportunity updated successfully.",
      data: updated,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            error.message === "UNAUTHORIZED"
              ? "Authentication required."
              : "Forbidden: Administrator privileges required.",
        },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update opportunity.",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/opportunities/[id]
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const deleted = await deleteOpportunity(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Opportunity deleted successfully.",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            error.message === "UNAUTHORIZED"
              ? "Authentication required."
              : "Forbidden: Administrator privileges required.",
        },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete opportunity." },
      { status: 500 }
    );
  }
}

