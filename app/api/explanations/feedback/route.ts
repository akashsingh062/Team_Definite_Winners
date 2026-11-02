import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { saveExplanationFeedback } from "@/services/explanations/explanation.service";
import { explanationFeedbackSchema } from "@/features/explanations/schemas/explanationSchema";
import { ExplanationFeedback } from "@/models/ExplanationFeedback";
import { connectToDatabase } from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const body = await req.json();
    const parseResult = explanationFeedbackSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const saved = await saveExplanationFeedback(userId, parseResult.data);

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully. Thank you for helping us improve transparency!",
      data: saved,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to submit feedback" },
        { status: 401 }
      );
    }

    console.error("Explanation feedback API error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to submit explanation feedback",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const opportunityId = searchParams.get("opportunityId");

    if (!opportunityId) {
      return NextResponse.json(
        { success: false, message: "opportunityId query parameter is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const feedback = await ExplanationFeedback.findOne({
      userId,
      opportunityId,
    }).lean();

    return NextResponse.json({
      success: true,
      data: feedback || null,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: err.message || "Failed to retrieve feedback" },
      { status: 500 }
    );
  }
}

