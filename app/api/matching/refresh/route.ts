import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import {
  invalidateStudentMatchCache,
  getRecommendationsForStudent,
} from "@/services/matching/matching.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;

    // Invalidate cached results
    invalidateStudentMatchCache(studentId);

    // Recompute freshly
    await getRecommendationsForStudent(studentId, {}, true);

    return NextResponse.json({
      success: true,
      message: "Matching engine calculations refreshed successfully.",
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    console.error("Match refresh API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to refresh recommendations." },
      { status: 500 }
    );
  }
}

