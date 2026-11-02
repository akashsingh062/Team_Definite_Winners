import { ISkillMatchResult } from "@/types/matching";
import { IOpportunity } from "@/types/opportunity";
import { IStudentProfile } from "@/types/student";
import { IResume } from "@/types/resume";
import {
  ISkillAnalysisItem,
  IProjectRelevanceItem,
  IExperienceRelevanceItem,
  ICertificationRelevanceItem,
} from "@/types/explanation";
import { normalizeSkill } from "@/services/matching/skill-normalizer";

/**
 * Builds evidence-based skills analysis categorized into:
 * 1. Matching Skills (with evidence source)
 * 2. Missing Required Skills
 * 3. Missing Preferred Skills
 * 4. Skills Requiring Verification (unknowns never assumed absent)
 */
export function buildSkillsAnalysis(
  student: Partial<IStudentProfile>,
  resume: Partial<IResume> | null,
  opportunity: Partial<IOpportunity>,
  skillResult: ISkillMatchResult
): {
  matchingSkills: ISkillAnalysisItem[];
  missingRequiredSkills: ISkillAnalysisItem[];
  missingPreferredSkills: ISkillAnalysisItem[];
  skillsRequiringVerification: ISkillAnalysisItem[];
} {
  const profileSkillsMap = new Map<string, string>();
  for (const s of student.skills || []) {
    if (s.name) profileSkillsMap.set(normalizeSkill(s.name).toLowerCase(), s.name);
  }

  const projectSkillsMap = new Map<string, string>();
  for (const p of student.projects || []) {
    for (const t of p.technologies || []) {
      if (t) projectSkillsMap.set(normalizeSkill(t).toLowerCase(), p.title);
    }
  }

  const resumeSkillsSet = new Set<string>();
  if (resume && resume.parsedData?.technicalSkills) {
    const tech = resume.parsedData.technicalSkills;
    const allResume = [
      ...(tech.programmingLanguages || []),
      ...(tech.frontend || []),
      ...(tech.backend || []),
      ...(tech.databases || []),
      ...(tech.frameworks || []),
      ...(tech.tools || []),
      ...(tech.cloud || []),
      ...(tech.other || []),
    ];
    for (const s of allResume) {
      if (typeof s === "string") {
        resumeSkillsSet.add(normalizeSkill(s).toLowerCase());
      }
    }
  }

  const matchingSkills: ISkillAnalysisItem[] = [];
  const missingRequiredSkills: ISkillAnalysisItem[] = [];
  const missingPreferredSkills: ISkillAnalysisItem[] = [];
  const skillsRequiringVerification: ISkillAnalysisItem[] = [];

  // Helper to determine evidence source
  function getEvidence(skillName: string): {
    source: "profile" | "resume" | "project" | "none";
    detail: string;
  } {
    const normalized = normalizeSkill(skillName).toLowerCase();
    if (projectSkillsMap.has(normalized)) {
      return {
        source: "project",
        detail: `Demonstrated in project "${projectSkillsMap.get(normalized)}"`,
      };
    }
    if (profileSkillsMap.has(normalized)) {
      return {
        source: "profile",
        detail: `Verified in student profile skills`,
      };
    }
    if (resumeSkillsSet.has(normalized)) {
      return {
        source: "resume",
        detail: `Extracted from approved resume`,
      };
    }
    return {
      source: "none",
      detail: "No direct evidence found",
    };
  }

  // 1. Process Matched Required Skills
  for (const skill of skillResult.matchedRequiredSkills) {
    const ev = getEvidence(skill);
    matchingSkills.push({
      name: skill,
      type: "required",
      category: "matching",
      evidenceSource: ev.source,
      evidenceDetail: ev.detail,
      importance: "critical",
      reason: `Mandatory qualification for ${opportunity.title || "this role"}, directly confirmed via your ${ev.source}.`,
    });
  }

  // 2. Process Matched Preferred Skills
  for (const skill of skillResult.matchedPreferredSkills) {
    const ev = getEvidence(skill);
    matchingSkills.push({
      name: skill,
      type: "preferred",
      category: "matching",
      evidenceSource: ev.source,
      evidenceDetail: ev.detail,
      importance: "high",
      reason: `Preferred bonus skill that increases candidate competitiveness for this role.`,
    });
  }

  // 3. Process Missing Required Skills & Verification Needed
  for (const skill of skillResult.missingRequiredSkills) {
    const norm = normalizeSkill(skill).toLowerCase();

    // Check if the student has a related partial mention or if this is a general/unverified domain
    const isProfileUnpopulated = (student.skills || []).length === 0;
    const hasFuzzyMatch = Array.from(profileSkillsMap.keys()).some(
      (k) => k.includes(norm) || norm.includes(k)
    );

    if (isProfileUnpopulated || hasFuzzyMatch) {
      skillsRequiringVerification.push({
        name: skill,
        type: "required",
        category: "verification_needed",
        evidenceSource: "none",
        evidenceDetail: isProfileUnpopulated
          ? "Profile technical skills section is incomplete"
          : "Related skill detected but exact proficiency requires verification",
        importance: "high",
        reason: `Cannot conclusively determine whether you possess "${skill}". Verification recommended before applying.`,
      });
    } else {
      missingRequiredSkills.push({
        name: skill,
        type: "required",
        category: "missing_required",
        evidenceSource: "none",
        evidenceDetail: "Not found in profile, resume, or projects",
        importance: "critical",
        reason: `Core prerequisite explicitly mandated by the hiring team. Acquiring this competency will significantly increase your match.`,
        skillGapUrl: `/dashboard/skill-gap/${encodeURIComponent(skill)}`,
      });
    }
  }

  // 4. Process Missing Preferred Skills
  for (const skill of skillResult.missingPreferredSkills) {
    const norm = normalizeSkill(skill).toLowerCase();
    const hasFuzzyMatch = Array.from(profileSkillsMap.keys()).some(
      (k) => k.includes(norm) || norm.includes(k)
    );

    if (hasFuzzyMatch) {
      skillsRequiringVerification.push({
        name: skill,
        type: "preferred",
        category: "verification_needed",
        evidenceSource: "none",
        evidenceDetail: "Partial keyword match found in profile",
        importance: "medium",
        reason: `May have familiarity with "${skill}". Confirm proficiency in profile to earn preferred bonus credit.`,
      });
    } else {
      missingPreferredSkills.push({
        name: skill,
        type: "preferred",
        category: "missing_preferred",
        evidenceSource: "none",
        evidenceDetail: "Optional bonus skill",
        importance: "medium",
        reason: `Preferred skill that provides an edge over other applicants. Not strictly mandatory.`,
        skillGapUrl: `/dashboard/skill-gap/${encodeURIComponent(skill)}`,
      });
    }
  }

  return {
    matchingSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    skillsRequiringVerification,
  };
}

