import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  getStudentProfileByUserId,
  upsertStudentProfile,
  calculateProfileCompletionBreakdown,
} from "@/services/studentProfileService";
import { completeProfileSchema } from "@/features/profile/schemas/profileSchemas";
import { IStudentProfile } from "@/types/student";

/**
 * GET /api/student/profile
 * Retrieves the profile of the currently authenticated student.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    let profile = await getStudentProfileByUserId(userId);

    // If profile does not exist yet, return a prepopulated empty template
    if (!profile) {
      const initialTemplate: Partial<IStudentProfile> = {
        userId,
        personalInfo: {
          fullName: session.user.name || "",
          email: session.user.email || "",
          phoneNumber: "",
          profilePhotograph: "",
        },
        academicInfo: {
          collegeName: "",
          degree: "",
          branch: "",
          currentAcademicYear: "3rd Year",
          graduationYear: new Date().getFullYear() + 1,
        },
        skills: [],
        projects: [],
        careerPreferences: {
          preferredJobRole: "",
          preferredEmploymentType: "Internship",
          workPreference: "Hybrid",
          preferredLocation: "",
          expectedStipend: "",
        },
        additionalInfo: {
          certifications: [],
          experience: [],
          linkedinUrl: "",
          githubUrl: "",
        },
        profileCompletionPercentage: 0,
      };

      const breakdown = calculateProfileCompletionBreakdown(initialTemplate);
      initialTemplate.profileCompletionPercentage = breakdown.total;

      return NextResponse.json({
        success: true,
        data: initialTemplate,
        breakdown,
        isNew: true,
      });
    }

    const breakdown = calculateProfileCompletionBreakdown(profile);

    return NextResponse.json({
      success: true,
      data: profile,
      breakdown,
      isNew: false,
    });
  } catch (error) {
    console.error("GET /api/student/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while fetching the profile.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/student/profile
 * Updates the authenticated student's profile.
 * Recomputes profile completion and validates payload using Zod.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate using Zod schema
    const validationResult = completeProfileSchema.safeParse(body);

    if (!validationResult.success) {
      const errorFormatted = validationResult.error.format();
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed. Please check the entered fields.",
          details: errorFormatted,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Guarantee that email and userId cannot be hijacked by client
    validatedData.personalInfo.email = session.user.email;

    const savedProfile = await upsertStudentProfile(session.user.id, {
      personalInfo: validatedData.personalInfo,
      academicInfo: validatedData.academicInfo,
      skills: validatedData.skills,
      projects: validatedData.projects,
      careerPreferences: validatedData.careerPreferences,
      additionalInfo: validatedData.additionalInfo,
    });

    const breakdown = calculateProfileCompletionBreakdown(savedProfile);

    return NextResponse.json({
      success: true,
      message: "Profile saved successfully.",
      data: savedProfile,
      breakdown,
    });
  } catch (error) {
    console.error("PUT /api/student/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while saving the profile.",
      },
      { status: 500 }
    );
  }
}

