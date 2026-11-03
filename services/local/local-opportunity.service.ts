import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Opportunity } from "@/models/Opportunity";
import { RegionalTrainingCentre } from "@/models/RegionalTrainingCentre";
import { StudentProfile } from "@/models/StudentProfile";
import { IOpportunity } from "@/types/opportunity";
import {
  ILocalOpportunityFilters,
  ILocalOpportunityItem,
  IMapMarkerItem,
  IRegionalSkillDemand,
  IRegionalSkillGapAnalysis,
  IRegionalSkillGapItem,
  IAvailableRegion,
  ISkillDemandStat,
} from "@/types/local-opportunity";
import {
  normalizeSkill,
  areSkillsEquivalent,
} from "@/services/matching/skill-normalizer";
import { matchSkills } from "@/services/matching/skill-matcher";
import { checkEligibility } from "@/services/matching/eligibility-checker";
import { calculateCompatibilityScore } from "@/services/matching/score-calculator";
import {
  SEED_LOCAL_OPPORTUNITIES,
  SEED_TRAINING_CENTRES,
} from "./local-seed-data";

/**
 * Calculates Haversine distance in kilometers between two geographic coordinates.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Ensures regional seed data (opportunities and training centres) are populated.
 */
export async function ensureLocalSeedData(): Promise<void> {
  await connectToDatabase();

  const regionalOppCount = await Opportunity.countDocuments({
    $or: [{ state: { $exists: true, $ne: "" } }, { isGovernmentProgram: true }],
  });

  if (regionalOppCount === 0) {
    console.log("[LocalOpportunityService] Seeding initial regional opportunities...");
    for (const opp of SEED_LOCAL_OPPORTUNITIES) {
      await Opportunity.create({
        ...opp,
        status: "published",
        verificationStatus: "verified",
      });
    }
  }

  const centresCount = await RegionalTrainingCentre.countDocuments();
  if (centresCount === 0) {
    console.log("[LocalOpportunityService] Seeding initial regional training centres...");
    for (const centre of SEED_TRAINING_CENTRES) {
      await RegionalTrainingCentre.create({
        ...centre,
        verificationStatus: "verified",
      });
    }
  }
}

/**
 * Discovers and prioritizes local opportunities with Stage 4 matching integration.
 */
