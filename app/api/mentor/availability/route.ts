import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorService } from "@/services/mentor/mentor.service";

/**
 * PATCH /api/mentor/availability
 * Update mentor availability settings.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const updated = await MentorService.updateAvailability(
      session.user.id,
      body
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Availability preferences updated.",
    });
  } catch (error) {
    console.error("PATCH /api/mentor/availability error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update availability",
      },
      { status: 400 }
    );
  }
}
