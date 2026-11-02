import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Application } from "@/models/Application";
import { ApplicationActivity } from "@/models/ApplicationActivity";
import { Opportunity } from "@/models/Opportunity";
import {
  ApplicationStatus,
  IApplication,
  IApplicationActivity,
  IApplicationStatistics,
  IApplicationFilters,
  IRecordApplicationInput,
  IUpdateApplicationDetailsInput,
} from "@/types/application";
import { APPLICATION_STATUSES } from "@/features/applications/schemas/applicationSchema";

/**
 * Saves an opportunity to the student's tracker with status 'saved'.
 * Prevents duplicate records for the same student and opportunity.
 */
export async function saveOpportunity(
  userId: string,
  opportunityId: string
): Promise<IApplication> {
  if (!userId) throw new Error("Unauthorized: Student ID is required");
  if (!opportunityId) throw new Error("Opportunity ID is required");

  await connectToDatabase();

  const opp = await Opportunity.findById(opportunityId).lean();
  if (!opp) {
    throw new Error("Opportunity not found or no longer available");
  }

  // Check if tracking record already exists
  let application = await Application.findOne({ userId, opportunityId });

  if (application) {
    // If it was withdrawn or expired, allow re-saving
    if (application.status === "withdrawn" || application.status === "expired") {
      const prev = application.status;
      application.status = "saved";
      application.savedAt = new Date();
      await application.save();

      await ApplicationActivity.create({
        applicationId: application._id,
        userId,
        previousStatus: prev,
        newStatus: "saved",
        note: "Opportunity re-saved to tracker",
        createdAt: new Date(),
      });
    }
    return application.toObject() as IApplication;
  }

  // Create new saved application
  const newApp = await Application.create({
    userId,
    opportunityId: opp._id,
    status: "saved",
    savedAt: new Date(),
    deadline: opp.applicationDeadline || null,
  });

  await ApplicationActivity.create({
    applicationId: newApp._id,
    userId,
    previousStatus: undefined,
    newStatus: "saved",
    note: "Opportunity saved to tracker",
    createdAt: new Date(),
  });

  return newApp.toObject() as IApplication;
}

/**
 * Removes an opportunity from the student's saved list.
 */
export async function removeSavedOpportunity(
  userId: string,
  opportunityId: string
): Promise<boolean> {
  if (!userId || !opportunityId) return false;

  await connectToDatabase();

  const app = await Application.findOne({ userId, opportunityId });
  if (!app) return false;

  await ApplicationActivity.deleteMany({ applicationId: app._id });
  await Application.deleteOne({ _id: app._id });

  return true;
}

/**
 * Records that a student has applied to an opportunity ("I Have Applied" workflow).
 */
export async function recordApplication(
  userId: string,
  input: IRecordApplicationInput
): Promise<IApplication> {
  if (!userId) throw new Error("Unauthorized: Student ID is required");
  if (!input.opportunityId) throw new Error("Opportunity ID is required");

  await connectToDatabase();

  const opp = await Opportunity.findById(input.opportunityId).lean();
  if (!opp) {
    throw new Error("Opportunity not found or no longer available");
  }

  const appliedDate = input.appliedAt ? new Date(input.appliedAt) : new Date();

  // Find existing tracking record or create a new one
  let application = await Application.findOne({
    userId,
    opportunityId: input.opportunityId,
  });

  if (application) {
    const prevStatus = application.status;
    application.status = "applied";
    application.appliedAt = appliedDate;
    if (input.applicationMethod) {
      application.applicationMethod = input.applicationMethod;
    }
    if (input.applicationUrl !== undefined) {
      application.applicationUrl = input.applicationUrl;
    }
    if (input.notes) {
      application.notes = input.notes;
    }
    if (!application.deadline && opp.applicationDeadline) {
      application.deadline = opp.applicationDeadline;
    }
    await application.save();

    await ApplicationActivity.create({
      applicationId: application._id,
      userId,
      previousStatus: prevStatus,
      newStatus: "applied",
      note: input.notes
        ? `Application confirmed: ${input.notes}`
        : `Confirmed application via ${input.applicationMethod || "online"}`,
      createdAt: new Date(),
    });

    return application.toObject() as IApplication;
  }

  // Create new application directly with status 'applied'
  const newApp = await Application.create({
    userId,
    opportunityId: opp._id,
    status: "applied",
    savedAt: new Date(),
    appliedAt: appliedDate,
    applicationMethod: input.applicationMethod || "company_website",
    applicationUrl: input.applicationUrl || "",
    notes: input.notes || "",
    deadline: opp.applicationDeadline || null,
  });

  await ApplicationActivity.create({
    applicationId: newApp._id,
    userId,
    previousStatus: undefined,
    newStatus: "applied",
    note: input.notes
      ? `Application recorded: ${input.notes}`
      : `Application recorded via ${input.applicationMethod || "online"}`,
    createdAt: new Date(),
  });

  return newApp.toObject() as IApplication;
}

