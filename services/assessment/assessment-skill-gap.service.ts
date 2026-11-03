import { connectToDatabase } from "@/lib/db/mongodb";
import { StudentProfile } from "@/models/StudentProfile";
import { AssessmentEvidence } from "@/models/AssessmentEvidence";
import { areSkillsEquivalent } from "@/services/matching/skill-normalizer";

export interface ISkillAssessmentCorrelation {
  skillName: string;
  selfReportedProficiency: string;
  assessedProficiency?: string;
  assessedScore?: number;
  hasAssessment: boolean;
  isDiscrepancy: boolean;
  discrepancyNote?: string;
  verifiedAt?: Date;
  status: "verified_aligned" | "verified_gap" | "verified_higher" | "untested";
}

/**
 * Analyzes assessment evidence against student self-reported skills.
 * Never silently overwrites the student's self-reported profile skills;
 * displays transparent discrepancies to guide prioritized learning.
 */
export async function getSkillAssessmentCorrelations(
  userId: string
): Promise<ISkillAssessmentCorrelation[]> {
  await connectToDatabase();

  const [profile, evidences] = await Promise.all([
    StudentProfile.findOne({ userId }).lean(),
    AssessmentEvidence.find({ userId, isPassed: true }).sort({ verifiedAt: -1 }).lean(),
  ]);

  const studentSkills = profile?.skills || [];
  const correlations: ISkillAssessmentCorrelation[] = [];

  for (const s of studentSkills) {
    const matchingEvidence = evidences.find((e) =>
      areSkillsEquivalent(e.skill, s.name)
    );

    if (!matchingEvidence) {
      correlations.push({
        skillName: s.name,
        selfReportedProficiency: s.proficiency || "Intermediate",
        hasAssessment: false,
        isDiscrepancy: false,
        status: "untested",
      });
      continue;
    }

    const selfRank = getProficiencyRank(s.proficiency);
    const assessedRank = getProficiencyRank(matchingEvidence.proficiency);

    let status: ISkillAssessmentCorrelation["status"] = "verified_aligned";
    let isDiscrepancy = false;
    let discrepancyNote: string | undefined;

    if (selfRank > assessedRank) {
      status = "verified_gap";
      isDiscrepancy = true;
      discrepancyNote = `You reported ${s.proficiency}, but the verified assessment scored ${matchingEvidence.percentage}% (${matchingEvidence.proficiency}). Targeted practice is recommended to reach full ${s.proficiency} production competency.`;
    } else if (selfRank < assessedRank) {
      status = "verified_higher";
      isDiscrepancy = true;
      discrepancyNote = `You reported ${s.proficiency}, but demonstrated higher capability in assessment (${matchingEvidence.percentage}% - ${matchingEvidence.proficiency}). Consider updating your portfolio.`;
    } else {
      status = "verified_aligned";
      discrepancyNote = `Verified assessment score (${matchingEvidence.percentage}%) aligns with your reported ${s.proficiency} proficiency.`;
    }

    correlations.push({
      skillName: s.name,
      selfReportedProficiency: s.proficiency || "Intermediate",
      assessedProficiency: matchingEvidence.proficiency,
      assessedScore: matchingEvidence.percentage,
      hasAssessment: true,
      isDiscrepancy,
      discrepancyNote,
      verifiedAt: matchingEvidence.verifiedAt ? new Date(matchingEvidence.verifiedAt) : undefined,
      status,
    });
  }

  return correlations;
}

function getProficiencyRank(p?: string): number {
  if (!p) return 2;
  const lower = p.toLowerCase();
  if (lower.includes("advanced") || lower.includes("expert")) return 3;
  if (lower.includes("proficient") || lower.includes("intermediate")) return 2;
  if (lower.includes("developing") || lower.includes("beginner")) return 1;
  return 1;
}

