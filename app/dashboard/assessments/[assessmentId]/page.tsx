"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { IAssessment } from "@/types/assessment";
import {
  Clock,
  Award,
  HelpCircle,
  ShieldCheck,
  ChevronLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AssessmentDetailPage() {
  const params = useParams<{ assessmentId: string }>();
  const router = useRouter();

  const [assessment, setAssessment] = useState<IAssessment | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<{
    _id: string;
    expiresAt: string;
  } | null>(null);
  const [lastAttempt, setLastAttempt] = useState<{
    _id: string;
    percentage: number;
    isPassed: boolean;
    proficiency: string;
    submittedAt: string;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadDetail() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/assessments/${params.assessmentId}`);
        const json = await res.json();
        if (!ignore && json.success && json.data) {
          setAssessment(json.data.assessment);
          setActiveAttempt(json.data.userActiveAttempt);
          setLastAttempt(json.data.lastCompletedAttempt);
        } else if (!json.success) {
          toast.error(json.error || "Failed to load assessment.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load assessment:", err);
          toast.error("Failed to load assessment.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    if (params.assessmentId) {
      loadDetail();
    }
    return () => {
      ignore = true;
    };
  }, [params.assessmentId]);

  const handleStart = async () => {
    if (!assessment) return;
    setIsStarting(true);
    try {
      const res = await fetch(`/api/assessments/${params.assessmentId}/start`, {
        method: "POST",
      });
      const json = await res.json();

      if (json.success && json.data?._id) {
        router.push(`/dashboard/assessments/${params.assessmentId}/attempt`);
      } else {
        toast.error(json.error || "Failed to start assessment.");
      }
    } catch {
      toast.error("Network error starting assessment.");
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <StudentPortalLayout>
        <div className="flex flex-col items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading assessment syllabus...</p>
        </div>
      </StudentPortalLayout>
    );
  }

  if (!assessment) {
    return (
      <StudentPortalLayout>
        <div className="max-w-xl mx-auto py-16 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Assessment not found</h2>
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

  return (
    <StudentPortalLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back navigation */}
        <Link
          href="/dashboard/assessments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Assessments Catalog
        </Link>

        {/* Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {assessment.subject} Assessment
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {assessment.title}
              </h1>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shrink-0">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Verified Competency Test
            </span>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {assessment.description}
          </p>

          {/* Test Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 mb-6 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {assessment.durationMinutes} min
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                Duration
              </p>
            </div>

            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {assessment.questionCount || 10}
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <HelpCircle className="w-3 h-3" />
                Questions
              </p>
            </div>

            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {assessment.totalMarks} pts
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <Award className="w-3 h-3" />
                Total Marks
              </p>
            </div>

            <div>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {assessment.passingThreshold}%
              </p>
              <p className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                Passing Score
              </p>
            </div>
          </div>

          {/* Previous Performance or Active Attempt Notice */}
          {activeAttempt && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    You have an ongoing attempt in progress!
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Your answers were saved. Resume before time expires.
                  </p>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={isStarting}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Play className="w-3.5 h-3.5" />
                Resume Test
              </button>
            </div>
          )}

          {lastAttempt && !activeAttempt && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Previous Score: {lastAttempt.percentage}% ({lastAttempt.proficiency})
                </p>
                <p className="text-xs text-slate-500">
                  {lastAttempt.isPassed ? "Status: Passed & Verified" : "Status: Retake Available"} | Completed on {new Date(lastAttempt.submittedAt).toLocaleDateString()}
                </p>
              </div>

              <Link
                href={`/dashboard/assessments/results/${lastAttempt._id}`}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Review Breakdown →
              </Link>
            </div>
          )}

          {/* Action Button */}
          {!activeAttempt && (
            <button
              onClick={handleStart}
              disabled={isStarting}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              {isStarting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Test Session...
                </>
              ) : lastAttempt ? (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Retake Assessment
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Assessment Now
                </>
              )}
            </button>
          )}
        </div>

        {/* Syllabus / Topics Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            Curriculum & Assessment Structure
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            The assessment draws randomized questions across these core technical topics
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {assessment.topics.map((topic, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                {topic}
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <h3 className="font-bold text-slate-700 dark:text-slate-300">
              Assessment Instructions:
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              <li>You may navigate between questions in any order and change selections before submission.</li>
              <li>Use the &quot;Mark for Review&quot; toggle if you wish to revisit a question later.</li>
              <li>Your answers are automatically saved to the server as you select them.</li>
              <li>Once the timer reaches zero, the test automatically finalizes your saved answers.</li>
              <li>Do not execute untrusted external code; questions test analytical output prediction and syntax debugging.</li>
            </ul>
          </div>
        </div>
      </div>
    </StudentPortalLayout>
  );
}

