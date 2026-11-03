export type OpportunityCategory =
  | "internship"
  | "job"
  | "skill-development";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "internship"
  | "contract"
  | "training";

export type WorkMode = "remote" | "onsite" | "hybrid";

export type OpportunityStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  | "expired";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface IOpportunity {
  _id?: string;
  id?: string;
  // Basic Information
  title: string;
  companyName: string;
  companyLogo?: string;
  description: string;
  category: OpportunityCategory;
  employmentType: EmploymentType;
  industry: string;

  // Skills and Requirements
  requiredSkills: string[];
  preferredSkills: string[];
  minimumExperience: string;
  eligibilityCriteria: string;
  educationRequirements: string;
  minimumCGPA?: number;

  // Location Information
  workMode: WorkMode;
  location: string;
  eligibleRegions?: string[];
  state?: string;
  district?: string;
  city?: string;
  locationName?: string;
  remoteEligibility?: boolean;
  relocationAvailable?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  // Compensation
  stipend?: string;
  salaryRange?: string;
  currency: string;
  isPaid: boolean;

  // Additional Information
  duration?: string;
  applicationDeadline?: string | Date;
  externalApplicationUrl?: string;
  applicationInstructions: string;
  benefits: string[];

  // Verification, Provenance and Publishing
  status: OpportunityStatus;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  createdBy: string;
  verifiedBy?: string;
  publishedAt?: string | Date;
  isDemoData?: boolean;

  // Regional & Provenance Extensions (Feature 5)
  opportunitySource?:
    | "direct_employer"
    | "regional_employer"
    | "skill_india"
    | "naps"
    | "ncs"
    | "state_mission"
    | "govt_portal"
    | "partner";
  sourceUrl?: string;
  sourceOrganization?: string;
  isGovernmentProgram?: boolean;
  governmentProgramDetails?: {
    schemeName?: string;
    ministryOrDepartment?: string;
    stipendProvided?: boolean;
    certificationOffered?: boolean;
    targetBeneficiaries?: string;
  };
  lastVerifiedAt?: string | Date;
  isOutdated?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface OpportunityQueryFilters {
  category?: OpportunityCategory;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  location?: string;
  isPaid?: boolean;
  search?: string;
  skills?: string[];
  status?: OpportunityStatus;
  verificationStatus?: VerificationStatus;
  page?: number;
  limit?: number;
  sortBy?: "publishedAt" | "deadline" | "alphabetical" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface OpportunityStats {
  total: number;
  published: number;
  draft: number;
  pending: number;
  expired: number;
  rejected: number;
  byCategory: {
    internship: number;
    job: number;
    "skill-development": number;
  };
}
