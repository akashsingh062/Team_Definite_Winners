import crypto from "crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongodb";
import { SkillsPassport, SkillsPassportDocument } from "@/models/SkillsPassport";
import { PassportEvidence } from "@/models/PassportEvidence";
import { StudentProfile } from "@/models/StudentProfile";
import { Resume } from "@/models/Resume";
import { Roadmap } from "@/models/Roadmap";
import { StudentSkillProgress } from "@/models/StudentSkillProgress";
import { User } from "@/models/User";
import {
  ISkillsPassport,
  IPassportSkill,
  IPassportProject,
  IPassportCertification,
  IPassportEducation,
  IPassportAssessment,
} from "@/types/skills-passport";
import {
  classifySkillEvidence,
  IEvidenceClassificationContext,
  normalizeProficiency,
} from "./evidence-classifier.service";
import { verifyCertification } from "./credential-verifier.service";
import { normalizeSkillName } from "@/services/matching/skill-normalizer";

/**
 * Generates a cryptographically secure random public ID with prefix.
 * Never exposes MongoDB ObjectIds or user IDs.
 */
export function generateCryptographicPublicId(): string {
  const randomBytes = crypto.randomBytes(12).toString("hex");
  return `csp_${randomBytes}`;
}

/**
 * Computes a deterministic SHA-256 fingerprint for public verification.
 */
