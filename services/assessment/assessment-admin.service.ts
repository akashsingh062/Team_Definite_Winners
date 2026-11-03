import { connectToDatabase } from "@/lib/db/mongodb";
import { Assessment, AssessmentDocument } from "@/models/Assessment";
import { AssessmentQuestion, AssessmentQuestionDocument } from "@/models/AssessmentQuestion";
import { IAssessment, IAssessmentQuestion } from "@/types/assessment";

/**
 * Creates a new assessment question in the question bank (Admin).
 */
export async function createAdminQuestion(
  adminId: string,
  payload: Partial<IAssessmentQuestion>
): Promise<AssessmentQuestionDocument> {
  await connectToDatabase();

  if (!payload.title || !payload.questionText || !payload.subject || !payload.topic) {
    throw new Error("Missing required question fields (title, questionText, subject, topic).");
  }

  if (!Array.isArray(payload.options) || payload.options.length < 2) {
    throw new Error("Question must contain at least 2 options.");
  }

  const optionIds = payload.options.map((o) => o.id);
  if (!payload.correctAnswer || !optionIds.includes(payload.correctAnswer)) {
    throw new Error("correctAnswer must match one of the provided option IDs.");
  }

  const question = await AssessmentQuestion.create({
    title: payload.title.trim(),
    questionText: payload.questionText.trim(),
    codeSnippet: payload.codeSnippet?.trim() || "",
    subject: payload.subject.trim(),
    topic: payload.topic.trim(),
    difficulty: payload.difficulty || "Intermediate",
    questionType: payload.questionType || "multiple_choice",
    options: payload.options,
    correctAnswer: payload.correctAnswer.trim(),
    explanation: payload.explanation?.trim() || "No explanation provided.",
    marks: payload.marks || 1,
    status: payload.status || "published",
    createdBy: adminId,
  });

  return question;
}

/**
 * Updates an existing question (Admin).
 */
export async function updateAdminQuestion(
  questionId: string,
  updates: Partial<IAssessmentQuestion>
): Promise<AssessmentQuestionDocument | null> {
  await connectToDatabase();

  if (updates.options && updates.options.length < 2) {
    throw new Error("Question must contain at least 2 options.");
  }

  const question = await AssessmentQuestion.findByIdAndUpdate(
    questionId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return question;
}

/**
 * Creates a new assessment configuration (Admin).
 */
export async function createAdminAssessment(
  adminId: string,
  payload: Partial<IAssessment>
): Promise<AssessmentDocument> {
  await connectToDatabase();

  if (!payload.title || !payload.subject || !payload.description) {
    throw new Error("Missing required assessment fields (title, subject, description).");
  }

  let questionRefs = payload.questionReferences || [];
  if (questionRefs.length === 0) {
    // Automatically associate published questions for this subject
    const matching = await AssessmentQuestion.find({
      subject: payload.subject,
      status: "published",
    }).select("_id");
    questionRefs = matching.map((q) => q._id.toString());
  }

  const assessment = await Assessment.create({
    title: payload.title.trim(),
    subject: payload.subject.trim(),
    description: payload.description.trim(),
    durationMinutes: payload.durationMinutes || 30,
    totalMarks: payload.totalMarks || (questionRefs.length > 0 ? questionRefs.length * 5 : 25),
    passingThreshold: payload.passingThreshold || 60,
    difficulty: payload.difficulty || "Mixed",
    topics: payload.topics || [],
    questionCount: questionRefs.length,
    questionReferences: questionRefs,
    status: payload.status || "published",
    retakeCooldownHours: payload.retakeCooldownHours !== undefined ? payload.retakeCooldownHours : 24,
    createdBy: adminId,
  });

  return assessment;
}

/**
 * Updates an assessment configuration (Admin).
 */
export async function updateAdminAssessment(
  assessmentId: string,
  updates: Partial<IAssessment>
): Promise<AssessmentDocument | null> {
  await connectToDatabase();

  const assessment = await Assessment.findByIdAndUpdate(
    assessmentId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  return assessment;
}

/**
 * Retrieves all questions for admin management.
 */
export async function getAdminQuestions(filter?: {
  subject?: string;
  status?: string;
}): Promise<AssessmentQuestionDocument[]> {
  await connectToDatabase();
  const query: Record<string, unknown> = {};

  if (filter?.subject && filter.subject !== "all") query.subject = filter.subject;
  if (filter?.status && filter.status !== "all") query.status = filter.status;

  return await AssessmentQuestion.find(query).sort({ subject: 1, createdAt: -1 });
}

