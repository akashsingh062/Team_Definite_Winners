export type AssessmentSubject =
  | "JavaScript"
  | "HTML"
  | "CSS"
  | "React"
  | "Node.js"
  | "Express.js"
  | "MongoDB"
  | "SQL"
  | "Python"
  | "Java"
  | "Data Structures and Algorithms"
  | string;

export type QuestionType =
  | "multiple_choice"
  | "output_prediction"
  | "code_debugging";

export type QuestionDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type AssessmentDifficulty =
  | "Beginner"
  | "Intermediate"
  | "Advanced"
  | "Mixed";

export type ProficiencyCategory =
  | "Beginner"
  | "Developing"
  | "Proficient"
  | "Advanced";

export type AssessmentStatus = "draft" | "published" | "archived";

export type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "timed_out"
  | "abandoned";

export interface IQuestionOption {
  id: string;
  text: string;
}

export interface IAssessmentQuestion {
  _id?: string;
  id?: string;
  title: string;
  questionText: string;
  codeSnippet?: string;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  options: IQuestionOption[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  status: AssessmentStatus;
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IAssessmentQuestionPublic {
  id: string;
  title: string;
  questionText: string;
  codeSnippet?: string;
  subject: string;
  topic: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  options: IQuestionOption[];
  marks: number;
}

export interface IAssessment {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingThreshold: number; // Percentage (default: 60)
  difficulty: AssessmentDifficulty;
  topics: string[];
  questionCount: number;
  questionReferences: string[];
  status: AssessmentStatus;
  retakeCooldownHours: number;
  createdBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IStudentAnswer {
  questionId: string;
  selectedOptionId: string | null;
  isFlaggedForReview: boolean;
  answeredAt?: Date | string;
}

export interface ITopicPerformance {
  topic: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
}

export interface IDifficultyPerformance {
  difficulty: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
}

export interface IAssessmentAttempt {
  _id?: string;
  id?: string;
  userId: string;
  assessmentId: string;
  assessmentTitle: string;
  subject: string;
  questions: IAssessmentQuestionPublic[];
  answers: Record<string, IStudentAnswer>;
  status: AttemptStatus;
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
  timeTakenSeconds: number;
  startedAt: Date | string;
  expiresAt: Date | string;
  submittedAt?: Date | string;
}

export interface IQuestionReviewItem {
  question: IAssessmentQuestionPublic;
  selectedOptionId: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  marksPossible: number;
  explanation: string;
}

export interface IAssessmentResult {
  attempt: IAssessmentAttempt;
  questionReviews: IQuestionReviewItem[];
  strengths: string[];
  weaknesses: string[];
  recommendedTopics: string[];
  disclaimer: string;
}

export interface IAssessmentEvidenceDoc {
  _id?: string;
  userId: string;
  skill: string;
  assessmentId: string;
  assessmentTitle: string;
  attemptId: string;
  score: number;
  percentage: number;
  proficiency: ProficiencyCategory;
  isPassed: boolean;
  verifiedAt: Date | string;
}

