import { connectToDatabase } from "@/lib/db/mongodb";
import { StudentProfile } from "@/models/StudentProfile";
import { IStudentProfile, IProfileCompletionBreakdown } from "@/types/student";

/**
 * Calculates weighted profile completion breakdown according to exact requirements:
 * - Personal information: 20%
 * - Academic information: 20%
 * - Technical skills: 25%
 * - Projects: 20%
 * - Career preferences: 15%
 */
export function calculateProfileCompletionBreakdown(
  profile: Partial<IStudentProfile>
): IProfileCompletionBreakdown {
  let personalScore = 0;
  let academicScore = 0;
  let skillsScore = 0;
  let projectsScore = 0;
  let careerScore = 0;

  // A. Personal Information (Max 20)
  if (profile.personalInfo?.fullName?.trim()) {
    personalScore += 10;
  }
  if (profile.personalInfo?.email?.trim()) {
    personalScore += 5;
  }
  if (
    profile.personalInfo?.phoneNumber?.trim() ||
    profile.personalInfo?.profilePhotograph?.trim()
  ) {
    personalScore += 5;
  }

  // B. Academic Information (Max 20)
  if (profile.academicInfo?.collegeName?.trim()) {
    academicScore += 5;
  }
  if (profile.academicInfo?.degree?.trim()) {
    academicScore += 5;
  }
  if (profile.academicInfo?.branch?.trim()) {
    academicScore += 5;
  }
  if (
    profile.academicInfo?.currentAcademicYear?.trim() &&
    profile.academicInfo?.graduationYear
  ) {
    academicScore += 5;
  }

  // C. Technical Skills (Max 25)
  const skillsCount = profile.skills?.length || 0;
  if (skillsCount >= 1) {
    skillsScore += 10;
  }
  if (skillsCount >= 3) {
    skillsScore += 10;
  }
  if (skillsCount >= 5) {
    const categories = new Set(profile.skills?.map((s) => s.category));
    if (categories.size >= 2) {
      skillsScore += 5;
    } else {
      skillsScore += 3;
    }
  }

  // D. Projects (Max 20)
  const validProjects =
    profile.projects?.filter(
      (p) =>
        p.title?.trim() &&
        p.description?.trim() &&
        p.technologies &&
        p.technologies.length > 0
    ) || [];

  if (validProjects.length >= 1) {
    projectsScore += 15;
  }
  if (validProjects.length >= 2) {
    projectsScore += 5;
  }

  // E. Career Preferences (Max 15)
  if (profile.careerPreferences?.preferredJobRole?.trim()) {
    careerScore += 5;
  }
  if (
    profile.careerPreferences?.preferredEmploymentType &&
    profile.careerPreferences?.workPreference
  ) {
    careerScore += 5;
  }
  if (profile.careerPreferences?.preferredLocation?.trim()) {
    careerScore += 5;
  }

  const total = Math.min(
    100,
    personalScore + academicScore + skillsScore + projectsScore + careerScore
  );

  return {
    personalInfo: personalScore,
    academicInfo: academicScore,
    technicalSkills: skillsScore,
    projects: projectsScore,
    careerPreferences: careerScore,
    total,
  };
}

/**
 * Calculates overall profile completion percentage (0 to 100)
 */
export function calculateProfileCompleteness(
  profile: Partial<IStudentProfile>
): number {
  return calculateProfileCompletionBreakdown(profile).total;
}

/**
 * Fetches a student's profile by their authenticated user ID.
 */
export async function getStudentProfileByUserId(
  userId: string
): Promise<IStudentProfile | null> {
  await connectToDatabase();
  const profile = await StudentProfile.findOne({ userId }).lean<IStudentProfile>();
  return profile ? JSON.parse(JSON.stringify(profile)) : null;
}

/**
 * Upserts a student profile for the authenticated user.
 * Recalculates profile completion dynamically.
 * Never allows arbitrary client-provided user IDs.
 */
export async function upsertStudentProfile(
  userId: string,
  profileData: Partial<IStudentProfile>
): Promise<IStudentProfile> {
  await connectToDatabase();

  const completionScore = calculateProfileCompleteness(profileData);

  const updated = await StudentProfile.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...profileData,
        userId,
        profileCompletionPercentage: completionScore,
      },
    },
    { new: true, upsert: true, runValidators: true }
  ).lean<IStudentProfile>();

  return JSON.parse(JSON.stringify(updated));
}
