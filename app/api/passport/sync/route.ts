import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { syncPassportFromProfile } from "@/services/passport/passport-generator.service";

/**
 * POST /api/passport/sync
 * Manually synchronizes passport with latest profile, approved resume, and assessments.
 */
export async function POST() {
  try {
    const session = await requireAuth();
    const synced = await syncPassportFromProfile(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Skills passport successfully synced with latest profile data.",
      data: synced,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("POST /api/passport/sync error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync skills passport.",
      },
      { status: 500 }
    );
  }
}
