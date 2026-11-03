import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { MentorshipResourceService } from "@/services/mentor/mentorship-resource.service";

/**
 * DELETE /api/mentorship/resources/share/[shareId]
 * Explicit student revocation of mentor access to a resource.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { shareId } = await params;
    const revoked = await MentorshipResourceService.revokeResourceAccess(
      session.user.id,
      shareId
    );

    return NextResponse.json({
      success: true,
      data: revoked,
      message: "Resource access revoked successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/mentorship/resources/share/[shareId] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to revoke access",
      },
      { status: 400 }
    );
  }
}
