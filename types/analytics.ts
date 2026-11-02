import { OpportunityCategory, WorkMode } from "./opportunity";
import { ApplicationStatus } from "./application";

export type AnalyticsTimeRange =
  | "today"
  | "7d"
  | "30d"
  | "90d"
  | "this_year"
  | "all"
  | "custom";

export interface IAnalyticsDateFilter {
  range?: AnalyticsTimeRange;
  startDate?: string;
  endDate?: string;
}

export interface IDateRangeBoundaries {
  start: Date;
  end: Date;
  label: string;
}

// -------------------------------------------------------------
// 1. Platform Overview Analytics
// -------------------------------------------------------------
export interface IStudentOverviewStats {
  totalStudents: number;
  newStudentsThisMonth: number;
  activeStudents: number;
  completedProfiles: number;
  uploadedResumes: number;
}

export interface IOpportunityOverviewStats {
  totalOpportunities: number;
  publishedOpportunities: number;
  verifiedOpportunities: number;
  pendingVerification: number;
  expiredOpportunities: number;
  byCategory: Record<string, number>;
}

export interface IApplicationOverviewStats {
  totalTracked: number;
  savedOpportunities: number;
  applicationsSubmitted: number;
  interviews: number;
  offersReceived: number;
  selectedApplications: number;
  rejectedApplications: number;
}

export interface IPlatformEngagementStats {
  studentsUsingRecommendations: number;
  studentsUsingSkillGap: number;
  studentsGeneratingRoadmaps: number;
  studentsTrackingApplications: number;
}

export interface IPlatformOverviewAnalytics {
  timeRange: string;
  startDate: string;
  endDate: string;
  students: IStudentOverviewStats;
  opportunities: IOpportunityOverviewStats;
  applications: IApplicationOverviewStats;
  engagement: IPlatformEngagementStats;
}

// -------------------------------------------------------------
// 2. Student Analytics
// -------------------------------------------------------------
export interface IRegistrationTrendItem {
  date: string;
  count: number;
  cumulative: number;
}

export interface IProfileCompletionBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface IEducationDistributionItem {
  degree: string;
  count: number;
  percentage: number;
}

export interface ITopTechnicalSkillItem {
  name: string;
  count: number;
  percentage: number;
}

export interface ICareerPreferenceItem {
  preference: string;
  count: number;
}

export interface IStudentAnalytics {
  timeRange: string;
  startDate: string;
  endDate: string;
  totalStudents: number;
  activeStudents: number;
  registrationTrends: IRegistrationTrendItem[];
  profileCompletionDistribution: IProfileCompletionBucket[];
  educationDistribution: IEducationDistributionItem[];
  topTechnicalSkills: ITopTechnicalSkillItem[];
  careerPreferences: {
    preferredRoles: ICareerPreferenceItem[];
    employmentTypes: ICareerPreferenceItem[];
    workModes: ICareerPreferenceItem[];
  };
  resumeUploadStats: {
    totalResumes: number;
    approvedResumes: number;
    pendingResumes: number;
    approvalRate: number;
  };
}

// -------------------------------------------------------------
// 3. Opportunity Analytics
// -------------------------------------------------------------
export interface ISkillDemandItem {
  name: string;
  requiredCount: number;
  preferredCount: number;
  totalCount: number;
  percentageOfOpportunities: number;
}

export interface IOpportunityDistributionItem {
  label: string;
  count: number;
  percentage: number;
}

export interface IOpportunityAnalytics {
  timeRange: string;
  startDate: string;
  endDate: string;
  totalOpportunities: number;
  publishedOpportunities: number;
  verifiedOpportunities: number;
  categoryDistribution: IOpportunityDistributionItem[];
  workModeDistribution: IOpportunityDistributionItem[];
  statusDistribution: IOpportunityDistributionItem[];
  skillDemand: ISkillDemandItem[];
  opportunitiesOverTime: Array<{ date: string; count: number }>;
}

// -------------------------------------------------------------
// 4. Matching Engine Analytics
// -------------------------------------------------------------
export interface IMatchScoreBucket {
  range: string;
  label: string;
  count: number;
  percentage: number;
}

export interface IEligibilityDistributionItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
}

export interface IMostRecommendedOpportunityItem {
  opportunityId: string;
  title: string;
  companyName: string;
  category: string;
  recommendationCount: number;
  averageScore: number;
}