/**
 * Retrieves the authenticated student's applications with pagination, search, and filters.
 */
export async function getStudentApplications(
  userId: string,
  filters: IApplicationFilters = {}
): Promise<{
  applications: IApplication[];
  total: number;
  page: number;
  totalPages: number;
}> {
  if (!userId) throw new Error("Unauthorized: Student ID is required");

  await connectToDatabase();

  const query: any = { userId };

  // Status Filter
  if (filters.status && filters.status.trim().length > 0) {
    query.status = filters.status.trim();
  }

  // Upcoming Follow-up filter
  if (filters.hasFollowUp) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    query.nextFollowUpDate = { $gte: startOfToday };
  }

  // Sorting
  let sortField: any = { updatedAt: -1 };
  if (filters.sortBy === "recently_applied") {
    sortField = { appliedAt: -1, updatedAt: -1 };
  } else if (filters.sortBy === "deadline_approaching") {
    sortField = { deadline: 1, updatedAt: -1 };
  } else if (filters.sortBy === "oldest") {
    sortField = { createdAt: 1 };
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(50, filters.limit || 10));
  const skip = (page - 1) * limit;

  // Retrieve applications populated with opportunity
  const docs = await Application.find(query)
    .populate({
      path: "opportunityId",
      select:
        "title companyName companyLogo category workMode location stipend salaryRange isPaid applicationDeadline externalApplicationUrl status verificationStatus",
    })
    .sort(sortField)
    .lean();

  // Normalize populated opportunity structure and perform client-side search/category if needed
  let formatted: IApplication[] = docs.map((doc: any) => {
    const opp = doc.opportunityId || null;
    return {
      _id: doc._id.toString(),
      id: doc._id.toString(),
      userId: doc.userId,
      opportunityId: opp ? opp._id.toString() : doc.opportunityId?.toString(),
      status: doc.status,
      savedAt: doc.savedAt,
      appliedAt: doc.appliedAt,
      applicationMethod: doc.applicationMethod,
      applicationUrl: doc.applicationUrl,
      notes: doc.notes,
      deadline: doc.deadline || (opp ? opp.applicationDeadline : null),
      nextFollowUpDate: doc.nextFollowUpDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      opportunity: opp
        ? {
            _id: opp._id.toString(),
            id: opp._id.toString(),
            title: opp.title,
            companyName: opp.companyName,
            companyLogo: opp.companyLogo,
            category: opp.category,
            workMode: opp.workMode,
            location: opp.location,
            stipend: opp.stipend,
            salaryRange: opp.salaryRange,
            isPaid: opp.isPaid,
            applicationDeadline: opp.applicationDeadline,
            externalApplicationUrl: opp.externalApplicationUrl,
            status: opp.status,
            verificationStatus: opp.verificationStatus,
          }
        : undefined,
    };
  });

  // Filter by category if specified
  if (filters.category && filters.category.trim().length > 0) {
    const targetCat = filters.category.trim().toLowerCase();
    formatted = formatted.filter(
      (a) => a.opportunity && a.opportunity.category.toLowerCase() === targetCat
    );
  }

  // Filter by search term (Title or Company name)
  if (filters.search && filters.search.trim().length > 0) {
    const term = filters.search.trim().toLowerCase();
    formatted = formatted.filter((a) => {
      if (!a.opportunity) return false;
      return (
        a.opportunity.title.toLowerCase().includes(term) ||
        a.opportunity.companyName.toLowerCase().includes(term) ||
        (a.notes && a.notes.toLowerCase().includes(term))
      );
    });
  }

  const total = formatted.length;
  const paginated = formatted.slice(skip, skip + limit);
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    applications: paginated,
    total,
    page,
    totalPages,
  };
}

/**
 * Retrieves a single application by ID with ownership enforcement.
 */
