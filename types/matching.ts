import { IOpportunity, OpportunityCategory, WorkMode } from "./opportunity";

export type EligibilityStatus =
  | "eligible"
  | "potentially_eligible"
  | "not_eligible"
  | "insufficient_information";

export interface IComponentScores {
  requiredSkills: number;
  preferredSkills: number;
  projectsExperience: number;
  education: number;
  careerAlignment: number;
  locationWorkMode: number;
  compensation: number;
}

export interface ISkillMatchResult {
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  requiredCoverage: number;
  preferredCoverage: number;
  totalRequired: number;
  totalPreferred: number;
}

export interface IEligibilityResult {
  status: EligibilityStatus;
  reasons: string[];
  issues: string[];
  isEducationMet: boolean;
  isDegreeMet: boolean;
  isBranchMet: boolean;
  isGraduationYearMet: boolean;
  isCgpaMet: boolean;
  isExperienceMet: boolean;
}

export interface IOpportunityMatchResult {
  opportunityId: string;
  opportunity: {
    _id?: string;
    id?: string;
    title: string;
    companyName: string;
    companyLogo?: string;
    description?: string;
    category: OpportunityCategory;
    employmentType: string;
    industry: string;
    workMode: WorkMode;
    location: string;
    stipend?: string;
    salaryRange?: string;
    isPaid: boolean;
    duration?: string;
    applicationDeadline?: string | Date;
    externalApplicationUrl?: string;
    applicationInstructions?: string;
    requiredSkills: string[];
    preferredSkills: string[];
    minimumExperience: string;
    educationRequirements: string;
    minimumCGPA?: number;
    benefits: string[];
    publishedAt?: string | Date;
  };
  overallScore: number; // 0 - 100
  eligibilityStatus: EligibilityStatus;
  componentScores: IComponentScores;
  matchedSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  eligibilityIssues: string[];
  strengths: string[];
  improvementAreas: string[];
  explanation: string;
  dataCompleteness: number; // 0 - 100
  relevantProjects: Array<{
    title: string;
    technologies: string[];
  }>;
  calculatedAt: string | Date;
}

export interface IMatchingFilters {
  category?: string;
  workMode?: string;
  eligibility?: string;
  sortBy?: "score" | "deadline" | "newest";
  page?: number;
  limit?: number;
}

export interface IMatchingSummary {
  totalRecommendations: number;
  eligibleCount: number;
  potentiallyEligibleCount: number;
  topScore: number;
  averageScore: number;
  byCategory: {
    internship: number;
    job: number;
    "skill-development": number;
  };
}

