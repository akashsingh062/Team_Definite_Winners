import { getGeminiClient, DEFAULT_GEMINI_MODEL, isGeminiConfigured } from "@/lib/gemini";
import {
  IRoadmapMilestone,
  LearningPace,
  IRoadmapGenerateInput,
} from "@/types/roadmap";
import { ISkillToSequence, sequenceLearningSkills } from "./learning-sequencer";
import { generateMilestonesForSkills } from "./milestone-generator";
import { geminiRoadmapAiOutputSchema } from "@/features/roadmap/schemas/roadmapSchema";

export interface IGeneratedRoadmapPlan {
  title: string;
  description: string;
  estimatedDuration: string;
  totalEstimatedHours: number;
  milestones: IRoadmapMilestone[];
}

/**
 * Deterministic roadmap generator ensuring 100% reliability if Gemini is unavailable or rate-limited.
 */
export async function generateDeterministicRoadmap(
  targetRole: string,
  sequencedSkills: ISkillToSequence[],
  input: IRoadmapGenerateInput
): Promise<IGeneratedRoadmapPlan> {
  const studyHoursPerDay = input.studyHoursPerDay || 2;
  const studyDaysPerWeek = input.studyDaysPerWeek || 5;
  const learningPace: LearningPace = input.learningPace || "moderate";

  const { milestones, totalHours } = await generateMilestonesForSkills(
    sequencedSkills,
    studyHoursPerDay,
    studyDaysPerWeek,
    learningPace
  );

  const totalWeeks = milestones.length;
  const estimatedDuration = `${totalWeeks} weeks (${totalHours} hours total)`;

  const title = `Career Preparation Roadmap: ${targetRole}`;
  const description = `A personalized ${learningPace}-pace learning roadmap targeting ${sequencedSkills.length} missing competencies required for ${targetRole}. Focuses on practical portfolio proof, prerequisite foundations, and verified industry resources.`;

  return {
    title,
    description,
    estimatedDuration,
    totalEstimatedHours: totalHours,
    milestones,
  };
}

/**
 * AI-assisted roadmap generator using Gemini API with deterministic fallback and Zod validation.
 */
export async function generatePersonalizedRoadmapPlan(
  targetRole: string,
  missingSkillsWithPriorities: ISkillToSequence[],
  existingSkills: string[],
  input: IRoadmapGenerateInput
): Promise<IGeneratedRoadmapPlan> {
  // 1. First, sequence skills deterministically using the dependency resolver & priority rules
  const sequencedSkills = sequenceLearningSkills(missingSkillsWithPriorities);

  // 2. Prepare the deterministic baseline (which guarantees valid milestones, resources, and assignments)
  const baseline = await generateDeterministicRoadmap(
    targetRole,
    sequencedSkills,
    input
  );

  if (!isGeminiConfigured() || sequencedSkills.length === 0) {
    return baseline;
  }

  // 3. Enhance milestone descriptions, assignments, and objectives using Gemini API if configured
  try {
    const ai = getGeminiClient();

    const skillsSummary = sequencedSkills
      .map(
        (s, idx) =>
          `${idx + 1}. ${s.skillName} (Priority: ${s.priority}, Category: ${s.category})`
      )
      .join("\n");

    const prompt = `
You are NexSkill AI's Senior Curriculum Architect. Enhance this personalized student learning roadmap.

Context:
- Target Career Role: ${targetRole}
- Student's Existing Approved Skills: ${existingSkills.slice(0, 10).join(", ") || "None"}
- Missing Skills in Sequential Order:
${skillsSummary}
- Study Hours Per Day: ${input.studyHoursPerDay || 2}
- Study Days Per Week: ${input.studyDaysPerWeek || 5}
- Learning Pace: ${input.learningPace || "moderate"}

Instructions:
1. Provide a professional roadmap title and description tailored to the target role.
2. For each of the ${sequencedSkills.length} skills (in the exact order given), provide:
   - title (e.g. "Week X: Advanced React Patterns")
   - description (1-2 sentences on practical relevance)
   - estimatedHours (number, around 8 to 15)
   - objectives (array of 3-4 specific technical goals)
   - tasks (array of 3-4 actionable tasks with title and description)
   - assignment (practical hands-on project with title, objective, description, difficultyLevel: "beginner"|"intermediate"|"advanced", expectedDeliverable, completionCriteria)

Output strictly a JSON object conforming to this shape without markdown backticks outside:
{
  "title": "Roadmap Title",
  "description": "Roadmap Description",
  "milestones": [
    {
      "skillName": "React",
      "title": "Week 1: Core Fundamentals of React",
      "description": "...",
      "estimatedHours": 10,
      "objectives": ["Obj 1", "Obj 2", "Obj 3"],
      "tasks": [
        { "title": "Task 1", "description": "..." },
        { "title": "Task 2", "description": "..." }
      ],
      "assignment": {
        "title": "Project Title",
        "objective": "...",
        "description": "...",
        "difficultyLevel": "beginner",
        "expectedDeliverable": "...",
        "completionCriteria": "..."
      }
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const responseText = response.text;
    if (!responseText) return baseline;

    let sanitizedJson = responseText.trim();
    if (sanitizedJson.startsWith("```json")) {
      sanitizedJson = sanitizedJson.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (sanitizedJson.startsWith("```")) {
      sanitizedJson = sanitizedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsedJson = JSON.parse(sanitizedJson);
    const validated = geminiRoadmapAiOutputSchema.safeParse(parsedJson);

    if (!validated.success) {
      console.warn("Gemini roadmap output failed Zod schema validation, using deterministic baseline:", validated.error);
      return baseline;
    }

    // Merge validated AI enhancements with our baseline (preserving resourceIds and IDs)
    const aiData = validated.data;
    const mergedMilestones: IRoadmapMilestone[] = baseline.milestones.map(
      (baseM, idx) => {
        const aiM = aiData.milestones[idx];
        if (!aiM) return baseM;

        return {
          ...baseM,
          title: aiM.title || baseM.title,
          description: aiM.description || baseM.description,
          estimatedHours: aiM.estimatedHours || baseM.estimatedHours,
          objectives: aiM.objectives || baseM.objectives,
          tasks: aiM.tasks?.map((t, tIdx) => ({
            id: `${baseM.id}-t${tIdx + 1}`,
            title: t.title,
            description: t.description || "",
            isCompleted: false,
            completedAt: null,
          })) || baseM.tasks,
          assignment: aiM.assignment
            ? {
                ...aiM.assignment,
                requiredSkills: [baseM.skillName],
              }
            : baseM.assignment,
        };
      }
    );

    return {
      title: aiData.title || baseline.title,
      description: aiData.description || baseline.description,
      estimatedDuration: baseline.estimatedDuration,
      totalEstimatedHours: baseline.totalEstimatedHours,
      milestones: mergedMilestones,
    };
  } catch (err) {
    console.warn("Gemini roadmap generation encountered an issue, falling back to deterministic plan:", err);
    return baseline;
  }
}

