import connectDB from "@/lib/db/mongodb";
import { Opportunity } from "@/models/Opportunity";
import { getCareerPathByIdOrSlug } from "./career-path.service";
import {
  getAggregatedStudentProfile,
  calculateCareerReadiness,
} from "./career-readiness.service";
import { generateSimulationExplanation } from "./career-ai.service";
import {
  IWhatIfSimulationResult,
  ISimulatedOpportunityDelta,
} from "@/types/career-path";
import { normalizeSkill, areSkillsEquivalent } from "@/services/matching/skill-normalizer";

const SAFETY_DISCLAIMER =
  "HYPOTHETICAL SIMULATION ONLY. This simulation models the impact of prospective skill acquisition. It does NOT modify your real student profile, does NOT alter official qualifications, and does NOT claim you have mastered these skills.";

export async function runCareerWhatIfSimulation(
  userId: string,
  careerPathId: string,
  hypotheticalSkills: string[] = []
): Promise<IWhatIfSimulationResult> {
  await connectDB();

  const careerPath = await getCareerPathByIdOrSlug(careerPathId);
  if (!careerPath) {
    throw new Error(`Career path '${careerPathId}' not found.`);
  }

  // 1. Gather baseline student profile
  const studentData = await getAggregatedStudentProfile(userId);

  // 2. Clean & normalize hypothetical skills
  const cleanHypothetical = Array.from(
    new Set(
      hypotheticalSkills
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map((s) => normalizeSkill(s))
    )
  );

  // 3. Compute baseline alignment vs simulated alignment
  const baselineAlignment = calculateCareerReadiness(careerPath, studentData, []);
  const simulatedAlignment = calculateCareerReadiness(
    careerPath,
    studentData,
    cleanHypothetical
  );

  const alignmentDelta = simulatedAlignment.overallScore - baselineAlignment.overallScore;

  // 4. Identify newly satisfied skills
  const newlySatisfiedRequiredSkills = simulatedAlignment.skills.matchedRequired.filter(
    (skill) => !baselineAlignment.skills.matchedRequired.some((b) => areSkillsEquivalent(b, skill))
  );

  const newlySatisfiedPreferredSkills = simulatedAlignment.skills.matchedPreferred.filter(
    (skill) => !baselineAlignment.skills.matchedPreferred.some((b) => areSkillsEquivalent(b, skill))
  );

  const remainingMissingRequiredSkills = simulatedAlignment.skills.missingRequired;
  const remainingMissingPreferredSkills = simulatedAlignment.skills.missingPreferred;

  // 5. Calculate Opportunity Impact Delta
  // Find published opportunities relevant to this career path or containing these skills
  const opportunities = await Opportunity.find({
    status: "published",
    $or: [
      { category: { $in: ["job", "internship"] } },
      { requiredSkills: { $in: careerPath.requiredSkills } },
    ],
  })
    .limit(20)
    .lean();

  const combinedStudentSkills = new Set<string>(studentData.allSkillNames);
  const hypotheticalSet = new Set<string>(cleanHypothetical);
  const simulatedAllSkills = new Set<string>([...combinedStudentSkills, ...hypotheticalSet]);

  const topImpactedOpportunities: ISimulatedOpportunityDelta[] = [];

  opportunities.forEach((opp: any) => {
    const oppReqSkills = (opp.requiredSkills || []).map((s: string) => normalizeSkill(s));
    if (oppReqSkills.length === 0) return;

    // Baseline match
    const baseMatched = oppReqSkills.filter((req: string) =>
      Array.from(combinedStudentSkills).some((st) => areSkillsEquivalent(req, st))
    );
    const baseScore = Math.round((baseMatched.length / oppReqSkills.length) * 100);

    // Simulated match
    const simMatched = oppReqSkills.filter((req: string) =>
      Array.from(simulatedAllSkills).some((st) => areSkillsEquivalent(req, st))
    );
    const simScore = Math.round((simMatched.length / oppReqSkills.length) * 100);

    const scoreDelta = simScore - baseScore;
    const oppNewlySatisfied = simMatched.filter(
      (m: string) => !baseMatched.some((bm: string) => areSkillsEquivalent(bm, m))
    );

    if (scoreDelta > 0 || (cleanHypothetical.length === 0 && baseScore > 0)) {
      topImpactedOpportunities.push({
        opportunityId: opp._id.toString(),
        title: opp.title,
        companyName: opp.companyName,
        category: opp.category,
        originalScore: baseScore,
        simulatedScore: simScore,
        scoreDelta,
        newlySatisfiedSkills: oppNewlySatisfied,
      });
    }
  });

  // Sort by scoreDelta descending, then simulatedScore descending
  topImpactedOpportunities.sort((a, b) => b.scoreDelta - a.scoreDelta || b.simulatedScore - a.simulatedScore);

  // 6. Generate AI Explanation
  const aiExplanation = await generateSimulationExplanation(
    careerPath,
    baselineAlignment,
    simulatedAlignment,
    cleanHypothetical
  );

  return {
    isSimulated: true,
    safetyDisclaimer: SAFETY_DISCLAIMER,
    careerPathId: careerPath.id || careerPath._id?.toString() || "",
    careerTitle: careerPath.title,
    hypotheticalSkillsAdded: cleanHypothetical,
    baselineAlignment,
    simulatedAlignment,
    alignmentDelta,
    newlySatisfiedRequiredSkills,
    newlySatisfiedPreferredSkills,
    remainingMissingRequiredSkills,
    remainingMissingPreferredSkills,
    opportunityImpact: {
      totalEvaluated: opportunities.length,
      improvedOpportunitiesCount: topImpactedOpportunities.filter((o) => o.scoreDelta > 0).length,
      topImpactedOpportunities: topImpactedOpportunities.slice(0, 5),
    },
    aiExplanation,
    calculatedAt: new Date().toISOString(),
  };
}
