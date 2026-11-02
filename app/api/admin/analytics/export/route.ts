import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { generateAnalyticsCSV } from "@/services/analytics/analytics.service";
import { recordAdminAuditLog } from "@/services/analytics/auditLogService";
import { AnalyticsTimeRange } from "@/types/analytics";

export async function GET(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "overview";
    const range = (searchParams.get("range") as AnalyticsTimeRange) || "30d";
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const csvContent = await generateAnalyticsCSV(type, { range, startDate, endDate });

    // Record audit log for data export
    await recordAdminAuditLog({
      adminUserId: adminSession.user.id,
      adminEmail: adminSession.user.email,
      action: "data_exported",
      entityType: "AnalyticsExport",
      metadata: {
        exportType: type,
        range,
        startDate,
        endDate,
      },
    }).catch((err) => console.error("Export audit log failed:", err));

    const filename = `careerbridge-${type}-analytics-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
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

    console.error("GET /api/admin/analytics/export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to export CSV.",
      },
      { status: 500 }
    );
  }
}

