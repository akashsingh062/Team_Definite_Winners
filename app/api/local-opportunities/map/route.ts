import { NextRequest, NextResponse } from "next/server";
import { getMapOpportunities } from "@/services/local/local-opportunity.service";

/**
 * GET /api/local-opportunities/map
 * Retrieves verified geo-located opportunities and training centres.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters = {
      state: searchParams.get("state") || undefined,
      district: searchParams.get("district") || undefined,
      category: searchParams.get("category") || undefined,
    };

    const data = await getMapOpportunities(filters);

    return NextResponse.json({
      success: true,
      data: data.markers,
      meta: {
        unmappedOpportunitiesCount: data.unmappedOpportunitiesCount,
        totalLocations: data.totalLocations,
      },
    });
  } catch (error) {
    console.error("GET /api/local-opportunities/map error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load map data.",
      },
      { status: 500 }
    );
  }
}

