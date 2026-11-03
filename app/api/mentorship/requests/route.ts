import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorshipRequestService } from "@/services/mentor/mentorship-request.service";

/**
 * GET /api/mentorship/requests
 * - If query param `as=mentor`, returns requests sent to current user as mentor.
 * - Otherwise returns requests sent by current user as student.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const asMentor = searchParams.get("as") === "mentor";

    const requests = asMentor
      ? await MentorshipRequestService.getMentorRequests(session.user.id)
      : await MentorshipRequestService.getStudentRequests(session.user.id);

    return NextResponse.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("GET /api/mentorship/requests error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch requests",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mentorship/requests
 * Student sends a mentorship request to a verified mentor.
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

    if (!body.mentorId || !body.careerGoal || !body.topic || !body.introduction) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: mentorId, careerGoal, topic, and introduction are required.",
        },
        { status: 400 }
      );
    }

    const request = await MentorshipRequestService.createRequest(
      session.user.id,
      body
    );

    return NextResponse.json({
      success: true,
      data: request,
      message: "Mentorship request sent successfully.",
    });
  } catch (error) {
    console.error("POST /api/mentorship/requests error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create request",
      },
      { status: 400 }
    );
  }
}