export function computePassportIntegrityHash(passport: any): string {
  const payload = {
    publicId: passport.publicId,
    displayName: passport.displayName || "",
    headline: passport.headline || "",
    skills: (passport.skills || [])
      .map((s: any) => `${s.name}:${s.evidenceType}:${s.verificationStatus}`)
      .sort(),
    projects: (passport.projects || [])
      .map((p: any) => `${p.title}:${p.githubUrl || ""}`)
      .sort(),
    certifications: (passport.certifications || [])
      .map((c: any) => `${c.name}:${c.verificationStatus}:${c.credentialId || ""}`)
      .sort(),
    issuedAt: passport.issuedAt ? new Date(passport.issuedAt).toISOString() : "",
  };

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

/**
 * Creates or retrieves the student's digital skills passport.
 * Automatically synchronizes evidence from StudentProfile, approved Resume, and completed assessments.
 */
export async function createOrGetPassport(
  userId: string
): Promise<SkillsPassportDocument> {
  await connectToDatabase();

  const existing = await SkillsPassport.findOne({ userId });
  if (existing) {
    return existing;
  }

  // Auto-initialize from available student records
  return await initializePassportFromRecords(userId);
}

/**
 * Internal initializer building the baseline passport from existing modules.
 */
async function initializePassportFromRecords(
  userId: string
): Promise<SkillsPassportDocument> {
  const [profile, approvedResume, user, roadmaps, skillProgressList] =
    await Promise.all([
      StudentProfile.findOne({ userId }).lean(),
      Resume.findOne({
        studentId: userId,
        analysisStatus: { $in: ["approved", "completed"] },
      })
        .sort({ createdAt: -1 })
        .lean(),
      mongoose.isValidObjectId(userId)
        ? User.findById(userId).lean()
        : User.findOne({ id: userId }).lean(),
      Roadmap.find({ studentId: userId }).lean(),
      StudentSkillProgress.find({
        studentId: userId,
        status: "completed",
      }).lean(),
    ]);

  const publicId = generateCryptographicPublicId();
  const displayName =
    profile?.personalInfo?.fullName || user?.name || "Student";
  const headline =
    profile?.careerPreferences?.preferredJobRole ||
    (profile?.academicInfo?.degree
      ? `${profile.academicInfo.degree} Student`
      : "Aspiring Tech Professional");
  const summary =
    profile?.academicInfo?.branch && profile?.academicInfo?.collegeName
      ? `Student of ${profile.academicInfo.branch} at ${profile.academicInfo.collegeName}. Focused on practical problem solving and technical excellence.`
      : "Driven technical student building practical software projects and verified competencies.";

  // 1. Projects
  const rawProjects: IPassportProject[] = [];
  const profileProjects = profile?.projects || [];
  profileProjects.forEach((p, idx) => {
    rawProjects.push({
      id: p.id || `proj_${idx}`,
      title: p.title,
      description: p.description,
      technologies: p.technologies || [],
      category: "Software Development",
      githubUrl: p.githubUrl || undefined,
      liveDemoUrl: p.liveDeploymentUrl || undefined,
      contribution: "Primary Developer",
      evidenceStatus: "project_demonstrated",
    });
  });

  const resumeProjects = (approvedResume?.parsedData as any)?.projects || [];
  resumeProjects.forEach((p: any, idx: number) => {
    if (!rawProjects.some((rp) => rp.title.toLowerCase() === p.title?.toLowerCase())) {
      rawProjects.push({
        id: `resume_proj_${idx}`,
        title: p.title || `Project ${idx + 1}`,
        description: p.description || "",
        technologies: p.technologies || [],
        category: "Software Development",
        githubUrl: p.githubUrl || undefined,
        liveDemoUrl: p.liveDeploymentUrl || undefined,
        contribution: p.responsibilities?.join(". ") || "Project Contributor",
        evidenceStatus: "project_demonstrated",
      });
    }
  });

  // 2. Certifications
  const rawCerts: IPassportCertification[] = [];
  const profileCerts = profile?.additionalInfo?.certifications || [];
  profileCerts.forEach((c, idx) => {
    rawCerts.push(
      verifyCertification({
        id: c.id || `cert_${idx}`,
        name: c.name,
        issuingOrganization: c.issuer || "Independent Issuer",
        issueDate: c.issueDate || "",
        credentialUrl: c.url || undefined,
        verificationStatus: "student_provided",
      })
    );
  });

  const resumeCerts = (approvedResume?.parsedData as any)?.certifications || [];
  resumeCerts.forEach((c: any, idx: number) => {
    if (!rawCerts.some((rc) => rc.name.toLowerCase() === c.name?.toLowerCase())) {
      rawCerts.push(
        verifyCertification({
          id: `resume_cert_${idx}`,
          name: c.name,
          issuingOrganization: c.issuer || "Independent Issuer",
          issueDate: c.issueDate || "",
          credentialUrl: c.credentialUrl || undefined,
          verificationStatus: "student_provided",
        })
      );
    }
  });

  // 3. Completed Assessments
  const completedAssessments: IPassportAssessment[] = [];
  skillProgressList.forEach((sp, idx) => {
    completedAssessments.push({
      id: `assessment_sp_${idx}`,
      assessmentTitle: `${sp.skillName} Competency Milestone`,
      skillName: sp.skillName,
      badge: "Verified Skill",
      completedAt: sp.completedAt || new Date(),
      verificationReference: `StudentSkillProgress:${sp._id}`,
    });
  });

  roadmaps.forEach((rm) => {
    rm.milestones?.forEach((m) => {
      if (m.assignment && m.tasks.every((t) => t.isCompleted)) {
        completedAssessments.push({
          id: `assessment_rm_${m.id}`,
          assessmentTitle: `${m.title} Capstone Project`,
          skillName: m.skillName,
          badge: "Curriculum Capstone",
          completedAt: new Date(),
          verificationReference: `Roadmap:${rm._id}:${m.id}`,
        });
      }
    });
  });

  // 4. Skills Evidence Classification
  const approvedResumeSkills: string[] = [];
  const resumeTech = (approvedResume?.parsedData as any)?.technicalSkills || {};
  Object.values(resumeTech).forEach((list) => {
    if (Array.isArray(list)) {
      list.forEach((s) => {
        if (typeof s === "string" && s.trim()) approvedResumeSkills.push(s.trim());
      });
    }
  });

  const classificationContext: IEvidenceClassificationContext = {
    studentProfileSkills: (profile?.skills || []).map((s) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
    })),
    approvedResumeSkills,
    projects: rawProjects,
    certifications: rawCerts,
    completedAssessments: completedAssessments.map((a) => ({
      skillName: a.skillName,
      assessmentTitle: a.assessmentTitle,
      score: a.score,
      completedAt: a.completedAt,
    })),
  };

  const skillMap = new Map<string, IPassportSkill>();

  // Add from profile
  (profile?.skills || []).forEach((ps) => {
    const norm = normalizeSkillName(ps.name);
    const classified = classifySkillEvidence(
      norm,
      classificationContext,
      ps.category,
      normalizeProficiency(ps.proficiency)
    );
    skillMap.set(norm.toLowerCase(), classified);
  });

  // Add from approved resume if missing
  approvedResumeSkills.forEach((rs) => {
    const norm = normalizeSkillName(rs);
    if (!skillMap.has(norm.toLowerCase())) {
      const classified = classifySkillEvidence(
        norm,
        classificationContext,
        "Technical",
        "Intermediate"
      );
      skillMap.set(norm.toLowerCase(), classified);
    }
  });

  // 5. Education
  const educationList: IPassportEducation[] = [];
  if (profile?.academicInfo?.collegeName && profile?.academicInfo?.degree) {
    educationList.push({
      institution: profile.academicInfo.collegeName,
      degree: profile.academicInfo.degree,
      branch: profile.academicInfo.branch || "",
      graduationYear: profile.academicInfo.graduationYear || new Date().getFullYear(),
      cgpa: profile.academicInfo.cgpa,
    });
  }

  const resumeEdu = (approvedResume?.parsedData as any)?.education || [];
  resumeEdu.forEach((e: any) => {
    if (
      e.institution &&
      !educationList.some(
        (edu) => edu.institution.toLowerCase() === e.institution.toLowerCase()
      )
    ) {
      educationList.push({
        institution: e.institution,
        degree: e.degree || "Degree",
        branch: e.branch || "",
        graduationYear: e.graduationYear || "",
        cgpa: e.cgpa,
      });
    }
  });

  // 6. Portfolio Links
  const portfolioLinks = {
    github:
      profile?.additionalInfo?.githubUrl ||
      (approvedResume?.parsedData as any)?.personalInfo?.github ||
      "",
    linkedin:
      profile?.additionalInfo?.linkedinUrl ||
      (approvedResume?.parsedData as any)?.personalInfo?.linkedin ||
      "",
    portfolio:
      (approvedResume?.parsedData as any)?.personalInfo?.portfolio || "",
    twitter: "",
  };

  const newPassport = new SkillsPassport({
    userId,
    publicId,
    displayName,
    headline,
    summary,
    visibility: "public",
    visibleSections: {
      skills: true,
      projects: true,
      certifications: true,
      education: true,
      assessments: true,
      contact: false, // Default opt-in privacy
    },
    skills: Array.from(skillMap.values()),
    projects: rawProjects,
    certifications: rawCerts,
    education: educationList,
    assessments: completedAssessments,
    portfolioLinks,
    analytics: {
      viewCount: 0,
      lastViewedAt: null,
    },
    issuedAt: new Date(),
    updatedAt: new Date(),
    isRevoked: false,
  });

  newPassport.integrityHash = computePassportIntegrityHash(newPassport.toObject());
  await newPassport.save();

  // Audit initial evidence records in background
  syncEvidenceAuditLog(newPassport._id.toString(), userId, newPassport.skills).catch((err) =>
    console.error("[Passport] Evidence audit log failed:", err)
  );

  return newPassport;
}

