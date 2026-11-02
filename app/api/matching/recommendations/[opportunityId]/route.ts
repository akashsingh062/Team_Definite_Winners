import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getOpportunityMatchDetail } from "@/services/matching/matching.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;
    const { opportunityId } = await params;

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, message: "opportunityId is required." },
        { status: 400 }
      );
    }

    const matchDetail = await getOpportunityMatchDetail(studentId, opportunityId);

    if (!matchDetail) {
      return NextResponse.json(
        {
          success: false,
          message: "Match analysis not found for this opportunity or listing is no longer active.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: matchDetail,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to view match details." },
        { status: 401 }
      );
    }
    console.error("Match detail API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to retrieve match details." },
      { status: 500 }
    );
  }
}

