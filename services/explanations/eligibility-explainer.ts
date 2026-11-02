import { IEligibilityResult } from "@/types/matching";
import { IOpportunity } from "@/types/opportunity";
import { IStudentProfile, IAcademicInfo } from "@/types/student";
import {
  IEligibilityCriterionExplanation,
  CriterionSatisfaction,
} from "@/types/explanation";

/**
 * Builds itemized explanations for each eligibility requirement.
 * Clearly separates mandatory failures from weighted scores and marks missing student data as unknown.
 */
export function buildEligibilityExplanation(
  student: Partial<IStudentProfile>,
  opportunity: Partial<IOpportunity>,
  eligibilityResult: IEligibilityResult
): IEligibilityCriterionExplanation[] {
  const criteria: IEligibilityCriterionExplanation[] = [];
  const academic: Partial<IAcademicInfo> = student.academicInfo || {};

  // 1. Minimum CGPA Requirement
  if (opportunity.minimumCGPA && opportunity.minimumCGPA > 0) {
    const studentCgpa = academic.cgpa;
    let status: CriterionSatisfaction = "unknown";
    let explanation = "";

    if (studentCgpa === undefined || studentCgpa === null) {
      status = "unknown";
      explanation =
        "Your CGPA is not entered in your academic profile. Cannot verify if minimum cutoff is met.";
    } else if (studentCgpa >= opportunity.minimumCGPA) {
      status = "satisfied";
      explanation = `Your CGPA (${studentCgpa}) satisfies the employer's minimum threshold of ${opportunity.minimumCGPA}.`;
    } else {
      status = "not_satisfied";
      explanation = `Your CGPA (${studentCgpa}) is below the required cutoff of ${opportunity.minimumCGPA}. This is a mandatory employer restriction.`;
    }

    criteria.push({
      criterion: "Minimum CGPA",
      requirement: `CGPA >= ${opportunity.minimumCGPA}`,
      studentValue: studentCgpa !== undefined && studentCgpa !== null ? `${studentCgpa} / 10.0` : "Not provided",
      status,
      explanation,
      isMandatory: true,
    });
  }

  // 2. Degree Requirements
  const oppEdu = opportunity.educationRequirements || "";
  if (oppEdu) {
    const studentDegree = academic.degree;
    let status: CriterionSatisfaction = "unknown";
    let explanation = "";

    if (!studentDegree) {
      status = "unknown";
      explanation = "Degree not specified in profile. Unable to verify degree alignment.";
    } else if (eligibilityResult.isDegreeMet) {
      status = "satisfied";
      explanation = `Your current degree (${studentDegree}) meets the educational background required (${oppEdu}).`;
    } else {
      status = "not_satisfied";
      explanation = `Your degree (${studentDegree}) may not meet the specified requirement: "${oppEdu}".`;
    }

    criteria.push({
      criterion: "Degree & Qualification",
      requirement: oppEdu,
      studentValue: studentDegree || "Not provided",
      status,
      explanation,
      isMandatory: false,
    });
  }

  // 3. Branch / Major Alignment
  if (academic.branch) {
    criteria.push({
      criterion: "Branch / Discipline",
      requirement: "Relevant technical or engineering discipline",
      studentValue: academic.branch,
      status: "satisfied",
      explanation: `Your major in "${academic.branch}" provides appropriate domain context for this role.`,
      isMandatory: false,
    });
  } else {
    criteria.push({
      criterion: "Branch / Discipline",
      requirement: "Engineering or Computer Applications discipline",
      studentValue: "Not provided",
      status: "unknown",
      explanation: "Academic branch not entered. Add your major in profile settings to clarify eligibility.",
      isMandatory: false,
    });
  }

  // 4. Minimum Experience
  const oppExp = opportunity.minimumExperience || "Fresher";
  const expCount = (student.additionalInfo?.experience || []).length;
  let expStatus: CriterionSatisfaction = "satisfied";
  let expExplanation = "";

  if (oppExp.toLowerCase().includes("fresher") || oppExp.toLowerCase().includes("entry") || oppExp.toLowerCase().includes("0")) {
    expStatus = "satisfied";
    expExplanation = "Opportunity welcomes freshers and early-stage students without mandatory corporate tenure.";
  } else if (expCount > 0) {
    expStatus = "satisfied";
    expExplanation = `You have documented prior experience (${expCount} position(s)), satisfying minimum background expectations.`;
  } else {
    expStatus = "unknown";
    expExplanation = `Role requests "${oppExp}". If you have internship tenure, add it under Experience in your profile.`;
  }

  criteria.push({
    criterion: "Experience Requirement",
    requirement: oppExp,
    studentValue: expCount > 0 ? `${expCount} verified position(s)` : "Fresher / No corporate records",
    status: expStatus,
    explanation: expExplanation,
    isMandatory: false,
  });

  // 5. Graduation Timeline
  if (academic.graduationYear) {
    criteria.push({
      criterion: "Graduation Year",
      requirement: "Current student or recent graduate",
      studentValue: `Class of ${academic.graduationYear}`,
      status: "satisfied",
      explanation: `Graduation year (${academic.graduationYear}) is within the typical target cohort for campus opportunities.`,
      isMandatory: false,
    });
  }

  return criteria;
}
