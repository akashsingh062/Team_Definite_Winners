import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import {
  createTrainingCentre,
  getTrainingCentres,
} from "@/services/local/regional-training-centre.service";

/**
 * GET /api/admin/training-centres
 * List all regional training centres (Admin).
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const filters = {
      state: searchParams.get("state") || undefined,
      district: searchParams.get("district") || undefined,
      category: searchParams.get("category") || undefined,
      verificationStatus: searchParams.get("verificationStatus") || undefined,
    };

    const centres = await getTrainingCentres(filters);

    return NextResponse.json({
      success: true,
      data: centres,
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

    console.error("GET /api/admin/training-centres error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load training centres.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/training-centres
 * Create a new regional training centre (Admin).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const centre = await createTrainingCentre(session.user.id, body);

    return NextResponse.json({
      success: true,
      data: centre,
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

    console.error("POST /api/admin/training-centres error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create training centre.",
      },
      { status: 400 }
    );
  }
}

