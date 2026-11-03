import { GoogleGenAI } from "@google/genai";
import {
  ICareerPath,
  ICareerAlignmentResult,
  ICareerComparisonItem,
} from "@/types/career-path";
import { IAggregatedStudentSkills } from "./career-readiness.service";

let aiClient: GoogleGenAI | null = null;

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

/**
 * Generates an empathetic, student-friendly explanation of a career path tailored to student background.
 */
export async function generateCareerPathExplanation(
  careerPath: ICareerPath,
  studentData: IAggregatedStudentSkills,
  alignment: ICareerAlignmentResult
): Promise<{
  summary: string;
  strengths: string[];
  recommendedFocus: string;
  projectIdea: string;
  isAiGenerated: boolean;
}> {
  const ai = getAIClient();

  if (!ai) {
    return generateDeterministicPathFallback(careerPath, alignment);
  }

  const prompt = `You are a supportive, knowledgeable technical career advisor at NexSkill AI (From Skill to Opportunity).
Analyze this student's alignment with the "${careerPath.title}" career path.

Career Requirements:
- Required Skills: ${careerPath.requiredSkills.join(", ")}
- Preferred Skills: ${careerPath.preferredSkills.join(", ")}

Student Profile:
- Matched Skills: ${alignment.skills.matchedRequired.concat(alignment.skills.matchedPreferred).join(", ") || "None yet"}
- Missing Required Skills: ${alignment.skills.missingRequired.join(", ") || "None"}
- Missing Preferred Skills: ${alignment.skills.missingPreferred.join(", ") || "None"}
- Alignment Score: ${alignment.overallScore}%

Instructions:
- Write an encouraging 2-sentence summary of where the student currently stands.
- List 2 key existing strengths the student has.
- Name the single most important skill they should focus on next and why.
- Suggest 1 practical, portfolio-worthy project idea that combines their current skills with 1 missing skill.
- Do NOT guarantee employment or claim a specific hire probability.
- Return ONLY valid JSON with keys: "summary", "strengths" (array of strings), "recommendedFocus", "projectIdea".`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(6000),
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty AI response");

    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary || `${careerPath.title} is an exciting career path with ${alignment.overallScore}% current profile alignment.`,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [`Solid foundation in ${alignment.skills.matchedRequired.join(", ") || "core fundamentals"}`],
      recommendedFocus: parsed.recommendedFocus || `Prioritize learning ${alignment.skills.missingRequired[0] || "advanced concepts"}.`,
      projectIdea: parsed.projectIdea || `Build a practical ${careerPath.title.toLowerCase()} application to showcase your skills.`,
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn("[CareerAI] Gemini explanation failed, using deterministic fallback:", err);
    return generateDeterministicPathFallback(careerPath, alignment);
  }
}

/**
 * Explains the impact of a What-If simulation where hypothetical skills were added.
 */
export async function generateSimulationExplanation(
  careerPath: ICareerPath,
  baseline: ICareerAlignmentResult,
  simulated: ICareerAlignmentResult,
  hypotheticalSkills: string[]
): Promise<{
  summary: string;
  strategicValue: string;
  recommendedLearningOrder: string[];
  suggestedProjectIdea: string;
  isAiGenerated: boolean;
}> {
  const delta = simulated.overallScore - baseline.overallScore;
  const ai = getAIClient();

  if (!ai || hypotheticalSkills.length === 0) {
    return generateDeterministicSimulationFallback(careerPath, baseline, simulated, hypotheticalSkills);
  }

  const prompt = `You are an expert career mentor at NexSkill AI explaining a What-If skill simulation.
The student tested adding the following hypothetical skills for the "${careerPath.title}" career path:
Hypothetical Skills Added: ${hypotheticalSkills.join(", ")}

Simulation Impact:
- Baseline Alignment: ${baseline.overallScore}%
- Simulated Alignment: ${simulated.overallScore}% (+${delta}%)
- Newly Satisfied Skills: ${simulated.skills.matchedRequired.filter((s) => !baseline.skills.matchedRequired.includes(s)).join(", ") || "None"}
- Remaining Gaps: ${simulated.skills.missingRequired.join(", ") || "None"}

Instructions:
- Write an objective, encouraging 2-sentence summary of the simulated gain.
- Explain the strategic industry value of these hypothetical skills for a ${careerPath.title}.
- Suggest the recommended chronological learning order for the added skills.
- Suggest 1 practical project idea where these hypothetical skills would be utilized together.
- Remind the student that this is a hypothetical simulation. Do NOT claim the student has already mastered these skills.
- Return ONLY valid JSON with keys: "summary", "strategicValue", "recommendedLearningOrder" (array of strings), "suggestedProjectIdea".`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(6000),
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty AI response");

    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary || `Adding ${hypotheticalSkills.join(", ")} raises your simulated alignment by +${delta}%, unlocking key requirements for ${careerPath.title}.`,
      strategicValue: parsed.strategicValue || `Mastering ${hypotheticalSkills.join(" and ")} directly addresses critical production competencies required by hiring teams.`,
      recommendedLearningOrder: Array.isArray(parsed.recommendedLearningOrder) && parsed.recommendedLearningOrder.length > 0
        ? parsed.recommendedLearningOrder
        : hypotheticalSkills,
      suggestedProjectIdea: parsed.suggestedProjectIdea || `Create an end-to-end project applying ${hypotheticalSkills.join(" and ")} in a realistic scenario.`,
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn("[CareerAI] Gemini simulation explanation failed, using deterministic fallback:", err);
    return generateDeterministicSimulationFallback(careerPath, baseline, simulated, hypotheticalSkills);
  }
}

