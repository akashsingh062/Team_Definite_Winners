import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { verifyOpportunity } from "@/services/opportunityService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const adminSession = await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const isVerified = Boolean(body.isVerified);
    const notes = typeof body.notes === "string" ? body.notes : "";

    const updated = await verifyOpportunity(
      id,
      adminSession.user.id,
      isVerified,
      notes
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Opportunity not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isVerified
        ? "Opportunity verified successfully."
        : "Opportunity rejected.",
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
            : "Verification update failed.",
      },
      { status: 500 }
    );
  }
}
