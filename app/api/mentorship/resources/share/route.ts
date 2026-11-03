import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorshipResourceService } from "@/services/mentor/mentorship-resource.service";

/**
 * GET /api/mentorship/resources/share
 * If as=mentor: returns active resources shared with this mentor.
 * If as=student: returns all resources shared by this student.
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
    const studentId = searchParams.get("studentId") || undefined;

    const shares = asMentor
      ? await MentorshipResourceService.getSharedResourcesForMentor(
          session.user.id,
          studentId
        )
      : await MentorshipResourceService.getStudentResourceShares(session.user.id);

    return NextResponse.json({
      success: true,
      data: shares,
    });
  } catch (error) {
    console.error("GET /api/mentorship/resources/share error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch shared resources",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mentorship/resources/share
 * Explicit student action: grants a mentor access to review a specific resource.
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

    if (!body.mentorId || !body.resourceType || !body.resourceReference) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: mentorId, resourceType, and resourceReference are required.",
        },
        { status: 400 }
      );
    }

    const share = await MentorshipResourceService.shareResource(
      session.user.id,
      {
        mentorId: body.mentorId,
        resourceType: body.resourceType,
        resourceReference: body.resourceReference,
      }
    );

    return NextResponse.json({
      success: true,
      data: share,
      message: "Resource successfully shared with mentor.",
    });
  } catch (error) {
    console.error("POST /api/mentorship/resources/share error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to share resource",
      },
      { status: 400 }
    );
  }
}