export async function getLocalOpportunities(
  userId?: string,
  filters: ILocalOpportunityFilters = {}
): Promise<{
  items: ILocalOpportunityItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await connectToDatabase();
  await ensureLocalSeedData();

  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(filters.limit) || 10));

  // Build query
  const query: Record<string, unknown> = {
    status: "published",
    verificationStatus: "verified",
    isOutdated: { $ne: true },
  };

  // State / District / City filters
  if (filters.state && filters.state.toLowerCase() !== "all") {
    query.$or = [
      { state: new RegExp(`^${filters.state.trim()}$`, "i") },
      { state: "Pan-India" },
      { workMode: "remote" },
    ];
  }

  if (filters.district && filters.district.toLowerCase() !== "all") {
    query.district = new RegExp(`^${filters.district.trim()}$`, "i");
  }

  if (filters.city) {
    query.city = new RegExp(filters.city.trim(), "i");
  }

  if (filters.workMode && filters.workMode !== "any") {
    query.workMode = filters.workMode;
  }

  if (filters.category && filters.category !== "all") {
    query.category = filters.category;
  }

  if (filters.isGovernmentProgram !== undefined) {
    query.isGovernmentProgram = filters.isGovernmentProgram;
  }

  if (filters.search && filters.search.trim()) {
    const sRegex = new RegExp(filters.search.trim(), "i");
    query.$or = [
      { title: sRegex },
      { companyName: sRegex },
      { description: sRegex },
      { state: sRegex },
      { district: sRegex },
      { city: sRegex },
      { requiredSkills: sRegex },
    ];
  }

  // Fetch student profile for Stage 4 matching if logged in
  let studentProfile: any = null;
  if (userId) {
    studentProfile = await StudentProfile.findOne({ userId }).lean();
  }

  const rawOpportunities = await Opportunity.find(query).sort({ publishedAt: -1, createdAt: -1 });

  // Map and score items
  const mappedItems: ILocalOpportunityItem[] = [];

  for (const rawOpp of rawOpportunities) {
    const opp = rawOpp.toObject() as IOpportunity;

    // Distance calculation if coordinates are present
    let distanceKm: number | undefined;
    if (filters.coordinates) {
      if (
        opp.coordinates &&
        typeof opp.coordinates.latitude === "number" &&
        typeof opp.coordinates.longitude === "number"
      ) {
        distanceKm = calculateHaversineDistanceKm(
          filters.coordinates.latitude,
          filters.coordinates.longitude,
          opp.coordinates.latitude,
          opp.coordinates.longitude
        );

        // Filter by radius if requested
        if (filters.radiusKm && distanceKm > filters.radiusKm) {
          continue;
        }
      } else if (filters.radiusKm) {
        // If radiusKm is specified, skip opportunities that have no coordinates
        continue;
      }
    }

    // Determine if opportunity is considered a local match
    let isLocalMatch = false;
    if (filters.state && opp.state?.toLowerCase() === filters.state.toLowerCase()) {
      isLocalMatch = true;
    } else if (studentProfile?.locationPreferences?.state && opp.state) {
      isLocalMatch = opp.state.toLowerCase() === studentProfile.locationPreferences.state.toLowerCase();
    } else if (opp.workMode === "remote") {
      isLocalMatch = true;
    }

    // Calculate Stage 4 compatibility score if student profile is available
    let matchScore: number | undefined;
    if (studentProfile) {
      try {
        const studentSkillNames = (studentProfile.skills || []).map((s: any) => s.name);
        const skillMatch = matchSkills(studentSkillNames, opp.requiredSkills, opp.preferredSkills || []);
        const eligibility = checkEligibility(studentProfile, opp);
        const scoreCalc = calculateCompatibilityScore(studentProfile, opp, skillMatch, eligibility);
        matchScore = scoreCalc.overallScore;
      } catch (err) {
        console.error("Match score calculation error:", err);
      }
    }

    mappedItems.push({
      opportunity: opp,
      distanceKm,
      isLocalMatch,
      matchScore,
      provenance: {
        source: opp.opportunitySource || "direct_employer",
        sourceOrganization: opp.sourceOrganization || opp.companyName,
        sourceUrl: opp.sourceUrl || opp.externalApplicationUrl,
        lastVerifiedAt: opp.lastVerifiedAt || opp.publishedAt || opp.createdAt,
        isGovernmentProgram: Boolean(opp.isGovernmentProgram),
        verificationStatus: opp.verificationStatus || "verified",
      },
    });
  }

  // Sort by matchScore (descending) if available, then by local proximity
  mappedItems.sort((a, b) => {
    if (a.matchScore !== undefined && b.matchScore !== undefined) {
      return b.matchScore - a.matchScore;
    }
    if (a.isLocalMatch !== b.isLocalMatch) {
      return a.isLocalMatch ? -1 : 1;
    }
    if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
      return a.distanceKm - b.distanceKm;
    }
    return 0;
  });

  const total = mappedItems.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginated = mappedItems.slice((page - 1) * limit, page * limit);

  return {
    items: paginated,
    total,
    page,
    totalPages,
  };
}

/**
 * Retrieves verified geo-located opportunities and training centres for interactive map.
 * Strictly never fabricates or invents coordinates for items that lack them.
 */
