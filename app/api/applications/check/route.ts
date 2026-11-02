import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import { checkOpportunityApplicationStatus } from "@/services/application/application.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user) {
      return NextResponse.json({
        success: true,
        data: { isTracked: false, isSaved: false, isApplied: false },
      });
    }

    const { searchParams } = new URL(req.url);
    const opportunityId = searchParams.get("opportunityId");

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, message: "opportunityId query param is required" },
        { status: 400 }
      );
    }

    const status = await checkOpportunityApplicationStatus(
      session.user.id,
      opportunityId
    );

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to check status" },
      { status: 500 }
    );
  }
}
