import { SkillPriority } from "@/types/skill-gap";
import { ISkillDemandData } from "./demand-analyzer";

export interface IPriorityConfig {
  criticalDemandThreshold: number; // e.g. 75%
  highDemandThreshold: number; // e.g. 50%
  highOpportunityCountThreshold: number; // e.g. 2
}

export const DEFAULT_PRIORITY_CONFIG: IPriorityConfig = {
  criticalDemandThreshold: 75,
  highDemandThreshold: 50,
  highOpportunityCountThreshold: 2,
};

/**
 * Deterministically determines the priority level of a missing skill gap.
 */
export function calculateSkillPriority(
  demand: ISkillDemandData,
  totalOpportunities: number,
  config: IPriorityConfig = DEFAULT_PRIORITY_CONFIG
): SkillPriority {
  const { requiredByCount, preferredByCount, demandPercentage, isMandatory } = demand;

  // Single opportunity context
  if (totalOpportunities <= 1) {
    if (isMandatory || requiredByCount > 0) {
      return "critical";
    }
    if (preferredByCount > 0) {
      return "medium";
    }
    return "low";
  }

  // Multi-opportunity context:
  // 1. Critical: Required by all or nearly all selected opportunities (>= 75% and required)
  if (
    requiredByCount >= 2 &&
    demandPercentage >= config.criticalDemandThreshold
  ) {
    return "critical";
  }

  if (requiredByCount === totalOpportunities && totalOpportunities >= 2) {
    return "critical";
  }

  // 2. High: Required by multiple opportunities (>= 2) or high demand percentage (>= 50% and required)
  if (
    requiredByCount >= config.highOpportunityCountThreshold ||
    (demandPercentage >= config.highDemandThreshold && requiredByCount > 0)
  ) {
    return "high";
  }

  // 3. Medium: Preferred by multiple opportunities or required by at least 1 opportunity
  if (
    requiredByCount === 1 ||
    preferredByCount >= config.highOpportunityCountThreshold ||
    (demandPercentage >= config.highDemandThreshold && preferredByCount > 0)
  ) {
    return "medium";
  }

  // 4. Low: General bonus or preferred by a single opportunity
  return "low";
}