/**
 * Generates comparative analysis across 2 to 3 career paths.
 */
export async function generateCareerComparisonExplanation(
  comparisons: ICareerComparisonItem[]
): Promise<{
  overview: string;
  recommendation: string;
  keyTradeoffs: string[];
  isAiGenerated: boolean;
}> {
  const ai = getAIClient();

  if (!ai || comparisons.length < 2) {
    return generateDeterministicComparisonFallback(comparisons);
  }

  const comparisonSummaries = comparisons.map((c) => ({
    title: c.careerPath.title,
    score: c.alignment.overallScore,
    matchedSkills: c.alignment.skills.matchedRequired.join(", "),
    missingSkills: c.alignment.skills.missingRequired.join(", "),
    difficulty: c.careerPath.learningDifficulty,
  }));

  const prompt = `You are a senior career strategist at NexSkill AI comparing multiple career pathways for a student.

Career Paths Being Compared:
${JSON.stringify(comparisonSummaries, null, 2)}

Instructions:
- Write a 2-sentence overview comparing the student's relative positioning across these paths.
- Provide a personalized recommendation on which path offers the smoothest entry or highest synergy based on current matched skills.
- List 2 to 3 key tradeoffs between these careers (e.g. learning curve, prerequisite skills, scope of responsibility).
- Do NOT guarantee employment or fabricate salary figures.
- Return ONLY valid JSON with keys: "overview", "recommendation", "keyTradeoffs" (array of strings).`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
        abortSignal: AbortSignal.timeout(6000),
      },
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty AI response");

    const parsed = JSON.parse(text);
    return {
      overview: parsed.overview || "Comparison of career paths based on your current technical skill profile.",
      recommendation: parsed.recommendation || `Based on existing skills, ${comparisons[0]?.careerPath.title} provides the highest immediate coverage.`,
      keyTradeoffs: Array.isArray(parsed.keyTradeoffs) ? parsed.keyTradeoffs : [
        "Different roles demand specialized auxiliary libraries and workflows.",
        "Learning effort varies based on core algorithmic vs architectural requirements.",
      ],
      isAiGenerated: true,
    };
  } catch (err) {
    console.warn("[CareerAI] Gemini comparison failed, using deterministic fallback:", err);
    return generateDeterministicComparisonFallback(comparisons);
  }
}

// ---------------------------------------------------------------------------
// Deterministic Fallback Generators
// ---------------------------------------------------------------------------
function generateDeterministicPathFallback(
  careerPath: ICareerPath,
  alignment: ICareerAlignmentResult
) {
  const topMissing = alignment.skills.missingRequired[0] || "required core skills";
  const matchedCount = alignment.skills.matchedRequired.length;
  const totalCount = alignment.skills.totalRequiredCount;

  return {
    summary: `Your profile currently satisfies ${matchedCount} of ${totalCount} required skills for ${careerPath.title}, establishing an overall career alignment of ${alignment.overallScore}%.`,
    strengths: alignment.skills.matchedRequired.length > 0
      ? [`Demonstrated competence in ${alignment.skills.matchedRequired.slice(0, 3).join(", ")}.`]
      : ["Foundational analytical capability and motivation to build technical skills."],
    recommendedFocus: `Focus on mastering ${topMissing} to bridge the primary requirement for this pathway.`,
    projectIdea: `Build a portfolio project that incorporates ${alignment.skills.matchedRequired[0] || "modern tools"} and ${topMissing} to validate applied competency.`,
    isAiGenerated: false,
  };
}

function generateDeterministicSimulationFallback(
  careerPath: ICareerPath,
  baseline: ICareerAlignmentResult,
  simulated: ICareerAlignmentResult,
  hypotheticalSkills: string[]
) {
  const delta = simulated.overallScore - baseline.overallScore;
  return {
    summary: `Hypothetically acquiring ${hypotheticalSkills.join(", ")} increases your career alignment score by +${delta}% (from ${baseline.overallScore}% to ${simulated.overallScore}%).`,
    strategicValue: `These hypothetical skills satisfy key industry competencies frequently requested by hiring teams for ${careerPath.title}.`,
    recommendedLearningOrder: hypotheticalSkills,
    suggestedProjectIdea: `Design and deploy a practical application utilizing ${hypotheticalSkills.join(" and ")} alongside your current skill set.`,
    isAiGenerated: false,
  };
}

function generateDeterministicComparisonFallback(
  comparisons: ICareerComparisonItem[]
) {
  const sorted = [...comparisons].sort((a, b) => b.alignment.overallScore - a.alignment.overallScore);
  const best = sorted[0];

  return {
    overview: `Comparing ${comparisons.map((c) => c.careerPath.title).join(", ")} reveals distinct skill requirements and career trajectories.`,
    recommendation: best
      ? `Your profile currently shows the strongest alignment with ${best.careerPath.title} (${best.alignment.overallScore}% readiness).`
      : "Select paths with overlapping skill sets to maximize study efficiency.",
    keyTradeoffs: [
      "Different specializations require distinct backend, frontend, or mathematical depth.",
      "Time to readiness varies depending on whether you are expanding an existing stack or learning a new domain.",
    ],
    isAiGenerated: false,
  };
}
