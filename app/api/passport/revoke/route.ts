import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { revokePassport } from "@/services/passport/passport-generator.service";

/**
 * POST /api/passport/revoke
 * Revokes public access to the student's skills passport.
 */
export async function POST() {
  try {
    const session = await requireAuth();
    const revoked = await revokePassport(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Skills passport public link has been revoked. Public visitors will no longer see your profile.",
      data: revoked,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("POST /api/passport/revoke error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to revoke skills passport.",
      },
      { status: 500 }
    );
  }
}
