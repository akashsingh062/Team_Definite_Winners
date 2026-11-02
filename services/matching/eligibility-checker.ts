import { IEligibilityResult, EligibilityStatus } from "@/types/matching";
import { IStudentProfile } from "@/types/student";
import { IOpportunity } from "@/types/opportunity";

/**
 * Normalizes academic degree strings for comparison.
 */
function normalizeDegree(degree: string): string {
  if (!degree) return "";
  return degree
    .toLowerCase()
    .replace(/[.\s]/g, "")
    .trim();
}

/**
 * Checks if student's degree is compatible with opportunity requirements.
 */
function checkDegreeCompatibility(
  studentDegree: string,
  requiredEducation: string
): { isMet: boolean; isUnknown: boolean } {
  if (!requiredEducation || requiredEducation.trim().length === 0) {
    return { isMet: true, isUnknown: false };
  }
  if (!studentDegree || studentDegree.trim().length === 0) {
    return { isMet: true, isUnknown: true }; // Unknown, not disqualified
  }

  const reqLower = requiredEducation.toLowerCase();
  const stdNorm = normalizeDegree(studentDegree);

  // Common flexible phrases
  if (
    reqLower.includes("any") ||
    reqLower.includes("open to all") ||
    reqLower.includes("all degrees") ||
    reqLower.includes("enrolled student")
  ) {
    return { isMet: true, isUnknown: false };
  }

  // Common degree abbreviations
  const degreeTokens = ["btech", "be", "bca", "mca", "mtech", "bs", "ms", "bsc", "msc"];
  const matchingTokens = degreeTokens.filter((token) => reqLower.includes(token));

  if (matchingTokens.length === 0) {
    // Opportunity does not strictly name an exact acronym
    return { isMet: true, isUnknown: false };
  }

  const isMatched = matchingTokens.some((tok) => stdNorm.includes(tok));
  return { isMet: isMatched, isUnknown: false };
}

/**
 * Evaluates whether a student meets the eligibility criteria of an opportunity.
 * Distinguishes between failed mandatory requirements, provisional matches, and missing data.
 */
export function evaluateEligibility(
  student: Partial<IStudentProfile>,
  opportunity: Partial<IOpportunity>
): IEligibilityResult {
  const issues: string[] = [];
  const reasons: string[] = [];

  let hasDefiniteFailure = false;
  let hasMissingInfo = false;

  // 1. Minimum CGPA Evaluation
  let isCgpaMet = true;
  if (
    opportunity.minimumCGPA !== undefined &&
    opportunity.minimumCGPA !== null &&
    opportunity.minimumCGPA > 0
  ) {
    const studentCgpa = student.academicInfo?.cgpa;
    if (studentCgpa !== undefined && studentCgpa !== null) {
      if (studentCgpa < opportunity.minimumCGPA) {
        isCgpaMet = false;
        hasDefiniteFailure = true;
        issues.push(
          `Minimum CGPA not met: Opportunity requires ${opportunity.minimumCGPA}, your profile has ${studentCgpa}`
        );
      } else {
        reasons.push(`CGPA (${studentCgpa}) satisfies requirement of ${opportunity.minimumCGPA}`);
      }
    } else {
      hasMissingInfo = true;
      issues.push(
        `CGPA requirement (${opportunity.minimumCGPA}) requires verification: No CGPA provided on your profile`
      );
    }
  }

  // 2. Education Requirements
  let isEducationMet = true;
  let isDegreeMet = true;
  if (opportunity.educationRequirements) {
    const degreeCheck = checkDegreeCompatibility(
      student.academicInfo?.degree || "",
      opportunity.educationRequirements
    );

    if (degreeCheck.isUnknown) {
      hasMissingInfo = true;
      issues.push("Degree requirement requires verification: Degree not specified on profile");
    } else if (!degreeCheck.isMet) {
      isDegreeMet = false;
      hasDefiniteFailure = true;
      issues.push(
        `Degree mismatch: Opportunity specifies "${opportunity.educationRequirements}", your profile lists "${student.academicInfo?.degree}"`
      );
    } else {
      reasons.push("Degree is compatible with education requirements");
    }
  }

  // 3. Branch / Department Evaluation
  let isBranchMet = true;
  if (opportunity.eligibilityCriteria) {
    const critLower = opportunity.eligibilityCriteria.toLowerCase();
    const studentBranch = (student.academicInfo?.branch || "").toLowerCase();

    // Check if eligible branches are strictly specified
    const techBranches = ["computer science", "cs", "it", "information technology", "software"];
    const requiresTech = techBranches.some((b) => critLower.includes(b));

    if (requiresTech) {
      if (!studentBranch) {
        hasMissingInfo = true;
        issues.push("Branch requirement requires verification: Academic branch not specified");
      } else {
        const studentIsTech = techBranches.some((b) => studentBranch.includes(b));
        if (!studentIsTech && !critLower.includes("all branches")) {
          // Note: flag as potential issue rather than strict disqualification to avoid unfair gatekeeping
          issues.push(
            `Branch alignment: Role preferred tech branches, your profile lists "${student.academicInfo?.branch}"`
          );
        }
      }
    }
  }

  // 4. Experience Requirements
  let isExperienceMet = true;
  const minExp = (opportunity.minimumExperience || "").toLowerCase();
  const isFresherRole =
    minExp.includes("fresher") ||
    minExp.includes("0-1") ||
    minExp.includes("0 year") ||
    minExp.includes("intern") ||
    minExp.length === 0;

  if (isFresherRole) {
    reasons.push("Role welcomes college freshers and early talent");
  } else {
    // If requires 2+ or 3+ years and student has no experience records
    const expCount =
      student.additionalInfo?.experience?.length ||
      (student as unknown as { experience?: unknown[] }).experience?.length ||
      0;
    if (expCount === 0 && (minExp.includes("2+") || minExp.includes("3+") || minExp.includes("years"))) {
      isExperienceMet = false;
      hasDefiniteFailure = true;
      issues.push(`Experience level: Listing asks for "${opportunity.minimumExperience}"`);
    }
  }

  // 5. Graduation Year
  let isGraduationYearMet = true;
  const currentYear = new Date().getFullYear();
  const studentGradYear = student.academicInfo?.graduationYear;

  if (opportunity.category === "internship") {
    // Internships are intended for current students and recent graduates
    if (studentGradYear && studentGradYear < currentYear - 1) {
      issues.push("Internships are typically intended for currently enrolled students or recent graduates");
    }
  }

  // Classify Overall Eligibility Status
  let status: EligibilityStatus;
  if (hasDefiniteFailure) {
    status = "not_eligible";
  } else if (hasMissingInfo) {
    status = "potentially_eligible";
  } else {
    status = "eligible";
  }

  return {
    status,
    reasons,
    issues,
    isEducationMet,
    isDegreeMet,
    isBranchMet,
    isGraduationYearMet,
    isCgpaMet,
    isExperienceMet,
  };
}

export const checkEligibility = evaluateEligibility;

