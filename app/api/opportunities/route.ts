import { NextRequest, NextResponse } from "next/server";
import { getPublicOpportunities } from "@/services/opportunityService";
import {
  OpportunityCategory,
  EmploymentType,
  WorkMode,
} from "@/types/opportunity";

/**
 * GET /api/opportunities
 * Public student endpoint for browsing verified and published opportunities.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const isPaidParam = searchParams.get("isPaid");
    const isPaid =
      isPaidParam === "true" ? true : isPaidParam === "false" ? false : undefined;

    const filters = {
      search: searchParams.get("search") || undefined,
      category: (searchParams.get("category") as OpportunityCategory) || undefined,
      employmentType:
        (searchParams.get("employmentType") as EmploymentType) || undefined,
      workMode: (searchParams.get("workMode") as WorkMode) || undefined,
      location: searchParams.get("location") || undefined,
      isPaid,
      sortBy:
        (searchParams.get("sortBy") as
          | "publishedAt"
          | "deadline"
          | "alphabetical") || "publishedAt",
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 12,
    };

    const result = await getPublicOpportunities(filters);
    return NextResponse.json({
      success: true,
      ...result,
      data: {
        opportunities: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: filters.limit,
          totalPages: result.totalPages,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/opportunities error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve opportunities. Please try again later.",
      },
      { status: 500 }
    );
  }
}

