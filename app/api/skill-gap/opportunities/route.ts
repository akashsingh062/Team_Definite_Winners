import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Opportunity } from "@/models/Opportunity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    await connectToDatabase();

    const opportunities = await Opportunity.find({
      status: "published",
      verificationStatus: "verified",
      $or: [
        { applicationDeadline: { $exists: false } },
        { applicationDeadline: null },
        { applicationDeadline: { $gte: new Date() } },
      ],
    })
      .select("_id title companyName category workMode location requiredSkills preferredSkills")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const formatted = opportunities.map((o) => ({
      id: o._id.toString(),
      _id: o._id.toString(),
      title: o.title,
      companyName: o.companyName,
      category: o.category,
      workMode: o.workMode,
      location: o.location,
      requiredSkills: o.requiredSkills || [],
      preferredSkills: o.preferredSkills || [],
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (err: any) {
    if (err.message === "Unauthorized") {
      return NextResponse.json(
        { success: false, message: "Authentication required to browse opportunities." },
        { status: 401 }
      );
    }
    console.error("Skill gap opportunities API error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve opportunities for analysis." },
      { status: 500 }
    );
  }
}

