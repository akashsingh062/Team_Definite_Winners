import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import {
  publishOpportunity,
  unpublishOpportunity,
} from "@/services/opportunityService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const shouldPublish = Boolean(body.publish);

    const updated = shouldPublish
      ? await publishOpportunity(id)
      : await unpublishOpportunity(id);

    return NextResponse.json({
      success: true,
      message: shouldPublish
        ? "Opportunity published successfully."
        : "Opportunity moved back to draft status.",
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
            : "Publishing status update failed.",
      },
      { status: 400 }
    );
  }
}
