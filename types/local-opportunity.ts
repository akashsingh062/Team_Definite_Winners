import { IOpportunity, WorkMode } from "./opportunity";
import { ITechnicalSkill } from "./student";

export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export type TrainingCentreCategory =
  | "iti"
  | "pmkvy_centre"
  | "polytechnic"
  | "vocational_centre"
  | "community_college"
  | "industry_partner"
  | "other";

export interface ITrainingCourse {
  courseName: string;
  duration: string;
  certification: string;
  feeType: "free" | "subsidized" | "paid";
}

export interface IRegionalTrainingCentre {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  category: TrainingCentreCategory;
  address: string;
  district: string;
  state: string;
  pincode?: string;
  coordinates: ICoordinates;
  contactNumber?: string;
  contactEmail?: string;
  officialWebsite?: string;
  sourceUrl?: string;
  sourceOrganization?: string;
  coursesOffered: ITrainingCourse[];
  verificationStatus: "verified" | "pending" | "unverified";
  lastVerifiedAt: Date | string;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILocalOpportunityFilters {
  state?: string;
  district?: string;
  city?: string;
  radiusKm?: number;
  coordinates?: ICoordinates;
  workMode?: WorkMode | "any";
  category?: string;
  skill?: string;
  isGovernmentProgram?: boolean;
  minStipend?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ILocalOpportunityItem {
  opportunity: IOpportunity;
  distanceKm?: number;
  isLocalMatch: boolean;
  matchScore?: number;
  relevanceScore?: number;
  provenance: {
    source: string;
    sourceOrganization?: string;
    sourceUrl?: string;
    lastVerifiedAt?: Date | string;
    isGovernmentProgram: boolean;
    verificationStatus: string;
  };
}

export interface IMapMarkerItem {
  id: string;
  type: "opportunity" | "training_centre";
  title: string;
  organization: string;
  category: string;
  workMode?: string;
  address: string;
  district: string;
  state: string;
  coordinates: ICoordinates;
  stipend?: string;
  deadline?: string | Date;
  isGovernmentProgram: boolean;
  sourceUrl?: string;
  verificationStatus: string;
}

export interface ISkillDemandStat {
  skillName: string;
  opportunityCount: number;
  demandPercentage: number;
  requiredCount: number;
  preferredCount: number;
}

export interface IRegionalSkillDemand {
  region: {
    state?: string;
    district?: string;
    totalOpportunities: number;
    recordCountUsed: number;
    dateRange: {
      from: Date | string;
      to: Date | string;
    };
  };
  topSkills: ISkillDemandStat[];
  categoryDistribution: Array<{ category: string; count: number }>;
  workModeDistribution: Array<{ workMode: string; count: number; percentage: number }>;
  remoteVsOnsite: {
    remoteCount: number;
    onsiteCount: number;
    hybridCount: number;
  };
  frequentlyRequestedTech: string[];
}

export interface IRegionalSkillGapItem {
  skillName: string;
  regionalDemandCount: number;
  demandPercentage: number;
  studentHasSkill: boolean;
  studentProficiency?: string;
  isRequired: boolean;
  gapStatus: "satisfied" | "missing_required" | "missing_preferred";
  recommendedRoadmapRole?: string;
}

export interface IRegionalSkillGapAnalysis {
  region: {
    state?: string;
    district?: string;
    opportunityCount: number;
  };
  summary: {
    totalRegionalSkills: number;
    skillsDemonstrated: number;
    missingRequired: number;
    missingPreferred: number;
  };
  gapItems: IRegionalSkillGapItem[];
  studentSkills: ITechnicalSkill[];
  sampleSizeDisclaimer: string;
}

export interface IAvailableRegion {
  state: string;
  districts: Array<{
    name: string;
    opportunityCount: number;
    trainingCentresCount: number;
  }>;
  totalOpportunities: number;
  totalTrainingCentres: number;
}