export async function getMapOpportunities(filters?: {
  state?: string;
  district?: string;
  category?: string;
}): Promise<{
  markers: IMapMarkerItem[];
  unmappedOpportunitiesCount: number;
  totalLocations: number;
}> {
  await connectToDatabase();
  await ensureLocalSeedData();

  const oppQuery: Record<string, unknown> = {
    status: "published",
    verificationStatus: "verified",
    isOutdated: { $ne: true },
  };

  const centreQuery: Record<string, unknown> = {
    verificationStatus: "verified",
  };

  if (filters?.state && filters.state.toLowerCase() !== "all") {
    const stateRegex = new RegExp(`^${filters.state.trim()}$`, "i");
    oppQuery.state = stateRegex;
    centreQuery.state = stateRegex;
  }

  if (filters?.district && filters.district.toLowerCase() !== "all") {
    const distRegex = new RegExp(`^${filters.district.trim()}$`, "i");
    oppQuery.district = distRegex;
    centreQuery.district = distRegex;
  }

  const [opportunities, trainingCentres] = await Promise.all([
    Opportunity.find(oppQuery).lean(),
    RegionalTrainingCentre.find(centreQuery).lean(),
  ]);

  const markers: IMapMarkerItem[] = [];
  let unmappedCount = 0;

  // Process opportunities
  for (const opp of opportunities) {
    if (
      opp.coordinates &&
      typeof opp.coordinates.latitude === "number" &&
      typeof opp.coordinates.longitude === "number" &&
      !isNaN(opp.coordinates.latitude) &&
      !isNaN(opp.coordinates.longitude)
    ) {
      markers.push({
        id: `opp_${opp._id.toString()}`,
        type: "opportunity",
        title: opp.title,
        organization: opp.companyName,
        category: opp.category,
        workMode: opp.workMode,
        address: opp.locationName || opp.location,
        district: opp.district || "Regional",
        state: opp.state || "State",
        coordinates: {
          latitude: opp.coordinates.latitude,
          longitude: opp.coordinates.longitude,
        },
        stipend: opp.stipend || opp.salaryRange,
        deadline: opp.applicationDeadline,
        isGovernmentProgram: Boolean(opp.isGovernmentProgram),
        sourceUrl: opp.sourceUrl || opp.externalApplicationUrl,
        verificationStatus: opp.verificationStatus,
      });
    } else {
      // Unmapped because no precise coordinates are verified
      unmappedCount++;
    }
  }

  // Process training centres
  for (const tc of trainingCentres) {
    if (
      tc.coordinates &&
      typeof tc.coordinates.latitude === "number" &&
      typeof tc.coordinates.longitude === "number"
    ) {
      markers.push({
        id: `tc_${tc._id.toString()}`,
        type: "training_centre",
        title: tc.name,
        organization: tc.sourceOrganization || "Govt Training Centre",
        category: `Training (${tc.category.toUpperCase()})`,
        address: tc.address,
        district: tc.district,
        state: tc.state,
        coordinates: {
          latitude: tc.coordinates.latitude,
          longitude: tc.coordinates.longitude,
        },
        isGovernmentProgram: true,
        sourceUrl: tc.sourceUrl || tc.officialWebsite,
        verificationStatus: tc.verificationStatus,
      });
    }
  }

  return {
    markers,
    unmappedOpportunitiesCount: unmappedCount,
    totalLocations: markers.length,
  };
}

/**
 * Calculates real-time regional skill demand intelligence across verified opportunities.
 */
