"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { IAssessmentAttempt, IStudentAnswer } from "@/types/assessment";
import { CountdownTimer } from "@/features/assessments/components/CountdownTimer";
import { QuestionPalette } from "@/features/assessments/components/QuestionPalette";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function AssessmentAttemptRunnerPage() {
  const params = useParams<{ assessmentId: string }>();
  const router = useRouter();

  const [attempt, setAttempt] = useState<IAssessmentAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, IStudentAnswer>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // Load or initialize attempt
  useEffect(() => {
    let ignore = false;
    async function loadAttempt() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/assessments/${params.assessmentId}/start`, {
          method: "POST",
        });
        const json = await res.json();

        if (!ignore && json.success && json.data) {
          const att: IAssessmentAttempt = json.data;
          if (att.status === "submitted" || att.status === "timed_out") {
            // Already finished, route to results
            router.replace(`/dashboard/assessments/results/${att._id || att.id}`);
            return;
          }
          setAttempt(att);
          setAnswers(att.answers || {});
        } else if (!json.success) {
          toast.error(json.error || "Failed to initialize assessment.");
          router.push(`/dashboard/assessments/${params.assessmentId}`);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Attempt load error:", err);
          toast.error("Network error loading assessment.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    if (params.assessmentId) {
      loadAttempt();
    }
    return () => {
      ignore = true;
    };
  }, [params.assessmentId, router]);

  // Server-side answer auto-save
  const persistAnswerToServer = useCallback(
    async (questionId: string, selectedOptionId: string | null, isFlagged: boolean) => {
      if (!attempt) return;
      const attemptId = attempt._id || attempt.id;
      setSaveStatus("saving");

      try {
        await fetch(`/api/assessments/attempts/${attemptId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: {
              [questionId]: {
                questionId,
                selectedOptionId,
                isFlaggedForReview: isFlagged,
              },
            },
          }),
        });
        setSaveStatus("saved");
      } catch (err) {
        console.warn("Failed to auto-save answer:", err);
        setSaveStatus("saved");
      }
    },
    [attempt]
  );

  const handleSelectOption = (optionId: string) => {
    if (!attempt) return;
    const currentQ = attempt.questions[currentIndex];
    const existing = answers[currentQ.id];

    const updatedAnswer: IStudentAnswer = {
      questionId: currentQ.id,
      selectedOptionId: optionId,
      isFlaggedForReview: Boolean(existing?.isFlaggedForReview),
      answeredAt: new Date(),
    };

    const newAnswers = { ...answers, [currentQ.id]: updatedAnswer };
    setAnswers(newAnswers);
    persistAnswerToServer(currentQ.id, optionId, updatedAnswer.isFlaggedForReview);
  };

  const handleToggleFlag = () => {
    if (!attempt) return;
    const currentQ = attempt.questions[currentIndex];
    const existing = answers[currentQ.id];
    const newFlag = !existing?.isFlaggedForReview;

    const updatedAnswer: IStudentAnswer = {
      questionId: currentQ.id,
      selectedOptionId: existing?.selectedOptionId || null,
      isFlaggedForReview: newFlag,
      answeredAt: new Date(),
    };

    const newAnswers = { ...answers, [currentQ.id]: updatedAnswer };
    setAnswers(newAnswers);
    persistAnswerToServer(currentQ.id, updatedAnswer.selectedOptionId, newFlag);
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    const attemptId = attempt._id || attempt.id;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/assessments/attempts/${attemptId}/submit`, {
        method: "POST",
      });
      const json = await res.json();

      if (json.success && json.data) {
        toast.success("Assessment submitted successfully!");
        router.push(`/dashboard/assessments/results/${attemptId}`);
      } else {
        toast.error(json.error || "Failed to submit assessment.");
        setIsSubmitting(false);
      }
    } catch {
      toast.error("Network error during submission.");
      setIsSubmitting(false);
    }
  };

  const handleTimeExpire = () => {
    toast.warning("Time has expired! Submitting answers automatically.");
    handleSubmit();
  };

  if (isLoading || !attempt) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Preparing test session...</p>
      </div>
    );
  }

  const currentQ = attempt.questions[currentIndex];
  const currentAnswer = answers[currentQ.id];
  const isFlagged = Boolean(currentAnswer?.isFlaggedForReview);

  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOptionId
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Test Header */}
      <header className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            {attempt.subject} Assessment
          </span>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-sm sm:max-w-md">
            {attempt.assessmentTitle}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            {saveStatus === "saving" ? "Saving answer..." : "Auto-saved"}
          </span>

          <CountdownTimer
            expiresAt={attempt.expiresAt}
            onExpire={handleTimeExpire}
          />

          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Testing Workspace */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Question Card (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col justify-between bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div>
            {/* Question Header */}
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Question {currentIndex + 1} of {attempt.questions.length}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {currentQ.topic}
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {currentQ.marks} {currentQ.marks === 1 ? "Mark" : "Marks"}
                </span>
              </div>
            </div>

            {/* Question Text */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 leading-snug">
              {currentQ.questionText}
            </h3>

            {/* Code Snippet Block (if present) */}
            {currentQ.codeSnippet && (
              <div className="mb-6 rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                <pre>{currentQ.codeSnippet}</pre>
              </div>
            )}

            {/* Option Radio Group */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((option) => {
                const isSelected = currentAnswer?.selectedOptionId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(option.id)}
                    className={`w-full p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-1 ring-blue-600 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-medium leading-relaxed">
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Question Action Bar */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleToggleFlag}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                isFlagged
                  ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-300"
                  : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? "fill-current" : ""}`} />
              {isFlagged ? "Flagged for Review" : "Mark for Review"}
            </button>

            {currentIndex < attempt.questions.length - 1 ? (
              <button
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(attempt.questions.length - 1, prev + 1)
                  )
                }
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowSubmitModal(true)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finish Test
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar: Question Palette & Overview */}
        <div className="space-y-4">
          <QuestionPalette
            questions={attempt.questions}
            answers={answers}
            currentIndex={currentIndex}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
          />

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs text-xs text-slate-500 space-y-2">
            <div className="flex items-center justify-between">
              <span>Answered:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {answeredCount} of {attempt.questions.length}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Time Remaining:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                Active Timer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-4">
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Ready to Submit Assessment?
                </h4>
                <p className="text-xs text-slate-500">
                  Finalize and score your attempt
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-300 mb-6 space-y-1.5">
              <p>
                <strong>Questions Answered:</strong> {answeredCount} of{" "}
                {attempt.questions.length}
              </p>
              {answeredCount < attempt.questions.length && (
                <p className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  You have {attempt.questions.length - answeredCount} unanswered questions!
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Scoring...
                  </>
                ) : (
                  "Confirm & Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