/**
 * Resynchronizes passport skills and projects from latest profile, approved resume, and assessments
 * while preserving user-defined headline, summary, visibility, and section toggles.
 */
export async function syncPassportFromProfile(
  userId: string
): Promise<SkillsPassportDocument> {
  await connectToDatabase();
  const passport = await createOrGetPassport(userId);

  const [profile, approvedResume, skillProgressList, roadmaps] = await Promise.all([
    StudentProfile.findOne({ userId }).lean(),
    Resume.findOne({
      studentId: userId,
      analysisStatus: { $in: ["approved", "completed"] },
    })
      .sort({ createdAt: -1 })
      .lean(),
    StudentSkillProgress.find({ studentId: userId, status: "completed" }).lean(),
    Roadmap.find({ studentId: userId }).lean(),
  ]);

  // Re-collect assessments
  const completedAssessments: IPassportAssessment[] = [];
  skillProgressList.forEach((sp, idx) => {
    completedAssessments.push({
      id: `assessment_sp_${idx}`,
      assessmentTitle: `${sp.skillName} Competency Milestone`,
      skillName: sp.skillName,
      badge: "Verified Skill",
      completedAt: sp.completedAt || new Date(),
      verificationReference: `StudentSkillProgress:${sp._id}`,
    });
  });

  roadmaps.forEach((rm) => {
    rm.milestones?.forEach((m) => {
      if (m.assignment && m.tasks.every((t) => t.isCompleted)) {
        completedAssessments.push({
          id: `assessment_rm_${m.id}`,
          assessmentTitle: `${m.title} Capstone Project`,
          skillName: m.skillName,
          badge: "Curriculum Capstone",
          completedAt: new Date(),
          verificationReference: `Roadmap:${rm._id}:${m.id}`,
        });
      }
    });
  });

  // Rebuild classification context
  const approvedResumeSkills: string[] = [];
  const resumeTech = (approvedResume?.parsedData as any)?.technicalSkills || {};
  Object.values(resumeTech).forEach((list) => {
    if (Array.isArray(list)) {
      list.forEach((s) => {
        if (typeof s === "string" && s.trim()) approvedResumeSkills.push(s.trim());
      });
    }
  });

  const classificationContext: IEvidenceClassificationContext = {
    studentProfileSkills: (profile?.skills || []).map((s) => ({
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
    })),
    approvedResumeSkills,
    projects: passport.projects,
    certifications: passport.certifications,
    completedAssessments: completedAssessments.map((a) => ({
      skillName: a.skillName,
      assessmentTitle: a.assessmentTitle,
      score: a.score,
      completedAt: a.completedAt,
    })),
  };

  const skillMap = new Map<string, IPassportSkill>();

  // Keep existing skills, re-evaluating evidence
  passport.skills.forEach((s) => {
    const reclassified = classifySkillEvidence(
      s.name,
      classificationContext,
      s.category,
      s.proficiency
    );
    skillMap.set(s.name.toLowerCase(), reclassified);
  });

  // Incorporate any new profile skills
  (profile?.skills || []).forEach((ps) => {
    const norm = normalizeSkillName(ps.name);
    if (!skillMap.has(norm.toLowerCase())) {
      const classified = classifySkillEvidence(
        norm,
        classificationContext,
        ps.category,
        normalizeProficiency(ps.proficiency)
      );
      skillMap.set(norm.toLowerCase(), classified);
    }
  });

  passport.skills = Array.from(skillMap.values()) as any;
  passport.assessments = completedAssessments as any;
  passport.updatedAt = new Date();
  passport.integrityHash = computePassportIntegrityHash(passport.toObject());

  await passport.save();
  return passport;
}

