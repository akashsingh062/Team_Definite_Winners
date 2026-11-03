import connectDB from "@/lib/db/mongodb";
import { Opportunity } from "@/models/Opportunity";
import { getCareerPathByIdOrSlug } from "./career-path.service";
import {
  getAggregatedStudentProfile,
  calculateCareerReadiness,
} from "./career-readiness.service";
import { generateCareerComparisonExplanation } from "./career-ai.service";
import {
  ICareerComparisonResult,
  ICareerComparisonItem,
} from "@/types/career-path";
import { normalizeSkill, areSkillsEquivalent } from "@/services/matching/skill-normalizer";

export async function compareCareerPaths(
  userId: string,
  careerPathIds: string[]
): Promise<ICareerComparisonResult> {
  await connectDB();

  if (!Array.isArray(careerPathIds) || careerPathIds.length === 0) {
    throw new Error("At least one career path must be provided for comparison.");
  }

  if (careerPathIds.length > 3) {
    throw new Error("A maximum of 3 career paths can be compared simultaneously.");
  }

  const studentData = await getAggregatedStudentProfile(userId);
  const comparisonItems: ICareerComparisonItem[] = [];

  for (const idOrSlug of careerPathIds) {
    const cp = await getCareerPathByIdOrSlug(idOrSlug);
    if (!cp) continue;

    const alignment = calculateCareerReadiness(cp, studentData, []);

    // Count related published opportunities in DB
    const oppCount = await Opportunity.countDocuments({
      status: "published",
      $or: [
        { requiredSkills: { $in: cp.requiredSkills } },
        { title: { $regex: cp.title, $options: "i" } },
      ],
    });

    const missingCount = alignment.skills.missingRequired.length;
    let effortEstimate = "~2-4 weeks (High Skill Synergy)";
    if (missingCount >= 4) {
      effortEstimate = "~3-5 months (Comprehensive Pathway)";
    } else if (missingCount >= 2) {
      effortEstimate = "~1-2 months (Moderate Ramp-up)";
    }

    comparisonItems.push({
      careerPath: cp,
      alignment,
      relatedOpportunitiesCount: oppCount,
      learningEffortEstimate: effortEstimate,
    });
  }

  if (comparisonItems.length === 0) {
    throw new Error("None of the specified career paths were found.");
  }

  // Find common skills required across all selected career paths
  const allReqSkillLists = comparisonItems.map((item) =>
    item.careerPath.requiredSkills.map((s) => normalizeSkill(s))
  );

  const commonSkills = allReqSkillLists[0].filter((skill) =>
    allReqSkillLists.every((otherList) =>
      otherList.some((os) => areSkillsEquivalent(skill, os))
    )
  );

  // Find distinct skills per career path
  const distinctSkillsByCareer: Record<string, string[]> = {};
  comparisonItems.forEach((item) => {
    const mySkills = item.careerPath.requiredSkills.map((s) => normalizeSkill(s));
    const others = comparisonItems
      .filter((other) => other.careerPath.id !== item.careerPath.id)
      .flatMap((other) => other.careerPath.requiredSkills.map((s) => normalizeSkill(s)));

    distinctSkillsByCareer[item.careerPath.title] = mySkills.filter(
      (ms) => !others.some((os) => areSkillsEquivalent(ms, os))
    );
  });

  const aiSynthesis = await generateCareerComparisonExplanation(comparisonItems);

  return {
    careers: comparisonItems,
    commonSkills,
    distinctSkillsByCareer,
    aiSynthesis,
    comparedAt: new Date().toISOString(),
  };
}

