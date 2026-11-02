import { IStudentProfile, IAcademicInfo, ICareerPreferences } from "@/types/student";
import { IResume } from "@/types/resume";
import { IOpportunity } from "@/types/opportunity";
import { IDataCompletenessInfo } from "@/types/explanation";

/**
 * Calculates recommendation data completeness.
 * Strictly separate from the match score.
 * Never labels completeness as "hiring probability" or "model confidence".
 */
export function calculateDataCompleteness(
  student: Partial<IStudentProfile>,
  resume: Partial<IResume> | null,
  opportunity: Partial<IOpportunity>
): IDataCompletenessInfo {
  const evaluatedFactors: string[] = [];
  const missingFactors: string[] = [];
  const factorsUnevaluated: string[] = [];

  let completenessPoints = 0;
  const maxPoints = 100;

  // 1. Technical Skills Check (25 pts)
  const skillsCount = (student.skills || []).length;
  if (skillsCount >= 5) {
    completenessPoints += 25;
    evaluatedFactors.push(`Technical skills comprehensive (${skillsCount} skills recorded)`);
  } else if (skillsCount >= 1) {
    completenessPoints += 15;
    evaluatedFactors.push(`Technical skills recorded (${skillsCount} skill(s))`);
    missingFactors.push("Additional technical skills could improve evaluation precision");
  } else {
    missingFactors.push("No technical skills listed on profile");
    factorsUnevaluated.push("Skill match precision limited by empty skills section");
  }

  // 2. Academic Background (20 pts)
  const academic: Partial<IAcademicInfo> = student.academicInfo || {};
  let academicPts = 0;
  if (academic.degree) academicPts += 8;
  if (academic.branch) academicPts += 6;
  if (academic.cgpa !== undefined && academic.cgpa !== null) academicPts += 6;

  completenessPoints += academicPts;
  if (academic.degree && academic.branch && academic.cgpa !== undefined && academic.cgpa !== null) {
    evaluatedFactors.push("Complete academic profile (degree, branch, and CGPA)");
  } else {
    if (!academic.degree) missingFactors.push("Degree qualification not specified");
    if (!academic.branch) missingFactors.push("Academic branch/major not specified");
    if (academic.cgpa === undefined || academic.cgpa === null) {
      missingFactors.push("CGPA not recorded");
      factorsUnevaluated.push("CGPA threshold eligibility");
    }
  }

  // 3. Project Portfolio (20 pts)
  const projectsCount = (student.projects || []).length;
  if (projectsCount >= 2) {
    completenessPoints += 20;
    evaluatedFactors.push(`Portfolio projects verified (${projectsCount} projects)`);
  } else if (projectsCount === 1) {
    completenessPoints += 12;
    evaluatedFactors.push("Single portfolio project recorded");
    missingFactors.push("Additional portfolio projects recommended for stronger proof");
  } else {
    missingFactors.push("No portfolio projects listed");
    factorsUnevaluated.push("Practical code & project implementation proof");
  }

  // 4. Approved Resume (20 pts)
  if (resume && resume.analysisStatus === "approved") {
    completenessPoints += 20;
    evaluatedFactors.push("Approved and parsed resume on file");
  } else if (resume && resume.analysisStatus === "completed") {
    completenessPoints += 12;
    evaluatedFactors.push("Resume uploaded but pending student approval");
    missingFactors.push("Resume analysis requires student review and approval");
  } else {
    missingFactors.push("No resume uploaded or verified");
    factorsUnevaluated.push("Resume verified work history and certifications");
  }

  // 5. Career Preferences (15 pts)
  const prefs: Partial<ICareerPreferences> = student.careerPreferences || {};
  let prefPts = 0;
  if (prefs.preferredJobRole) prefPts += 5;
  if (prefs.workPreference) prefPts += 5;
  if (prefs.preferredLocation) prefPts += 5;

  completenessPoints += prefPts;
  if (prefPts === 15) {
    evaluatedFactors.push("Career preferences complete (role, work mode, and location)");
  } else {
    if (!prefs.preferredJobRole) missingFactors.push("Target career role not specified");
    if (!prefs.workPreference) missingFactors.push("Work mode preference (Remote/Hybrid) unstated");
    if (!prefs.preferredLocation) missingFactors.push("Location preference unstated");
  }

  const completenessScore = Math.min(100, Math.max(0, completenessPoints));
  const isComplete = completenessScore >= 80;

  const narrative = isComplete
    ? `This recommendation is based on comprehensive profile data (${completenessScore}% complete). Most eligibility and skill criteria were fully evaluated.`
    : `This recommendation is based on partial profile data (${completenessScore}% complete). Some evaluation factors were assigned neutral baselines because corresponding fields are unpopulated on your profile.`;

  return {
    completenessScore,
    isComplete,
    evaluatedFactors,
    missingFactors,
    factorsUnevaluated,
    narrative,
  };
}
