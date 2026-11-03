import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { getLocalOpportunities } from "@/services/local/local-opportunity.service";
import { ILocalOpportunityFilters } from "@/types/local-opportunity";

/**
 * GET /api/local-opportunities
 * Discovers and prioritizes regional opportunities with Stage 4 matching integration.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const userId = session?.user?.id;

    const { searchParams } = new URL(req.url);

    const filters: ILocalOpportunityFilters = {
      state: searchParams.get("state") || undefined,
      district: searchParams.get("district") || undefined,
      city: searchParams.get("city") || undefined,
      workMode: (searchParams.get("workMode") as any) || undefined,
      category: searchParams.get("category") || undefined,
      skill: searchParams.get("skill") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 10,
    };

    if (searchParams.get("isGovernmentProgram") !== null) {
      filters.isGovernmentProgram = searchParams.get("isGovernmentProgram") === "true";
    }

    const lat = searchParams.get("latitude");
    const lon = searchParams.get("longitude");
    const radius = searchParams.get("radiusKm");
    if (lat && lon) {
      filters.coordinates = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
      if (radius) {
        filters.radiusKm = parseFloat(radius);
      }
    }

    const data = await getLocalOpportunities(userId, filters);

    return NextResponse.json({
      success: true,
      data: data.items,
      pagination: {
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/local-opportunities error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load local opportunities.",
      },
      { status: 500 }
    );
  }
}

