import { connectToDatabase } from "@/lib/db/mongodb";
import { MentorProfile } from "@/models/MentorProfile";
import { User } from "@/models/User";
import { IMentorProfile } from "@/types/mentor";
import { SEED_MENTORS } from "./mentor-seed-data";

export interface MentorFilterParams {
  search?: string;
  expertise?: string;
  skill?: string;
  minExperience?: number;
  maxExperience?: number;
  language?: string;
  acceptingOnly?: boolean;
}

export class MentorService {
  /**
   * Ensure initial verified and pending mentors are seeded in the database.
   */
  static async ensureMentorsSeeded(): Promise<void> {
    await connectToDatabase();
    const count = await MentorProfile.countDocuments();
    if (count > 0) return;

    for (const mentorData of SEED_MENTORS) {
      await MentorProfile.create(mentorData);
    }
  }

  /**
   * Discover mentors for public / student consumption.
   * STRICT INVARIANT: Only mentors with verificationStatus === "verified" are returned.
   */
  static async getPublicMentors(
    filters: MentorFilterParams = {}
  ): Promise<IMentorProfile[]> {
    await connectToDatabase();
    await this.ensureMentorsSeeded();

    const query: Record<string, unknown> = {
      verificationStatus: "verified",
    };

    if (filters.acceptingOnly) {
      query["availability.isAcceptingRequests"] = true;
    }

    if (filters.minExperience !== undefined || filters.maxExperience !== undefined) {
      query.experienceYears = {};
      if (filters.minExperience !== undefined) {
        (query.experienceYears as Record<string, number>).$gte = Number(
          filters.minExperience
        );
      }
      if (filters.maxExperience !== undefined) {
        (query.experienceYears as Record<string, number>).$lte = Number(
          filters.maxExperience
        );
      }
    }

    if (filters.expertise) {
      query.expertise = { $regex: new RegExp(filters.expertise.trim(), "i") };
    }

    if (filters.skill) {
      query.skills = { $regex: new RegExp(filters.skill.trim(), "i") };
    }

    if (filters.language) {
      query.languages = { $regex: new RegExp(filters.language.trim(), "i") };
    }

    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), "i");
      query.$or = [
        { displayName: searchRegex },
        { headline: searchRegex },
        { organization: searchRegex },
        { currentRole: searchRegex },
        { biography: searchRegex },
        { expertise: searchRegex },
        { skills: searchRegex },
      ];
    }

    const mentors = await MentorProfile.find(query)
      .sort({ "rating.average": -1, experienceYears: -1, createdAt: -1 })
      .lean();

    return mentors as unknown as IMentorProfile[];
  }

  /**
   * Fetch a single mentor by ID (MongoDB _id or userId).
   * If includeUnverified is false (default for students/public), only returns if verified.
   */
  static async getMentorById(
    mentorId: string,
    includeUnverified = false
  ): Promise<IMentorProfile | null> {
    await connectToDatabase();
    await this.ensureMentorsSeeded();

    const query: Record<string, unknown> = {
      $or: [{ _id: mentorId.match(/^[0-9a-fA-F]{24}$/) ? mentorId : null }, { userId: mentorId }].filter(
        (cond) => cond._id !== null || cond.userId !== null
      ),
    };

    if (!includeUnverified) {
      query.verificationStatus = "verified";
    }

    const mentor = await MentorProfile.findOne(query).lean();
    return (mentor as unknown as IMentorProfile) || null;
  }

  /**
   * Get a mentor's profile by their authenticated userId.
   */
  static async getMentorByUserId(userId: string): Promise<IMentorProfile | null> {
    await connectToDatabase();
    const mentor = await MentorProfile.findOne({ userId }).lean();
    return (mentor as unknown as IMentorProfile) || null;
  }

  /**
   * Register or update a mentor's profile.
   * New profiles start with verificationStatus = "pending".
   */
  static async registerOrUpdateMentorProfile(
    userId: string,
    data: Partial<IMentorProfile>
  ): Promise<IMentorProfile> {
    await connectToDatabase();

    // Validate safe URLs if provided
    if (data.professionalLinks) {
      const { linkedin, github, portfolio, twitter } = data.professionalLinks;
      const validateUrl = (url?: string) => {
        if (!url || !url.trim()) return true;
        try {
          const parsed = new URL(url);
          return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch {
          return false;
        }
      };

      if (
        !validateUrl(linkedin) ||
        !validateUrl(github) ||
        !validateUrl(portfolio) ||
        !validateUrl(twitter)
      ) {
        throw new Error("Invalid professional URL format provided");
      }
    }

    const existing = await MentorProfile.findOne({ userId });

    if (existing) {
      // Retain verification status unless explicitly managed by admin,
      // but if user changes organization, currentRole or credentials, flag for review
      const isReVerificationNeeded =
        existing.verificationStatus === "rejected" ||
        (existing.verificationStatus === "verified" &&
          (data.organization !== undefined && data.organization !== existing.organization));

      const updatedStatus = isReVerificationNeeded
        ? "under_review"
        : existing.verificationStatus;

      const updated = await MentorProfile.findOneAndUpdate(
        { userId },
        {
          $set: {
            displayName: data.displayName ?? existing.displayName,
            headline: data.headline ?? existing.headline,
            organization: data.organization ?? existing.organization,
            currentRole: data.currentRole ?? existing.currentRole,
            experienceYears: data.experienceYears ?? existing.experienceYears,
            expertise: data.expertise ?? existing.expertise,
            skills: data.skills ?? existing.skills,
            languages: data.languages ?? existing.languages,
            biography: data.biography ?? existing.biography,
            education: data.education ?? existing.education,
            professionalLinks: data.professionalLinks ?? existing.professionalLinks,
            credentials: data.credentials ?? existing.credentials,
            availability: data.availability ?? existing.availability,
            verificationStatus: updatedStatus,
          },
        },
        { new: true, runValidators: true }
      ).lean();

      return updated as unknown as IMentorProfile;
    }

    // New profile creation
    const newProfile = await MentorProfile.create({
      userId,
      displayName: data.displayName || "Mentor",
      headline: data.headline || "Industry Professional & Career Mentor",
      organization: data.organization || "Independent",
      currentRole: data.currentRole || "Consultant",
      experienceYears: data.experienceYears || 1,
      expertise: data.expertise || ["General Advisory"],
      skills: data.skills || [],
      languages: data.languages || ["English"],
      biography: data.biography || "Ready to guide aspiring professionals.",
      education: data.education || [],
      professionalLinks: data.professionalLinks || {},
      credentials: data.credentials || [],
      verificationStatus: "pending", // ALWAYS starts as pending!
      availability: data.availability || {
        isAcceptingRequests: true,
        maxActiveMentees: 5,
        weeklyHours: 4,
        preferredDays: ["Saturday", "Sunday"],
        timeSlots: [],
        timezone: "Asia/Kolkata",
      },
      rating: { average: 0, count: 0 },
    });

    // Update user role to mentor if not admin
    await User.updateOne(
      { _id: userId, role: { $ne: "admin" } },
      { $set: { role: "mentor" } }
    );

    return newProfile.toObject() as unknown as IMentorProfile;
  }

  /**
   * Update mentor's availability preferences.
   */
  static async updateAvailability(
    userId: string,
    availability: Partial<IMentorProfile["availability"]>
  ): Promise<IMentorProfile> {
    await connectToDatabase();

    const existing = await MentorProfile.findOne({ userId });
    if (!existing) {
      throw new Error("Mentor profile not found");
    }

    const updated = await MentorProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          "availability.isAcceptingRequests":
            availability.isAcceptingRequests ?? existing.availability.isAcceptingRequests,
          "availability.maxActiveMentees":
            availability.maxActiveMentees ?? existing.availability.maxActiveMentees,
          "availability.weeklyHours":
            availability.weeklyHours ?? existing.availability.weeklyHours,
          "availability.preferredDays":
            availability.preferredDays ?? existing.availability.preferredDays,
          "availability.timeSlots":
            availability.timeSlots ?? existing.availability.timeSlots,
          "availability.timezone":
            availability.timezone ?? existing.availability.timezone,
        },
      },
      { new: true }
    ).lean();

    return updated as unknown as IMentorProfile;
  }
}
