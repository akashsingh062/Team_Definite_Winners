import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Assessment, AssessmentDocument } from "@/models/Assessment";
import { AssessmentQuestion, AssessmentQuestionDocument } from "@/models/AssessmentQuestion";
import { AssessmentAttempt, AssessmentAttemptDocument } from "@/models/AssessmentAttempt";
import { AssessmentEvidence } from "@/models/AssessmentEvidence";
import { SkillsPassport } from "@/models/SkillsPassport";
import {
  IAssessment,
  IAssessmentQuestionPublic,
  IAssessmentResult,
  IStudentAnswer,
} from "@/types/assessment";
import { calculateAssessmentScore } from "./assessment-scoring.service";
import {
  INITIAL_ASSESSMENTS_SEED,
  INITIAL_QUESTIONS_SEED,
} from "./assessment-seed-data";
import { areSkillsEquivalent } from "@/services/matching/skill-normalizer";

/**
 * Ensures the default 11 subject assessments and question bank are seeded.
 */
export async function ensureAssessmentsSeeded(): Promise<void> {
  await connectToDatabase();

  const questionsCount = await AssessmentQuestion.countDocuments();
  if (questionsCount === 0) {
    console.log("[AssessmentService] Seeding initial assessment questions...");
    await AssessmentQuestion.insertMany(INITIAL_QUESTIONS_SEED);
  }

  const assessmentsCount = await Assessment.countDocuments();
  if (assessmentsCount === 0) {
    console.log("[AssessmentService] Seeding initial assessments...");
    for (const raw of INITIAL_ASSESSMENTS_SEED) {
      const matchingQuestions = await AssessmentQuestion.find({
        subject: raw.subject,
        status: "published",
      }).select("_id marks");

      const questionReferences = matchingQuestions.map((q) => q._id.toString());
      const totalMarks = matchingQuestions.reduce(
        (sum, q) => sum + (q.marks || 1),
        0
      );

      await Assessment.create({
        ...raw,
        questionReferences,
        questionCount: questionReferences.length,
        totalMarks: totalMarks > 0 ? totalMarks : raw.totalMarks,
      });
    }
  }
}

/**
 * Retrieves all published assessments with optional subject and difficulty filters.
 */
export async function getAssessments(filter?: {
  subject?: string;
  difficulty?: string;
  search?: string;
}): Promise<AssessmentDocument[]> {
  await connectToDatabase();
  await ensureAssessmentsSeeded();

  const query: Record<string, unknown> = { status: "published" };

  if (filter?.subject && filter.subject !== "all") {
    query.subject = new RegExp(`^${filter.subject}$`, "i");
  }

  if (filter?.difficulty && filter.difficulty !== "all") {
    query.difficulty = filter.difficulty;
  }

  if (filter?.search) {
    const searchRegex = new RegExp(filter.search.trim(), "i");
    query.$or = [{ title: searchRegex }, { subject: searchRegex }, { topics: searchRegex }];
  }

  return await Assessment.find(query).sort({ subject: 1, title: 1 });
}

/**
 * Retrieves a single assessment by ID.
 */
export async function getAssessmentById(
  id: string
): Promise<AssessmentDocument | null> {
  await connectToDatabase();
  await ensureAssessmentsSeeded();

  if (mongoose.isValidObjectId(id)) {
    return await Assessment.findById(id);
  }
  return await Assessment.findOne({ _id: id });
}

/**
 * Starts an assessment attempt or resumes an ongoing active attempt for the student.
 * Never exposes correctAnswer or explanation in questions snapshot before submission.
 */
