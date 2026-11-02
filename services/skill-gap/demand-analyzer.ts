import { normalizeSkill, areSkillsEquivalent } from "../matching/skill-normalizer";
import { IOpportunity } from "@/types/opportunity";
import { IOpportunitySkillRef } from "@/types/skill-gap";

export interface ISkillDemandData {
  skillName: string;
  category: string;
  opportunityCount: number;
  requiredByCount: number;
  preferredByCount: number;
  demandPercentage: number;
  isMandatory: boolean;
  relevantOpportunities: IOpportunitySkillRef[];
}

/**
 * Infers category for a skill from common industry naming conventions.
 */
export function inferSkillCategory(skillName: string): string {
  const norm = skillName.toLowerCase();
  if (
    norm.includes("javascript") ||
    norm.includes("typescript") ||
    norm.includes("python") ||
    norm.includes("java") ||
    norm.includes("c++") ||
    norm.includes("c#") ||
    norm.includes("go") ||
    norm.includes("rust")
  ) {
    return "Programming languages";
  }

  if (
    norm.includes("react") ||
    norm.includes("vue") ||
    norm.includes("angular") ||
    norm.includes("html") ||
    norm.includes("css") ||
    norm.includes("tailwind") ||
    norm.includes("next.js") ||
    norm.includes("redux")
  ) {
    return "Frontend technologies";
  }

  if (
    norm.includes("node") ||
    norm.includes("express") ||
    norm.includes("django") ||
    norm.includes("fastapi") ||
    norm.includes("spring") ||
    norm.includes("graphql") ||
    norm.includes("rest")
  ) {
    return "Backend technologies";
  }

  if (
    norm.includes("sql") ||
    norm.includes("mongo") ||
    norm.includes("postgres") ||
    norm.includes("redis") ||
    norm.includes("database")
  ) {
    return "Databases";
  }

  if (
    norm.includes("docker") ||
    norm.includes("git") ||
    norm.includes("kubernetes") ||
    norm.includes("ci/cd") ||
    norm.includes("linux")
  ) {
    return "Development tools";
  }

  if (
    norm.includes("aws") ||
    norm.includes("gcp") ||
    norm.includes("azure") ||
    norm.includes("cloud")
  ) {
    return "Cloud technologies";
  }

  return "Other technical skills";
}

/**
 * Analyzes skill demand across an array of selected opportunities.
 */
export function analyzeMultiOpportunityDemand(
  opportunities: Partial<IOpportunity>[]
): {
  skillDemands: ISkillDemandData[];
  commonSkills: string[];
  totalOpportunities: number;
} {
  const totalOpportunities = opportunities.length;
  if (totalOpportunities === 0) {
    return { skillDemands: [], commonSkills: [], totalOpportunities: 0 };
  }

  const demandMap = new Map<string, ISkillDemandData>();

  for (const opp of opportunities) {
    const oppId = opp._id ? opp._id.toString() : opp.id || "opp-unknown";
    const oppTitle = opp.title || "Untitled Opportunity";
    const companyName = opp.companyName || "Organization";

    const oppRequired = opp.requiredSkills || [];
    const oppPreferred = opp.preferredSkills || [];

    // Track skills seen in this opportunity to avoid duplicate counting within same opportunity
    const seenInOpp = new Set<string>();

    // Process Required Skills
    for (const raw of oppRequired) {
      const canonical = normalizeSkill(raw);
      if (!canonical) continue;
      const key = canonical.toLowerCase();

      if (!demandMap.has(key)) {
        demandMap.set(key, {
          skillName: canonical,
          category: inferSkillCategory(canonical),
          opportunityCount: 0,
          requiredByCount: 0,
          preferredByCount: 0,
          demandPercentage: 0,
          isMandatory: true,
          relevantOpportunities: [],
        });
      }

      const item = demandMap.get(key)!;
      item.isMandatory = true;

      if (!seenInOpp.has(key)) {
        seenInOpp.add(key);
        item.opportunityCount++;
        item.requiredByCount++;
        item.relevantOpportunities.push({
          id: oppId,
          title: oppTitle,
          companyName,
          isRequired: true,
        });
      }
    }

    // Process Preferred Skills
    for (const raw of oppPreferred) {
      const canonical = normalizeSkill(raw);
      if (!canonical) continue;
      const key = canonical.toLowerCase();

      if (!demandMap.has(key)) {
        demandMap.set(key, {
          skillName: canonical,
          category: inferSkillCategory(canonical),
          opportunityCount: 0,
          requiredByCount: 0,
          preferredByCount: 0,
          demandPercentage: 0,
          isMandatory: false,
          relevantOpportunities: [],
        });
      }

      const item = demandMap.get(key)!;

      if (!seenInOpp.has(key)) {
        seenInOpp.add(key);
        item.opportunityCount++;
        item.preferredByCount++;
        item.relevantOpportunities.push({
          id: oppId,
          title: oppTitle,
          companyName,
          isRequired: false,
        });
      }
    }
  }

  // Calculate demand percentages
  const skillDemands = Array.from(demandMap.values()).map((item) => {
    const demandPercentage = Math.round(
      (item.opportunityCount / totalOpportunities) * 100
    );
    return {
      ...item,
      demandPercentage,
    };
  });

  // Sort descending by opportunity count and demand percentage
  skillDemands.sort((a, b) => {
    if (b.opportunityCount !== a.opportunityCount) {
      return b.opportunityCount - a.opportunityCount;
    }
    return b.requiredByCount - a.requiredByCount;
  });

  // Identify common skills (required by 100% of selected opportunities)
  const commonSkills = skillDemands
    .filter((s) => s.opportunityCount === totalOpportunities && s.requiredByCount > 0)
    .map((s) => s.skillName);

  return {
    skillDemands,
    commonSkills,
    totalOpportunities,
  };
}

