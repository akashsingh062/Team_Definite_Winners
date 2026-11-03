import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { updatePassport, unrevokePassport } from "@/services/passport/passport-generator.service";

/**
 * POST /api/passport/publish
 * Sets passport visibility to public and unrevokes if previously revoked.
 */
export async function POST() {
  try {
    const session = await requireAuth();

    // Ensure it's active and public
    await unrevokePassport(session.user.id);
    const updated = await updatePassport(session.user.id, { visibility: "public" });

    return NextResponse.json({
      success: true,
      message: "Skills passport is now publicly published.",
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("POST /api/passport/publish error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to publish skills passport.",
      },
      { status: 500 }
    );
  }
}
