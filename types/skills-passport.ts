export type SkillEvidenceType =
  | "self_reported"
  | "resume_extracted"
  | "project_demonstrated"
  | "assessment_verified"
  | "externally_verified";

export type SkillVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "flagged";

export type ProjectEvidenceStatus =
  | "self_reported"
  | "project_demonstrated"
  | "peer_reviewed"
  | "externally_verified";

export type CertificationVerificationStatus =
  | "unverified"
  | "verified"
  | "student_provided"
  | "expired";

export type PassportVisibility = "public" | "private" | "unlisted";

export interface IPassportSkill {
  id: string;
  name: string;
  category: string;
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  evidenceType: SkillEvidenceType;
  evidenceReference?: string;
  verificationStatus: SkillVerificationStatus;
  verificationDate?: string | Date;
  issuingSource: string;
}

export interface IPassportProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  images?: string[];
  contribution?: string;
  completionDate?: string;
  evidenceStatus: ProjectEvidenceStatus;
}

export interface IPassportCertification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  supportingDocumentUrl?: string;
  verificationStatus: CertificationVerificationStatus;
  verificationMethod?: string;
  verificationNotes?: string;
}

export interface IPassportEducation {
  institution: string;
  degree: string;
  branch: string;
  graduationYear: number | string;
  cgpa?: number | string;
}

export interface IPassportAssessment {
  id: string;
  assessmentTitle: string;
  skillName: string;
  score?: number;
  badge: string;
  completedAt: Date | string;
  verificationReference: string;
}

export interface IPassportVisibleSections {
  skills: boolean;
  projects: boolean;
  certifications: boolean;
  education: boolean;
  assessments: boolean;
  contact: boolean;
}

export interface IPassportPortfolioLinks {
  github?: string;
  linkedin?: string;
  portfolio?: string;
  twitter?: string;
}

export interface IPassportAnalytics {
  viewCount: number;
  lastViewedAt?: Date | string | null;
}

export interface ISkillsPassport {
  _id?: string | unknown;
  userId: string;
  publicId: string;
  displayName?: string;
  headline: string;
  summary: string;
  visibility: PassportVisibility;
  visibleSections: IPassportVisibleSections;
  skills: IPassportSkill[];
  projects: IPassportProject[];
  certifications: IPassportCertification[];
  education: IPassportEducation[];
  assessments: IPassportAssessment[];
  portfolioLinks: IPassportPortfolioLinks;
  analytics: IPassportAnalytics;
  issuedAt: Date | string;
  updatedAt: Date | string;
  revokedAt?: Date | string | null;
  isRevoked: boolean;
  integrityHash?: string;
}

export interface IPublicPassportView {
  publicId: string;
  displayName: string;
  headline: string;
  summary: string;
  visibility: PassportVisibility;
  visibleSections: IPassportVisibleSections;
  skills?: IPassportSkill[];
  projects?: IPassportProject[];
  certifications?: IPassportCertification[];
  education?: IPassportEducation[];
  assessments?: IPassportAssessment[];
  portfolioLinks?: IPassportPortfolioLinks;
  issuedAt: string;
  updatedAt: string;
  isRevoked: boolean;
  verificationSummary: {
    totalSkills: number;
    assessmentVerifiedCount: number;
    projectDemonstratedCount: number;
    resumeExtractedCount: number;
    selfReportedCount: number;
    externallyVerifiedCertCount: number;
    totalProjects: number;
    totalCertifications: number;
    hasIntegritySeal: boolean;
  };
}

export interface IPassportVerificationReport {
  publicId: string;
  authenticityStatus: "authentic" | "revoked" | "not_found" | "private";
  studentDisplayName: string;
  headline: string;
  issuedAt: string;
  updatedAt: string;
  integrityHash: string;
  evidenceBreakdown: {
    assessmentVerified: number;
    projectDemonstrated: number;
    resumeExtracted: number;
    selfReported: number;
    externallyVerifiedCerts: number;
    studentProvidedCerts: number;
  };
  verificationDisclaimer: string;
  platformAttestation: {
    issuingPlatform: string;
    verifiedDomain: string;
    protocolVersion: string;
    timestamp: string;
  };
}