export async function getRegionalSkillDemand(
  state?: string,
  district?: string
): Promise<IRegionalSkillDemand> {
  await connectToDatabase();
  await ensureLocalSeedData();

  const query: Record<string, unknown> = {
    status: "published",
    verificationStatus: "verified",
    isOutdated: { $ne: true },
  };

  if (state && state.toLowerCase() !== "all") {
    query.state = new RegExp(`^${state.trim()}$`, "i");
  }

  if (district && district.toLowerCase() !== "all") {
    query.district = new RegExp(`^${district.trim()}$`, "i");
  }

  const opportunities = await Opportunity.find(query).lean();
  const totalOpportunities = opportunities.length;

  const skillCounts = new Map<
    string,
    { count: number; requiredCount: number; preferredCount: number }
  >();
  const categoryCounts: Record<string, number> = {};
  const workModeCounts: Record<string, number> = { remote: 0, hybrid: 0, onsite: 0 };

  let oldestDate: Date = new Date();
  let newestDate: Date = new Date(0);

  for (const opp of opportunities) {
    // Track dates
    const createdAt = opp.createdAt ? new Date(opp.createdAt) : new Date();
    if (createdAt < oldestDate) oldestDate = createdAt;
    if (createdAt > newestDate) newestDate = createdAt;

    // Track category
    const cat = opp.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    // Track work mode
    const wm = (opp.workMode || "onsite").toLowerCase();
    if (workModeCounts[wm] !== undefined) {
      workModeCounts[wm]++;
    }

    // Required skills
    (opp.requiredSkills || []).forEach((rawSkill: string) => {
      const norm = normalizeSkill(rawSkill);
      if (!skillCounts.has(norm)) {
        skillCounts.set(norm, { count: 0, requiredCount: 0, preferredCount: 0 });
      }
      const stat = skillCounts.get(norm)!;
      stat.count++;
      stat.requiredCount++;
    });

    // Preferred skills
    (opp.preferredSkills || []).forEach((rawSkill: string) => {
      const norm = normalizeSkill(rawSkill);
      if (!skillCounts.has(norm)) {
        skillCounts.set(norm, { count: 0, requiredCount: 0, preferredCount: 0 });
      }
      const stat = skillCounts.get(norm)!;
      stat.count++;
      stat.preferredCount++;
    });
  }

  // Format top skills
  const topSkills: ISkillDemandStat[] = Array.from(skillCounts.entries())
    .map(([skillName, stat]) => ({
      skillName,
      opportunityCount: stat.count,
      demandPercentage:
        totalOpportunities > 0 ? Math.round((stat.count / totalOpportunities) * 100) : 0,
      requiredCount: stat.requiredCount,
      preferredCount: stat.preferredCount,
    }))
    .sort((a, b) => b.opportunityCount - a.opportunityCount)
    .slice(0, 15);

  const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count,
  }));

  const workModeDistribution = Object.entries(workModeCounts).map(([workMode, count]) => ({
    workMode,
    count,
    percentage: totalOpportunities > 0 ? Math.round((count / totalOpportunities) * 100) : 0,
  }));

  return {
    region: {
      state: state || "All Regions",
      district: district || undefined,
      totalOpportunities,
      recordCountUsed: totalOpportunities,
      dateRange: {
        from: totalOpportunities > 0 ? oldestDate : new Date(),
        to: totalOpportunities > 0 ? newestDate : new Date(),
      },
    },
    topSkills,
    categoryDistribution,
    workModeDistribution,
    remoteVsOnsite: {
      remoteCount: workModeCounts.remote,
      hybridCount: workModeCounts.hybrid,
      onsiteCount: workModeCounts.onsite,
    },
    frequentlyRequestedTech: topSkills.slice(0, 8).map((s) => s.skillName),
  };
}

/**
 * Analyzes the student's skill portfolio against regional opportunity demand.
 */
export async function getRegionalSkillGapAnalysis(
  userId: string,
  state?: string,
  district?: string
): Promise<IRegionalSkillGapAnalysis> {
  await connectToDatabase();

  const [demand, profile] = await Promise.all([
    getRegionalSkillDemand(state, district),
    StudentProfile.findOne({ userId }).lean(),
  ]);

  const studentSkills = profile?.skills || [];
  const gapItems: IRegionalSkillGapItem[] = [];

  let satisfiedCount = 0;
  let missingRequiredCount = 0;
  let missingPreferredCount = 0;

  for (const stat of demand.topSkills) {
    const hasSkill = studentSkills.some((s: any) => areSkillsEquivalent(s.name, stat.skillName));
    const matchingProfileSkill = studentSkills.find((s: any) =>
      areSkillsEquivalent(s.name, stat.skillName)
    );

    const isRequired = stat.requiredCount >= stat.preferredCount;

    let gapStatus: IRegionalSkillGapItem["gapStatus"] = "satisfied";
    if (!hasSkill) {
      if (isRequired) {
        gapStatus = "missing_required";
        missingRequiredCount++;
      } else {
        gapStatus = "missing_preferred";
        missingPreferredCount++;
      }
    } else {
      satisfiedCount++;
    }

    gapItems.push({
      skillName: stat.skillName,
      regionalDemandCount: stat.opportunityCount,
      demandPercentage: stat.demandPercentage,
      studentHasSkill: hasSkill,
      studentProficiency: matchingProfileSkill?.proficiency,
      isRequired,
      gapStatus,
    });
  }

  const sampleSize = demand.region.totalOpportunities;
  const sampleSizeDisclaimer =
    sampleSize === 0
      ? "Zero verified opportunities currently indexed for this region. Display reflects verified platform postings rather than exhaustive economic census data."
      : `Based on ${sampleSize} verified opportunities in ${state || "all active regions"}. Represents current platform demand rather than complete regional industry census.`;

  return {
    region: {
      state,
      district,
      opportunityCount: sampleSize,
    },
    summary: {
      totalRegionalSkills: demand.topSkills.length,
      skillsDemonstrated: satisfiedCount,
      missingRequired: missingRequiredCount,
      missingPreferred: missingPreferredCount,
    },
    gapItems,
    studentSkills,
    sampleSizeDisclaimer,
  };
}

