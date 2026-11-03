import { NextRequest, NextResponse } from "next/server";
import { getPublicPassport } from "@/services/passport/passport-public.service";

interface RouteParams {
  params: Promise<{
    publicId: string;
  }>;
}

/**
 * GET /api/public/passport/[publicId]
 * Public unauthenticated view of the digital skills passport.
 * Enforces strict section visibility filtering and zero sensitive PII leakage.
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { publicId } = await params;

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json(
        { success: false, error: "Public ID is required." },
        { status: 400 }
      );
    }

    const result = await getPublicPassport(publicId, true);

    if (result.error === "NOT_FOUND") {
      return NextResponse.json(
        {
          success: false,
          error: "Skills passport not found.",
          code: "NOT_FOUND",
        },
        { status: 404 }
      );
    }

    if (result.error === "REVOKED") {
      return NextResponse.json(
        {
          success: false,
          error: "This skills passport link has been revoked by the student.",
          code: "REVOKED",
          revokedAt: result.revokedAt,
        },
        { status: 410 }
      );
    }

    if (result.error === "PRIVATE") {
      return NextResponse.json(
        {
          success: false,
          error: "This skills passport is currently private.",
          code: "PRIVATE",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.passport,
    });
  } catch (error) {
    console.error("GET /api/public/passport/[publicId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load public skills passport.",
      },
      { status: 500 }
    );
  }
}
