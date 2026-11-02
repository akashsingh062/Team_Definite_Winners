import { getGeminiClient, DEFAULT_GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";
import {
  INarrativeExplanation,
  IScoreFactorExplanation,
  ISkillAnalysisItem,
  IEligibilityCriterionExplanation,
  IDataCompletenessInfo,
} from "@/types/explanation";
import { geminiExplanationAiOutputSchema } from "@/features/explanations/schemas/explanationSchema";

const DEFAULT_DISCLAIMER =
  "This match score represents alignment between your available profile information and the opportunity requirements. It is not a probability of selection or a guarantee of employment. Employers make their own hiring decisions.";

/**
 * Generates deterministic explanatory narrative.
 * Serves as 100% reliable fallback when Gemini is unavailable, rate-limited, or unconfigured.
 */
export function generateDeterministicNarrative(
  opportunityTitle: string,
  companyName: string,
  overallScore: number,
  scoreBreakdown: IScoreFactorExplanation[],
  matchingSkills: ISkillAnalysisItem[],
  missingRequiredSkills: ISkillAnalysisItem[],
  eligibilityExplanation: IEligibilityCriterionExplanation[],
  dataCompleteness: IDataCompletenessInfo
): INarrativeExplanation {
  const topMatchingFactors: string[] = [];
  const keyProfileEvidence: string[] = [];

  // Identify top score contributors
  const sortedFactors = [...scoreBreakdown].sort(
    (a, b) => b.weightedContribution - a.weightedContribution
  );

  for (const factor of sortedFactors.slice(0, 3)) {
    if (factor.score >= 50) {
      topMatchingFactors.push(
        `${factor.name}: scored ${factor.score}% (${factor.weightedContribution} weighted pts) - ${factor.explanation}`
      );
    }
  }

  if (topMatchingFactors.length === 0) {
    topMatchingFactors.push(
      "Baseline eligibility: Your profile fulfills initial qualification criteria for this role."
    );
  }

  // Compile key evidence
  if (matchingSkills.length > 0) {
    const matchedNames = matchingSkills.map((s) => s.name).join(", ");
    keyProfileEvidence.push(
      `Verified skills in your profile/resume: ${matchedNames}`
    );
  }

  const satisfiedCriteria = eligibilityExplanation.filter(
    (c) => c.status === "satisfied"
  );
  if (satisfiedCriteria.length > 0) {
    keyProfileEvidence.push(
      `Academic eligibility confirmed for ${satisfiedCriteria.map((c) => c.criterion).join(", ")}`
    );
  }

  if (dataCompleteness.evaluatedFactors.length > 0) {
    keyProfileEvidence.push(dataCompleteness.evaluatedFactors[0]);
  }

  // Summary
  let summary = `This opportunity for "${opportunityTitle}" at ${companyName} achieved an overall match score of ${overallScore}%. `;
  if (overallScore >= 80) {
    summary += `You demonstrate exceptional alignment with core technical requirements (${matchingSkills.length} matching skills) and meet candidate qualification expectations.`;
  } else if (overallScore >= 60) {
    summary += `You have strong foundational qualifications for this position, with ${matchingSkills.length} matching skills. Addressing ${missingRequiredSkills.length} missing skill(s) will further strengthen your application.`;
  } else {
    summary += `This role has specific prerequisites that partially align with your current profile. Focus on the actionable recommendations below to increase your suitability.`;
  }

  return {
    summary,
    topMatchingFactors,
    keyProfileEvidence,
    limitationsDisclaimer: DEFAULT_DISCLAIMER,
  };
}

/**
 * AI-assisted narrative generator using Gemini API with strict validation and deterministic fallback.
 * Strictly forbidden from modifying scores, eligibility, or facts.
 */
export async function generateAiExplanation(
  opportunityTitle: string,
  companyName: string,
  overallScore: number,
  scoreBreakdown: IScoreFactorExplanation[],
  matchingSkills: ISkillAnalysisItem[],
  missingRequiredSkills: ISkillAnalysisItem[],
  eligibilityExplanation: IEligibilityCriterionExplanation[],
  dataCompleteness: IDataCompletenessInfo
): Promise<{ narrative: INarrativeExplanation; aiGenerated: boolean }> {
  // Always prepare deterministic baseline first
  const deterministicBaseline = generateDeterministicNarrative(
    opportunityTitle,
    companyName,
    overallScore,
    scoreBreakdown,
    matchingSkills,
    missingRequiredSkills,
    eligibilityExplanation,
    dataCompleteness
  );

  if (!isGeminiConfigured()) {
    return { narrative: deterministicBaseline, aiGenerated: false };
  }

  try {
    const ai = getGeminiClient();

    const prompt = `
You are the CareerBridge AI Explainability Assistant. Your task is to explain why an opportunity was recommended to a student in transparent, encouraging, student-friendly language.

CRITICAL RULES:
1. You MUST NEVER calculate, alter, or question the match score (${overallScore}%).
2. You MUST NOT invent any skills, qualifications, work history, or requirements not listed below.
3. You MUST explain the facts truthfully and objectively.
4. Distinguish unavailable student profile data from failed criteria.

CONTEXT:
- Opportunity: "${opportunityTitle}" at "${companyName}"
- Match Score: ${overallScore}% (Calculated deterministically)
- Matching Skills: ${matchingSkills.map((s) => `${s.name} (${s.evidenceDetail || s.evidenceSource})`).join("; ") || "None"}
- Missing Required Skills: ${missingRequiredSkills.map((s) => s.name).join("; ") || "None"}
- Top Scoring Factors:
${scoreBreakdown.map((f) => `  * ${f.name} (Weight: ${f.weight}%): Score ${f.score}%, Contribution ${f.weightedContribution}pts - ${f.explanation}`).join("\n")}
- Data Completeness: ${dataCompleteness.completenessScore}% (${dataCompleteness.narrative})

OUTPUT FORMAT:
Respond with ONLY valid JSON matching this schema:
{
  "summary": "2-3 sentence overview explaining the match transparently",
  "topMatchingFactors": ["1-3 bullet points highlighting top reasons for recommendation"],
  "keyProfileEvidence": ["1-3 bullet points referencing specific skills, projects, or academic records"],
  "limitationsDisclaimer": "${DEFAULT_DISCLAIMER}"
}
`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text?.trim();
    if (!responseText) {
      return { narrative: deterministicBaseline, aiGenerated: false };
    }

    const parsed = JSON.parse(responseText);
    const validated = geminiExplanationAiOutputSchema.safeParse(parsed);

    if (!validated.success) {
      console.warn(
        "Gemini explanation output failed Zod validation, falling back to deterministic:",
        validated.error.issues
      );
      return { narrative: deterministicBaseline, aiGenerated: false };
    }

    return {
      narrative: {
        summary: validated.data.summary,
        topMatchingFactors: validated.data.topMatchingFactors,
        keyProfileEvidence: validated.data.keyProfileEvidence,
        limitationsDisclaimer: DEFAULT_DISCLAIMER,
      },
      aiGenerated: true,
    };
  } catch (err) {
    console.warn(
      "Gemini API explanation generation failed, smoothly activating deterministic fallback:",
      err
    );
    return { narrative: deterministicBaseline, aiGenerated: false };
  }
}