/**
 * Retrieves verified government and public training opportunities.
 */
export async function getGovernmentPrograms(filters?: {
  state?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<{
  items: IOpportunity[];
  total: number;
  page: number;
  totalPages: number;
}> {
  await connectToDatabase();
  await ensureLocalSeedData();

  const page = Math.max(1, Number(filters?.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(filters?.limit) || 10));

  const query: Record<string, unknown> = {
    status: "published",
    verificationStatus: "verified",
    $or: [
      { isGovernmentProgram: true },
      {
        opportunitySource: {
          $in: ["skill_india", "naps", "ncs", "state_mission", "govt_portal"],
        },
      },
    ],
  };

  if (filters?.state && filters.state.toLowerCase() !== "all") {
    query.state = new RegExp(`^${filters.state.trim()}$`, "i");
  }

  if (filters?.category && filters.category !== "all") {
    query.category = filters.category;
  }

  const [items, total] = await Promise.all([
    Opportunity.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Opportunity.countDocuments(query),
  ]);

  return {
    items: items as IOpportunity[],
    total,
    page,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Retrieves the list of all available states and districts with active opportunities and training centres.
 */
export async function getAvailableRegions(): Promise<IAvailableRegion[]> {
  await connectToDatabase();
  await ensureLocalSeedData();

  const [opps, centres] = await Promise.all([
    Opportunity.find(
      { status: "published", verificationStatus: "verified", state: { $exists: true, $ne: "" } },
      { state: 1, district: 1 }
    ).lean(),
    RegionalTrainingCentre.find(
      { verificationStatus: "verified" },
      { state: 1, district: 1 }
    ).lean(),
  ]);

  const stateMap = new Map<
    string,
    {
      districts: Map<string, { oppCount: number; centreCount: number }>;
      totalOpps: number;
      totalCentres: number;
    }
  >();

  // Aggregate opportunities
  for (const o of opps) {
    const s = o.state?.trim() || "Other";
    const d = o.district?.trim() || "General";

    if (!stateMap.has(s)) {
      stateMap.set(s, { districts: new Map(), totalOpps: 0, totalCentres: 0 });
    }
    const stateEntry = stateMap.get(s)!;
    stateEntry.totalOpps++;

    if (!stateEntry.districts.has(d)) {
      stateEntry.districts.set(d, { oppCount: 0, centreCount: 0 });
    }
    stateEntry.districts.get(d)!.oppCount++;
  }

  // Aggregate training centres
  for (const c of centres) {
    const s = c.state?.trim() || "Other";
    const d = c.district?.trim() || "General";

    if (!stateMap.has(s)) {
      stateMap.set(s, { districts: new Map(), totalOpps: 0, totalCentres: 0 });
    }
    const stateEntry = stateMap.get(s)!;
    stateEntry.totalCentres++;

    if (!stateEntry.districts.has(d)) {
      stateEntry.districts.set(d, { oppCount: 0, centreCount: 0 });
    }
    stateEntry.districts.get(d)!.centreCount++;
  }

  const regions: IAvailableRegion[] = [];
  for (const [state, data] of stateMap.entries()) {
    const districtsList = Array.from(data.districts.entries()).map(([name, counts]) => ({
      name,
      opportunityCount: counts.oppCount,
      trainingCentresCount: counts.centreCount,
    }));

    regions.push({
      state,
      districts: districtsList.sort((a, b) => b.opportunityCount - a.opportunityCount),
      totalOpportunities: data.totalOpps,
      totalTrainingCentres: data.totalCentres,
    });
  }

  return regions.sort((a, b) => b.totalOpportunities - a.totalOpportunities);
}
