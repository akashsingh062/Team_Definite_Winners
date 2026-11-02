import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getOpportunityExplanation } from "@/services/explanations/explanation.service";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ opportunityId: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const resolvedParams = await params;
    const opportunityId = resolvedParams.opportunityId;

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, message: "Opportunity ID is required" },
        { status: 400 }
      );
    }

    const explanation = await getOpportunityExplanation(userId, opportunityId);

    return NextResponse.json({
      success: true,
      data: explanation,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to view explanation" },
        { status: 401 }
      );
    }

    if (
      err.message?.includes("not found") ||
      err.message?.includes("does not exist")
    ) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 404 }
      );
    }

    console.error("Opportunity explanation API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to generate opportunity explanation",
      },
      { status: err.statusCode || 500 }
    );
  }
}

