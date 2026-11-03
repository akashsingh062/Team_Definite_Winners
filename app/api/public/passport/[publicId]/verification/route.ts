import { NextRequest, NextResponse } from "next/server";
import { getPassportVerificationReport } from "@/services/passport/passport-public.service";

interface RouteParams {
  params: Promise<{
    publicId: string;
  }>;
}

/**
 * GET /api/public/passport/[publicId]/verification
 * Employer/recruiter verification endpoint verifying integrity seal and evidence breakdown.
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

    const report = await getPassportVerificationReport(publicId);

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("GET /api/public/passport/[publicId]/verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate verification report.",
      },
      { status: 500 }
    );
  }
}
