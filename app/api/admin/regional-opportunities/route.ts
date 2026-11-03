import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Opportunity } from "@/models/Opportunity";

/**
 * POST /api/admin/regional-opportunities
 * Creates a new local opportunity, apprenticeship, or government initiative (Admin).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    if (!body.title || !body.companyName || !body.description || !body.requiredSkills) {
      return NextResponse.json(
        { success: false, error: "Missing required opportunity fields." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const opportunity = await Opportunity.create({
      ...body,
      createdBy: session.user.id,
      verifiedBy: session.user.id,
      publishedAt: new Date(),
      lastVerifiedAt: new Date(),
      verificationStatus: body.verificationStatus || "verified",
      status: body.status || "published",
    });

    return NextResponse.json({
      success: true,
      data: opportunity,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
    ) {
      return NextResponse.json(
        { success: false, error: "Administrative authorization required." },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("POST /api/admin/regional-opportunities error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create regional opportunity.",
      },
      { status: 400 }
    );
  }
}

