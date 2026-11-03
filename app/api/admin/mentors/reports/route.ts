import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { MentorAdminService } from "@/services/mentor/mentor-admin.service";

/**
 * GET /api/admin/mentors/reports
 * Fetch conduct reports for administrative review.
 */
export async function GET() {
  try {
    await requireAdmin();

    const reports = await MentorAdminService.getConductReports();

    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Internal Error";
    const status =
      errMessage === "UNAUTHORIZED" ? 401 : errMessage === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: errMessage }, { status });
  }
}

/**
 * PATCH /api/admin/mentors/reports
 * Resolve or dismiss a conduct report.
 */
export async function PATCH(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();
    const body = await req.json();

    if (!body.reportId || !["resolved", "dismissed"].includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "reportId and status ('resolved' | 'dismissed') are required.",
        },
        { status: 400 }
      );
    }

    const report = await MentorAdminService.resolveReport(
      adminSession.user.id,
      body.reportId,
      body.status,
      body.adminNotes
    );

    return NextResponse.json({
      success: true,
      data: report,
      message: `Report marked as ${body.status}.`,
    });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Internal Error";
    const status =
      errMessage === "UNAUTHORIZED" ? 401 : errMessage === "FORBIDDEN" ? 403 : 500;
    return NextResponse.json({ success: false, error: errMessage }, { status });
  }
}
