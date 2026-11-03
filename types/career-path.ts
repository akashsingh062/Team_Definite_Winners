export type CareerDifficulty = "beginner" | "intermediate" | "advanced";

export interface ICareerProject {
  title: string;
  description: string;
  skills: string[];
  deliverable?: string;
}

export interface ICareerEducationRequirement {
  preferredDegrees?: string[];
  minimumGpa?: number;
  fieldsOfStudy?: string[];
  notes?: string;
}

export interface ICareerPath {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  requiredSkills: string[];
  preferredSkills: string[];
  recommendedProjects: ICareerProject[];
  responsibilities: string[];
  educationRequirements?: ICareerEducationRequirement;
  relatedCareerPaths: string[]; // slugs or titles
  learningDifficulty: CareerDifficulty;
  careerProgression: string[];
  methodologyVersion: string;
  sourceInformation: string;
  reviewedAt: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// -------------------------------------------------------------
// Career Readiness & Alignment Types
// -------------------------------------------------------------
export interface ISkillAlignmentDetail {
  name: string;
  normalizedName: string;
  isMatched: boolean;
  isVerified: boolean; // true if found in resume/projects, false if self-reported
  source?: "resume" | "project" | "self_reported" | "hypothetical";
}

export interface ICareerPillarBreakdown {
  score: number; // 0 - 100
  weight: number; // percentage of total
  weightedScore: number;
  label: string;
  details: string;
}

export interface ICareerAlignmentResult {
  careerPathId: string;
  careerTitle: string;
  category: string;
  overallScore: number; // 0 - 100
  methodologyVersion: string;
  scoringVersion: string;

  pillars: {
    requiredSkills: ICareerPillarBreakdown;
    preferredSkills: ICareerPillarBreakdown;
    projects: ICareerPillarBreakdown;
    educationExperience: ICareerPillarBreakdown;
  };

  skills: {
    matchedRequired: string[];
    missingRequired: string[];
    matchedPreferred: string[];
    missingPreferred: string[];
    totalRequiredCount: number;
    totalPreferredCount: number;
    requiredCoveragePercentage: number;
  };

  relevantProjects: Array<{
    title: string;
    technologies: string[];
    matchingSkills: string[];
  }>;

  educationAlignment: {
    isAligned: boolean;
    studentDegree?: string;
    studentField?: string;
    notes: string;
  };

  missingInformationNotes: string[];
  calculatedAt: string;
}

// -------------------------------------------------------------
// What-If Simulator Types
// -------------------------------------------------------------
export interface ISimulatedOpportunityDelta {
  opportunityId: string;
  title: string;
  companyName: string;
  category: string;
  originalScore: number;
  simulatedScore: number;
  scoreDelta: number;
  newlySatisfiedSkills: string[];
}

export interface IWhatIfSimulationResult {
  isSimulated: true;
  safetyDisclaimer: string;
  careerPathId: string;
  careerTitle: string;
  hypotheticalSkillsAdded: string[];

  baselineAlignment: ICareerAlignmentResult;
  simulatedAlignment: ICareerAlignmentResult;
  alignmentDelta: number; // e.g. +18%

  newlySatisfiedRequiredSkills: string[];
  newlySatisfiedPreferredSkills: string[];
  remainingMissingRequiredSkills: string[];
  remainingMissingPreferredSkills: string[];

  opportunityImpact: {
    totalEvaluated: number;
    improvedOpportunitiesCount: number;
    topImpactedOpportunities: ISimulatedOpportunityDelta[];
  };

  aiExplanation?: {
    summary: string;
    strategicValue: string;
    recommendedLearningOrder: string[];
    suggestedProjectIdea: string;
    isAiGenerated: boolean;
  };

  calculatedAt: string;
}

// -------------------------------------------------------------
// Career Path Comparison Types
// -------------------------------------------------------------
export interface ICareerComparisonItem {
  careerPath: ICareerPath;
  alignment: ICareerAlignmentResult;
  relatedOpportunitiesCount: number;
  learningEffortEstimate: string;
}

export interface ICareerComparisonResult {
  careers: ICareerComparisonItem[];
  commonSkills: string[];
  distinctSkillsByCareer: Record<string, string[]>;
  aiSynthesis?: {
    overview: string;
    recommendation: string;
    keyTradeoffs: string[];
    isAiGenerated: boolean;
  };
  comparedAt: string;
}

// -------------------------------------------------------------
// Career Simulation Persistence Types
// -------------------------------------------------------------
export interface ICareerSimulationDoc {
  _id?: string;
  id?: string;
  userId: string;
  careerPathId: string;
  targetCareerTitle: string;
  hypotheticalSkills: string[];
  baselineScore: number;
  simulatedScore: number;
  scoreDelta: number;
  simulationSnapshot: IWhatIfSimulationResult;
  methodologyVersion: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

