import { NextRequest, NextResponse } from "next/server";
import { getGovernmentPrograms } from "@/services/local/local-opportunity.service";

/**
 * GET /api/local-opportunities/programs
 * Retrieves verified government and public training opportunities.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters = {
      state: searchParams.get("state") || undefined,
      category: searchParams.get("category") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 10,
    };

    const data = await getGovernmentPrograms(filters);

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
    console.error("GET /api/local-opportunities/programs error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load government programs.",
      },
      { status: 500 }
    );
  }
}

