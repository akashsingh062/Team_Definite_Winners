import { ISkillAnalysisItem, IImprovementSuggestion } from "@/types/explanation";
import { IStudentProfile, IAcademicInfo } from "@/types/student";
import { IOpportunity } from "@/types/opportunity";
import { IEligibilityResult } from "@/types/matching";
import { IRoadmap } from "@/types/roadmap";

/**
 * Generates actionable improvement suggestions based strictly on actual missing requirements.
 * Connects directly to Stage 5 Skill Gap and Stage 6 Learning Roadmap without duplicating data.
 */
export function buildImprovementSuggestions(
  student: Partial<IStudentProfile>,
  opportunity: Partial<IOpportunity>,
  missingRequiredSkills: ISkillAnalysisItem[],
  missingPreferredSkills: ISkillAnalysisItem[],
  eligibilityResult: IEligibilityResult,
  activeRoadmap: IRoadmap | null
): IImprovementSuggestion[] {
  const suggestions: IImprovementSuggestion[] = [];

  // 1. Mandatory Skills Suggestions (Stage 5 Link)
  if (missingRequiredSkills.length > 0) {
    const topMissing = missingRequiredSkills.slice(0, 3).map((s) => s.name);
    suggestions.push({
      id: "learn-required-skills",
      type: "skill",
      title: `Learn core required skills: ${topMissing.join(", ")}`,
      description: `Closing these gaps directly improves your technical match score by up to ${Math.min(40, missingRequiredSkills.length * 15)}%. Explore vetted courses, tutorials, and benchmarks in the Skill Gap Analyzer.`,
      priority: "high",
      isMandatory: true,
      actionUrl: `/dashboard/skill-gap/${encodeURIComponent(topMissing[0])}`,
      actionText: "View Skill Gap & Resources",
    });
  }

  // 2. Learning Roadmap Suggestion (Stage 6 Link)
  if (activeRoadmap) {
    const currentMilestone = activeRoadmap.milestones.find(
      (m) => m.status === "in_progress"
    ) || activeRoadmap.milestones.find((m) => m.status === "not_started");

    if (currentMilestone) {
      suggestions.push({
        id: "continue-roadmap",
        type: "milestone",
        title: `Advance your active roadmap: Week ${currentMilestone.weekNumber} (${currentMilestone.title})`,
        description: `Complete practical subtasks and project assignments in your active learning roadmap to systematically build hiring readiness.`,
        priority: "high",
        isMandatory: false,
        actionUrl: `/dashboard/roadmap/${activeRoadmap._id || activeRoadmap.id}`,
        actionText: "Continue Learning Roadmap",
      });
    }
  } else if (missingRequiredSkills.length > 0) {
    suggestions.push({
      id: "generate-roadmap",
      type: "milestone",
      title: "Generate a Personalized Learning Roadmap",
      description:
        "Create an AI-structured, week-by-week study schedule with hands-on project deliverables to master missing competencies.",
      priority: "medium",
      isMandatory: false,
      actionUrl: "/dashboard/roadmap",
      actionText: "Create Learning Roadmap",
    });
  }

  // 3. Project Evidence Suggestion
  const studentProjects = student.projects || [];
  if (studentProjects.length < 2 && missingRequiredSkills.length > 0) {
    const targetSkill = missingRequiredSkills[0].name;
    suggestions.push({
      id: "build-portfolio-project",
      type: "project",
      title: `Build a portfolio project demonstrating ${targetSkill}`,
      description: `Recruiters prioritize practical proof over theoretical knowledge. Building and deploying an open-source project featuring ${targetSkill} validates your capabilities.`,
      priority: "medium",
      isMandatory: false,
      actionUrl: "/profile",
      actionText: "Add Project to Profile",
    });
  }

  // 4. Academic Profile Completion
  const academic: Partial<IAcademicInfo> = student.academicInfo || {};
  if (opportunity.minimumCGPA && (academic.cgpa === undefined || academic.cgpa === null)) {
    suggestions.push({
      id: "update-cgpa",
      type: "profile",
      title: `Add your CGPA to verify eligibility (Min: ${opportunity.minimumCGPA})`,
      description: `This opportunity enforces a mandatory minimum CGPA of ${opportunity.minimumCGPA}. Entering your CGPA will resolve your eligibility status from 'potentially eligible' to verified.`,
      priority: "high",
      isMandatory: true,
      actionUrl: "/profile",
      actionText: "Update Academic Profile",
    });
  }

  // 5. Preferred Skills Bonus (Stage 5 Link)
  if (missingPreferredSkills.length > 0 && missingRequiredSkills.length === 0) {
    const topPref = missingPreferredSkills.slice(0, 2).map((s) => s.name);
    suggestions.push({
      id: "learn-preferred-skills",
      type: "skill",
      title: `Acquire preferred bonus skills: ${topPref.join(", ")}`,
      description: `You already satisfy all mandatory requirements! Learning ${topPref.join(", ")} will give you a decisive edge during candidate selection.`,
      priority: "low",
      isMandatory: false,
      actionUrl: `/dashboard/skill-gap/${encodeURIComponent(topPref[0])}`,
      actionText: "Explore Bonus Skills",
    });
  }

  return suggestions;
}
