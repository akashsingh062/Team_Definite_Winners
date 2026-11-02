import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { multiOpportunityAnalysisSchema } from "@/features/skill-gap/schemas/skillGapSchema";
import { analyzeMultiOpportunityGap } from "@/services/skill-gap/skill-gap.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;

    const body = await req.json();
    const parsed = multiOpportunityAnalysisSchema.parse(body);

    const result = await analyzeMultiOpportunityGap(
      studentId,
      parsed.opportunityIds,
      parsed.targetRole
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to perform analysis." },
        { status: 401 }
      );
    }
    if (err.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid opportunity selection payload",
          errors: err.errors,
        },
        { status: 400 }
      );
    }
    console.error("Multi-opportunity analysis API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to analyze skill gaps.",
      },
      { status: err.statusCode || 500 }
    );
  }
}

