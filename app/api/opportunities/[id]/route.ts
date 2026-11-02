import { NextRequest, NextResponse } from "next/server";
import { getOpportunityById } from "@/services/opportunityService";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/opportunities/[id]
 * Public student endpoint for viewing complete opportunity details.
 * Strictly requires the opportunity to be verified and published.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Second parameter false guarantees only published & verified are returned
    const opportunity = await getOpportunityById(id, false);

    if (!opportunity) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Opportunity not found or is currently not available for public application.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: opportunity });
  } catch (error) {
    console.error("GET /api/opportunities/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve opportunity details." },
      { status: 500 }
    );
  }
}

