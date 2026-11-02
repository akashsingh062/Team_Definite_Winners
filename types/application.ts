import { Types } from "mongoose";
import { IOpportunity, OpportunityCategory, WorkMode } from "./opportunity";

export type ApplicationStatus =
  | "saved"
  | "planning"
  | "applied"
  | "assessment"
  | "interview"
  | "offer_received"
  | "selected"
  | "rejected"
  | "withdrawn"
  | "expired";

export type ApplicationMethod =
  | "company_website"
  | "referral"
  | "email"
  | "campus_placement"
  | "other";

export interface IApplicationActivity {
  _id?: string;
  id?: string;
  applicationId: string | Types.ObjectId;
  userId: string;
  previousStatus?: ApplicationStatus;
  newStatus: ApplicationStatus;
  note?: string;
  createdAt: Date;
}

export interface IApplication {
  _id?: string;
  id?: string;
  userId: string;
  opportunityId: string | any;
  status: ApplicationStatus;
  savedAt: Date | string;
  appliedAt?: Date | string | null;
  applicationMethod?: ApplicationMethod;
  applicationUrl?: string;
  notes?: string;
  deadline?: Date | string | null;
  nextFollowUpDate?: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  opportunity?: {
    _id: string;
    id?: string;
    title: string;
    companyName: string;
    companyLogo?: string;
    category: OpportunityCategory;
    workMode: WorkMode;
    location: string;
    stipend?: string;
    salaryRange?: string;
    isPaid: boolean;
    applicationDeadline?: string | Date;
    externalApplicationUrl?: string;
    status: string;
    verificationStatus: string;
  };
}

export interface IApplicationStatistics {
  totalTracked: number;
  totalApplications: number;
  activeApplications: number;
  savedOpportunities: number;
  interviewsScheduled: number;
  offersReceived: number;
  responseRate: number;
  savedCount: number;
  planningCount: number;
  appliedCount: number;
  assessmentCount: number;
  interviewCount: number;
  offerReceivedCount: number;
  selectedCount: number;
  rejectedCount: number;
  withdrawnCount: number;
  expiredCount: number;
  submittedTotal: number;
  upcomingFollowUpsCount: number;
  upcomingFollowUps: IApplication[];
  pipelineCounts: Record<ApplicationStatus, number>;
  pipeline: Array<{
    status: ApplicationStatus;
    label: string;
    count: number;
    color: string;
  }>;
}

export interface IApplicationFilters {
  status?: string;
  category?: string;
  search?: string;
  hasFollowUp?: boolean;
  sortBy?: "recently_updated" | "recently_applied" | "deadline_approaching" | "oldest";
  page?: number;
  limit?: number;
}

export interface IRecordApplicationInput {
  opportunityId: string;
  appliedAt?: Date | string;
  applicationMethod?: ApplicationMethod;
  applicationUrl?: string;
  notes?: string;
}

export interface IUpdateApplicationDetailsInput {
  status?: ApplicationStatus;
  notes?: string;
  nextFollowUpDate?: Date | string | null;
  appliedAt?: Date | string | null;
  applicationMethod?: ApplicationMethod;
  applicationUrl?: string;
  note?: string; // note to record in activity timeline
}
