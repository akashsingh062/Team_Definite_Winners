import { IComponentScores, ISkillMatchResult, IEligibilityResult } from "@/types/matching";
import { IStudentProfile, IProjectItem } from "@/types/student";
import { IOpportunity } from "@/types/opportunity";
import { normalizeSkill } from "./skill-normalizer";

export interface IScoringWeights {
  requiredSkills: number; // default: 0.40
  preferredSkills: number; // default: 0.15
  projectsExperience: number; // default: 0.15
  education: number; // default: 0.10
  careerAlignment: number; // default: 0.10
  locationWorkMode: number; // default: 0.05
  compensation: number; // default: 0.05
}

export const DEFAULT_SCORING_WEIGHTS: IScoringWeights = {
  requiredSkills: 0.4,
  preferredSkills: 0.15,
  projectsExperience: 0.15,
  education: 0.1,
  careerAlignment: 0.1,
  locationWorkMode: 0.05,
  compensation: 0.05,
};

/**
 * Calculates deterministic component scores and weighted overall compatibility.
 */
export function calculateMatchScores(
  student: Partial<IStudentProfile>,
  opportunity: Partial<IOpportunity>,
  skillResult: ISkillMatchResult,
  eligibilityResult: IEligibilityResult,
  weights: IScoringWeights = DEFAULT_SCORING_WEIGHTS
): {
  overallScore: number;
  componentScores: IComponentScores;
  dataCompleteness: number;
  relevantProjects: Array<{ title: string; technologies: string[] }>;
} {
  // 1. Required Technical Skills (0 - 100)
  const requiredSkills = skillResult.requiredCoverage;

  // 2. Preferred Technical Skills (0 - 100)
  const preferredSkills = skillResult.preferredCoverage;

  // 3. Projects & Relevant Experience (0 - 100)
  let projectsExperience = 40; // Base baseline for students
  const relevantProjects: Array<{ title: string; technologies: string[] }> = [];

  const oppSkillsSet = new Set([
    ...skillResult.matchedRequiredSkills.map((s) => s.toLowerCase()),
    ...skillResult.matchedPreferredSkills.map((s) => s.toLowerCase()),
  ]);

  const studentProjects: IProjectItem[] = student.projects || [];
  for (const proj of studentProjects) {
    const projTech = (proj.technologies || []).map((t) => normalizeSkill(t).toLowerCase());
    const hasOverlap = projTech.some((t) => oppSkillsSet.has(t));
    if (hasOverlap) {
      relevantProjects.push({
        title: proj.title,
        technologies: proj.technologies || [],
      });
    }
  }

  if (relevantProjects.length >= 2) {
    projectsExperience += 40;
  } else if (relevantProjects.length === 1) {
    projectsExperience += 25;
  } else if (studentProjects.length > 0) {
    projectsExperience += 15;
  }

  // Work experience bonus
  const experienceRecords = student.additionalInfo?.experience || [];
  if (experienceRecords.length > 0) {
    projectsExperience = Math.min(100, projectsExperience + 20);
  } else {
    projectsExperience = Math.min(100, projectsExperience);
  }

  // 4. Education & Eligibility (0 - 100)
  let education = 80;
  if (eligibilityResult.status === "eligible") {
    education = 100;
  } else if (eligibilityResult.status === "potentially_eligible") {
    education = 70; // Missing data policy: neutral rather than punitive 0
  } else {
    education = 20; // Ineligible
  }

  // 5. Career Role Alignment (0 - 100)
  let careerAlignment = 65; // Default neutral if preferences unconfigured
  const studentRole = (student.careerPreferences?.preferredJobRole || "").toLowerCase();
  const oppTitle = (opportunity.title || "").toLowerCase();
  const oppCategory = (opportunity.category || "").toLowerCase();
  const studentPrefType = (student.careerPreferences?.preferredEmploymentType || "").toLowerCase();

  if (studentRole) {
    let roleTokens = studentRole.split(/\s+/).filter((t) => t.length > 2);
    const hasTokenOverlap = roleTokens.some((tok) => oppTitle.includes(tok));
    if (hasTokenOverlap) {
      careerAlignment += 25;
    }
  }

  if (studentPrefType) {
    if (
      (studentPrefType.includes("intern") && oppCategory === "internship") ||
      (studentPrefType.includes("full") && oppCategory === "job")
    ) {
      careerAlignment += 15;
    }
  }
  careerAlignment = Math.min(100, careerAlignment);

  // 6. Work Mode & Location Alignment (0 - 100)
  let locationWorkMode = 75;
  const studentWorkPref = (student.careerPreferences?.workPreference || "").toLowerCase();
  const oppWorkMode = (opportunity.workMode || "").toLowerCase();
  const studentLoc = (student.careerPreferences?.preferredLocation || "").toLowerCase();
  const oppLoc = (opportunity.location || "").toLowerCase();

  if (oppWorkMode === "remote") {
    locationWorkMode = 100;
  } else if (studentWorkPref && studentWorkPref === oppWorkMode) {
    locationWorkMode = 95;
  } else if (studentWorkPref === "hybrid" || oppWorkMode === "hybrid") {
    locationWorkMode = 85;
  }

  if (studentLoc && oppLoc && oppLoc.includes(studentLoc)) {
    locationWorkMode = Math.min(100, locationWorkMode + 15);
  }

  // 7. Compensation Alignment (0 - 100)
  let compensation = 80;
  if (opportunity.isPaid) {
    compensation = 100;
  } else if (opportunity.category === "skill-development") {
    compensation = 90; // Learning opportunities are valued for skill building
  } else {
    compensation = 60;
  }

  const componentScores: IComponentScores = {
    requiredSkills: Math.round(requiredSkills),
    preferredSkills: Math.round(preferredSkills),
    projectsExperience: Math.round(projectsExperience),
    education: Math.round(education),
    careerAlignment: Math.round(careerAlignment),
    locationWorkMode: Math.round(locationWorkMode),
    compensation: Math.round(compensation),
  };

  // Weighted Score Computation
  let rawScore =
    componentScores.requiredSkills * weights.requiredSkills +
    componentScores.preferredSkills * weights.preferredSkills +
    componentScores.projectsExperience * weights.projectsExperience +
    componentScores.education * weights.education +
    componentScores.careerAlignment * weights.careerAlignment +
    componentScores.locationWorkMode * weights.locationWorkMode +
    componentScores.compensation * weights.compensation;

  let overallScore = Math.round(rawScore);

  // Mandatory Eligibility Invariant:
  // If the candidate fails a mandatory eligibility criterion (e.g. CGPA strictly below minimum),
  // they must NOT be displayed with an misleading high matching score.
  if (eligibilityResult.status === "not_eligible") {
    overallScore = Math.min(45, overallScore);
  }

  const dataCompleteness = student.profileCompletionPercentage || 50;

  return {
    overallScore,
    componentScores,
    dataCompleteness,
    relevantProjects,
  };
}

export const calculateCompatibilityScore = calculateMatchScores;

