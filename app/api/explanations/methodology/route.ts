import { NextResponse } from "next/server";
import { getMethodologyInfo } from "@/services/explanations/explanation.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const methodology = getMethodologyInfo();

    return NextResponse.json({
      success: true,
      data: methodology,
    });
  } catch (err: any) {
    console.error("Methodology API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to retrieve scoring methodology",
      },
      { status: 500 }
    );
  }
}

