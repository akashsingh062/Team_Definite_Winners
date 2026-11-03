import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-server";
import {
  getAdminOpportunities,
  createOpportunity,
} from "@/services/opportunityService";
import { recordAdminAuditLog } from "@/services/analytics/auditLogService";
import { opportunityFormSchema } from "@/features/opportunity/schemas/opportunitySchema";
import { OpportunityCategory, OpportunityStatus, VerificationStatus } from "@/types/opportunity";

/**
 * GET /api/admin/opportunities
 * Lists all opportunities with admin filtering, search, and pagination.
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get("search") || undefined,
      category: (searchParams.get("category") as OpportunityCategory) || undefined,
      status: (searchParams.get("status") as OpportunityStatus) || undefined,
      verificationStatus:
        (searchParams.get("verificationStatus") as VerificationStatus) ||
        undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    };

    const result = await getAdminOpportunities(filters);
    return NextResponse.json({
      success: true,
      ...result,
      data: {
        opportunities: result.items,
        pagination: {
          total: result.total,
          page: result.page,
          limit: filters.limit,
          totalPages: result.totalPages,
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            error.message === "UNAUTHORIZED"
              ? "Authentication required."
              : "Forbidden: Administrator privileges required.",
        },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("GET /api/admin/opportunities error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/opportunities
 * Creates a new opportunity record in draft status.
 */
export async function POST(req: NextRequest) {
  try {
    const adminSession = await requireAdmin();

    const body = await req.json();
    const validation = opportunityFormSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed. Please check form fields.",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const created = await createOpportunity(
      adminSession.user.id,
      validation.data
    );

    // Record admin audit log
    await recordAdminAuditLog({
      adminUserId: adminSession.user.id,
      adminEmail: adminSession.user.email,
      action: "opportunity_created",
      entityType: "Opportunity",
      entityId: created._id?.toString() || created.id,
      newValues: {
        title: created.title,
        companyName: created.companyName,
        category: created.category,
      },
    }).catch((err) => console.error("Audit log failed:", err));

    return NextResponse.json(
      {
        success: true,
        message: "Opportunity created successfully.",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            error.message === "UNAUTHORIZED"
              ? "Authentication required."
              : "Forbidden: Administrator privileges required.",
        },
        { status: error.message === "UNAUTHORIZED" ? 401 : 403 }
      );
    }

    console.error("POST /api/admin/opportunities error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create opportunity.",
      },
      { status: 500 }
    );
  }
}

