export type SkillCategory =
  | "Programming languages"
  | "Frontend technologies"
  | "Backend technologies"
  | "Databases"
  | "Development tools"
  | "Other technical skills";

export type SkillProficiency = "Beginner" | "Intermediate" | "Advanced";

export interface ITechnicalSkill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: SkillProficiency;
}

export interface IAcademicInfo {
  collegeName: string;
  degree: string;
  branch: string;
  currentAcademicYear: string;
  graduationYear: number;
  cgpa?: number;
}

export interface IProjectItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveDeploymentUrl?: string;
}

export interface ICareerPreferences {
  preferredJobRole: string;
  preferredEmploymentType: "Internship" | "Full-time" | "Part-time" | "Fellowship";
  workPreference: "Remote" | "On-site" | "Hybrid";
  preferredLocation: string;
  expectedStipend?: string;
}

export interface ICertificationItem {
  id: string;
  name: string;
  issuer?: string;
  issueDate?: string;
  url?: string;
}

export interface IExperienceItem {
  id: string;
  role: string;
  company: string;
  duration?: string;
  description?: string;
}

export interface IAdditionalInfo {
  certifications: ICertificationItem[];
  experience: IExperienceItem[];
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface IPersonalInfo {
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilePhotograph?: string;
}

export interface IProfileCompletionBreakdown {
  personalInfo: number; // Max 20
  academicInfo: number; // Max 20
  technicalSkills: number; // Max 25
  projects: number; // Max 20
  careerPreferences: number; // Max 15
  total: number; // Max 100
}

export interface ILocationPreferences {
  state?: string;
  district?: string;
  city?: string;
  preferredRadiusKm?: number;
  willingToRelocate?: boolean;
  preferredWorkMode?: "remote" | "hybrid" | "onsite" | "any";
  preferRemote?: boolean;
}

export interface IStudentProfile {
  _id?: string;
  userId: string;
  personalInfo: IPersonalInfo;
  academicInfo: IAcademicInfo;
  skills: ITechnicalSkill[];
  projects: IProjectItem[];
  careerPreferences: ICareerPreferences;
  locationPreferences?: ILocationPreferences;
  additionalInfo: IAdditionalInfo;
  profileCompletionPercentage: number;
  createdAt?: Date;
  updatedAt?: Date;
}
