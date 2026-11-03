import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { regeneratePassportPublicId } from "@/services/passport/passport-generator.service";

/**
 * POST /api/passport/regenerate-link
 * Invalidates the previous publicId and assigns a fresh cryptographically random one.
 */
export async function POST() {
  try {
    const session = await requireAuth();
    const result = await regeneratePassportPublicId(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Public link regenerated successfully. Previous link is now inactive.",
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("POST /api/passport/regenerate-link error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to regenerate public link.",
      },
      { status: 500 }
    );
  }
}
