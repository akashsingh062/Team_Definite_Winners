import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import {
  createOrGetPassport,
  updatePassport,
} from "@/services/passport/passport-generator.service";

/**
 * GET /api/passport
 * Retrieves authenticated student's full passport (auto-initializes if first access).
 */
export async function GET() {
  try {
    const session = await requireAuth();
    const passport = await createOrGetPassport(session.user.id);

    return NextResponse.json({
      success: true,
      data: passport,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("GET /api/passport error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to retrieve skills passport.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/passport
 * Updates student editable settings (headline, summary, visibility, visibleSections, portfolioLinks, etc.).
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();

    const allowedUpdates = {
      displayName: body.displayName,
      headline: body.headline,
      summary: body.summary,
      visibility: body.visibility,
      visibleSections: body.visibleSections,
      portfolioLinks: body.portfolioLinks,
      skills: body.skills,
      projects: body.projects,
      certifications: body.certifications,
    };

    const updated = await updatePassport(session.user.id, allowedUpdates);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    console.error("PATCH /api/passport error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update skills passport.",
      },
      { status: 500 }
    );
  }
}
