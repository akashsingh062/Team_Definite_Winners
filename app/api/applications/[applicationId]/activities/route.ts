import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import {
  getApplicationActivities,
  updateApplicationStatus,
} from "@/services/application/application.service";
import { createActivitySchema } from "@/features/applications/schemas/applicationSchema";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const resolved = await params;
    const applicationId = resolved.applicationId;

    const activities = await getApplicationActivities(userId, applicationId);

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    if (err.message?.includes("Unauthorized:")) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 403 }
      );
    }
    if (err.message?.includes("not found")) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 404 }
      );
    }

    console.error("Application activities GET error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to load activity history" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const resolved = await params;
    const applicationId = resolved.applicationId;

    const body = await req.json();
    const parseResult = createActivitySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = await updateApplicationStatus(
      userId,
      applicationId,
      parseResult.data.newStatus,
      parseResult.data.note
    );

    return NextResponse.json({
      success: true,
      message: "Activity recorded successfully",
      data: updated,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    if (err.message?.includes("Unauthorized:")) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 403 }
      );
    }

    console.error("Application activity POST error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to record activity" },
      { status: 500 }
    );
  }
}