/**
 * Updates student editable fields on their skills passport.
 */
export async function updatePassport(
  userId: string,
  updates: Partial<ISkillsPassport>
): Promise<SkillsPassportDocument> {
  await connectToDatabase();
  const passport = await createOrGetPassport(userId);

  if (updates.displayName !== undefined) passport.displayName = updates.displayName.trim();
  if (updates.headline !== undefined) passport.headline = updates.headline.trim();
  if (updates.summary !== undefined) passport.summary = updates.summary.trim();
  if (updates.visibility !== undefined) passport.visibility = updates.visibility;
  if (updates.visibleSections !== undefined) {
    passport.visibleSections = {
      ...passport.visibleSections,
      ...updates.visibleSections,
    };
  }
  if (updates.portfolioLinks !== undefined) {
    passport.portfolioLinks = {
      ...passport.portfolioLinks,
      ...updates.portfolioLinks,
    };
  }
  if (Array.isArray(updates.skills)) {
    passport.skills = updates.skills as any;
  }
  if (Array.isArray(updates.projects)) {
    passport.projects = updates.projects as any;
  }
  if (Array.isArray(updates.certifications)) {
    // Re-verify certification URLs
    passport.certifications = updates.certifications.map(verifyCertification) as any;
  }

  passport.updatedAt = new Date();
  passport.integrityHash = computePassportIntegrityHash(passport.toObject());

  await passport.save();
  return passport;
}

/**
 * Regenerates the cryptographically random public ID.
 * Immediately invalidates the previous public link.
 */
export async function regeneratePassportPublicId(
  userId: string
): Promise<{ previousPublicId: string; newPublicId: string }> {
  await connectToDatabase();
  const passport = await createOrGetPassport(userId);

  const previousPublicId = passport.publicId;
  passport.publicId = generateCryptographicPublicId();
  passport.updatedAt = new Date();
  passport.integrityHash = computePassportIntegrityHash(passport.toObject());

  await passport.save();
  return { previousPublicId, newPublicId: passport.publicId };
}

/**
 * Revokes public access to the passport link.
 */
export async function revokePassport(userId: string): Promise<SkillsPassportDocument> {
  await connectToDatabase();
  const passport = await createOrGetPassport(userId);

  passport.isRevoked = true;
  passport.revokedAt = new Date();
  passport.updatedAt = new Date();
  passport.integrityHash = computePassportIntegrityHash(passport.toObject());

  await passport.save();
  return passport;
}

/**
 * Unrevokes / reactivates a previously revoked passport.
 */
export async function unrevokePassport(userId: string): Promise<SkillsPassportDocument> {
  await connectToDatabase();
  const passport = await createOrGetPassport(userId);

  passport.isRevoked = false;
  passport.revokedAt = null;
  passport.updatedAt = new Date();
  passport.integrityHash = computePassportIntegrityHash(passport.toObject());

  await passport.save();
  return passport;
}

/**
 * Writes audit log entries to PassportEvidence collection.
 */
async function syncEvidenceAuditLog(
  passportId: string,
  userId: string,
  skills: IPassportSkill[]
): Promise<void> {
  for (const skill of skills) {
    await PassportEvidence.findOneAndUpdate(
      {
        passportId,
        itemType: "skill",
        itemName: skill.name,
      },
      {
        userId,
        evidenceType: skill.evidenceType,
        itemId: skill.id,
        verificationStatus: skill.verificationStatus,
        verificationSource: skill.issuingSource,
        verifiedAt: skill.verificationDate || new Date(),
        metadata: {
          category: skill.category,
          proficiency: skill.proficiency,
          evidenceReference: skill.evidenceReference,
        },
      },
      { upsert: true, new: true }
    );
  }
}