export async function getApplicationById(
  userId: string,
  applicationId: string
): Promise<IApplication> {
  if (!userId) throw new Error("Unauthorized: Student ID is required");
  if (!applicationId) throw new Error("Application ID is required");

  await connectToDatabase();

  const doc: any = await Application.findById(applicationId)
    .populate({
      path: "opportunityId",
      select:
        "title companyName companyLogo description category employmentType industry workMode location stipend salaryRange isPaid duration applicationDeadline externalApplicationUrl applicationInstructions requiredSkills preferredSkills minimumExperience educationRequirements minimumCGPA benefits status verificationStatus",
    })
    .lean();

  if (!doc) {
    throw new Error("Application record not found");
  }

  // Enforce student ownership
  if (doc.userId !== userId) {
    throw new Error("Unauthorized: You do not have permission to view this application");
  }

  const opp = doc.opportunityId || null;

  return {
    _id: doc._id.toString(),
    id: doc._id.toString(),
    userId: doc.userId,
    opportunityId: opp ? opp._id.toString() : doc.opportunityId?.toString(),
    status: doc.status,
    savedAt: doc.savedAt,
    appliedAt: doc.appliedAt,
    applicationMethod: doc.applicationMethod,
    applicationUrl: doc.applicationUrl,
    notes: doc.notes,
    deadline: doc.deadline || (opp ? opp.applicationDeadline : null),
    nextFollowUpDate: doc.nextFollowUpDate,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    opportunity: opp
      ? {
          _id: opp._id.toString(),
          id: opp._id.toString(),
          title: opp.title,
          companyName: opp.companyName,
          companyLogo: opp.companyLogo,
          category: opp.category,
          workMode: opp.workMode,
          location: opp.location,
          stipend: opp.stipend,
          salaryRange: opp.salaryRange,
          isPaid: opp.isPaid,
          applicationDeadline: opp.applicationDeadline,
          externalApplicationUrl: opp.externalApplicationUrl,
          status: opp.status,
          verificationStatus: opp.verificationStatus,
        }
      : undefined,
  };
}

/**
 * Updates application status and appends an activity log.
 */
export async function updateApplicationStatus(
  userId: string,
  applicationId: string,
  newStatus: ApplicationStatus,
  note?: string
): Promise<IApplication> {
  if (!userId) throw new Error("Unauthorized: Student ID is required");
  if (!APPLICATION_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  await connectToDatabase();

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new Error("Application record not found");
  }

  if (application.userId !== userId) {
    throw new Error("Unauthorized: You do not have permission to modify this application");
  }

  const prevStatus = application.status;
  application.status = newStatus;

  // If transitioning to applied for the first time
  if (newStatus === "applied" && !application.appliedAt) {
    application.appliedAt = new Date();
  }

  await application.save();

  // Record activity history
  await ApplicationActivity.create({
    applicationId: application._id,
    userId,
    previousStatus: prevStatus,
    newStatus,
    note: note || `Status updated from ${prevStatus} to ${newStatus}`,
    createdAt: new Date(),
  });

  return getApplicationById(userId, applicationId);
}

/**
 * Updates application notes, follow-up date, and metadata.
 */
export async function updateApplicationDetails(
  userId: string,
  applicationId: string,
  updates: IUpdateApplicationDetailsInput
): Promise<IApplication> {
  if (!userId) throw new Error("Unauthorized: Student ID is required");

  await connectToDatabase();

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new Error("Application record not found");
  }

  if (application.userId !== userId) {
    throw new Error("Unauthorized: You do not have permission to modify this application");
  }

  let statusChanged = false;
  let prevStatus = application.status;

  if (updates.status && updates.status !== application.status) {
    if (!APPLICATION_STATUSES.includes(updates.status)) {
      throw new Error(`Invalid status: ${updates.status}`);
    }
    prevStatus = application.status;
    application.status = updates.status;
    statusChanged = true;
    if (updates.status === "applied" && !application.appliedAt) {
      application.appliedAt = new Date();
    }
  }

  if (updates.notes !== undefined) {
    application.notes = updates.notes;
  }

  if (updates.nextFollowUpDate !== undefined) {
    application.nextFollowUpDate = updates.nextFollowUpDate
      ? new Date(updates.nextFollowUpDate)
      : null;
  }

  if (updates.appliedAt !== undefined) {
    application.appliedAt = updates.appliedAt
      ? new Date(updates.appliedAt)
      : null;
  }

  if (updates.applicationMethod !== undefined) {
    application.applicationMethod = updates.applicationMethod;
  }

  if (updates.applicationUrl !== undefined) {
    application.applicationUrl = updates.applicationUrl;
  }

  await application.save();

  // If status changed or a specific note was provided, log activity
  if (statusChanged || updates.note) {
    await ApplicationActivity.create({
      applicationId: application._id,
      userId,
      previousStatus: statusChanged ? prevStatus : application.status,
      newStatus: application.status,
      note: updates.note || `Application details updated`,
      createdAt: new Date(),
    });
  }

  return getApplicationById(userId, applicationId);
}

/**
 * Deletes an application from the student's tracker along with its activity logs.
 */
export async function deleteApplication(
  userId: string,
  applicationId: string
): Promise<boolean> {
  if (!userId) throw new Error("Unauthorized: Student ID is required");

  await connectToDatabase();

  const application = await Application.findById(applicationId);
  if (!application) return false;

  if (application.userId !== userId) {
    throw new Error("Unauthorized: You do not have permission to delete this application");
  }

  await ApplicationActivity.deleteMany({ applicationId: application._id });
  await Application.deleteOne({ _id: application._id });

  return true;
}

