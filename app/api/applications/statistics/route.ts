import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { getApplicationStatistics } from "@/services/application/application.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const stats = await getApplicationStatistics(userId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("Application statistics API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to load statistics" },
      { status: 500 }
    );
  }
}
