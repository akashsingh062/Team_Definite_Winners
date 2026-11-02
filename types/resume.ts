export type ResumeAnalysisStatus =
  | "uploaded"
  | "processing"
  | "completed"
  | "failed"
  | "approved";

export interface IResumePersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface IResumeEducation {
  institution: string;
  degree: string;
  branch: string;
  startYear?: string | number;
  graduationYear?: string | number;
  cgpa?: string | number;
}

export interface IResumeTechnicalSkills {
  programmingLanguages: string[];
  frontend: string[];
  backend: string[];
  databases: string[];
  frameworks: string[];
  tools: string[];
  cloud: string[];
  other: string[];
}

export interface IResumeProject {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveDeploymentUrl?: string;
  responsibilities?: string[];
}

export interface IResumeExperience {
  company: string;
  jobTitle: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  responsibilities: string[];
  technologies?: string[];
}

export interface IResumeCertification {
  name: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
}

export interface IResumeQualityAnalysis {
  completenessAssessment?: string;
  strengths: string[];
  missingInformation: string[];
  suggestions: string[];
  formattingObservations: string[];
}

export interface IResumeParsedData {
  personalInfo: IResumePersonalInfo;
  education: IResumeEducation[];
  technicalSkills: IResumeTechnicalSkills;
  softSkills: string[];
  projects: IResumeProject[];
  experience: IResumeExperience[];
  certifications: IResumeCertification[];
  resumeAnalysis: IResumeQualityAnalysis;
}

export interface IResume {
  _id?: string;
  id?: string;
  studentId: string;
  originalFileName: string;
  fileStorageKey: string;
  fileSize: number;
  mimeType: string;
  extractedText?: string;
  pageCount?: number;
  parsedData: IResumeParsedData;
  analysisStatus: ResumeAnalysisStatus;
  errorMessage?: string;
  isCurrent: boolean;
  approvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IResumeMergeOptions {
  mergeTechnicalSkills?: boolean;
  addProjects?: boolean;
  updateEducation?: boolean;
  addCertifications?: boolean;
  addExperience?: boolean;
  replacePersonalInfo?: boolean;
}

