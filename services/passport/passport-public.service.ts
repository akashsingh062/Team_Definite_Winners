import { connectToDatabase } from "@/lib/db/mongodb";
import { SkillsPassport } from "@/models/SkillsPassport";
import {
  IPublicPassportView,
  IPassportVerificationReport,
} from "@/types/skills-passport";

export type PublicPassportError = "NOT_FOUND" | "REVOKED" | "PRIVATE";

export interface PublicPassportResult {
  passport?: IPublicPassportView;
  error?: PublicPassportError;
  revokedAt?: string | null;
}

/**
 * Retrieves a privacy-sanitized public view of a skills passport.
 * Enforces strict section visibility filtering and zero PII leakage.
 */
export async function getPublicPassport(
  publicId: string,
  trackView = true
): Promise<PublicPassportResult> {
  await connectToDatabase();

  const passport = await SkillsPassport.findOne({ publicId }).lean();
  if (!passport) {
    return { error: "NOT_FOUND" };
  }

  if (passport.isRevoked) {
    return {
      error: "REVOKED",
      revokedAt: passport.revokedAt ? new Date(passport.revokedAt).toISOString() : null,
    };
  }

  if (passport.visibility === "private") {
    return { error: "PRIVATE" };
  }

  // Increment analytics count without storing any visitor PII
  if (trackView) {
    SkillsPassport.updateOne(
      { _id: passport._id },
      {
        $inc: { "analytics.viewCount": 1 },
        $set: { "analytics.lastViewedAt": new Date() },
      }
    ).exec().catch((err) =>
      console.warn("[PassportAnalytics] Failed to bump view count:", err)
    );
  }

  const sections = passport.visibleSections || {
    skills: true,
    projects: true,
    certifications: true,
    education: true,
    assessments: true,
    contact: false,
  };

  const skills = passport.skills || [];
  const projects = passport.projects || [];
  const certs = passport.certifications || [];

  const assessmentVerifiedCount = skills.filter(
    (s) => s.evidenceType === "assessment_verified"
  ).length;
  const projectDemonstratedCount = skills.filter(
    (s) => s.evidenceType === "project_demonstrated"
  ).length;
  const resumeExtractedCount = skills.filter(
    (s) => s.evidenceType === "resume_extracted"
  ).length;
  const selfReportedCount = skills.filter(
    (s) => s.evidenceType === "self_reported"
  ).length;
  const externallyVerifiedCertCount = certs.filter(
    (c) => c.verificationStatus === "verified"
  ).length;

  const publicView: IPublicPassportView = {
    publicId: passport.publicId,
    displayName: passport.displayName || "NexSkill Student",
    headline: passport.headline || "Aspiring Tech Professional",
    summary: passport.summary || "",
    visibility: passport.visibility,
    visibleSections: sections,
    issuedAt: new Date(passport.issuedAt).toISOString(),
    updatedAt: new Date(passport.updatedAt).toISOString(),
    isRevoked: false,
    verificationSummary: {
      totalSkills: skills.length,
      assessmentVerifiedCount,
      projectDemonstratedCount,
      resumeExtractedCount,
      selfReportedCount,
      externallyVerifiedCertCount,
      totalProjects: projects.length,
      totalCertifications: certs.length,
      hasIntegritySeal: Boolean(passport.integrityHash),
    },
  };

  if (sections.skills) {
    publicView.skills = skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      proficiency: s.proficiency,
      evidenceType: s.evidenceType,
      evidenceReference: s.evidenceReference,
      verificationStatus: s.verificationStatus,
      verificationDate: s.verificationDate ? new Date(s.verificationDate).toISOString() : undefined,
      issuingSource: s.issuingSource,
    }));
  }

  if (sections.projects) {
    publicView.projects = projects.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      technologies: p.technologies || [],
      category: p.category,
      githubUrl: p.githubUrl,
      liveDemoUrl: p.liveDemoUrl,
      images: p.images,
      contribution: p.contribution,
      completionDate: p.completionDate,
      evidenceStatus: p.evidenceStatus,
    }));
  }

  if (sections.certifications) {
    publicView.certifications = certs.map((c) => ({
      id: c.id,
      name: c.name,
      issuingOrganization: c.issuingOrganization,
      issueDate: c.issueDate,
      expirationDate: c.expirationDate,
      credentialId: c.credentialId,
      credentialUrl: c.credentialUrl,
      supportingDocumentUrl: c.supportingDocumentUrl,
      verificationStatus: c.verificationStatus,
      verificationMethod: c.verificationMethod,
      verificationNotes: c.verificationNotes,
    }));
  }

  if (sections.education) {
    publicView.education = (passport.education || []).map((e) => ({
      institution: e.institution,
      degree: e.degree,
      branch: e.branch,
      graduationYear: e.graduationYear,
      cgpa: e.cgpa,
    }));
  }

  if (sections.assessments) {
    publicView.assessments = (passport.assessments || []).map((a) => ({
      id: a.id,
      assessmentTitle: a.assessmentTitle,
      skillName: a.skillName,
      score: a.score,
      badge: a.badge,
      completedAt: new Date(a.completedAt).toISOString(),
      verificationReference: a.verificationReference,
    }));
  }

  if (sections.contact && passport.portfolioLinks) {
    publicView.portfolioLinks = {
      github: passport.portfolioLinks.github || undefined,
      linkedin: passport.portfolioLinks.linkedin || undefined,
      portfolio: passport.portfolioLinks.portfolio || undefined,
      twitter: passport.portfolioLinks.twitter || undefined,
    };
  }

  return { passport: publicView };
}

