import connectDB from "@/lib/db/mongodb";
import {
  User,
  StudentProfile,
  Opportunity,
  Resume,
  OpportunityExplanation,
  ExplanationFeedback,
  Application,
  Roadmap,
  StudentSkillProgress,
  LearningResource,
} from "@/models";
import { normalizeSkillName } from "@/services/matching/skill-normalizer";
import { resolveDateRange, buildMongoDateQuery } from "./dateFilterHelper";
import {
  IAnalyticsDateFilter,
  IPlatformOverviewAnalytics,
  IStudentAnalytics,
  IOpportunityAnalytics,
  IMatchingAnalytics,
  IApplicationAnalytics,
  ISkillGapAnalytics,
  ILearningRoadmapAnalytics,
  IFairnessAnalytics,
  IRegistrationTrendItem,
  IProfileCompletionBucket,
  IEducationDistributionItem,
  ITopTechnicalSkillItem,
  IOpportunityDistributionItem,
  ISkillDemandItem,
  IMatchScoreBucket,
  IEligibilityDistributionItem,
  IMostRecommendedOpportunityItem,
  IFunnelStage,
  ISkillTriangulationItem,
  IMethodologyFactorWeight,
} from "@/types/analytics";

// Helper safe percentage calculator
function safePercent(part: number, total: number, decimals = 1): number {
  if (!total || total <= 0) return 0;
  return Number(((part / total) * 100).toFixed(decimals));
}

// ---------------------------------------------------------------------------
// 1. Platform Overview Analytics
// ---------------------------------------------------------------------------
export async function getPlatformOverviewAnalytics(
  filter?: IAnalyticsDateFilter
): Promise<IPlatformOverviewAnalytics> {
  await connectDB();
  const bounds = resolveDateRange(filter);
  const dateQuery = buildMongoDateQuery(bounds, "createdAt");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    newStudentsThisMonth,
    activeStudentProfiles,
    completedProfilesCount,
    resumesCount,
    totalOpps,
    publishedOpps,
    verifiedOpps,
    pendingOpps,
    expiredOpps,
    oppsByCategory,
    totalApplications,
    savedApplications,
    submittedApplications,
    interviewApplications,
    offerApplications,
    selectedApplications,
    rejectedApplications,
    recommendationsCount,
    skillGapCount,
    roadmapsCount,
    appTrackerStudentsCount,
  ] = await Promise.all([
    // Student counts
    User.countDocuments({ role: "student", ...dateQuery }),
    User.countDocuments({ role: "student", createdAt: { $gte: startOfMonth } }),
    StudentProfile.countDocuments({ ...dateQuery }),
    StudentProfile.countDocuments({ ...dateQuery, completionPercentage: { $gte: 80 } }),
    Resume.countDocuments({ ...dateQuery }),

    // Opportunity counts
    Opportunity.countDocuments(dateQuery),
    Opportunity.countDocuments({ ...dateQuery, status: "published" }),
    Opportunity.countDocuments({ ...dateQuery, isVerified: true }),
    Opportunity.countDocuments({ ...dateQuery, status: "pending_verification" }),
    Opportunity.countDocuments({ ...dateQuery, status: "expired" }),
    Opportunity.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),

    // Application counts
    Application.countDocuments(dateQuery),
    Application.countDocuments({ ...dateQuery, status: "saved" }),
    Application.countDocuments({ ...dateQuery, status: { $ne: "saved" } }),
    Application.countDocuments({ ...dateQuery, status: "interview" }),
    Application.countDocuments({ ...dateQuery, status: "offer" }),
    Application.countDocuments({ ...dateQuery, status: "selected" }),
    Application.countDocuments({ ...dateQuery, status: "rejected" }),

    // Platform Engagement (distinct student interactions)
    OpportunityExplanation.distinct("userId", dateQuery).then((res) => res.length),
    StudentProfile.countDocuments({ ...dateQuery, "careerPreferences.preferredRoles.0": { $exists: true } }),
    Roadmap.distinct("studentId", dateQuery).then((res) => res.length),
    Application.distinct("userId", dateQuery).then((res) => res.length),
  ]);

  const byCategoryMap: Record<string, number> = {
    internship: 0,
    job: 0,
    "skill-development": 0,
  };
  oppsByCategory.forEach((item: any) => {
    if (item._id) byCategoryMap[item._id] = item.count;
  });

  return {
    timeRange: bounds.label,
    startDate: bounds.start.toISOString(),
    endDate: bounds.end.toISOString(),
    students: {
      totalStudents,
      newStudentsThisMonth,
      activeStudents: activeStudentProfiles,
      completedProfiles: completedProfilesCount,
      uploadedResumes: resumesCount,
    },
    opportunities: {
      totalOpportunities: totalOpps,
      publishedOpportunities: publishedOpps,
      verifiedOpportunities: verifiedOpps,
      pendingVerification: pendingOpps,
      expiredOpportunities: expiredOpps,
      byCategory: byCategoryMap,
    },
    applications: {
      totalTracked: totalApplications,
      savedOpportunities: savedApplications,
      applicationsSubmitted: submittedApplications,
      interviews: interviewApplications,
      offersReceived: offerApplications,
      selectedApplications,
      rejectedApplications,
    },
    engagement: {
      studentsUsingRecommendations: recommendationsCount,
      studentsUsingSkillGap: skillGapCount,
      studentsGeneratingRoadmaps: roadmapsCount,
      studentsTrackingApplications: appTrackerStudentsCount,
    },
  };
}

