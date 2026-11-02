import { SkillPriority } from "@/types/skill-gap";
import { resolveSkillDependencies } from "./dependency-resolver";

export interface ISkillToSequence {
  skillName: string;
  priority: SkillPriority;
  category: string;
}

/**
 * Sequences missing skills by combining topological prerequisite constraints with Stage 5 priority tiers.
 */
export function sequenceLearningSkills(
  skills: ISkillToSequence[]
): ISkillToSequence[] {
  if (skills.length <= 1) {
    return skills;
  }

  const priorityWeight: Record<SkillPriority, number> = {
    critical: 40,
    high: 30,
    medium: 20,
    low: 10,
  };

  // Map of skillName -> original item and weights
  const itemMap = new Map<string, ISkillToSequence>();
  const weightMap = new Map<string, number>();

  for (const item of skills) {
    itemMap.set(item.skillName.toLowerCase(), item);
    // Prioritize skills that unlock others (prerequisites) + priority weight
    let weight = priorityWeight[item.priority] || 10;
    if (item.skillName === "JavaScript") weight += 50; // foundational language
    if (item.skillName === "Python") weight += 40;
    weightMap.set(item.skillName.toLowerCase(), weight);
  }

  // 1. Resolve prerequisites topologically with priority weights
  const skillNames = skills.map((s) => s.skillName);
  const topologicallyOrdered = resolveSkillDependencies(
    skillNames,
    undefined,
    weightMap
  );

  // 2. Re-map to full objects
  const sequenced: ISkillToSequence[] = [];
  for (const name of topologicallyOrdered) {
    const item = itemMap.get(name.toLowerCase());
    if (item) {
      sequenced.push(item);
    }
  }

  for (const item of skills) {
    if (!sequenced.some((s) => s.skillName.toLowerCase() === item.skillName.toLowerCase())) {
      sequenced.push(item);
    }
  }

  return sequenced;
}