export async function startAssessmentAttempt(
  userId: string,
  assessmentId: string
): Promise<AssessmentAttemptDocument> {
  await connectToDatabase();
  await ensureAssessmentsSeeded();

  const assessment = await getAssessmentById(assessmentId);
  if (!assessment || assessment.status !== "published") {
    throw new Error("Assessment not found or not currently available.");
  }

  const now = new Date();

  // 1. Check for existing active attempt
  const existingActive = await AssessmentAttempt.findOne({
    userId,
    assessmentId: assessment._id.toString(),
    status: "in_progress",
  }).sort({ createdAt: -1 });

  if (existingActive) {
    if (now < existingActive.expiresAt) {
      // Resume current ongoing attempt
      return existingActive;
    } else {
      // Auto-submit expired attempt
      await submitAssessmentAttempt(existingActive._id.toString(), userId);
    }
  }

  // 2. Check retake cooldown
  if (assessment.retakeCooldownHours > 0) {
    const lastSubmitted = await AssessmentAttempt.findOne({
      userId,
      assessmentId: assessment._id.toString(),
      status: { $in: ["submitted", "timed_out"] },
    }).sort({ submittedAt: -1 });

    if (lastSubmitted && lastSubmitted.submittedAt) {
      const cooldownMs = assessment.retakeCooldownHours * 60 * 60 * 1000;
      const timeSince = now.getTime() - new Date(lastSubmitted.submittedAt).getTime();
      if (timeSince < cooldownMs) {
        const remainingHours = Math.ceil((cooldownMs - timeSince) / (60 * 60 * 1000));
        throw new Error(
          `Retake cooldown active. You can attempt this assessment again in ${remainingHours} hour(s).`
        );
      }
    }
  }

  // 3. Fetch questions and randomize
  let questions: AssessmentQuestionDocument[] = [];
  if (assessment.questionReferences && assessment.questionReferences.length > 0) {
    questions = await AssessmentQuestion.find({
      _id: { $in: assessment.questionReferences },
      status: "published",
    });
  }

  if (questions.length === 0) {
    questions = await AssessmentQuestion.find({
      subject: assessment.subject,
      status: "published",
    });
  }

  if (questions.length === 0) {
    throw new Error("No active questions available for this assessment subject.");
  }

  // Shuffle questions randomly
  const shuffled = [...questions].sort(() => 0.5 - Math.random());

  // Convert to safe public questions: NO correctAnswer, NO explanation
  const publicQuestions: IAssessmentQuestionPublic[] = shuffled.map((q) => {
    // Also randomize options for non-sequential questions
    const shuffledOptions = [...q.options].sort(() => 0.5 - Math.random());
    return {
      id: q._id.toString(),
      title: q.title,
      questionText: q.questionText,
      codeSnippet: q.codeSnippet,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      questionType: q.questionType,
      options: shuffledOptions,
      marks: q.marks || 1,
    };
  });

  const durationMs = assessment.durationMinutes * 60 * 1000;
  const expiresAt = new Date(now.getTime() + durationMs);
  const totalMarks = publicQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

  const attempt = await AssessmentAttempt.create({
    userId,
    assessmentId: assessment._id.toString(),
    assessmentTitle: assessment.title,
    subject: assessment.subject,
    questions: publicQuestions,
    answers: {},
    status: "in_progress",
    totalMarks,
    score: 0,
    startedAt: now,
    expiresAt,
  });

  return attempt;
}

/**
 * Saves current student answer selections during an active attempt.
 */
export async function saveAttemptAnswers(
  attemptId: string,
  userId: string,
  answers: Record<string, { questionId: string; selectedOptionId: string | null; isFlaggedForReview?: boolean }>
): Promise<AssessmentAttemptDocument> {
  await connectToDatabase();

  const attempt = await AssessmentAttempt.findById(attemptId);
  if (!attempt) throw new Error("Attempt record not found.");

  if (attempt.userId !== userId) {
    throw new Error("Unauthorized to modify this assessment attempt.");
  }

  if (attempt.status !== "in_progress") {
    throw new Error("Attempt is already finalized and cannot be modified.");
  }

  const now = new Date();
  if (now > attempt.expiresAt) {
    // Automatically submit if time expired
    await submitAssessmentAttempt(attemptId, userId);
    const updated = await AssessmentAttempt.findById(attemptId);
    return updated!;
  }

  // Update answers map
  const existingAnswers = attempt.answers || {};
  for (const [qId, ans] of Object.entries(answers)) {
    existingAnswers[qId] = {
      questionId: qId,
      selectedOptionId: ans.selectedOptionId || null,
      isFlaggedForReview: Boolean(ans.isFlaggedForReview),
      answeredAt: new Date(),
    };
  }

  attempt.answers = existingAnswers;
  attempt.markModified("answers");
  await attempt.save();

  return attempt;
}