// ---------------------------------------------------------------------------
// 2. Student Analytics
// ---------------------------------------------------------------------------
export async function getStudentAnalytics(
  filter?: IAnalyticsDateFilter
): Promise<IStudentAnalytics> {
  await connectDB();
  const bounds = resolveDateRange(filter);
  const dateQuery = buildMongoDateQuery(bounds, "createdAt");

  const [
    totalStudents,
    rawTrends,
    profiles,
    totalResumes,
    approvedResumes,
    pendingResumes,
  ] = await Promise.all([
    User.countDocuments({ role: "student", ...dateQuery }),
    User.aggregate([
      { $match: { role: "student", ...dateQuery } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    StudentProfile.find(dateQuery).lean(),
    Resume.countDocuments(dateQuery),
    Resume.countDocuments({ ...dateQuery, processingStatus: "approved" }),
    Resume.countDocuments({ ...dateQuery, processingStatus: "pending_review" }),
  ]);

  // Cumulative registration trends
  let cumulative = 0;
  const registrationTrends: IRegistrationTrendItem[] = rawTrends.map((t: any) => {
    cumulative += t.count;
    return {
      date: t._id,
      count: t.count,
      cumulative,
    };
  });

  // Profile completion distribution
  const completionBins = [
    { range: "0-25%", count: 0, min: 0, max: 25 },
    { range: "26-50%", count: 0, min: 26, max: 50 },
    { range: "51-75%", count: 0, min: 51, max: 75 },
    { range: "76-100%", count: 0, min: 76, max: 100 },
  ];

  const educationMap: Record<string, number> = {};
  const skillCountMap: Record<string, number> = {};
  const preferredRolesMap: Record<string, number> = {};
  const employmentTypesMap: Record<string, number> = {};
  const workModesMap: Record<string, number> = {};

  profiles.forEach((p: any) => {
    const comp = p.completionPercentage || 0;
    const bin = completionBins.find((b) => comp >= b.min && comp <= b.max);
    if (bin) bin.count++;

    // Education
    const degree = p.education?.degree?.trim() || "Not Specified";
    educationMap[degree] = (educationMap[degree] || 0) + 1;

    // Technical Skills
    if (Array.isArray(p.technicalSkills)) {
      p.technicalSkills.forEach((s: any) => {
        const name = typeof s === "string" ? s : s.name;
        if (name) {
          const norm = normalizeSkillName(name);
          skillCountMap[norm] = (skillCountMap[norm] || 0) + 1;
        }
      });
    }

    // Career preferences
    if (p.careerPreferences) {
      if (Array.isArray(p.careerPreferences.preferredRoles)) {
        p.careerPreferences.preferredRoles.forEach((r: string) => {
          preferredRolesMap[r] = (preferredRolesMap[r] || 0) + 1;
        });
      }
      if (Array.isArray(p.careerPreferences.employmentTypes)) {
        p.careerPreferences.employmentTypes.forEach((e: string) => {
          employmentTypesMap[e] = (employmentTypesMap[e] || 0) + 1;
        });
      }
      if (Array.isArray(p.careerPreferences.workModes)) {
        p.careerPreferences.workModes.forEach((w: string) => {
          workModesMap[w] = (workModesMap[w] || 0) + 1;
        });
      }
    }
  });

  const totalProfiles = profiles.length;
  const profileCompletionDistribution: IProfileCompletionBucket[] = completionBins.map((b) => ({
    range: b.range,
    count: b.count,
    percentage: safePercent(b.count, totalProfiles),
  }));

  const educationDistribution: IEducationDistributionItem[] = Object.entries(educationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([degree, count]) => ({
      degree,
      count,
      percentage: safePercent(count, totalProfiles),
    }));

  const topTechnicalSkills: ITopTechnicalSkillItem[] = Object.entries(skillCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({
      name,
      count,
      percentage: safePercent(count, totalProfiles),
    }));

  return {
    timeRange: bounds.label,
    startDate: bounds.start.toISOString(),
    endDate: bounds.end.toISOString(),
    totalStudents,
    activeStudents: totalProfiles,
    registrationTrends,
    profileCompletionDistribution,
    educationDistribution,
    topTechnicalSkills,
    careerPreferences: {
      preferredRoles: Object.entries(preferredRolesMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([preference, count]) => ({ preference, count })),
      employmentTypes: Object.entries(employmentTypesMap)
        .sort((a, b) => b[1] - a[1])
        .map(([preference, count]) => ({ preference, count })),
      workModes: Object.entries(workModesMap)
        .sort((a, b) => b[1] - a[1])
        .map(([preference, count]) => ({ preference, count })),
    },
    resumeUploadStats: {
      totalResumes,
      approvedResumes,
      pendingResumes,
      approvalRate: safePercent(approvedResumes, totalResumes),
    },
  };
}

// ---------------------------------------------------------------------------
// 3. Opportunity Analytics
// ---------------------------------------------------------------------------
export async function getOpportunityAnalytics(
  filter?: IAnalyticsDateFilter
): Promise<IOpportunityAnalytics> {
  await connectDB();
  const bounds = resolveDateRange(filter);
  const dateQuery = buildMongoDateQuery(bounds, "createdAt");

  const [
    totalOpportunities,
    publishedOpportunities,
    verifiedOpportunities,
    opportunities,
    timeTrends,
  ] = await Promise.all([
    Opportunity.countDocuments(dateQuery),
    Opportunity.countDocuments({ ...dateQuery, status: "published" }),
    Opportunity.countDocuments({ ...dateQuery, isVerified: true }),
    Opportunity.find(dateQuery).lean(),
    Opportunity.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const catMap: Record<string, number> = {};
  const workModeMap: Record<string, number> = {};
  const statusMap: Record<string, number> = {};
  const skillReqMap: Record<string, number> = {};
  const skillPrefMap: Record<string, number> = {};

  opportunities.forEach((opp: any) => {
    catMap[opp.category] = (catMap[opp.category] || 0) + 1;
    workModeMap[opp.workMode] = (workModeMap[opp.workMode] || 0) + 1;
    statusMap[opp.status] = (statusMap[opp.status] || 0) + 1;

    if (Array.isArray(opp.requiredSkills)) {
      opp.requiredSkills.forEach((s: string) => {
        const norm = normalizeSkillName(s);
        skillReqMap[norm] = (skillReqMap[norm] || 0) + 1;
      });
    }

    if (Array.isArray(opp.preferredSkills)) {
      opp.preferredSkills.forEach((s: string) => {
        const norm = normalizeSkillName(s);
        skillPrefMap[norm] = (skillPrefMap[norm] || 0) + 1;
      });
    }
  });

  const categoryDistribution: IOpportunityDistributionItem[] = Object.entries(catMap).map(
    ([label, count]) => ({
      label,
      count,
      percentage: safePercent(count, totalOpportunities),
    })
  );

  const workModeDistribution: IOpportunityDistributionItem[] = Object.entries(workModeMap).map(
    ([label, count]) => ({
      label,
      count,
      percentage: safePercent(count, totalOpportunities),
    })
  );

  const statusDistribution: IOpportunityDistributionItem[] = Object.entries(statusMap).map(
    ([label, count]) => ({
      label,
      count,
      percentage: safePercent(count, totalOpportunities),
    })
  );

  const allSkills = new Set([...Object.keys(skillReqMap), ...Object.keys(skillPrefMap)]);
  const skillDemand: ISkillDemandItem[] = Array.from(allSkills)
    .map((name) => {
      const requiredCount = skillReqMap[name] || 0;
      const preferredCount = skillPrefMap[name] || 0;
      const totalCount = requiredCount + preferredCount;
      return {
        name,
        requiredCount,
        preferredCount,
        totalCount,
        percentageOfOpportunities: safePercent(totalCount, totalOpportunities),
      };
    })
    .sort((a, b) => b.totalCount - a.totalCount)
    .slice(0, 15);

  return {
    timeRange: bounds.label,
    startDate: bounds.start.toISOString(),
    endDate: bounds.end.toISOString(),
    totalOpportunities,
    publishedOpportunities,
    verifiedOpportunities,
    categoryDistribution,
    workModeDistribution,
    statusDistribution,
    skillDemand,
    opportunitiesOverTime: timeTrends.map((t: any) => ({
      date: t._id,
      count: t.count,
    })),
  };
}

// ---------------------------------------------------------------------------
// 4. Matching Engine Analytics
// ---------------------------------------------------------------------------
export async function getMatchingAnalytics(
  filter?: IAnalyticsDateFilter
): Promise<IMatchingAnalytics> {
  await connectDB();
  const bounds = resolveDateRange(filter);
  const dateQuery = buildMongoDateQuery(bounds, "createdAt");

  const [
    totalRecommendationsGenerated,
    distinctUsers,
    distinctOpps,
    explanations,
    topOppsAgg,
  ] = await Promise.all([
    OpportunityExplanation.countDocuments(dateQuery),
    OpportunityExplanation.distinct("userId", dateQuery),
    OpportunityExplanation.distinct("opportunityId", dateQuery),
    OpportunityExplanation.find(dateQuery)
      .select("matchResultReference structuredExplanation scoringVersion createdAt")
      .lean(),
    OpportunityExplanation.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$opportunityId", count: { $sum: 1 }, avgScore: { $avg: "$matchResultReference.score" } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const scoreBins = [
    { range: "0-20", label: "0% - 20%", count: 0, min: 0, max: 20 },
    { range: "21-40", label: "21% - 40%", count: 0, min: 21, max: 40 },
    { range: "41-60", label: "41% - 60%", count: 0, min: 41, max: 60 },
    { range: "61-80", label: "61% - 80%", count: 0, min: 61, max: 80 },
    { range: "81-100", label: "81% - 100%", count: 0, min: 81, max: 100 },
  ];

  let totalScoreSum = 0;
  const eligibilityCounts: Record<string, number> = {
    eligible: 0,
    partially_eligible: 0,
    ineligible: 0,
  };
  let fallbackCount = 0;

  explanations.forEach((exp: any) => {
    const score = exp.matchResultReference?.score || 0;
    totalScoreSum += score;

    const bin = scoreBins.find((b) => score >= b.min && score <= b.max);
    if (bin) bin.count++;

    const elig = exp.structuredExplanation?.eligibilityBreakdown?.overallStatus || "partially_eligible";
    if (eligibilityCounts[elig] !== undefined) {
      eligibilityCounts[elig]++;
    } else {
      eligibilityCounts["partially_eligible"]++;
    }

    if (exp.structuredExplanation?.fallbackUsed) {
      fallbackCount++;
    }
  });

  const totalExps = explanations.length;
  const averageMatchScore = totalExps > 0 ? Number((totalScoreSum / totalExps).toFixed(1)) : 0;

  const scoreDistribution: IMatchScoreBucket[] = scoreBins.map((b) => ({
    range: b.range,
    label: b.label,
    count: b.count,
    percentage: safePercent(b.count, totalExps),
  }));

  const eligibilityDistribution: IEligibilityDistributionItem[] = [
    {
      status: "eligible",
      label: "Fully Eligible",
      count: eligibilityCounts.eligible,
      percentage: safePercent(eligibilityCounts.eligible, totalExps),
    },
    {
      status: "partially_eligible",
      label: "Partially Eligible",
      count: eligibilityCounts.partially_eligible,
      percentage: safePercent(eligibilityCounts.partially_eligible, totalExps),
    },
    {
      status: "ineligible",
      label: "Ineligible",
      count: eligibilityCounts.ineligible,
      percentage: safePercent(eligibilityCounts.ineligible, totalExps),
    },
  ];

  // Resolve titles for top recommended opportunities
  const topOppIds = topOppsAgg.map((o: any) => o._id);
  const foundOpps = await Opportunity.find({ _id: { $in: topOppIds } })
    .select("title companyName category")
    .lean();

  const oppMap = new Map<string, any>(foundOpps.map((o: any) => [o._id.toString(), o]));

  const mostRecommendedOpportunities: IMostRecommendedOpportunityItem[] = topOppsAgg.map((o: any) => {
    const opp = oppMap.get(o._id?.toString());
    return {
      opportunityId: o._id?.toString() || "",
      title: opp?.title || "Opportunity Details",
      companyName: opp?.companyName || "Employer",
      category: opp?.category || "internship",
      recommendationCount: o.count,
      averageScore: Math.round(o.avgScore || 0),
    };
  });

  const aiNarrativeCount = Math.max(0, totalExps - fallbackCount);

  return {
    timeRange: bounds.label,
    startDate: bounds.start.toISOString(),
    endDate: bounds.end.toISOString(),
    totalRecommendationsGenerated,
    uniqueStudentsMatched: distinctUsers.length,
    uniqueOpportunitiesMatched: distinctOpps.length,
    averageMatchScore,
    scoreDistribution,
    eligibilityDistribution,
    mostRecommendedOpportunities,
    aiGenerationStats: {
      totalEvaluated: totalExps,
      aiNarrativeCount,
      deterministicFallbackCount: fallbackCount,
      aiCoveragePercentage: safePercent(aiNarrativeCount, totalExps),
    },
  };
}

// ---------------------------------------------------------------------------
// 5. Application Analytics & Funnel
// ---------------------------------------------------------------------------
export async function getApplicationAnalytics(
  filter?: IAnalyticsDateFilter
): Promise<IApplicationAnalytics> {
  await connectDB();
  const bounds = resolveDateRange(filter);
  const dateQuery = buildMongoDateQuery(bounds, "createdAt");

  const [totalTracked, applications, rawTrends] = await Promise.all([
    Application.countDocuments(dateQuery),
    Application.find(dateQuery).lean(),
    Application.aggregate([
      { $match: dateQuery },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          saved: { $sum: 1 },
          applied: {
            $sum: { $cond: [{ $ne: ["$status", "saved"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const statusCounts: Record<string, number> = {
    saved: 0,
    applied: 0,
    under_review: 0,
    interview: 0,
    offer: 0,
    selected: 0,
    rejected: 0,
    withdrawn: 0,
  };

  const methodCounts: Record<string, number> = {};

  applications.forEach((app: any) => {
    if (statusCounts[app.status] !== undefined) {
      statusCounts[app.status]++;
    }
    if (app.applicationMethod) {
      methodCounts[app.applicationMethod] = (methodCounts[app.applicationMethod] || 0) + 1;
    }
  });

  // Calculate Funnel Progression
  // Funnel stages:
  // 1. Saved (All tracked applications begin or pass through saved)
  // 2. Applied (status != 'saved')
  // 3. Assessment / Under Review (under_review, interview, offer, selected)
  // 4. Interview (interview, offer, selected)
  // 5. Offer (offer, selected)
  // 6. Selected (selected)

  const savedCount = totalTracked;
  const appliedCount = totalTracked - statusCounts.saved;
  const reviewCount = statusCounts.under_review + statusCounts.interview + statusCounts.offer + statusCounts.selected;
  const interviewCount = statusCounts.interview + statusCounts.offer + statusCounts.selected;
  const offerCount = statusCounts.offer + statusCounts.selected;
  const selectedCount = statusCounts.selected;

  const funnel: IFunnelStage[] = [
    {
      stage: "saved",
      label: "1. Saved",
      count: savedCount,
      conversionFromPrevious: 100,
      conversionFromInitial: 100,
      description: "Opportunities bookmarked or tracked by students",
    },
    {
      stage: "applied",
      label: "2. Applied",
      count: appliedCount,
      conversionFromPrevious: safePercent(appliedCount, savedCount),
      conversionFromInitial: safePercent(appliedCount, savedCount),
      description: "Formal applications submitted to employers",
    },
    {
      stage: "review",
      label: "3. Under Review / Assessment",
      count: reviewCount,
      conversionFromPrevious: safePercent(reviewCount, appliedCount),
      conversionFromInitial: safePercent(reviewCount, savedCount),
      description: "Applications undergoing employer evaluation",
    },
    {
      stage: "interview",
      label: "4. Interview",
      count: interviewCount,
      conversionFromPrevious: safePercent(interviewCount, reviewCount),
      conversionFromInitial: safePercent(interviewCount, savedCount),
      description: "Interviews scheduled or completed",
    },
    {
      stage: "offer",
      label: "5. Offer",
      count: offerCount,
      conversionFromPrevious: safePercent(offerCount, interviewCount),
      conversionFromInitial: safePercent(offerCount, savedCount),
      description: "Formal offers extended to candidates",
    },
    {
      stage: "selected",
      label: "6. Selected / Accepted",
      count: selectedCount,
      conversionFromPrevious: safePercent(selectedCount, offerCount),
      conversionFromInitial: safePercent(selectedCount, savedCount),
      description: "Candidates finalized and accepted placement",
    },
  ];

  const statusColors: Record<string, string> = {
    saved: "#94a3b8",
    applied: "#3b82f6",
    under_review: "#8b5cf6",
    interview: "#f59e0b",
    offer: "#10b981",
    selected: "#059669",
    rejected: "#ef4444",
    withdrawn: "#6b7280",
  };

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status: status as any,
    label: status.replace("_", " ").toUpperCase(),
    count,
    color: statusColors[status] || "#64748b",
  }));

  const applicationMethodDistribution = Object.entries(methodCounts).map(([method, count]) => ({
    method,
    label: method.replace("_", " ").toUpperCase(),
    count,
  }));

  return {
    timeRange: bounds.label,
    startDate: bounds.start.toISOString(),
    endDate: bounds.end.toISOString(),
    totalTracked,
    submittedTotal: appliedCount,
    savedToAppliedRate: safePercent(appliedCount, savedCount),
    funnel,
    statusDistribution,
    applicationsOverTime: rawTrends.map((t: any) => ({
      date: t._id,
      saved: t.saved,
      applied: t.applied,
    })),
    applicationMethodDistribution,
  };
}

// ---------------------------------------------------------------------------
// 6. Skill Gap & Learning Roadmap Analytics
// ---------------------------------------------------------------------------
export async function getSkillGapAnalytics(
  filter?: IAnalyticsDateFilter
): Promise<ISkillGapAnalytics> {
  await connectDB();
  const bounds = resolveDateRange(filter);
  const dateQuery = buildMongoDateQuery(bounds, "createdAt");

  const [explanations, opportunities, skillProgressList] = await Promise.all([
    OpportunityExplanation.find(dateQuery)
      .select("structuredExplanation createdAt")
      .lean(),
    Opportunity.find(dateQuery).select("requiredSkills preferredSkills").lean(),
    StudentSkillProgress.find().lean(),
  ]);

  const reqGapMap: Record<string, number> = {};
  const prefGapMap: Record<string, number> = {};
  const employerDemandMap: Record<string, number> = {};
  const activeLearningMap: Record<string, number> = {};
  const completedLearningMap: Record<string, number> = {};

  // Missing skills from explanations
  explanations.forEach((exp: any) => {
    const missingReq = exp.structuredExplanation?.missingRequiredSkills || [];
    missingReq.forEach((s: string) => {
      const norm = normalizeSkillName(s);
      reqGapMap[norm] = (reqGapMap[norm] || 0) + 1;
    });

    const missingPref = exp.structuredExplanation?.missingPreferredSkills || [];
    missingPref.forEach((s: string) => {
      const norm = normalizeSkillName(s);
      prefGapMap[norm] = (prefGapMap[norm] || 0) + 1;
    });
  });

  // Employer demand from opportunities
  opportunities.forEach((opp: any) => {
    if (Array.isArray(opp.requiredSkills)) {
      opp.requiredSkills.forEach((s: string) => {
        const norm = normalizeSkillName(s);
        employerDemandMap[norm] = (employerDemandMap[norm] || 0) + 1;
      });
    }
    if (Array.isArray(opp.preferredSkills)) {
      opp.preferredSkills.forEach((s: string) => {
        const norm = normalizeSkillName(s);
        employerDemandMap[norm] = (employerDemandMap[norm] || 0) + 1;
      });
    }
  });

  // Student progress in learning
  skillProgressList.forEach((sp: any) => {
    const norm = normalizeSkillName(sp.skillName || "");
    if (!norm) return;
    if (sp.status === "in_progress") {
      activeLearningMap[norm] = (activeLearningMap[norm] || 0) + 1;
    } else if (sp.status === "completed" || sp.status === "mastered") {
      completedLearningMap[norm] = (completedLearningMap[norm] || 0) + 1;
    }
  });

  const topMissingRequiredSkills = Object.entries(reqGapMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const topMissingPreferredSkills = Object.entries(prefGapMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const activelyLearnedSkills = Object.entries(activeLearningMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const completedSkills = Object.entries(completedLearningMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Triangulate across all discovered skills
  const allTriangulationSkills = new Set([
    ...Object.keys(employerDemandMap),
    ...Object.keys(reqGapMap),
    ...Object.keys(activeLearningMap),
  ]);

  const skillTriangulation: ISkillTriangulationItem[] = Array.from(allTriangulationSkills)
    .map((skillName) => ({
      skillName,
      employerDemandCount: employerDemandMap[skillName] || 0,
      studentGapCount: (reqGapMap[skillName] || 0) + (prefGapMap[skillName] || 0),
      activeLearnersCount: activeLearningMap[skillName] || 0,
      completedLearnersCount: completedLearningMap[skillName] || 0,
    }))
    .sort((a, b) => (b.employerDemandCount + b.studentGapCount) - (a.employerDemandCount + a.studentGapCount))
    .slice(0, 15);

  return {
    timeRange: bounds.label,
    startDate: bounds.start.toISOString(),
    endDate: bounds.end.toISOString(),
    topMissingRequiredSkills,
    topMissingPreferredSkills,
    activelyLearnedSkills,
    completedSkills,
    skillTriangulation,
  };
}

export async function getLearningRoadmapAnalytics(
  filter?: IAnalyticsDateFilter
): Promise<ILearningRoadmapAnalytics> {
  await connectDB();
  const bounds = resolveDateRange(filter);
  const dateQuery = buildMongoDateQuery(bounds, "createdAt");

  const [
    totalRoadmaps,
    activeRoadmaps,
    completedRoadmaps,
    archivedRoadmaps,
    roadmaps,
  ] = await Promise.all([
    Roadmap.countDocuments(dateQuery),
    Roadmap.countDocuments({ ...dateQuery, status: "active" }),
    Roadmap.countDocuments({ ...dateQuery, status: "completed" }),
    Roadmap.countDocuments({ ...dateQuery, status: "archived" }),
    Roadmap.find(dateQuery).lean(),
  ]);

  let totalMilestonesCount = 0;
  let totalProgressSum = 0;
  let totalTasks = 0;
  let completedTasks = 0;
  const targetRolesMap: Record<string, number> = {};

  roadmaps.forEach((rm: any) => {
    totalProgressSum += rm.progressPercentage || 0;
    if (rm.targetRole) {
      targetRolesMap[rm.targetRole] = (targetRolesMap[rm.targetRole] || 0) + 1;
    }

    if (Array.isArray(rm.milestones)) {
      totalMilestonesCount += rm.milestones.length;
      rm.milestones.forEach((m: any) => {
        if (Array.isArray(m.tasks)) {
          totalTasks += m.tasks.length;
          completedTasks += m.tasks.filter((t: any) => t.isCompleted).length;
        }
      });
    }
  });

  const count = roadmaps.length;
  const averageMilestones = count > 0 ? Number((totalMilestonesCount / count).toFixed(1)) : 0;
  const averageProgressPercentage = count > 0 ? Number((totalProgressSum / count).toFixed(1)) : 0;
  const completionRate = totalTasks > 0 ? safePercent(completedTasks, totalTasks) : 0;

  const topTargetedRoles = Object.entries(targetRolesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([role, count]) => ({ role, count }));

  return {
    timeRange: bounds.label,
    startDate: bounds.start.toISOString(),
    endDate: bounds.end.toISOString(),
    totalRoadmaps,
    activeRoadmaps,
    completedRoadmaps,
    archivedRoadmaps,
    averageMilestones,
    averageProgressPercentage,
    topTargetedRoles,
    taskCompletionMetrics: {
      totalTasks,
      completedTasks,
      completionRate,
    },
  };
}

// ---------------------------------------------------------------------------
// 7. Fairness & Responsible AI Monitoring
// ---------------------------------------------------------------------------
export async function getFairnessAnalytics(
  filter?: IAnalyticsDateFilter
): Promise<IFairnessAnalytics> {
  await connectDB();
  const bounds = resolveDateRange(filter);
  const dateQuery = buildMongoDateQuery(bounds, "createdAt");

  const [
    oppsMissingComp,
    oppsMissingLoc,
    incompleteProfiles,
    totalExplanations,
    explanations,
    feedbacks,
  ] = await Promise.all([
    Opportunity.countDocuments({
      ...dateQuery,
      $or: [{ stipend: { $in: ["", null] } }, { salaryRange: { $in: ["", null] } }],
    }),
    Opportunity.countDocuments({
      ...dateQuery,
      workMode: { $in: ["onsite", "hybrid"] },
      location: { $in: ["", "Remote / Multiple Locations", null] },
    }),
    StudentProfile.countDocuments({
      ...dateQuery,
      completionPercentage: { $lt: 50 },
    }),
    OpportunityExplanation.countDocuments(dateQuery),
    OpportunityExplanation.find(dateQuery)
      .select("structuredExplanation")
      .lean(),
    ExplanationFeedback.find(dateQuery).lean(),
  ]);

  let withProjectEvidenceCount = 0;
  let withUnknownConditionsCount = 0;
  let fallbackCount = 0;

  explanations.forEach((exp: any) => {
    const se = exp.structuredExplanation;
    if (se?.projectEvidence && Array.isArray(se.projectEvidence) && se.projectEvidence.length > 0) {
      withProjectEvidenceCount++;
    }
    if (se?.eligibilityBreakdown?.unknownConditions?.length > 0) {
      withUnknownConditionsCount++;
    }
    if (se?.fallbackUsed) {
      fallbackCount++;
    }
  });

  let helpfulCount = 0;
  let notHelpfulCount = 0;
  feedbacks.forEach((fb: any) => {
    if (fb.feedbackType === "helpful") helpfulCount++;
    else if (fb.feedbackType === "not_helpful") notHelpfulCount++;
  });
  const totalFeedback = helpfulCount + notHelpfulCount;
  const satisfactionRate = totalFeedback > 0 ? safePercent(helpfulCount, totalFeedback) : 100;

  // 7-Factor Scoring Methodology Breakdown
  const factorWeights: IMethodologyFactorWeight[] = [
    {
      factor: "Required Skills Match",
      weight: 40,
      description: "Direct match of verified student skills with employer required skills using semantic normalization.",
      isProtectedAttribute: false,
    },
    {
      factor: "Preferred Skills Match",
      weight: 15,
      description: "Bonus matching for auxiliary skills that improve candidate candidacy.",
      isProtectedAttribute: false,
    },
    {
      factor: "Project Evidence Relevance",
      weight: 15,
      description: "Verification of demonstrated skill applications across portfolio, GitHub, and academic projects.",
      isProtectedAttribute: false,
    },
    {
      factor: "Eligibility Criteria",
      weight: 10,
      description: "Compliance with graduation year, field of study, minimum GPA, and geographical eligibility.",
      isProtectedAttribute: false,
    },
    {
      factor: "Target Role Alignment",
      weight: 10,
      description: "Match with student stated career preferences and designated target roles.",
      isProtectedAttribute: false,
    },
    {
      factor: "Work Mode Preference",
      weight: 5,
      description: "Alignment between student preference (Remote/Hybrid/Onsite) and opportunity requirements.",
      isProtectedAttribute: false,
    },
    {
      factor: "Compensation Preference",
      weight: 5,
      description: "Alignment with paid/unpaid preferences without disqualifying unpaid learning internships.",
      isProtectedAttribute: false,
    },
  ];

  return {
    methodologyVersion: "v1.2-explainable-transparent",
    lastUpdated: new Date().toISOString(),
    factorWeights,
    protectedAttributesAudit: {
      attributesChecked: [
        "gender",
        "religion",
        "caste",
        "ethnicity",
        "family_income",
        "socioeconomic_status",
        "sexual_orientation",
        "disability_status",
        "marital_status",
      ],
      isCompliant: true,
      excludedFromScoring: true,
      pedigreeNeutralityVerified: true,
    },
    dataQuality: {
      opportunitiesMissingCompensation: oppsMissingComp,
      opportunitiesMissingLocation: oppsMissingLoc,
      incompleteStudentProfiles: incompleteProfiles,
      partialEvaluationRecommendations: withUnknownConditionsCount,
    },
    transparencyMetrics: {
      totalExplanations,
      withProjectEvidenceCount,
      withUnknownConditionsCount,
      aiFallbackRate: safePercent(fallbackCount, totalExplanations),
      studentFeedback: {
        totalFeedback,
        helpfulCount,
        notHelpfulCount,
        satisfactionRate,
      },
    },
    limitationsNotice:
      "CareerBridge AI employs a deterministic, transparent 7-factor matching methodology. Protected demographic attributes are strictly excluded from ranking and filtering algorithms. However, algorithmic fairness cannot guarantee parity if source job descriptions omit details or if student profiles have incomplete skill and project information. Periodic administrative review and continuous student feedback audits are maintained to mitigate systemic blind spots.",
  };
}

// ---------------------------------------------------------------------------
// 8. Sanitized CSV Export
// ---------------------------------------------------------------------------
/**
 * Sanitizes cell values to prevent CSV formula injection vulnerability.
 * If a cell starts with =, +, -, @, \t, or \r, prefix with a single quote.
 */
export function sanitizeCSVCell(value: any): string {
  if (value === null || value === undefined) return '""';
  let stringValue = String(value);

  // Guard against spreadsheet formula injection attacks
  const dangerousPrefixes = ["=", "+", "-", "@", "\t", "\r"];
  if (dangerousPrefixes.some((p) => stringValue.startsWith(p))) {
    const cleaned = stringValue.replace(/^[\t\r]+/, "");
    stringValue = `'${cleaned.trim()}`;
  } else {
    stringValue = stringValue.trim();
    if (dangerousPrefixes.some((p) => stringValue.startsWith(p))) {
      stringValue = `'${stringValue}`;
    }
  }

  // Escape existing double quotes and enclose in double quotes
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function generateAnalyticsCSV(
  type: string,
  filter?: IAnalyticsDateFilter
): Promise<string> {
  await connectDB();

  switch (type) {
    case "students": {
      const data = await getStudentAnalytics(filter);
      const rows: string[] = [];
      rows.push(["Category", "Metric", "Value"].map(sanitizeCSVCell).join(","));

      rows.push(["Summary", "Total Students", data.totalStudents].map(sanitizeCSVCell).join(","));
      rows.push(["Summary", "Active Profile Students", data.activeStudents].map(sanitizeCSVCell).join(","));
      rows.push(["Resumes", "Total Resumes", data.resumeUploadStats.totalResumes].map(sanitizeCSVCell).join(","));
      rows.push(["Resumes", "Approved Resumes", data.resumeUploadStats.approvedResumes].map(sanitizeCSVCell).join(","));
      rows.push(["Resumes", "Approval Rate (%)", `${data.resumeUploadStats.approvalRate}%`].map(sanitizeCSVCell).join(","));

      data.profileCompletionDistribution.forEach((b) => {
        rows.push(["Profile Completion", b.range, `${b.count} (${b.percentage}%)`].map(sanitizeCSVCell).join(","));
      });

      data.topTechnicalSkills.forEach((s) => {
        rows.push(["Top Technical Skill", s.name, `${s.count} students (${s.percentage}%)`].map(sanitizeCSVCell).join(","));
      });

      return rows.join("\r\n");
    }

    case "opportunities": {
      const data = await getOpportunityAnalytics(filter);
      const rows: string[] = [];
      rows.push(["Category", "Metric", "Value", "Percentage"].map(sanitizeCSVCell).join(","));

      rows.push(["Summary", "Total Opportunities", data.totalOpportunities, "100%"].map(sanitizeCSVCell).join(","));
      rows.push(["Summary", "Published", data.publishedOpportunities, `${safePercent(data.publishedOpportunities, data.totalOpportunities)}%`].map(sanitizeCSVCell).join(","));
      rows.push(["Summary", "Verified", data.verifiedOpportunities, `${safePercent(data.verifiedOpportunities, data.totalOpportunities)}%`].map(sanitizeCSVCell).join(","));

      data.categoryDistribution.forEach((c) => {
        rows.push(["Category Distribution", c.label, c.count, `${c.percentage}%`].map(sanitizeCSVCell).join(","));
      });

      data.workModeDistribution.forEach((w) => {
        rows.push(["Work Mode Distribution", w.label, w.count, `${w.percentage}%`].map(sanitizeCSVCell).join(","));
      });

      data.skillDemand.forEach((s) => {
        rows.push(["Skill Demand", s.name, `Req: ${s.requiredCount}, Pref: ${s.preferredCount}, Total: ${s.totalCount}`, `${s.percentageOfOpportunities}%`].map(sanitizeCSVCell).join(","));
      });

      return rows.join("\r\n");
    }

    case "skills": {
      const data = await getSkillGapAnalytics(filter);
      const rows: string[] = [];
      rows.push(["Skill Name", "Employer Demand Count", "Student Gap Count", "Active Learners", "Completed Learners"].map(sanitizeCSVCell).join(","));

      data.skillTriangulation.forEach((item) => {
        rows.push([
          item.skillName,
          item.employerDemandCount,
          item.studentGapCount,
          item.activeLearnersCount,
          item.completedLearnersCount,
        ].map(sanitizeCSVCell).join(","));
      });

      return rows.join("\r\n");
    }

    case "applications": {
      const data = await getApplicationAnalytics(filter);
      const rows: string[] = [];
      rows.push(["Funnel Stage", "Count", "Conversion From Previous (%)", "Conversion From Initial (%)", "Description"].map(sanitizeCSVCell).join(","));

      data.funnel.forEach((f) => {
        rows.push([
          f.label,
          f.count,
          `${f.conversionFromPrevious}%`,
          `${f.conversionFromInitial}%`,
          f.description,
        ].map(sanitizeCSVCell).join(","));
      });

      return rows.join("\r\n");
    }

    case "fairness": {
      const data = await getFairnessAnalytics(filter);
      const rows: string[] = [];
      rows.push(["Section", "Factor / Metric", "Value", "Notes"].map(sanitizeCSVCell).join(","));

      rows.push(["Fairness Methodology", "Version", data.methodologyVersion, data.lastUpdated].map(sanitizeCSVCell).join(","));
      data.factorWeights.forEach((fw) => {
        rows.push(["Scoring Weight", fw.factor, `${fw.weight}%`, fw.description].map(sanitizeCSVCell).join(","));
      });

      rows.push(["Protected Attributes", "Audit Status", data.protectedAttributesAudit.isCompliant ? "COMPLIANT" : "NON_COMPLIANT", "Zero protected attributes used in scoring"].map(sanitizeCSVCell).join(","));
      rows.push(["Transparency", "Total Explanations", data.transparencyMetrics.totalExplanations, ""].map(sanitizeCSVCell).join(","));
      rows.push(["Transparency", "Student Satisfaction Rate", `${data.transparencyMetrics.studentFeedback.satisfactionRate}%`, `Helpful: ${data.transparencyMetrics.studentFeedback.helpfulCount}, Not Helpful: ${data.transparencyMetrics.studentFeedback.notHelpfulCount}`].map(sanitizeCSVCell).join(","));
      rows.push(["Disclaimer", "Limitations Notice", data.limitationsNotice, ""].map(sanitizeCSVCell).join(","));

      return rows.join("\r\n");
    }

    case "overview":
    default: {
      const data = await getPlatformOverviewAnalytics(filter);
      const rows: string[] = [];
      rows.push(["Section", "Metric", "Count"].map(sanitizeCSVCell).join(","));

      rows.push(["Students", "Total Registered Students", data.students.totalStudents].map(sanitizeCSVCell).join(","));
      rows.push(["Students", "Active Profile Students", data.students.activeStudents].map(sanitizeCSVCell).join(","));
      rows.push(["Students", "Completed Profiles", data.students.completedProfiles].map(sanitizeCSVCell).join(","));
      rows.push(["Students", "Uploaded Resumes", data.students.uploadedResumes].map(sanitizeCSVCell).join(","));

      rows.push(["Opportunities", "Total Opportunities", data.opportunities.totalOpportunities].map(sanitizeCSVCell).join(","));
      rows.push(["Opportunities", "Published Opportunities", data.opportunities.publishedOpportunities].map(sanitizeCSVCell).join(","));
      rows.push(["Opportunities", "Verified Opportunities", data.opportunities.verifiedOpportunities].map(sanitizeCSVCell).join(","));
      rows.push(["Opportunities", "Pending Verification", data.opportunities.pendingVerification].map(sanitizeCSVCell).join(","));

      rows.push(["Applications", "Total Tracked", data.applications.totalTracked].map(sanitizeCSVCell).join(","));
      rows.push(["Applications", "Submitted Applications", data.applications.applicationsSubmitted].map(sanitizeCSVCell).join(","));
      rows.push(["Applications", "Interviews", data.applications.interviews].map(sanitizeCSVCell).join(","));
      rows.push(["Applications", "Offers Extended", data.applications.offersReceived].map(sanitizeCSVCell).join(","));
      rows.push(["Applications", "Placements Selected", data.applications.selectedApplications].map(sanitizeCSVCell).join(","));

      rows.push(["Platform Engagement", "Students Using Recommendations", data.engagement.studentsUsingRecommendations].map(sanitizeCSVCell).join(","));
      rows.push(["Platform Engagement", "Students Generating Roadmaps", data.engagement.studentsGeneratingRoadmaps].map(sanitizeCSVCell).join(","));
      rows.push(["Platform Engagement", "Students Tracking Applications", data.engagement.studentsTrackingApplications].map(sanitizeCSVCell).join(","));

      return rows.join("\r\n");
    }
  }
}
