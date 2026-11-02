import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getRecommendationsForStudent } from "@/services/matching/matching.service";
import { matchingFiltersSchema } from "@/features/matching/schemas/matchingSchema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;

    const url = new URL(req.url);
    const queryParams = {
      category: url.searchParams.get("category") || "all",
      workMode: url.searchParams.get("workMode") || "all",
      eligibility: url.searchParams.get("eligibility") || "all",
      sortBy: url.searchParams.get("sortBy") || "score",
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "10",
    };

    const parsedFilters = matchingFiltersSchema.parse(queryParams);

    const result = await getRecommendationsForStudent(
      studentId,
      parsedFilters
    );

    return NextResponse.json({
      success: true,
      data: {
        recommendations: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to view recommendations." },
        { status: 401 }
      );
    }
    console.error("Recommendations API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to generate recommendations." },
      { status: 500 }
    );
  }
}

