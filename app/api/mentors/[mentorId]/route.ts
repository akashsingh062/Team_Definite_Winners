import { NextRequest, NextResponse } from "next/server";
import { MentorService } from "@/services/mentor/mentor.service";
import { getCurrentSession } from "@/lib/auth-server";

/**
 * GET /api/mentors/[mentorId]
 * Returns detailed public mentor profile.
 * Only verified mentors are visible to the public unless the caller is the owner or an admin.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mentorId: string }> }
) {
  try {
    const { mentorId } = await params;
    const session = await getCurrentSession();
    const userId = session?.user?.id;
    const isAdmin = (session?.user as { role?: string })?.role === "admin";

    // Allow owner or admin to view even if not yet verified
    const isSelf = userId === mentorId;
    const includeUnverified = isAdmin || isSelf;

    const mentor = await MentorService.getMentorById(mentorId, includeUnverified);

    if (!mentor) {
      return NextResponse.json(
        {
          success: false,
          error: "Mentor not found or profile has not been verified yet.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    console.error("GET /api/mentors/[mentorId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch mentor",
      },
      { status: 500 }
    );
  }
}
