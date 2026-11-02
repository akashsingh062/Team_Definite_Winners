import { ISkillMatchResult, IEligibilityResult, IComponentScores } from "@/types/matching";
import { IOpportunity } from "@/types/opportunity";
import { IStudentProfile } from "@/types/student";

export interface IExplanationResult {
  explanation: string;
  strengths: string[];
  improvementAreas: string[];
}

/**
 * Deterministically generates evidence-based match explanations, strengths, and improvement areas.
 */
export function generateDeterministicExplanation(
  student: Partial<IStudentProfile>,
  opportunity: Partial<IOpportunity>,
  skillResult: ISkillMatchResult,
  eligibilityResult: IEligibilityResult,
  componentScores: IComponentScores,
  relevantProjects: Array<{ title: string; technologies: string[] }>
): IExplanationResult {
  const strengths: string[] = [];
  const improvementAreas: string[] = [];
  const summarySentences: string[] = [];

  const oppTitle = opportunity.title || "this role";

  // 1. Required Skills Evidence
  if (skillResult.totalRequired > 0) {
    if (skillResult.matchedRequiredSkills.length === skillResult.totalRequired) {
      strengths.push(
        `Full core competency alignment: matches all ${skillResult.totalRequired} required skills (${skillResult.matchedRequiredSkills.join(", ")})`
      );
      summarySentences.push(
        `Recommended because you satisfy 100% of the core required skills (${skillResult.matchedRequiredSkills.join(", ")}) for ${oppTitle}.`
      );
    } else if (skillResult.matchedRequiredSkills.length > 0) {
      strengths.push(
        `Strong foundational overlap: matches ${skillResult.matchedRequiredSkills.length} of ${skillResult.totalRequired} required skills (${skillResult.matchedRequiredSkills.join(", ")})`
      );
      summarySentences.push(
        `Matches ${skillResult.matchedRequiredSkills.length} of ${skillResult.totalRequired} required skills (${skillResult.matchedRequiredSkills.join(", ")}) for ${oppTitle}.`
      );
    } else {
      improvementAreas.push(
        `Missing core required skills: ${skillResult.missingRequiredSkills.join(", ")}`
      );
      summarySentences.push(
        `Opportunity requires competencies in ${skillResult.missingRequiredSkills.join(", ")} which are not yet on your profile.`
      );
    }
  } else {
    strengths.push("Open entry role with flexible skill requirements");
    summarySentences.push(`This opportunity offers an open entry pathway for students.`);
  }

  // 2. Missing Required Skills
  if (skillResult.missingRequiredSkills.length > 0 && skillResult.matchedRequiredSkills.length > 0) {
    improvementAreas.push(
      `Acquiring skills in ${skillResult.missingRequiredSkills.join(", ")} will close the remaining skill gap.`
    );
  }

  // 3. Preferred Skills Bonus
  if (skillResult.matchedPreferredSkills.length > 0) {
    strengths.push(
      `Bonus qualifications: includes preferred skills in ${skillResult.matchedPreferredSkills.join(", ")}`
    );
    summarySentences.push(
      `You also possess preferred bonus skills in ${skillResult.matchedPreferredSkills.join(", ")}.`
    );
  }

  // 4. Project Proof Evidence
  if (relevantProjects.length > 0) {
    const projectTitles = relevantProjects.map((p) => `"${p.title}"`).join(", ");
    strengths.push(
      `Demonstrated practical proof: your portfolio project(s) ${projectTitles} showcase applicable technical hands-on experience.`
    );
    summarySentences.push(
      `Your project work (${projectTitles}) demonstrates direct practical application of the required technologies.`
    );
  } else if ((student.projects || []).length === 0) {
    improvementAreas.push(
      "Building and showcasing a portfolio project using the required stack will strengthen your candidate profile."
    );
  }

  // 5. Work Experience
  const experienceCount = (student.additionalInfo?.experience || []).length;
  if (experienceCount > 0) {
    strengths.push(`Prior professional/internship experience enhances role readiness.`);
  }

  // 6. Eligibility Issues
  if (eligibilityResult.issues.length > 0) {
    for (const issue of eligibilityResult.issues) {
      improvementAreas.push(issue);
    }
  }

  // 7. Work Mode / Compensation Alignment
  if (opportunity.workMode === "remote") {
    strengths.push("Remote work mode provides geographical flexibility.");
  }

  const finalExplanation =
    summarySentences.join(" ") ||
    `This ${opportunity.category} matches your profile based on verified technical competencies and career preferences.`;

  return {
    explanation: finalExplanation,
    strengths,
    improvementAreas,
  };
}

export const generateMatchExplanation = generateDeterministicExplanation;

