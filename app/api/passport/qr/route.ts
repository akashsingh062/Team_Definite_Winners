import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { createOrGetPassport } from "@/services/passport/passport-generator.service";
import { generatePassportQRCode } from "@/services/passport/qr-generator.service";

/**
 * GET /api/passport/qr
 * Returns high-resolution QR code (DataURL & SVG) for the student's passport.
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const passport = await createOrGetPassport(session.user.id);
    const qrResult = await generatePassportQRCode(passport.publicId);

    return NextResponse.json({
      success: true,
      data: {
        publicId: passport.publicId,
        ...qrResult,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("GET /api/passport/qr error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate QR code.",
      },
      { status: 500 }
    );
  }
}
