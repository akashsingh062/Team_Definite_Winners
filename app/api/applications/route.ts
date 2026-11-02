import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import {
  getStudentApplications,
  saveOpportunity,
  recordApplication,
  removeSavedOpportunity,
} from "@/services/application/application.service";
import {
  saveOpportunitySchema,
  recordApplicationSchema,
} from "@/features/applications/schemas/applicationSchema";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") as any) || undefined;
    const hasFollowUp = searchParams.get("hasFollowUp") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getStudentApplications(userId, {
      status,
      category,
      search,
      sortBy,
      hasFollowUp,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.applications,
      pagination: {
        total: result.total,
        page: result.page,
        limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("Applications GET API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to retrieve applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    const body = await req.json();

    // Check action type: saving vs recording application
    if (body.action === "record_application" || body.status === "applied") {
      const parseResult = recordApplicationSchema.safeParse(body);
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
      const app = await recordApplication(userId, parseResult.data);
      return NextResponse.json({
        success: true,
        message: "Application recorded successfully!",
        data: app,
      });
    }

    if (body.action === "remove_saved") {
      const removed = await removeSavedOpportunity(userId, body.opportunityId);
      return NextResponse.json({
        success: true,
        message: removed
          ? "Opportunity removed from saved list"
          : "Opportunity was not saved",
        data: { removed },
      });
    }

    // Default action: Save Opportunity
    const parseResult = saveOpportunitySchema.safeParse(body);
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

    const saved = await saveOpportunity(userId, parseResult.data.opportunityId);
    return NextResponse.json({
      success: true,
      message: "Opportunity saved to your application tracker!",
      data: saved,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }
    console.error("Applications POST API error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to process application" },
      { status: 500 }
    );
  }
}
