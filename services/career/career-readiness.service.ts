import connectDB from "@/lib/db/mongodb";
import { StudentProfile, Resume } from "@/models";
import { normalizeSkill, areSkillsEquivalent } from "@/services/matching/skill-normalizer";
import {
  ICareerPath,
  ICareerAlignmentResult,
  ISkillAlignmentDetail,
} from "@/types/career-path";

export interface IAggregatedStudentSkills {
  allSkillNames: Set<string>;
  verifiedSkillNames: Set<string>;
  selfReportedSkillNames: Set<string>;
  projects: Array<{ title: string; description: string; technologies: string[] }>;
  education?: { degree?: string; fieldOfStudy?: string; gpa?: number };
}

/**
 * Aggregates student skills and projects from both StudentProfile and approved Resume.
 * Distinguishes verified skills (from resume/projects) vs self-reported skills.
 */
export async function getAggregatedStudentProfile(
  userId: string
): Promise<IAggregatedStudentSkills> {
  await connectDB();

  const [profile, resume] = await Promise.all([
    StudentProfile.findOne({ userId }).lean(),
    Resume.findOne({ userId, processingStatus: "approved" })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const allSkillNames = new Set<string>();
  const verifiedSkillNames = new Set<string>();
  const selfReportedSkillNames = new Set<string>();
  const projects: Array<{ title: string; description: string; technologies: string[] }> = [];

  // 1. Process StudentProfile skills
  if (profile) {
    const profileSkills = (profile as any).skills || (profile as any).technicalSkills || [];
    if (Array.isArray(profileSkills)) {
      profileSkills.forEach((s: any) => {
        const rawName = typeof s === "string" ? s : s.name;
        if (rawName) {
          const norm = normalizeSkill(rawName);
          allSkillNames.add(norm);
          if (s.isVerified) {
            verifiedSkillNames.add(norm);
          } else {
            selfReportedSkillNames.add(norm);
          }
        }
      });
    }

    if (Array.isArray(profile.projects)) {
      profile.projects.forEach((p: any) => {
        const techs = Array.isArray(p.technologies)
          ? p.technologies.map((t: string) => normalizeSkill(t))
          : [];
        techs.forEach((t: string) => {
          allSkillNames.add(t);
          verifiedSkillNames.add(t);
        });
        projects.push({
          title: p.title || "Project",
          description: p.description || "",
          technologies: techs,
        });
      });
    }
  }

  // 2. Process Approved Resume skills (these carry verified status)
  if (resume?.parsedData) {
    const techSkills = resume.parsedData.technicalSkills;
    if (techSkills) {
      Object.values(techSkills).forEach((categoryList: any) => {
        if (Array.isArray(categoryList)) {
          categoryList.forEach((rawSkill: string) => {
            if (rawSkill && typeof rawSkill === "string") {
              const norm = normalizeSkill(rawSkill);
              allSkillNames.add(norm);
              verifiedSkillNames.add(norm);
            }
          });
        }
      });
    }

    if (Array.isArray(resume.parsedData.projects)) {
      resume.parsedData.projects.forEach((p: any) => {
        const techs = Array.isArray(p.technologies)
          ? p.technologies.map((t: string) => normalizeSkill(t))
          : [];
        techs.forEach((t: string) => {
          allSkillNames.add(t);
          verifiedSkillNames.add(t);
        });
        // Avoid duplicate project titles
        if (!projects.some((existing) => existing.title.toLowerCase() === p.title?.toLowerCase())) {
          projects.push({
            title: p.title || "Resume Project",
            description: p.description || "",
            technologies: techs,
          });
        }
      });
    }
  }

  // 3. Education resolution
  let education: { degree?: string; fieldOfStudy?: string; gpa?: number } | undefined = undefined;
  const rawAcademic = (profile as any)?.academicInfo || (profile as any)?.education;
  if (rawAcademic) {
    education = {
      degree: rawAcademic.degree,
      fieldOfStudy: rawAcademic.fieldOfStudy || rawAcademic.branch,
      gpa: rawAcademic.cgpa,
    };
  } else if (resume?.parsedData?.education && resume.parsedData.education.length > 0) {
    const topEdu = resume.parsedData.education[0];
    education = {
      degree: topEdu.degree,
      fieldOfStudy: topEdu.branch,
      gpa: typeof topEdu.cgpa === "number" ? topEdu.cgpa : undefined,
    };
  }

  return {
    allSkillNames,
    verifiedSkillNames,
    selfReportedSkillNames,
    projects,
    education,
  };
}

/**
 * Calculates a transparent, deterministic career readiness score for a student against a target career path.
 *
 * Scoring Methodology (v1.0-career-path):
 * 1. Required Technical Skills Match (45% weight)
 * 2. Preferred Technical Skills Match (15% weight)
 * 3. Project Evidence Relevance (20% weight)
 * 4. Education & Experience Alignment (20% weight)
 * Total: 100%
 */
export function calculateCareerReadiness(
  careerPath: ICareerPath,
  studentData: IAggregatedStudentSkills,
  additionalHypotheticalSkills: string[] = []
): ICareerAlignmentResult {
  const normRequired = careerPath.requiredSkills.map((s) => normalizeSkill(s));
  const normPreferred = (careerPath.preferredSkills || []).map((s) => normalizeSkill(s));

  // Merge student skills with hypothetical skills if any
  const combinedStudentSkills = new Set<string>(studentData.allSkillNames);
  additionalHypotheticalSkills.forEach((hs) => {
    combinedStudentSkills.add(normalizeSkill(hs));
  });

  // 1. Evaluate Required Skills
  const matchedRequired: string[] = [];
  const missingRequired: string[] = [];

  normRequired.forEach((reqSkill) => {
    const hasSkill = Array.from(combinedStudentSkills).some((studentSkill) =>
      areSkillsEquivalent(reqSkill, studentSkill)
    );
    if (hasSkill) {
      matchedRequired.push(reqSkill);
    } else {
      missingRequired.push(reqSkill);
    }
  });

  const reqScore = normRequired.length > 0
    ? (matchedRequired.length / normRequired.length) * 100
    : 100;
  const weightedReqScore = Number((reqScore * 0.45).toFixed(1));

  // 2. Evaluate Preferred Skills
  const matchedPreferred: string[] = [];
  const missingPreferred: string[] = [];

  normPreferred.forEach((prefSkill) => {
    const hasSkill = Array.from(combinedStudentSkills).some((studentSkill) =>
      areSkillsEquivalent(prefSkill, studentSkill)
    );
    if (hasSkill) {
      matchedPreferred.push(prefSkill);
    } else {
      missingPreferred.push(prefSkill);
    }
  });

  const prefScore = normPreferred.length > 0
    ? (matchedPreferred.length / normPreferred.length) * 100
    : 100;
  const weightedPrefScore = Number((prefScore * 0.15).toFixed(1));

  // 3. Project Evidence Relevance
  // Check student projects demonstrating skills relevant to this career path
  const relevantProjects: Array<{
    title: string;
    technologies: string[];
    matchingSkills: string[];
  }> = [];

  const allCareerSkills = [...normRequired, ...normPreferred];

  studentData.projects.forEach((proj) => {
    const matching = proj.technologies.filter((tech) =>
      allCareerSkills.some((cs) => areSkillsEquivalent(tech, cs))
    );
    if (matching.length > 0) {
      relevantProjects.push({
        title: proj.title,
        technologies: proj.technologies,
        matchingSkills: matching,
      });
    }
  });

  // Project scoring: 1 project with matching skills = 70%, 2+ projects = 100%
  let projectScore = 0;
  if (relevantProjects.length >= 2) {
    projectScore = 100;
  } else if (relevantProjects.length === 1) {
    projectScore = 70;
  } else {
    projectScore = 30; // base score, not penalized drastically
  }
  const weightedProjectScore = Number((projectScore * 0.20).toFixed(1));

  // 4. Education & Experience Alignment
  let eduScore = 75; // neutral baseline if unstated
  let isEduAligned = true;
  let eduNotes = "No specific education restrictions enforced.";

  if (careerPath.educationRequirements?.preferredDegrees?.length) {
    const studentDegree = studentData.education?.degree?.toLowerCase() || "";
    const studentField = studentData.education?.fieldOfStudy?.toLowerCase() || "";

    const degreeMatches = careerPath.educationRequirements.preferredDegrees.some((d) =>
      studentDegree.includes(d.toLowerCase())
    );
    const fieldMatches = careerPath.educationRequirements.fieldsOfStudy?.some((f) =>
      studentField.includes(f.toLowerCase())
    );

    if (degreeMatches || fieldMatches) {
      eduScore = 100;
      eduNotes = `Academic background in ${studentData.education?.degree || "Engineering/Science"} aligns with this pathway.`;
    } else if (studentDegree || studentField) {
      eduScore = 80;
      eduNotes = `Background in ${studentData.education?.degree || studentData.education?.fieldOfStudy} provides transferable analytical foundation.`;
    } else {
      eduScore = 70; // unstated education does not fail the student
      isEduAligned = false;
      eduNotes = "Education details not specified in profile; evaluated based on technical skills.";
    }
  }
  const weightedEduScore = Number((eduScore * 0.20).toFixed(1));

  // Cumulative alignment score (0 - 100)
  const totalRaw = weightedReqScore + weightedPrefScore + weightedProjectScore + weightedEduScore;
  const overallScore = Math.min(100, Math.max(0, Math.round(totalRaw)));

  const missingInformationNotes: string[] = [];
  if (!studentData.education?.degree) {
    missingInformationNotes.push("Degree information not specified in profile.");
  }
  if (studentData.projects.length === 0) {
    missingInformationNotes.push("No project portfolio records found; adding projects will increase readiness.");
  }

  return {
    careerPathId: careerPath.id || careerPath._id?.toString() || "",
    careerTitle: careerPath.title,
    category: careerPath.category,
    overallScore,
    methodologyVersion: "v1.0-career-path",
    scoringVersion: "4-Pillar Transparent Baseline",
    pillars: {
      requiredSkills: {
        score: Math.round(reqScore),
        weight: 45,
        weightedScore: weightedReqScore,
        label: "Required Technical Skills",
        details: `${matchedRequired.length} of ${normRequired.length} required skills satisfied.`,
      },
      preferredSkills: {
        score: Math.round(prefScore),
        weight: 15,
        weightedScore: weightedPrefScore,
        label: "Preferred Auxiliary Skills",
        details: `${matchedPreferred.length} of ${normPreferred.length} preferred skills satisfied.`,
      },
      projects: {
        score: Math.round(projectScore),
        weight: 20,
        weightedScore: weightedProjectScore,
        label: "Demonstrated Project Evidence",
        details: `${relevantProjects.length} relevant project(s) demonstrate required competencies.`,
      },
      educationExperience: {
        score: Math.round(eduScore),
        weight: 20,
        weightedScore: weightedEduScore,
        label: "Education & Foundation",
        details: eduNotes,
      },
    },
    skills: {
      matchedRequired,
      missingRequired,
      matchedPreferred,
      missingPreferred,
      totalRequiredCount: normRequired.length,
      totalPreferredCount: normPreferred.length,
      requiredCoveragePercentage: normRequired.length > 0
        ? Math.round((matchedRequired.length / normRequired.length) * 100)
        : 100,
    },
    relevantProjects,
    educationAlignment: {
      isAligned: isEduAligned,
      studentDegree: studentData.education?.degree,
      studentField: studentData.education?.fieldOfStudy,
      notes: eduNotes,
    },
    missingInformationNotes,
    calculatedAt: new Date().toISOString(),
  };
}
