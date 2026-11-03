import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Opportunity } from "@/models/Opportunity";

/**
 * PATCH /api/admin/regional-opportunities/[id]
 * Updates a regional opportunity (verification, outdated status, deadline, coordinates).
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await context.params;
    const body = await req.json();

    await connectToDatabase();

    const updates = {
      ...body,
      verifiedBy: session.user.id,
      lastVerifiedAt: new Date(),
    };

    const updated = await Opportunity.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found." },
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

    console.error("PATCH /api/admin/regional-opportunities/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update opportunity.",
      },
      { status: 400 }
    );
  }
}