export interface IMatchingAnalytics {
  timeRange: string;
  startDate: string;
  endDate: string;
  totalRecommendationsGenerated: number;
  uniqueStudentsMatched: number;
  uniqueOpportunitiesMatched: number;
  averageMatchScore: number;
  scoreDistribution: IMatchScoreBucket[];
  eligibilityDistribution: IEligibilityDistributionItem[];
  mostRecommendedOpportunities: IMostRecommendedOpportunityItem[];
  aiGenerationStats: {
    totalEvaluated: number;
    aiNarrativeCount: number;
    deterministicFallbackCount: number;
    aiCoveragePercentage: number;
  };
}

// -------------------------------------------------------------
// 5. Application Analytics
// -------------------------------------------------------------
export interface IFunnelStage {
  stage: string;
  label: string;
  count: number;
  conversionFromPrevious: number;
  conversionFromInitial: number;
  description: string;
}

export interface IApplicationAnalytics {
  timeRange: string;
  startDate: string;
  endDate: string;
  totalTracked: number;
  submittedTotal: number;
  savedToAppliedRate: number;
  funnel: IFunnelStage[];
  statusDistribution: Array<{
    status: ApplicationStatus;
    label: string;
    count: number;
    color: string;
  }>;
  applicationsOverTime: Array<{ date: string; saved: number; applied: number }>;
  applicationMethodDistribution: Array<{ method: string; label: string; count: number }>;
}

// -------------------------------------------------------------
// 6. Skill-Gap & Learning Analytics
// -------------------------------------------------------------
export interface ISkillTriangulationItem {
  skillName: string;
  employerDemandCount: number;
  studentGapCount: number;
  activeLearnersCount: number;
  completedLearnersCount: number;
}

export interface ISkillGapAnalytics {
  timeRange: string;
  startDate: string;
  endDate: string;
  topMissingRequiredSkills: Array<{ name: string; count: number }>;
  topMissingPreferredSkills: Array<{ name: string; count: number }>;
  activelyLearnedSkills: Array<{ name: string; count: number }>;
  completedSkills: Array<{ name: string; count: number }>;
  skillTriangulation: ISkillTriangulationItem[];
}

export interface ILearningRoadmapAnalytics {
  timeRange: string;
  startDate: string;
  endDate: string;
  totalRoadmaps: number;
  activeRoadmaps: number;
  completedRoadmaps: number;
  archivedRoadmaps: number;
  averageMilestones: number;
  averageProgressPercentage: number;
  topTargetedRoles: Array<{ role: string; count: number }>;
  taskCompletionMetrics: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  };
}

// -------------------------------------------------------------
// 7. Fairness & Responsible AI Monitoring
// -------------------------------------------------------------
export interface IMethodologyFactorWeight {
  factor: string;
  weight: number;
  description: string;
  isProtectedAttribute: boolean;
}

export interface IDataQualityIndicators {
  opportunitiesMissingCompensation: number;
  opportunitiesMissingLocation: number;
  incompleteStudentProfiles: number;
  partialEvaluationRecommendations: number;
}

export interface IFairnessAnalytics {
  methodologyVersion: string;
  lastUpdated: string;
  factorWeights: IMethodologyFactorWeight[];
  protectedAttributesAudit: {
    attributesChecked: string[];
    isCompliant: boolean;
    excludedFromScoring: boolean;
    pedigreeNeutralityVerified: boolean;
  };
  dataQuality: IDataQualityIndicators;
  transparencyMetrics: {
    totalExplanations: number;
    withProjectEvidenceCount: number;
    withUnknownConditionsCount: number;
    aiFallbackRate: number;
    studentFeedback: {
      totalFeedback: number;
      helpfulCount: number;
      notHelpfulCount: number;
      satisfactionRate: number;
    };
  };
  limitationsNotice: string;
}

// -------------------------------------------------------------
// 8. Admin Audit Logs & Event Models
// -------------------------------------------------------------
export type AdminAuditAction =
  | "opportunity_created"
  | "opportunity_updated"
  | "opportunity_verified"
  | "opportunity_rejected"
  | "opportunity_published"
  | "opportunity_expired"
  | "opportunity_deleted"
  | "configuration_changed"
  | "methodology_updated"
  | "data_exported";

export interface IAdminAuditLog {
  _id?: string;
  id?: string;
  adminUserId: string;
  adminEmail?: string;
  action: AdminAuditAction;
  entityType: string;
  entityId?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

export interface IAnalyticsEvent {
  _id?: string;
  id?: string;
  eventType: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