/**
 * Generates an employer-facing verification report for a public passport.
 */
export async function getPassportVerificationReport(
  publicId: string
): Promise<IPassportVerificationReport> {
  await connectToDatabase();

  const passport = await SkillsPassport.findOne({ publicId }).lean();
  if (!passport) {
    return {
      publicId,
      authenticityStatus: "not_found",
      studentDisplayName: "",
      headline: "",
      issuedAt: "",
      updatedAt: "",
      integrityHash: "",
      evidenceBreakdown: {
        assessmentVerified: 0,
        projectDemonstrated: 0,
        resumeExtracted: 0,
        selfReported: 0,
        externallyVerifiedCerts: 0,
        studentProvidedCerts: 0,
      },
      verificationDisclaimer: "The requested passport does not exist in the NexSkill AI registry.",
      platformAttestation: {
        issuingPlatform: "NexSkill AI Digital Skills Registry",
        verifiedDomain: "nexskill.ai",
        protocolVersion: "v1.0-cdp",
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (passport.isRevoked) {
    return {
      publicId,
      authenticityStatus: "revoked",
      studentDisplayName: passport.displayName || "Student",
      headline: passport.headline || "",
      issuedAt: new Date(passport.issuedAt).toISOString(),
      updatedAt: new Date(passport.updatedAt).toISOString(),
      integrityHash: passport.integrityHash || "",
      evidenceBreakdown: {
        assessmentVerified: 0,
        projectDemonstrated: 0,
        resumeExtracted: 0,
        selfReported: 0,
        externallyVerifiedCerts: 0,
        studentProvidedCerts: 0,
      },
      verificationDisclaimer: "This digital passport was revoked by its owner and its verification attestation is no longer valid.",
      platformAttestation: {
        issuingPlatform: "NexSkill AI Digital Skills Registry",
        verifiedDomain: "nexskill.ai",
        protocolVersion: "v1.0-cdp",
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (passport.visibility === "private") {
    return {
      publicId,
      authenticityStatus: "private",
      studentDisplayName: passport.displayName || "Student",
      headline: passport.headline || "",
      issuedAt: new Date(passport.issuedAt).toISOString(),
      updatedAt: new Date(passport.updatedAt).toISOString(),
      integrityHash: passport.integrityHash || "",
      evidenceBreakdown: {
        assessmentVerified: 0,
        projectDemonstrated: 0,
        resumeExtracted: 0,
        selfReported: 0,
        externallyVerifiedCerts: 0,
        studentProvidedCerts: 0,
      },
      verificationDisclaimer: "This digital passport is set to private by its owner.",
      platformAttestation: {
        issuingPlatform: "NexSkill AI Digital Skills Registry",
        verifiedDomain: "nexskill.ai",
        protocolVersion: "v1.0-cdp",
        timestamp: new Date().toISOString(),
      },
    };
  }

  const skills = passport.skills || [];
  const certs = passport.certifications || [];

  return {
    publicId,
    authenticityStatus: "authentic",
    studentDisplayName: passport.displayName || "NexSkill Student",
    headline: passport.headline || "Aspiring Tech Professional",
    issuedAt: new Date(passport.issuedAt).toISOString(),
    updatedAt: new Date(passport.updatedAt).toISOString(),
    integrityHash: passport.integrityHash || "",
    evidenceBreakdown: {
      assessmentVerified: skills.filter((s) => s.evidenceType === "assessment_verified").length,
      projectDemonstrated: skills.filter((s) => s.evidenceType === "project_demonstrated").length,
      resumeExtracted: skills.filter((s) => s.evidenceType === "resume_extracted").length,
      selfReported: skills.filter((s) => s.evidenceType === "self_reported").length,
      externallyVerifiedCerts: certs.filter((c) => c.verificationStatus === "verified").length,
      studentProvidedCerts: certs.filter((c) => c.verificationStatus === "student_provided").length,
    },
    verificationDisclaimer:
      "NexSkill AI attests that assessment-verified milestones and internal project demonstrations were completed within the platform. Third-party certifications were confirmed via authorized external issuer URL schemes. Self-reported and resume-extracted items represent student-provided claims and should be verified during interview stages.",
    platformAttestation: {
      issuingPlatform: "NexSkill AI Digital Skills Registry",
      verifiedDomain: "nexskill.ai",
      protocolVersion: "v1.0-cdp",
      timestamp: new Date().toISOString(),
    },
  };
}
