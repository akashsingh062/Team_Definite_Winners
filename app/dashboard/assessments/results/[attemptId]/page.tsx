"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { IAssessmentResult } from "@/types/assessment";
import { TopicPerformanceBars } from "@/features/assessments/components/TopicPerformanceBars";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  FileBadge,
  ChevronLeft,
  RotateCcw,
  Sparkles,
  Loader2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";

export default function AssessmentResultDashboardPage() {
  const params = useParams<{ attemptId: string }>();
  const [result, setResult] = useState<IAssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadResult() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/assessments/results/${params.attemptId}`);
        const json = await res.json();

        if (!ignore && json.success && json.data) {
          setResult(json.data);
        } else if (!json.success) {
          toast.error(json.error || "Failed to load assessment results.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Result load error:", err);
          toast.error("Network error loading results.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    if (params.attemptId) {
      loadResult();
    }
    return () => {
      ignore = true;
    };
  }, [params.attemptId]);

  if (isLoading) {
    return (
      <StudentPortalLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Compiling assessment scorecard...</p>
        </div>
      </StudentPortalLayout>
    );
  }

  if (!result) {
    return (
      <StudentPortalLayout>
        <div className="max-w-xl mx-auto py-16 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Result not found</h2>
          <Link
            href="/dashboard/assessments"
            className="text-xs text-blue-600 hover:underline"
          >
            ← Return to assessment catalog
          </Link>
        </div>
      </StudentPortalLayout>
    );
  }

  const { attempt, questionReviews, strengths, weaknesses, recommendedTopics } =
    result;
  const isPassed = attempt.isPassed;

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <StudentPortalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/dashboard/assessments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Assessments Catalog
        </Link>

        {/* Scorecard Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Assessment Scorecard
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {attempt.assessmentTitle}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Subject: {attempt.subject} | Completed:{" "}
                {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : "Recently"}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                  {attempt.percentage}%
                </span>
                <span className="block text-xs font-semibold text-slate-500">
                  {attempt.score}/{attempt.totalMarks} Points
                </span>
              </div>

              <div
                className={`px-4 py-2 rounded-2xl border text-center ${
                  isPassed
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200 border-emerald-300"
                    : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300"
                }`}
              >
                <span className="block text-xs font-bold uppercase tracking-wider">
                  {isPassed ? "Passed" : "Needs Review"}
                </span>
                <span className="text-xs font-medium">{attempt.proficiency}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="py-6 border-b border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span className="block text-lg font-bold text-emerald-600">
                {attempt.correctAnswersCount}
              </span>
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Correct
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span className="block text-lg font-bold text-rose-600">
                {attempt.incorrectAnswersCount}
              </span>
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <XCircle className="w-3 h-3 text-rose-600" />
                Incorrect
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span className="block text-lg font-bold text-slate-700 dark:text-slate-300">
                {attempt.unansweredCount}
              </span>
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <HelpCircle className="w-3 h-3" />
                Unanswered
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <span className="block text-lg font-bold text-slate-700 dark:text-slate-300">
                {formatMinutes(attempt.timeTakenSeconds || 0)}
              </span>
              <span className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                Time Taken
              </span>
            </div>
          </div>

          {/* Skills Passport Verified Seal Callout */}
          {isPassed && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    Verified Competency Added to Skills Passport
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Your {attempt.subject} assessment score was recorded as platform-verified evidence.
                  </p>
                </div>
              </div>

              <Link
                href="/dashboard/skills-passport"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <FileBadge className="w-3.5 h-3.5" />
                View Skills Passport
              </Link>
            </div>
          )}

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/dashboard/assessments/${attempt.assessmentId}`}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Rules & Info
            </Link>

            <Link
              href="/dashboard/roadmap"
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Target Weak Areas in Learning Roadmap
            </Link>
          </div>
        </div>

        {/* Topic Breakdown Bars */}
        <TopicPerformanceBars topicPerformance={attempt.topicPerformance} />

        {/* Strengths & Weaknesses Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Demonstrated Strengths ({strengths.length})
            </h3>
            {strengths.length === 0 ? (
              <p className="text-xs text-slate-400">
                Continue practicing across topics to build verified strengths.
              </p>
            ) : (
              <ul className="space-y-2">
                {strengths.map((str, i) => (
                  <li
                    key={i}
                    className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 text-xs font-medium text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900/40"
                  >
                    ✔ {str}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              Recommended Focus Areas ({recommendedTopics.length})
            </h3>
            <ul className="space-y-2">
              {recommendedTopics.map((top, i) => (
                <li
                  key={i}
                  className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 text-xs font-medium text-amber-900 dark:text-amber-200 border border-amber-100 dark:border-amber-900/40"
                >
                  ⚡ Focus: {top}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Review with Explanations */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            Question Review & Explanations ({questionReviews.length})
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Review detailed solutions, technical rationales, and correct answers
          </p>

          <div className="space-y-6">
            {questionReviews.map((item, idx) => (
              <div
                key={item.question.id}
                className={`p-5 rounded-2xl border transition ${
                  item.isCorrect
                    ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Question {idx + 1} • {item.question.topic}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.isCorrect
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200"
                    }`}
                  >
                    {item.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Correct (+{item.marksAwarded} pts)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        Incorrect (0/{item.marksPossible} pts)
                      </>
                    )}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  {item.question.questionText}
                </h4>

                {item.question.codeSnippet && (
                  <div className="mb-4 rounded-xl bg-slate-900 text-slate-100 p-3.5 font-mono text-xs overflow-x-auto">
                    <pre>{item.question.codeSnippet}</pre>
                  </div>
                )}

                {/* Options display */}
                <div className="space-y-2 mb-4">
                  {item.question.options.map((opt) => {
                    const isSelected = item.selectedOptionId === opt.id;
                    const isCorrectOption = item.correctAnswer === opt.id;

                    let optClasses = "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300";
                    if (isCorrectOption) {
                      optClasses = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-500";
                    } else if (isSelected && !item.isCorrect) {
                      optClasses = "border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 line-through";
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${optClasses}`}
                      >
                        <span>{opt.text}</span>
                        {isCorrectOption && (
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                            ✔ Correct Answer
                          </span>
                        )}
                        {isSelected && !isCorrectOption && (
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 shrink-0">
                            ✖ Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Technical Explanation */}
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <strong className="block text-slate-900 dark:text-slate-100 mb-1">
                    Solution Rationale:
                  </strong>
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>{result.disclaimer}</p>
        </div>
      </div>
    </StudentPortalLayout>
  );
}

