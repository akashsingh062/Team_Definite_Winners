import { NextResponse } from "next/server";
import { getAvailableRegions } from "@/services/local/local-opportunity.service";

/**
 * GET /api/local-opportunities/regions
 * Retrieves available states, districts, and opportunity counts.
 */
export async function GET() {
  try {
    const regions = await getAvailableRegions();

    return NextResponse.json({
      success: true,
      data: regions,
    });
  } catch (error) {
    console.error("GET /api/local-opportunities/regions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load regions.",
      },
      { status: 500 }
    );
  }
}

