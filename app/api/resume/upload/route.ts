import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { uploadAndAnalyzeResume, ResumeServiceError } from "@/services/resumeService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const studentId = session.user.id;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No resume file was uploaded. Please provide a PDF file." },
        { status: 400 }
      );
    }

    // Convert Web File to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const resume = await uploadAndAnalyzeResume(
      studentId,
      buffer,
      file.name || "resume.pdf",
      file.type || "application/pdf"
    );

    return NextResponse.json(
      {
        success: true,
        message: "Resume uploaded and analyzed successfully.",
        data: resume,
      },
      { status: 201 }
    );
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "You must be signed in to upload a resume." },
        { status: 401 }
      );
    }

    if (err instanceof ResumeServiceError) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: err.statusCode }
      );
    }

    console.error("Resume upload API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "An unexpected error occurred during resume processing." },
      { status: 500 }
    );
  }
}