/**
 * Calculates application dashboard statistics from actual database records.
 */
export async function getApplicationStatistics(
  userId: string
): Promise<IApplicationStatistics> {
  if (!userId) throw new Error("Unauthorized: Student ID is required");

  await connectToDatabase();

  const counts = await Application.aggregate([
    { $match: { userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const countMap: Record<string, number> = {};
  for (const c of counts) {
    countMap[c._id] = c.count;
  }

  const savedCount = countMap["saved"] || 0;
  const planningCount = countMap["planning"] || 0;
  const appliedCount = countMap["applied"] || 0;
  const assessmentCount = countMap["assessment"] || 0;
  const interviewCount = countMap["interview"] || 0;
  const offerReceivedCount = countMap["offer_received"] || 0;
  const selectedCount = countMap["selected"] || 0;
  const rejectedCount = countMap["rejected"] || 0;
  const withdrawnCount = countMap["withdrawn"] || 0;
  const expiredCount = countMap["expired"] || 0;

  const totalTracked = Object.values(countMap).reduce((a, b) => a + b, 0);
  const submittedTotal =
    appliedCount +
    assessmentCount +
    interviewCount +
    offerReceivedCount +
    selectedCount;

  // Upcoming follow-ups
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcomingFollowUpsCount = await Application.countDocuments({
    userId,
    nextFollowUpDate: { $gte: startOfToday },
  });

  const pipeline = [
    { status: "saved" as ApplicationStatus, label: "Saved", count: savedCount, color: "bg-slate-500" },
    { status: "planning" as ApplicationStatus, label: "Planning", count: planningCount, color: "bg-blue-500" },
    { status: "applied" as ApplicationStatus, label: "Applied", count: appliedCount, color: "bg-purple-500" },
    { status: "assessment" as ApplicationStatus, label: "Assessment", count: assessmentCount, color: "bg-indigo-500" },
    { status: "interview" as ApplicationStatus, label: "Interview", count: interviewCount, color: "bg-amber-500" },
    { status: "offer_received" as ApplicationStatus, label: "Offer", count: offerReceivedCount, color: "bg-emerald-500" },
    { status: "selected" as ApplicationStatus, label: "Selected", count: selectedCount, color: "bg-green-600" },
    { status: "rejected" as ApplicationStatus, label: "Rejected", count: rejectedCount, color: "bg-rose-500" },
    { status: "withdrawn" as ApplicationStatus, label: "Withdrawn", count: withdrawnCount, color: "bg-slate-400" },
    { status: "expired" as ApplicationStatus, label: "Expired", count: expiredCount, color: "bg-slate-300" },
  ];

  return {
    totalTracked,
    savedCount,
    planningCount,
    appliedCount,
    assessmentCount,
    interviewCount,
    offerReceivedCount,
    selectedCount,
    rejectedCount,
    withdrawnCount,
    expiredCount,
    submittedTotal,
    upcomingFollowUpsCount,
    pipeline,
  };
}

/**
 * Returns chronological activity timeline for an application.
 */
export async function getApplicationActivities(
  userId: string,
  applicationId: string
): Promise<IApplicationActivity[]> {
  if (!userId) throw new Error("Unauthorized: Student ID is required");

  await connectToDatabase();

  const application = await Application.findById(applicationId);
  if (!application) {
    throw new Error("Application record not found");
  }

  if (application.userId !== userId) {
    throw new Error("Unauthorized: You do not have permission to view this application");
  }

  const activities = await ApplicationActivity.find({ applicationId })
    .sort({ createdAt: -1 })
    .lean();

  return activities.map((a: any) => ({
    _id: a._id.toString(),
    id: a._id.toString(),
    applicationId: a.applicationId.toString(),
    userId: a.userId,
    previousStatus: a.previousStatus,
    newStatus: a.newStatus,
    note: a.note,
    createdAt: a.createdAt,
  }));
}

/**
 * Checks if student has saved or applied to an opportunity.
 */
export async function checkOpportunityApplicationStatus(
  userId: string,
  opportunityId: string
): Promise<{
  isTracked: boolean;
  status?: ApplicationStatus;
  applicationId?: string;
  isSaved: boolean;
  isApplied: boolean;
}> {
  if (!userId || !opportunityId) {
    return { isTracked: false, isSaved: false, isApplied: false };
  }

  await connectToDatabase();

  const app = await Application.findOne({ userId, opportunityId }).lean();
  if (!app) {
    return { isTracked: false, isSaved: false, isApplied: false };
  }

  const isSaved = app.status === "saved";
  const isApplied = [
    "applied",
    "assessment",
    "interview",
    "offer_received",
    "selected",
  ].includes(app.status);

  return {
    isTracked: true,
    status: app.status,
    applicationId: app._id.toString(),
    isSaved,
    isApplied,
  };
}
