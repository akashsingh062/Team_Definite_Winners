import {
  IPassportSkill,
  SkillEvidenceType,
  SkillVerificationStatus,
  IPassportProject,
  IPassportCertification,
} from "@/types/skills-passport";
import { areSkillsEquivalent, normalizeSkillName } from "@/services/matching/skill-normalizer";

export interface IEvidenceClassificationContext {
  studentProfileSkills: Array<{
    name: string;
    category?: string;
    proficiency?: string;
  }>;
  approvedResumeSkills: string[];
  projects: IPassportProject[];
  certifications: IPassportCertification[];
  completedAssessments: Array<{
    skillName: string;
    assessmentTitle: string;
    score?: number;
    completedAt: Date | string;
  }>;
}

/**
 * Classifies a single skill by evaluating available evidence in hierarchy:
 * 1. Externally Verified (Highest: Backed by verified certification)
 * 2. Assessment Verified (Backed by completed roadmap milestone/assessment)
 * 3. Project Demonstrated (Backed by student project utilizing this skill)
 * 4. Resume Extracted (Extracted from approved resume)
 * 5. Self-Reported (Baseline: Added directly by student)
 */
export function classifySkillEvidence(
  skillName: string,
  context: IEvidenceClassificationContext,
  existingCategory = "Technical",
  existingProficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert" = "Intermediate"
): IPassportSkill {
  const normName = normalizeSkillName(skillName);

  // 1. Check if backed by an externally verified certification
  const matchingCert = context.certifications.find(
    (c) =>
      c.verificationStatus === "verified" &&
      (areSkillsEquivalent(c.name, normName) ||
        c.name.toLowerCase().includes(normName.toLowerCase()))
  );

  if (matchingCert) {
    return {
      id: `skill_${normName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: normName,
      category: existingCategory,
      proficiency: existingProficiency,
      evidenceType: "externally_verified",
      evidenceReference: `Certification: ${matchingCert.name} (${matchingCert.issuingOrganization})`,
      verificationStatus: "verified",
      verificationDate: matchingCert.issueDate ? new Date(matchingCert.issueDate) : new Date(),
      issuingSource: matchingCert.issuingOrganization,
    };
  }

  // 2. Check if backed by a completed assessment
  const matchingAssessment = context.completedAssessments.find((a) =>
    areSkillsEquivalent(a.skillName, normName)
  );

  if (matchingAssessment) {
    return {
      id: `skill_${normName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: normName,
      category: existingCategory,
      proficiency: existingProficiency,
      evidenceType: "assessment_verified",
      evidenceReference: `Platform Assessment: ${matchingAssessment.assessmentTitle}`,
      verificationStatus: "verified",
      verificationDate: new Date(matchingAssessment.completedAt),
      issuingSource: "NexSkill AI Assessment Engine",
    };
  }

  // 3. Check if demonstrated in a project
  const matchingProject = context.projects.find((p) =>
    p.technologies.some((t) => areSkillsEquivalent(t, normName))
  );

  if (matchingProject) {
    return {
      id: `skill_${normName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: normName,
      category: existingCategory,
      proficiency: existingProficiency,
      evidenceType: "project_demonstrated",
      evidenceReference: `Project: ${matchingProject.title}`,
      verificationStatus: "unverified", // Student-demonstrated without automated test verification
      verificationDate: matchingProject.completionDate
        ? new Date(matchingProject.completionDate)
        : undefined,
      issuingSource: `Project Portfolio (${matchingProject.title})`,
    };
  }

  // 4. Check if extracted from approved resume
  const matchingResumeSkill = context.approvedResumeSkills.find((s) =>
    areSkillsEquivalent(s, normName)
  );

  if (matchingResumeSkill) {
    return {
      id: `skill_${normName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      name: normName,
      category: existingCategory,
      proficiency: existingProficiency,
      evidenceType: "resume_extracted",
      evidenceReference: "Extracted from approved student resume",
      verificationStatus: "unverified",
      verificationDate: new Date(),
      issuingSource: "Approved Resume Parser",
    };
  }

  // 5. Default to self-reported
  return {
    id: `skill_${normName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
    name: normName,
    category: existingCategory,
    proficiency: existingProficiency,
    evidenceType: "self_reported",
    evidenceReference: "Self-reported by student in profile",
    verificationStatus: "unverified",
    verificationDate: new Date(),
    issuingSource: "Student Profile",
  };
}

/**
 * Normalizes proficiency string into allowed enum
 */
export function normalizeProficiency(
  val?: string
): "Beginner" | "Intermediate" | "Advanced" | "Expert" {
  if (!val) return "Intermediate";
  const lower = val.toLowerCase();
  if (lower.includes("expert") || lower.includes("master")) return "Expert";
  if (lower.includes("advanced") || lower.includes("senior")) return "Advanced";
  if (lower.includes("beginner") || lower.includes("novice") || lower.includes("basic"))
    return "Beginner";
  return "Intermediate";
}
