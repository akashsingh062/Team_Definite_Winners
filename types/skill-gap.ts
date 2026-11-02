export type SkillPriority = "critical" | "high" | "medium" | "low";

export type SkillProgressStatus =
  | "not_started"
  | "learning"
  | "practicing"
  | "completed";

export type ResourceType =
  | "documentation"
  | "course"
  | "tutorial"
  | "video"
  | "practice"
  | "project";

export type ResourceDifficulty = "beginner" | "intermediate" | "advanced";

export interface ILearningResource {
  _id?: string;
  id?: string;
  title: string;
  skillName: string;
  description: string;
  resourceType: ResourceType;
  provider: string;
  url: string;
  difficultyLevel: ResourceDifficulty;
  isFree: boolean;
  estimatedDuration: string;
  verificationStatus: "verified" | "unverified";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IStudentSkillProgress {
  _id?: string;
  id?: string;
  studentId: string;
  skillName: string;
  status: SkillProgressStatus;
  learningResourceIds: string[];
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IOpportunitySkillRef {
  id: string;
  title: string;
  companyName: string;
  isRequired: boolean;
}

export interface ISkillGapItem {
  skillName: string;
  category: string;
  priority: SkillPriority;
  demandPercentage: number; // 0 - 100
  opportunityCount: number;
  requiredByCount: number;
  preferredByCount: number;
  isMandatory: boolean;
  relevantOpportunities: IOpportunitySkillRef[];
  explanation?: string;
  suggestedProject?: string;
  keyConcepts?: string[];
  learningResources?: ILearningResource[];
  progress?: IStudentSkillProgress;
}

export interface ISkillCoverage {
  requiredCoverage: number; // 0 - 100
  preferredCoverage: number; // 0 - 100
  combinedCoverage: number; // 0 - 100
  matchedRequiredCount: number;
  totalRequiredCount: number;
  matchedPreferredCount: number;
  totalPreferredCount: number;
}

export interface IExistingSkillItem {
  name: string;
  category: string;
  proficiency?: string;
  source: "profile" | "resume" | "project";
}

export interface ISkillGapAnalysisResult {
  targetRole?: string;
  selectedOpportunities: Array<{
    id: string;
    title: string;
    companyName: string;
    category: string;
  }>;
  existingSkills: IExistingSkillItem[];
  missingSkills: ISkillGapItem[];
  commonSkills: string[]; // Skills shared across all selected opportunities
  coverage: ISkillCoverage;
  priorityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  analyzedAt: string | Date;
}

export interface ISkillExplanation {
  skillName: string;
  whatIsIt: string;
  whyItMatters: string;
  keyConcepts: string[];
  suggestedProject: string;
  relevantOpportunities: string[];
}

