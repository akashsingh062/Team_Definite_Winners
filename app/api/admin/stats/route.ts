import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { getAdminOpportunityStats } from "@/services/opportunityService";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getAdminOpportunityStats();
    return NextResponse.json({ success: true, data: stats });
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

    console.error("GET /api/admin/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
