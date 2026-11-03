import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorshipRequestService } from "@/services/mentor/mentorship-request.service";

/**
 * PATCH /api/mentorship/requests/[requestId]
 * Accept or reject (mentor), or cancel (student).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { requestId } = await params;
    const body = await req.json();

    if (!["accepted", "rejected", "cancelled", "completed"].includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Must be accepted, rejected, cancelled, or completed.",
        },
        { status: 400 }
      );
    }

    const updated = await MentorshipRequestService.updateRequestStatus(
      requestId,
      session.user.id,
      body.status,
      body.mentorResponse
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Request successfully updated to ${body.status}.`,
    });
  } catch (error) {
    console.error("PATCH /api/mentorship/requests/[requestId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update request",
      },
      { status: 400 }
    );
  }
}
