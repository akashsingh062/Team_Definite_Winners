import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getStudentMatchingSummary } from "@/services/matching/matching.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const summary = await getStudentMatchingSummary(session.user.id);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }
    console.error("Matching summary API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to retrieve matching summary." },
      { status: 500 }
    );
  }
}

