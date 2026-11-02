import { IComponentScores, IEligibilityResult, ISkillMatchResult } from "@/types/matching";
import { IOpportunity } from "@/types/opportunity";
import { IStudentProfile } from "@/types/student";
import { IScoreFactorExplanation, ScoreFactorStatus } from "@/types/explanation";
import { DEFAULT_SCORING_WEIGHTS } from "@/services/matching/score-calculator";

/**
 * Explains the 7-factor Stage 4 score breakdown with exact weights and transparent contributions.
 * Strictly distinguishes unavailable information from failed requirements.
 */
export function buildScoreBreakdown(
  student: Partial<IStudentProfile>,
  opportunity: Partial<IOpportunity>,
  componentScores: IComponentScores,
  skillResult: ISkillMatchResult,
  eligibilityResult: IEligibilityResult
): IScoreFactorExplanation[] {
  const breakdown: IScoreFactorExplanation[] = [];

  // 1. Required Technical Skills (40%)
  const reqTotal = skillResult.totalRequired;
  const reqMatched = skillResult.matchedRequiredSkills.length;
  let reqStatus: ScoreFactorStatus = "not_satisfied";
  let reqExplanation = "";

  if (reqTotal === 0) {
    reqStatus = "satisfied";
    reqExplanation =
      "Opportunity does not mandate specific technical prerequisites; open to candidates with general foundational skills.";
  } else if (reqMatched === reqTotal) {
    reqStatus = "satisfied";
    reqExplanation = `Full alignment: demonstrated all ${reqTotal} mandatory skills (${skillResult.matchedRequiredSkills.join(", ")}).`;
  } else if (reqMatched > 0) {
    reqStatus = "partially_satisfied";
    reqExplanation = `Partial match: demonstrated ${reqMatched} of ${reqTotal} required skills (${skillResult.matchedRequiredSkills.join(", ")}). Missing: ${skillResult.missingRequiredSkills.join(", ")}.`;
  } else {
    reqStatus = "not_satisfied";
    reqExplanation = `No required skills matched yet. Missing core skills: ${skillResult.missingRequiredSkills.join(", ")}.`;
  }

  breakdown.push({
    factorKey: "requiredSkills",
    name: "Required Technical Skills",
    weight: Math.round(DEFAULT_SCORING_WEIGHTS.requiredSkills * 100),
    score: componentScores.requiredSkills,
    weightedContribution:
      Math.round(
        componentScores.requiredSkills * DEFAULT_SCORING_WEIGHTS.requiredSkills * 10
      ) / 10,
    status: reqStatus,
    explanation: reqExplanation,
    isAvailable: true,
    studentValue:
      skillResult.matchedRequiredSkills.join(", ") || "None demonstrated",
    opportunityRequirement: (opportunity.requiredSkills || []).join(", "),
  });

  // 2. Preferred Technical Skills (15%)
  const prefTotal = skillResult.totalPreferred;
  const prefMatched = skillResult.matchedPreferredSkills.length;
  let prefStatus: ScoreFactorStatus = "unavailable";
  let prefExplanation = "";

  if (prefTotal === 0) {
    prefStatus = "satisfied";
    prefExplanation =
      "No preferred bonus technologies specified by the employer; full marks awarded.";
  } else if (prefMatched === prefTotal) {
    prefStatus = "satisfied";
    prefExplanation = `Outstanding bonus alignment: demonstrated all ${prefTotal} preferred technologies (${skillResult.matchedPreferredSkills.join(", ")}).`;
  } else if (prefMatched > 0) {
    prefStatus = "partially_satisfied";
    prefExplanation = `Competitive advantage: demonstrated ${prefMatched} of ${prefTotal} preferred technologies (${skillResult.matchedPreferredSkills.join(", ")}).`;
  } else {
    prefStatus = "not_satisfied";
    prefExplanation = `Preferred bonus skills (${skillResult.missingPreferredSkills.join(", ")}) not yet demonstrated. These are optional but enhance competitiveness.`;
  }

  breakdown.push({
    factorKey: "preferredSkills",
    name: "Preferred Technical Skills",
    weight: Math.round(DEFAULT_SCORING_WEIGHTS.preferredSkills * 100),
    score: componentScores.preferredSkills,
    weightedContribution:
      Math.round(
        componentScores.preferredSkills * DEFAULT_SCORING_WEIGHTS.preferredSkills * 10
      ) / 10,
    status: prefStatus,
    explanation: prefExplanation,
    isAvailable: true,
    studentValue:
      skillResult.matchedPreferredSkills.join(", ") || "None demonstrated",
    opportunityRequirement: (opportunity.preferredSkills || []).join(", "),
  });

  // 3. Projects & Relevant Experience (15%)
  const studentProjects = student.projects || [];
  const studentExp = student.additionalInfo?.experience || [];
  let projStatus: ScoreFactorStatus = "unavailable";
  let projExplanation = "";

  if (studentProjects.length === 0 && studentExp.length === 0) {
    projStatus = "unavailable";
    projExplanation =
      "No portfolio projects or experience records uploaded. Baseline student score granted without penalizing.";
  } else if (componentScores.projectsExperience >= 80) {
    projStatus = "satisfied";
    projExplanation = `Strong practical proof: demonstrated hands-on technical competency across ${studentProjects.length} portfolio project(s)${studentExp.length > 0 ? " and prior experience" : ""}.`;
  } else {
    projStatus = "partially_satisfied";
    projExplanation = `Practical evidence present in portfolio (${studentProjects.length} project(s)). Adding projects with relevant stack will maximize this score.`;
  }

  breakdown.push({
    factorKey: "projectsExperience",
    name: "Projects & Practical Experience",
    weight: Math.round(DEFAULT_SCORING_WEIGHTS.projectsExperience * 100),
    score: componentScores.projectsExperience,
    weightedContribution:
      Math.round(
        componentScores.projectsExperience *
          DEFAULT_SCORING_WEIGHTS.projectsExperience *
          10
      ) / 10,
    status: projStatus,
    explanation: projExplanation,
    isAvailable: studentProjects.length > 0 || studentExp.length > 0,
    studentValue: `${studentProjects.length} projects, ${studentExp.length} experience entries`,
    opportunityRequirement:
      opportunity.minimumExperience || "Demonstrated project ability",
  });

  // 4. Education & Academic Eligibility (10%)
  let eduStatus: ScoreFactorStatus = "unavailable";
  let eduExplanation = "";

  if (eligibilityResult.status === "eligible") {
    eduStatus = "satisfied";
    eduExplanation =
      "You meet all stated academic criteria, including degree, branch, and minimum CGPA.";
  } else if (eligibilityResult.status === "potentially_eligible") {
    eduStatus = "unavailable";
    eduExplanation =
      "Some academic criteria are not fully stated on your profile (e.g. CGPA or exact branch). Neutral evaluation applied.";
  } else {
    eduStatus = "not_satisfied";
    eduExplanation = `Eligibility criteria not met: ${eligibilityResult.issues.join("; ")}. Overall match capped per mandatory policy.`;
  }

  breakdown.push({
    factorKey: "education",
    name: "Education & Academic Eligibility",
    weight: Math.round(DEFAULT_SCORING_WEIGHTS.education * 100),
    score: componentScores.education,
    weightedContribution:
      Math.round(
        componentScores.education * DEFAULT_SCORING_WEIGHTS.education * 10
      ) / 10,
    status: eduStatus,
    explanation: eduExplanation,
    isAvailable: Boolean(student.academicInfo?.degree),
    studentValue: `${student.academicInfo?.degree || "Degree unstated"} ${student.academicInfo?.branch || ""}${student.academicInfo?.cgpa ? ` (CGPA: ${student.academicInfo.cgpa})` : ""}`,
    opportunityRequirement: `${opportunity.educationRequirements || "Any graduation"}${opportunity.minimumCGPA ? ` (Min CGPA: ${opportunity.minimumCGPA})` : ""}`,
  });

  // 5. Career Role Alignment (10%)
  const studentRole = student.careerPreferences?.preferredJobRole || "";
  let careerStatus: ScoreFactorStatus = "unavailable";
  let careerExplanation = "";

  if (!studentRole) {
    careerStatus = "unavailable";
    careerExplanation =
      "Preferred job role not specified in career preferences. Evaluated with default neutral alignment.";
  } else if (componentScores.careerAlignment >= 85) {
    careerStatus = "satisfied";
    careerExplanation = `High role alignment: Opportunity title "${opportunity.title}" matches your target career objective "${studentRole}".`;
  } else {
    careerStatus = "partially_satisfied";
    careerExplanation = `Moderate role alignment between your target role ("${studentRole}") and this position ("${opportunity.title}").`;
  }

  breakdown.push({
    factorKey: "careerAlignment",
    name: "Career Role Alignment",
    weight: Math.round(DEFAULT_SCORING_WEIGHTS.careerAlignment * 100),
    score: componentScores.careerAlignment,
    weightedContribution:
      Math.round(
        componentScores.careerAlignment *
          DEFAULT_SCORING_WEIGHTS.careerAlignment *
          10
      ) / 10,
    status: careerStatus,
    explanation: careerExplanation,
    isAvailable: Boolean(studentRole),
    studentValue: studentRole || "Not specified in profile",
    opportunityRequirement: `${opportunity.title} (${opportunity.category})`,
  });

  // 6. Work Mode & Location Alignment (5%)
  const studentWorkMode = student.careerPreferences?.workPreference || "";
  const studentLoc = student.careerPreferences?.preferredLocation || "";
  let locStatus: ScoreFactorStatus = "unavailable";
  let locExplanation = "";

  if (!studentWorkMode && !studentLoc) {
    locStatus = "unavailable";
    locExplanation =
      "Work mode and location preferences not configured in profile. Evaluated with neutral baseline.";
  } else if (opportunity.workMode === "remote") {
    locStatus = "satisfied";
    locExplanation =
      "Remote opportunity accessible from any location, fully compatible with all student preferences.";
  } else if (studentWorkMode.toLowerCase() === (opportunity.workMode || "").toLowerCase()) {
    locStatus = "satisfied";
    locExplanation = `Work mode (${opportunity.workMode}) perfectly matches your preferred setting.`;
  } else {
    locStatus = "partially_satisfied";
    locExplanation = `Opportunity is ${opportunity.workMode} in ${opportunity.location || "unspecified location"}; your stated preference is ${studentWorkMode || "unspecified"}.`;
  }

  breakdown.push({
    factorKey: "locationWorkMode",
    name: "Work Mode & Location",
    weight: Math.round(DEFAULT_SCORING_WEIGHTS.locationWorkMode * 100),
    score: componentScores.locationWorkMode,
    weightedContribution:
      Math.round(
        componentScores.locationWorkMode *
          DEFAULT_SCORING_WEIGHTS.locationWorkMode *
          10
      ) / 10,
    status: locStatus,
    explanation: locExplanation,
    isAvailable: Boolean(studentWorkMode || studentLoc),
    studentValue: `${studentWorkMode || "Mode unstated"}, ${studentLoc || "Location unstated"}`,
    opportunityRequirement: `${opportunity.workMode || "On-site"}, ${opportunity.location || "Office"}`,
  });

  // 7. Compensation Alignment (5%)
  let compStatus: ScoreFactorStatus = "satisfied";
  let compExplanation = "";

  if (opportunity.isPaid) {
    compStatus = "satisfied";
    compExplanation = `Paid opportunity (${opportunity.stipend || opportunity.salaryRange || "Stipend/salary provided"}).`;
  } else if (opportunity.category === "skill-development") {
    compStatus = "satisfied";
    compExplanation =
      "Skill-development program focused on curriculum and credentials rather than direct remuneration.";
  } else {
    compStatus = "not_satisfied";
    compExplanation =
      "Unpaid or volunteer position. Does not meet standard compensation expectations.";
  }

  breakdown.push({
    factorKey: "compensation",
    name: "Compensation Alignment",
    weight: Math.round(DEFAULT_SCORING_WEIGHTS.compensation * 100),
    score: componentScores.compensation,
    weightedContribution:
      Math.round(
        componentScores.compensation * DEFAULT_SCORING_WEIGHTS.compensation * 10
      ) / 10,
    status: compStatus,
    explanation: compExplanation,
    isAvailable: Boolean(opportunity.isPaid || opportunity.stipend || opportunity.salaryRange),
    studentValue: student.careerPreferences?.expectedStipend || "Not specified",
    opportunityRequirement:
      opportunity.stipend || opportunity.salaryRange || (opportunity.isPaid ? "Paid" : "Not disclosed"),
  });

  return breakdown;
}

