import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorService } from "@/services/mentor/mentor.service";

/**
 * GET /api/mentor/profile
 * Retrieves the currently logged-in user's mentor profile.
 */
export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const profile = await MentorService.getMentorByUserId(session.user.id);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("GET /api/mentor/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mentor/profile
 * Create or update the currently logged-in user's mentor profile.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const profile = await MentorService.registerOrUpdateMentorProfile(
      session.user.id,
      body
    );

    return NextResponse.json({
      success: true,
      data: profile,
      message: "Mentor profile saved successfully.",
    });
  } catch (error) {
    console.error("POST /api/mentor/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 400 }
    );
  }
}