/**
 * Builds project and experience alignment evidence from actual database records.
 */
export function buildProjectAndExperienceEvidence(
  student: Partial<IStudentProfile>,
  resume: Partial<IResume> | null,
  opportunity: Partial<IOpportunity>,
  skillResult: ISkillMatchResult
): {
  projectRelevance: IProjectRelevanceItem[];
  experienceRelevance: IExperienceRelevanceItem[];
  certificationsRelevance: ICertificationRelevanceItem[];
} {
  const oppSkillsSet = new Set([
    ...skillResult.matchedRequiredSkills.map((s) => normalizeSkill(s).toLowerCase()),
    ...skillResult.matchedPreferredSkills.map((s) => normalizeSkill(s).toLowerCase()),
    ...(opportunity.requiredSkills || []).map((s) => normalizeSkill(s).toLowerCase()),
    ...(opportunity.preferredSkills || []).map((s) => normalizeSkill(s).toLowerCase()),
  ]);

  // 1. Projects
  const projectRelevance: IProjectRelevanceItem[] = [];
  const studentProjects = student.projects || [];

  for (const proj of studentProjects) {
    const matchingTech = (proj.technologies || []).filter((t) =>
      oppSkillsSet.has(normalizeSkill(t).toLowerCase())
    );

    if (matchingTech.length > 0) {
      projectRelevance.push({
        title: proj.title,
        technologies: proj.technologies || [],
        matchingSkills: matchingTech,
        explanation: `Demonstrates direct practical application of ${matchingTech.join(", ")} in project "${proj.title}".`,
        githubUrl: proj.githubUrl,
        liveDeploymentUrl: proj.liveDeploymentUrl,
      });
    }
  }

  // 2. Experience
  const experienceRelevance: IExperienceRelevanceItem[] = [];
  const studentExp = student.additionalInfo?.experience || [];

  for (const exp of studentExp) {
    experienceRelevance.push({
      role: exp.role,
      company: exp.company,
      duration: exp.duration,
      explanation: `Prior tenure as "${exp.role}" at ${exp.company} demonstrates professional workplace readiness.`,
    });
  }

  // Also check resume experience if available and not duplicated
  if (resume && resume.parsedData?.experience) {
    for (const exp of resume.parsedData.experience) {
      const alreadyIncluded = experienceRelevance.some(
        (e) => e.company.toLowerCase() === exp.company.toLowerCase()
      );
      if (!alreadyIncluded && exp.company) {
        experienceRelevance.push({
          role: exp.jobTitle || "Intern/Developer",
          company: exp.company,
          duration: `${exp.startDate || ""} - ${exp.endDate || ""}`.trim(),
          technologies: exp.technologies,
          explanation: `Resume verified role at ${exp.company} showcasing industry practice.`,
        });
      }
    }
  }

  // 3. Certifications
  const certificationsRelevance: ICertificationRelevanceItem[] = [];
  const certs = student.additionalInfo?.certifications || [];

  for (const cert of certs) {
    const certTokens = cert.name.toLowerCase().split(/\s+/);
    const matchingSkills = Array.from(oppSkillsSet).filter((s) =>
      certTokens.some((tok) => tok.length > 2 && s.includes(tok))
    );

    certificationsRelevance.push({
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate,
      matchingSkills,
      explanation:
        matchingSkills.length > 0
          ? `Verified credential supporting competencies in ${matchingSkills.join(", ")}.`
          : `Recognized achievement validating continuous professional development.`,
    });
  }

  return {
    projectRelevance,
    experienceRelevance,
    certificationsRelevance,
  };
}

