import {
  normalizeSkill,
  areSkillsEquivalent,
} from "../matching/skill-normalizer";
import { IStudentProfile } from "@/types/student";
import { IResume } from "@/types/resume";
import { IOpportunity } from "@/types/opportunity";
import {
  ISkillCoverage,
  IExistingSkillItem,
} from "@/types/skill-gap";

/**
 * Extracts and deduplicates all approved technical skills from student profile and approved resume.
 */
export function extractApprovedStudentSkills(
  profile: Partial<IStudentProfile> | null,
  resume: Partial<IResume> | null = null
): IExistingSkillItem[] {
  const skillMap = new Map<string, IExistingSkillItem>();

  if (!profile) return [];

  // 1. Skills from StudentProfile.skills
  if (profile.skills && Array.isArray(profile.skills)) {
    for (const skill of profile.skills) {
      if (skill && skill.name) {
        const canonical = normalizeSkill(skill.name);
        if (canonical && !skillMap.has(canonical.toLowerCase())) {
          skillMap.set(canonical.toLowerCase(), {
            name: canonical,
            category: skill.category || "Other technical skills",
            proficiency: skill.proficiency || "Intermediate",
            source: "profile",
          });
        }
      }
    }
  }

  // 2. Skills demonstrated in StudentProfile.projects
  if (profile.projects && Array.isArray(profile.projects)) {
    for (const proj of profile.projects) {
      if (proj && Array.isArray(proj.technologies)) {
        for (const tech of proj.technologies) {
          if (tech) {
            const canonical = normalizeSkill(tech);
            if (canonical && !skillMap.has(canonical.toLowerCase())) {
              skillMap.set(canonical.toLowerCase(), {
                name: canonical,
                category: "Project technologies",
                proficiency: "Intermediate",
                source: "project",
              });
            }
          }
        }
      }
    }
  }

  // 3. Skills from Approved Resume only
  if (
    resume &&
    (resume.analysisStatus === "completed" ||
      resume.analysisStatus === "approved" ||
      Boolean(resume.approvedAt)) &&
    (resume.parsedData?.technicalSkills || (resume.parsedData as any)?.skills)
  ) {
    const tSkills =
      resume.parsedData?.technicalSkills || (resume.parsedData as any)?.skills;
    const allResumeTech: (string | { name?: string; category?: string; proficiencyLevel?: string })[] = [
      ...(tSkills.programmingLanguages || []),
      ...(tSkills.frontend || []),
      ...(tSkills.backend || []),
      ...(tSkills.databases || []),
      ...(tSkills.frameworks || []),
      ...(tSkills.tools || []),
      ...(tSkills.cloud || []),
      ...(tSkills.other || []),
    ];

    for (const item of allResumeTech) {
      const rawName = typeof item === "string" ? item : item?.name;
      if (rawName) {
        const canonical = normalizeSkill(rawName);
        if (canonical && !skillMap.has(canonical.toLowerCase())) {
          skillMap.set(canonical.toLowerCase(), {
            name: canonical,
            category: typeof item === "object" && item?.category ? item.category : "Approved resume",
            proficiency: typeof item === "object" && item?.proficiencyLevel ? item.proficiencyLevel : "Intermediate",
            source: "resume",
          });
        }
      }
    }
  }

  return Array.from(skillMap.values());
}

/**
 * Checks if a candidate possesses a given required/preferred skill.
 */
export function hasSkill(
  existingSkills: IExistingSkillItem[],
  targetSkill: string
): boolean {
  if (!targetSkill || targetSkill.trim().length === 0) return false;
  return existingSkills.some((s) => areSkillsEquivalent(s.name, targetSkill));
}

/**
 * Computes deterministic skill coverage percentages.
 */
export function calculateSkillCoverage(
  existingSkills: IExistingSkillItem[],
  requiredSkills: string[],
  preferredSkills: string[]
): ISkillCoverage {
  const normRequired = Array.from(
    new Set(requiredSkills.map((s) => normalizeSkill(s)).filter(Boolean))
  );
  const normPreferred = Array.from(
    new Set(preferredSkills.map((s) => normalizeSkill(s)).filter(Boolean))
  );

  let matchedRequiredCount = 0;
  for (const req of normRequired) {
    if (hasSkill(existingSkills, req)) {
      matchedRequiredCount++;
    }
  }

  let matchedPreferredCount = 0;
  for (const pref of normPreferred) {
    if (hasSkill(existingSkills, pref)) {
      matchedPreferredCount++;
    }
  }

  const requiredCoverage =
    normRequired.length > 0
      ? Math.round((matchedRequiredCount / normRequired.length) * 100)
      : 100;

  const preferredCoverage =
    normPreferred.length > 0
      ? Math.round((matchedPreferredCount / normPreferred.length) * 100)
      : 100;

  // Combined Coverage: 70% weight on required, 30% weight on preferred
  let combinedCoverage = 100;
  if (normRequired.length > 0 && normPreferred.length > 0) {
    combinedCoverage = Math.round(
      requiredCoverage * 0.7 + preferredCoverage * 0.3
    );
  } else if (normRequired.length > 0) {
    combinedCoverage = requiredCoverage;
  } else if (normPreferred.length > 0) {
    combinedCoverage = preferredCoverage;
  }

  return {
    requiredCoverage,
    preferredCoverage,
    combinedCoverage,
    matchedRequiredCount,
    totalRequiredCount: normRequired.length,
    matchedPreferredCount,
    totalPreferredCount: normPreferred.length,
  };
}

