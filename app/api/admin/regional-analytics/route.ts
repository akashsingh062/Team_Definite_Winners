import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Opportunity } from "@/models/Opportunity";
import { RegionalTrainingCentre } from "@/models/RegionalTrainingCentre";
import { ensureLocalSeedData } from "@/services/local/local-opportunity.service";

/**
 * GET /api/admin/regional-analytics
 * Provides administrative insights into regional opportunity coverage and geospatial data.
 */
export async function GET() {
  try {
    await requireAdmin();
    await connectToDatabase();
    await ensureLocalSeedData();

    const [
      totalRegionalOpps,
      totalTrainingCentres,
      withCoordinatesCount,
      withoutCoordinatesCount,
      governmentProgramsCount,
      stateGroupings,
      categoryGroupings,
      trainingCentreCategories,
    ] = await Promise.all([
      Opportunity.countDocuments({
        $or: [{ state: { $exists: true, $ne: "" } }, { isGovernmentProgram: true }],
      }),
      RegionalTrainingCentre.countDocuments(),
      Opportunity.countDocuments({
        "coordinates.latitude": { $exists: true, $ne: null },
        "coordinates.longitude": { $exists: true, $ne: null },
      }),
      Opportunity.countDocuments({
        $or: [
          { "coordinates.latitude": { $exists: false } },
          { "coordinates.latitude": null },
        ],
      }),
      Opportunity.countDocuments({ isGovernmentProgram: true }),
      Opportunity.aggregate([
        { $match: { state: { $exists: true, $ne: "" } } },
        { $group: { _id: "$state", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Opportunity.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      RegionalTrainingCentre.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRegionalOpportunities: totalRegionalOpps,
          totalTrainingCentres,
          withExactCoordinates: withCoordinatesCount,
          unmappedWithoutCoordinates: withoutCoordinatesCount,
          governmentProgramsCount,
        },
        stateDistribution: stateGroupings.map((g) => ({
          state: g._id,
          count: g.count,
        })),
        categoryDistribution: categoryGroupings.map((g) => ({
          category: g._id,
          count: g.count,
        })),
        trainingCentreCategories: trainingCentreCategories.map((g) => ({
          category: g._id,
          count: g.count,
        })),
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
    ) {
      return NextResponse.json(
        { success: false, error: "Administrative authorization required." },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("GET /api/admin/regional-analytics error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load regional analytics.",
      },
      { status: 500 }
    );
  }
}

