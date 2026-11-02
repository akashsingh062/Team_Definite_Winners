import { EligibilityStatus, IComponentScores } from "./matching";
import { OpportunityCategory, WorkMode } from "./opportunity";

export type ScoreFactorStatus =
  | "satisfied"
  | "partially_satisfied"
  | "not_satisfied"
  | "unavailable";

export interface IScoreFactorExplanation {
  factorKey: keyof IComponentScores;
  name: string;
  weight: number; // Percentage, e.g. 40, 15, 10, 5
  score: number; // 0 - 100
  weightedContribution: number; // score * (weight / 100)
  status: ScoreFactorStatus;
  explanation: string;
  isAvailable: boolean;
  studentValue?: string;
  opportunityRequirement?: string;
}

export type SkillAnalysisCategory =
  | "matching"
  | "missing_required"
  | "missing_preferred"
  | "verification_needed";

export interface ISkillAnalysisItem {
  name: string;
  type: "required" | "preferred" | "unknown";
  category: SkillAnalysisCategory;
  evidenceSource?: "profile" | "resume" | "project" | "none";
  evidenceDetail?: string;
  importance: "critical" | "high" | "medium" | "low";
  reason: string;
  skillGapUrl?: string;
}

export type CriterionSatisfaction = "satisfied" | "not_satisfied" | "unknown";

export interface IEligibilityCriterionExplanation {
  criterion: string;
  requirement: string;
  studentValue: string;
  status: CriterionSatisfaction;
  explanation: string;
  isMandatory: boolean;
}

export interface IProjectRelevanceItem {
  title: string;
  technologies: string[];
  matchingSkills: string[];
  explanation: string;
  githubUrl?: string;
  liveDeploymentUrl?: string;
}

export interface IExperienceRelevanceItem {
  role: string;
  company: string;
  duration?: string;
  technologies?: string[];
  explanation: string;
}

export interface ICertificationRelevanceItem {
  name: string;
  issuer?: string;
  issueDate?: string;
  matchingSkills: string[];
  explanation: string;
}

export interface ICareerAlignmentExplanation {
  roleAlignment: {
    studentRole: string;
    opportunityTitle: string;
    matches: boolean;
    explanation: string;
  };
  employmentType: {
    studentPreference: string;
    opportunityType: string;
    matches: boolean;
    explanation: string;
  };
  industry: {
    studentPreference?: string;
    opportunityIndustry: string;
    explanation: string;
  };
  overallExplanation: string;
}

export interface ILocationCompensationExplanation {
  workMode: {
    studentPreference: string;
    opportunityMode: string;
    matches: boolean;
    explanation: string;
  };
  location: {
    studentPreference: string;
    opportunityLocation: string;
    matches: boolean;
    explanation: string;
  };
  compensation: {
    studentPreference?: string;
    opportunityCompensation: string;
    isDisclosed: boolean;
    isPaid: boolean;
    explanation: string;
  };
}

export interface IDataCompletenessInfo {
  completenessScore: number; // 0 - 100
  isComplete: boolean;
  evaluatedFactors: string[];
  missingFactors: string[];
  factorsUnevaluated: string[];
  narrative: string;
}

export type ImprovementSuggestionType =
  | "skill"
  | "project"
  | "milestone"
  | "profile";

export interface IImprovementSuggestion {
  id: string;
  type: ImprovementSuggestionType;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  isMandatory: boolean;
  actionUrl: string;
  actionText: string;
}

export interface INarrativeExplanation {
  summary: string;
  topMatchingFactors: string[];
  keyProfileEvidence: string[];
  limitationsDisclaimer: string;
}

export interface IOpportunityExplanation {
  opportunityId: string;
  opportunity: {
    id: string;
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
    minimumExperience?: string;
    educationRequirements?: string;
    minimumCGPA?: number;
  };
  overallScore: number;
  eligibilityStatus: EligibilityStatus;
  scoringVersion: string;
  scoreBreakdown: IScoreFactorExplanation[];
  skillsAnalysis: {
    matchingSkills: ISkillAnalysisItem[];
    missingRequiredSkills: ISkillAnalysisItem[];
    missingPreferredSkills: ISkillAnalysisItem[];
    skillsRequiringVerification: ISkillAnalysisItem[];
  };
  eligibilityExplanation: IEligibilityCriterionExplanation[];
  projectRelevance: IProjectRelevanceItem[];
  experienceRelevance: IExperienceRelevanceItem[];
  certificationsRelevance: ICertificationRelevanceItem[];
  careerAlignment: ICareerAlignmentExplanation;
  locationCompensation: ILocationCompensationExplanation;
  dataCompleteness: IDataCompletenessInfo;
  improvementSuggestions: IImprovementSuggestion[];
  narrativeExplanation: INarrativeExplanation;
  aiGenerated: boolean;
  userFeedback?: {
    feedbackType: "helpful" | "not_helpful";
    reason?: string;
    comment?: string;
    createdAt: string | Date;
  };
  calculatedAt: string | Date;
}

export type ExplanationFeedbackType = "helpful" | "not_helpful";

export type ExplanationFeedbackReason =
  | "Incorrect information"
  | "Missing information"
  | "Explanation is unclear"
  | "Score breakdown is confusing"
  | "Other";

export interface IExplanationFeedbackInput {
  opportunityId: string;
  feedbackType: ExplanationFeedbackType;
  reason?: ExplanationFeedbackReason;
  comment?: string;
}

export interface IExplanationFeedbackDoc {
  id?: string;
  _id?: string;
  userId: string;
  opportunityId: string;
  feedbackType: ExplanationFeedbackType;
  reason?: string;
  comment?: string;
  createdAt: Date;
}

export interface IMethodologyInfo {
  scoringVersion: string;
  factors: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
  methodologyOverview: string;
  fairnessGuarantees: string[];
  limitations: string[];
}

