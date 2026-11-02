import { connectToDatabase } from "@/lib/db/mongodb";
import { Opportunity } from "@/models/Opportunity";
import {
  IOpportunity,
  OpportunityQueryFilters,
  OpportunityStats,
} from "@/types/opportunity";

/**
 * Creates a new opportunity record in draft status.
 */
export async function createOpportunity(
  adminId: string,
  data: Partial<IOpportunity>
): Promise<IOpportunity> {
  await connectToDatabase();

  const opportunity = new Opportunity({
    ...data,
    createdBy: adminId,
    status: data.status || "draft",
    verificationStatus: "unverified",
    verifiedBy: undefined,
    publishedAt: undefined,
  });

  const saved = await opportunity.save();
  return JSON.parse(JSON.stringify(saved));
}

/**
 * Fetches an opportunity by ID.
 * If allowUnpublished is false, only verified & published opportunities are returned.
 */
export async function getOpportunityById(
  id: string,
  allowUnpublished = false
): Promise<IOpportunity | null> {
  await connectToDatabase();

  const query: Record<string, unknown> = { _id: id };
  if (!allowUnpublished) {
    query.status = "published";
    query.verificationStatus = "verified";
  }

  const doc = await Opportunity.findOne(query).lean<IOpportunity>();
  return doc ? JSON.parse(JSON.stringify(doc)) : null;
}

/**
 * Updates an opportunity's fields.
 */
export async function updateOpportunity(
  id: string,
  data: Partial<IOpportunity>
): Promise<IOpportunity | null> {
  await connectToDatabase();

  // Remove immutable fields to protect audit trail
  const safeData = { ...data };
  delete safeData._id;
  delete safeData.createdBy;

  const updated = await Opportunity.findByIdAndUpdate(
    id,
    { $set: safeData },
    { new: true, runValidators: true }
  ).lean<IOpportunity>();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Deletes an opportunity by ID.
 */
export async function deleteOpportunity(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await Opportunity.findByIdAndDelete(id);
  return Boolean(res);
}

/**
 * Submits a draft opportunity for administrative verification.
 */
export async function submitForVerification(
  id: string
): Promise<IOpportunity | null> {
  await connectToDatabase();

  const updated = await Opportunity.findByIdAndUpdate(
    id,
    { $set: { status: "pending", verificationStatus: "unverified" } },
    { new: true }
  ).lean<IOpportunity>();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Verifies or rejects an opportunity with audit notes.
 */
export async function verifyOpportunity(
  id: string,
  verifierAdminId: string,
  isVerified: boolean,
  notes = ""
): Promise<IOpportunity | null> {
  await connectToDatabase();

  const updatePayload: Record<string, unknown> = {
    verificationStatus: isVerified ? "verified" : "rejected",
    verifiedBy: verifierAdminId,
    verificationNotes: notes,
  };

  // If rejected, ensure it cannot be published
  if (!isVerified) {
    updatePayload.status = "rejected";
  }

  const updated = await Opportunity.findByIdAndUpdate(
    id,
    { $set: updatePayload },
    { new: true }
  ).lean<IOpportunity>();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Publishes a verified opportunity.
 * Throws if the opportunity has not been verified.
 */
export async function publishOpportunity(
  id: string
): Promise<IOpportunity | null> {
  await connectToDatabase();

  const current = await Opportunity.findById(id).lean<IOpportunity>();
  if (!current) {
    throw new Error("Opportunity not found");
  }

  if (current.verificationStatus !== "verified") {
    throw new Error(
      "Opportunity must be verified by an administrator before publishing."
    );
  }

  const updated = await Opportunity.findByIdAndUpdate(
    id,
    {
      $set: {
        status: "published",
        publishedAt: new Date(),
      },
    },
    { new: true }
  ).lean<IOpportunity>();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Unpublishes an opportunity, returning it to draft status.
 */
export async function unpublishOpportunity(
  id: string
): Promise<IOpportunity | null> {
  await connectToDatabase();

  const updated = await Opportunity.findByIdAndUpdate(
    id,
    { $set: { status: "draft" } },
    { new: true }
  ).lean<IOpportunity>();

  return updated ? JSON.parse(JSON.stringify(updated)) : null;
}

/**
 * Fetches published and verified opportunities for public student consumption.
 */
export async function getPublicOpportunities(
  filters: OpportunityQueryFilters
): Promise<{
  items: IOpportunity[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await connectToDatabase();

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(filters.limit) || 12));
  const skip = (page - 1) * limit;

  // Strict public filter: only verified and published
  const query: Record<string, unknown> = {
    status: "published",
    verificationStatus: "verified",
  };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.employmentType) {
    query.employmentType = filters.employmentType;
  }

  if (filters.workMode) {
    query.workMode = filters.workMode;
  }

  if (filters.isPaid !== undefined) {
    query.isPaid = filters.isPaid;
  }

  if (filters.location) {
    query.location = { $regex: filters.location, $options: "i" };
  }

  if (filters.search?.trim()) {
    const s = filters.search.trim();
    query.$or = [
      { title: { $regex: s, $options: "i" } },
      { companyName: { $regex: s, $options: "i" } },
      { description: { $regex: s, $options: "i" } },
      { requiredSkills: { $regex: s, $options: "i" } },
    ];
  }

  // Sorting
  let sortOption: Record<string, 1 | -1> = { publishedAt: -1, createdAt: -1 };
  if (filters.sortBy === "deadline") {
    sortOption = { applicationDeadline: 1 };
  } else if (filters.sortBy === "alphabetical") {
    sortOption = { title: 1 };
  } else if (filters.sortBy === "publishedAt") {
    sortOption = { publishedAt: -1 };
  }

  const [items, total] = await Promise.all([
    Opportunity.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean<IOpportunity[]>(),
    Opportunity.countDocuments(query),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Fetches all opportunities for administrators with comprehensive filtering.
 */
export async function getAdminOpportunities(
  filters: OpportunityQueryFilters
): Promise<{
  items: IOpportunity[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await connectToDatabase();

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.verificationStatus) {
    query.verificationStatus = filters.verificationStatus;
  }

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.search?.trim()) {
    const s = filters.search.trim();
    query.$or = [
      { title: { $regex: s, $options: "i" } },
      { companyName: { $regex: s, $options: "i" } },
      { requiredSkills: { $regex: s, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Opportunity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<IOpportunity[]>(),
    Opportunity.countDocuments(query),
  ]);

  return {
    items: JSON.parse(JSON.stringify(items)),
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Calculates real-time aggregate statistics for the Admin Dashboard.
 */
export async function getAdminOpportunityStats(): Promise<OpportunityStats> {
  await connectToDatabase();

  const [
    total,
    published,
    draft,
    pending,
    expired,
    rejected,
    internshipCount,
    jobCount,
    skillDevCount,
  ] = await Promise.all([
    Opportunity.countDocuments(),
    Opportunity.countDocuments({ status: "published" }),
    Opportunity.countDocuments({ status: "draft" }),
    Opportunity.countDocuments({ status: "pending" }),
    Opportunity.countDocuments({ status: "expired" }),
    Opportunity.countDocuments({ status: "rejected" }),
    Opportunity.countDocuments({ category: "internship" }),
    Opportunity.countDocuments({ category: "job" }),
    Opportunity.countDocuments({ category: "skill-development" }),
  ]);

  return {
    total,
    published,
    draft,
    pending,
    expired,
    rejected,
    byCategory: {
      internship: internshipCount,
      job: jobCount,
      "skill-development": skillDevCount,
    },
  };
}
