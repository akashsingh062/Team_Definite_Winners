import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getStudentProfileByUserId } from "@/services/studentProfileService";
import { getStudentCurrentResume } from "@/services/resumeService";
import {
  askCareerCompanion,
  CompanionMessage,
  StudentContext,
} from "@/services/companion/career-companion.service";

export async function POST(req: NextRequest) {
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
    const { message, language = "en", history = [] } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "A message string is required." },
        { status: 400 }
      );
    }

    const validLang = language === "hi" ? "hi" : "en";

    // Gather student context
    const [profile, resume] = await Promise.all([
      getStudentProfileByUserId(session.user.id),
      getStudentCurrentResume(session.user.id).catch(() => null),
    ]);

    const studentContext: StudentContext = {
      fullName: profile?.personalInfo?.fullName || session.user.name || "Student",
      major: profile?.academicInfo?.branch || "Computer Science",
      degree: profile?.academicInfo?.degree || "B.Tech",
      graduationYear: profile?.academicInfo?.graduationYear,
      preferredRole: profile?.careerPreferences?.preferredJobRole || "Software Developer",
      skills: profile?.skills?.map((s) => s.name) || [],
      hasResume: Boolean(resume),
    };

    const result = await askCareerCompanion(
      message,
      validLang,
      (history as CompanionMessage[]).slice(-6),
      studentContext
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Career Companion API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