/**
 * Submits and deterministically scores an assessment attempt server-side.
 */
export async function submitAssessmentAttempt(
  attemptId: string,
  userId: string
): Promise<{ attempt: AssessmentAttemptDocument; result: IAssessmentResult }> {
  await connectToDatabase();

  const attempt = await AssessmentAttempt.findById(attemptId);
  if (!attempt) throw new Error("Attempt record not found.");

  if (attempt.userId !== userId) {
    throw new Error("Unauthorized: attempt belongs to another student.");
  }

  const assessment = await Assessment.findById(attempt.assessmentId);
  const passingThreshold = assessment?.passingThreshold || 60;

  if (attempt.status === "submitted" || attempt.status === "timed_out") {
    const result = await getAttemptResult(attemptId, userId);
    return { attempt, result };
  }

  const now = new Date();
  const isTimedOut = now > attempt.expiresAt;

  // Retrieve actual question documents to access server-side correctAnswer & explanation
  const questionIds = attempt.questions.map((q) => q.id);
  const fullQuestions = await AssessmentQuestion.find({
    _id: { $in: questionIds },
  });

  const scoring = calculateAssessmentScore({
    questions: fullQuestions,
    studentAnswers: (attempt.answers as Record<string, IStudentAnswer>) || {},
    passingThreshold,
  });

  const timeTakenSeconds = Math.max(
    1,
    Math.round((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000)
  );

  attempt.status = isTimedOut ? "timed_out" : "submitted";
  attempt.score = scoring.score;
  attempt.totalMarks = scoring.totalMarks;
  attempt.percentage = scoring.percentage;
  attempt.isPassed = scoring.isPassed;
  attempt.proficiency = scoring.proficiency;
  attempt.topicPerformance = scoring.topicPerformance as any;
  attempt.difficultyPerformance = scoring.difficultyPerformance as any;
  attempt.correctAnswersCount = scoring.correctAnswersCount;
  attempt.incorrectAnswersCount = scoring.incorrectAnswersCount;
  attempt.unansweredCount = scoring.unansweredCount;
  attempt.timeTakenSeconds = timeTakenSeconds;
  attempt.submittedAt = now;

  await attempt.save();

  // If passed, record AssessmentEvidence and sync to SkillsPassport
  if (scoring.isPassed) {
    await recordAssessmentEvidence(userId, attempt, scoring.percentage, scoring.proficiency);
  }

  const result: IAssessmentResult = {
    attempt: attempt.toObject() as any,
    questionReviews: scoring.questionReviews,
    strengths: scoring.strengths,
    weaknesses: scoring.weaknesses,
    recommendedTopics: scoring.recommendedTopics,
    disclaimer:
      "Completing this assessment demonstrates validated proficiency on the specified test curriculum. It represents measurable technical evidence rather than universal or exhaustive mastery.",
  };

  return { attempt, result };
}

/**
 * Records verified assessment evidence and links with Digital Skills Passport.
 */
async function recordAssessmentEvidence(
  userId: string,
  attempt: AssessmentAttemptDocument,
  percentage: number,
  proficiency: string
): Promise<void> {
  try {
    // Upsert AssessmentEvidence
    await AssessmentEvidence.findOneAndUpdate(
      {
        userId,
        skill: attempt.subject,
        assessmentId: attempt.assessmentId,
      },
      {
        attemptId: attempt._id.toString(),
        assessmentTitle: attempt.assessmentTitle,
        score: attempt.score,
        percentage,
        proficiency,
        isPassed: true,
        verifiedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Sync to SkillsPassport
    const passport = await SkillsPassport.findOne({ userId });
    if (passport) {
      const assessmentEntry = {
        id: `assess_${attempt._id.toString()}`,
        assessmentTitle: attempt.assessmentTitle,
        skillName: attempt.subject,
        score: percentage,
        badge: `${proficiency} Verified`,
        completedAt: new Date(),
        verificationReference: `AssessmentAttempt:${attempt._id.toString()}`,
      };

      const existingIdx = passport.assessments.findIndex(
        (a) => a.assessmentTitle === attempt.assessmentTitle
      );

      if (existingIdx >= 0) {
        passport.assessments[existingIdx] = assessmentEntry as any;
      } else {
        passport.assessments.push(assessmentEntry as any);
      }

      // Upgrade matching skill in passport if present
      passport.skills.forEach((skill) => {
        if (areSkillsEquivalent(skill.name, attempt.subject)) {
          skill.evidenceType = "assessment_verified";
          skill.verificationStatus = "verified";
          skill.verificationDate = new Date();
          skill.issuingSource = "CareerBridge AI Assessment Engine";
          skill.evidenceReference = `Scored ${percentage}% on ${attempt.assessmentTitle}`;
        }
      });

      passport.updatedAt = new Date();
      await passport.save();
    }
  } catch (err) {
    console.error("[AssessmentService] Failed to record evidence in passport:", err);
  }
}

/**
 * Retrieves the comprehensive post-submission result review.
 * Only accessible after submission or timeout.
 */
export async function getAttemptResult(
  attemptId: string,
  userId: string,
  isAdmin = false
): Promise<IAssessmentResult> {
  await connectToDatabase();

  const attempt = await AssessmentAttempt.findById(attemptId);
  if (!attempt) throw new Error("Attempt record not found.");

  if (!isAdmin && attempt.userId !== userId) {
    throw new Error("Unauthorized: attempt belongs to another student.");
  }

  if (attempt.status === "in_progress") {
    // If expired, auto-submit
    if (new Date() > attempt.expiresAt) {
      const { result } = await submitAssessmentAttempt(attemptId, attempt.userId);
      return result;
    }
    throw new Error("Assessment attempt is still in progress. Submit before viewing results.");
  }

  const assessment = await Assessment.findById(attempt.assessmentId);
  const passingThreshold = assessment?.passingThreshold || 60;

  const questionIds = attempt.questions.map((q) => q.id);
  const fullQuestions = await AssessmentQuestion.find({
    _id: { $in: questionIds },
  });

  const scoring = calculateAssessmentScore({
    questions: fullQuestions,
    studentAnswers: (attempt.answers as Record<string, IStudentAnswer>) || {},
    passingThreshold,
  });

  return {
    attempt: attempt.toObject() as any,
    questionReviews: scoring.questionReviews,
    strengths: scoring.strengths,
    weaknesses: scoring.weaknesses,
    recommendedTopics: scoring.recommendedTopics,
    disclaimer:
      "Completing this assessment demonstrates validated proficiency on the specified test curriculum. It represents measurable technical evidence rather than universal or exhaustive mastery.",
  };
}

/**
 * Retrieves student assessment attempt history.
 */
export async function getStudentAssessmentsHistory(
  userId: string
): Promise<{
  attempts: AssessmentAttemptDocument[];
  evidences: Array<{
    skill: string;
    assessmentTitle: string;
    percentage: number;
    proficiency: string;
    verifiedAt: Date;
  }>;
}> {
  await connectToDatabase();

  const [attempts, evidences] = await Promise.all([
    AssessmentAttempt.find({ userId }).sort({ createdAt: -1 }),
    AssessmentEvidence.find({ userId, isPassed: true }).sort({ verifiedAt: -1 }),
  ]);

  return {
    attempts,
    evidences: evidences.map((e) => ({
      skill: e.skill,
      assessmentTitle: e.assessmentTitle,
      percentage: e.percentage,
      proficiency: e.proficiency,
      verifiedAt: new Date(e.verifiedAt),
    })),
  };
}

