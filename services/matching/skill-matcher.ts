import { normalizeSkill, normalizeSkillList } from "./skill-normalizer";
import { ISkillMatchResult } from "@/types/matching";

/**
 * Evaluates skill overlap between a student and an opportunity.
 */
export function matchSkills(
  studentSkills: string[],
  opportunityRequiredSkills: string[],
  opportunityPreferredSkills: string[] = []
): ISkillMatchResult {
  const normalizedStudent = normalizeSkillList(studentSkills || []);
  const normalizedRequired = normalizeSkillList(opportunityRequiredSkills || []);
  const normalizedPreferred = normalizeSkillList(opportunityPreferredSkills || []);

  const studentSkillSet = new Set(
    normalizedStudent.map((s) => s.toLowerCase())
  );

  // 1. Required Skills Evaluation
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];

  for (const reqSkill of normalizedRequired) {
    if (studentSkillSet.has(reqSkill.toLowerCase())) {
      matchedRequired.push(reqSkill);
    } else {
      missingRequired.push(reqSkill);
    }
  }

  const totalRequired = normalizedRequired.length;
  const requiredCoverage =
    totalRequired === 0
      ? 100
      : Math.round((matchedRequired.length / totalRequired) * 100);

  // 2. Preferred Skills Evaluation
  const matchedPreferred: string[] = [];
  const missingPreferred: string[] = [];

  for (const prefSkill of normalizedPreferred) {
    if (studentSkillSet.has(prefSkill.toLowerCase())) {
      matchedPreferred.push(prefSkill);
    } else {
      missingPreferred.push(prefSkill);
    }
  }

  const totalPreferred = normalizedPreferred.length;
  const preferredCoverage =
    totalPreferred === 0
      ? 100
      : Math.round((matchedPreferred.length / totalPreferred) * 100);

  return {
    matchedRequiredSkills: matchedRequired,
    missingRequiredSkills: missingRequired,
    matchedPreferredSkills: matchedPreferred,
    missingPreferredSkills: missingPreferred,
    requiredCoverage,
    preferredCoverage,
    totalRequired,
    totalPreferred,
  };
}

