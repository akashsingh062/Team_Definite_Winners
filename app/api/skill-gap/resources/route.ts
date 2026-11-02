import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getLearningResourcesForSkill } from "@/services/skill-gap/learning-resource.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const url = new URL(req.url);
    const skill = url.searchParams.get("skill") || "";

    if (!skill || skill.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Query parameter 'skill' is required." },
        { status: 400 }
      );
    }

    const resources = await getLearningResourcesForSkill(skill);

    return NextResponse.json({
      success: true,
      data: resources,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to view resources." },
        { status: 401 }
      );
    }
    console.error("Learning resources API error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve learning resources." },
      { status: 500 }
    );
  }
}

