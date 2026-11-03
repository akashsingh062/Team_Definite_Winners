import { NextRequest, NextResponse } from "next/server";
import { MentorService, MentorFilterParams } from "@/services/mentor/mentor.service";

/**
 * GET /api/mentors
 * Public mentor discovery endpoint.
 * STRICT INVARIANT: Only mentors with verificationStatus === "verified" are returned.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: MentorFilterParams = {
      search: searchParams.get("search") || undefined,
      expertise: searchParams.get("expertise") || undefined,
      skill: searchParams.get("skill") || undefined,
      language: searchParams.get("language") || undefined,
      acceptingOnly: searchParams.get("acceptingOnly") === "true",
    };

    if (searchParams.get("minExperience")) {
      filters.minExperience = Number(searchParams.get("minExperience"));
    }
    if (searchParams.get("maxExperience")) {
      filters.maxExperience = Number(searchParams.get("maxExperience"));
    }

    const mentors = await MentorService.getPublicMentors(filters);

    return NextResponse.json({
      success: true,
      data: mentors,
      count: mentors.length,
    });
  } catch (error) {
    console.error("GET /api/mentors error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch mentors",
      },
      { status: 500 }
    );
  }
}

