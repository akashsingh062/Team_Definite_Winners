import {
  ProficiencyCategory,
  ITopicPerformance,
  IDifficultyPerformance,
  IQuestionReviewItem,
  IAssessmentQuestionPublic,
} from "@/types/assessment";
import { AssessmentQuestionDocument } from "@/models/AssessmentQuestion";

export interface IScoreCalculationInput {
  questions: AssessmentQuestionDocument[];
  studentAnswers: Record<
    string,
    { questionId: string; selectedOptionId: string | null; isFlaggedForReview?: boolean }
  >;
  passingThreshold: number; // percentage
}

export interface IScoreCalculationResult {
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  proficiency: ProficiencyCategory;
  topicPerformance: ITopicPerformance[];
  difficultyPerformance: IDifficultyPerformance[];
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unansweredCount: number;
  questionReviews: IQuestionReviewItem[];
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
}

/**
 * Deterministically computes score, topic breakdowns, difficulty breakdowns,
 * and proficiency categories strictly on the server.
 */
export function calculateAssessmentScore(
  input: IScoreCalculationInput
): IScoreCalculationResult {
  let score = 0;
  let totalMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  const topicMap = new Map<string, { total: number; obtained: number }>();
  const difficultyMap = new Map<string, { total: number; obtained: number }>();
  const questionReviews: IQuestionReviewItem[] = [];

  for (const q of input.questions) {
    const qId = q._id ? q._id.toString() : q.id || "";
    const qMarks = q.marks || 1;
    totalMarks += qMarks;

    const answer = input.studentAnswers[qId] || input.studentAnswers[q.id || ""];
    const selectedOptionId = answer?.selectedOptionId || null;

    let isCorrect = false;
    let marksAwarded = 0;

    if (!selectedOptionId) {
      unansweredCount++;
    } else if (selectedOptionId.trim() === q.correctAnswer.trim()) {
      isCorrect = true;
      marksAwarded = qMarks;
      score += qMarks;
      correctCount++;
    } else {
      incorrectCount++;
    }

    // Accumulate topic metrics
    const topic = q.topic || "General";
    if (!topicMap.has(topic)) {
      topicMap.set(topic, { total: 0, obtained: 0 });
    }
    const topicStat = topicMap.get(topic)!;
    topicStat.total += qMarks;
    topicStat.obtained += marksAwarded;

    // Accumulate difficulty metrics
    const difficulty = q.difficulty || "Intermediate";
    if (!difficultyMap.has(difficulty)) {
      difficultyMap.set(difficulty, { total: 0, obtained: 0 });
    }
    const diffStat = difficultyMap.get(difficulty)!;
    diffStat.total += qMarks;
    diffStat.obtained += marksAwarded;

    const publicQ: IAssessmentQuestionPublic = {
      id: qId,
      title: q.title,
      questionText: q.questionText,
      codeSnippet: q.codeSnippet,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      questionType: q.questionType,
      options: q.options.map((o) => ({ id: o.id, text: o.text })),
      marks: qMarks,
    };

    questionReviews.push({
      question: publicQ,
      selectedOptionId,
      correctAnswer: q.correctAnswer,
      isCorrect,
      marksAwarded,
      marksPossible: qMarks,
      explanation: q.explanation || "No explanation provided.",
    });
  }

  const percentage =
    totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const isPassed = percentage >= input.passingThreshold;

  // Determine proficiency category
  let proficiency: ProficiencyCategory = "Beginner";
  if (percentage >= 85) {
    proficiency = "Advanced";
  } else if (percentage >= 70) {
    proficiency = "Proficient";
  } else if (percentage >= 50) {
    proficiency = "Developing";
  }

  // Format topic performance array
  const topicPerformance: ITopicPerformance[] = Array.from(
    topicMap.entries()
  ).map(([topic, stat]) => ({
    topic,
    totalMarks: stat.total,
    obtainedMarks: stat.obtained,
    percentage:
      stat.total > 0 ? Math.round((stat.obtained / stat.total) * 100) : 0,
  }));

  // Format difficulty performance array
  const difficultyPerformance: IDifficultyPerformance[] = Array.from(
    difficultyMap.entries()
  ).map(([difficulty, stat]) => ({
    difficulty,
    totalMarks: stat.total,
    obtainedMarks: stat.obtained,
    percentage:
      stat.total > 0 ? Math.round((stat.obtained / stat.total) * 100) : 0,
  }));

  // Extract strengths (>= 70%) and weaknesses (< 70%)
  const strengths = topicPerformance
    .filter((t) => t.percentage >= 70)
    .map((t) => t.topic);

  const weaknesses = topicPerformance
    .filter((t) => t.percentage < 70)
    .map((t) => t.topic);

  const recommendedTopics = weaknesses.length > 0 ? weaknesses : ["Advanced Optimization"];

  return {
    score,
    totalMarks,
    percentage,
    isPassed,
    proficiency,
    topicPerformance,
    difficultyPerformance,
    correctAnswersCount: correctCount,
    incorrectAnswersCount: incorrectCount,
    unansweredCount,
    questionReviews,
    strengths,
    weaknesses,
    recommendedTopics,
  };
}

