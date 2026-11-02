import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import {
  getApplicationById,
  updateApplicationDetails,
  deleteApplication,
} from "@/services/application/application.service";
import { updateApplicationDetailsSchema } from "@/features/applications/schemas/applicationSchema";

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

    const application = await getApplicationById(userId, applicationId);

    return NextResponse.json({
      success: true,
      data: application,
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

    console.error("Application GET detail error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to load application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const resolved = await params;
    const applicationId = resolved.applicationId;

    const body = await req.json();
    const parseResult = updateApplicationDetailsSchema.safeParse(body);

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

    const updated = await updateApplicationDetails(
      userId,
      applicationId,
      parseResult.data
    );

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
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
    if (err.message?.includes("not found")) {
      return NextResponse.json(
        { success: false, message: err.message },
        { status: 404 }
      );
    }

    console.error("Application PATCH error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const resolved = await params;
    const applicationId = resolved.applicationId;

    const deleted = await deleteApplication(userId, applicationId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Application record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Application removed from tracking successfully",
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

    console.error("Application DELETE error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to delete application" },
      { status: 500 }
    );
  }
}

