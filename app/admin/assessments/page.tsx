"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IAssessment } from "@/types/assessment";
import {
  Award,
  Plus,
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Database,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminAssessmentsDashboardPage() {
  const [assessments, setAssessments] = useState<IAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/assessments");
        const json = await res.json();
        if (!ignore && json.success && json.data) {
          setAssessments(json.data);
        } else if (!json.success) {
          toast.error(json.error || "Failed to load TPO assessments.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("TPO assessments load error:", err);
          toast.error("Network error loading assessments.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Award className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              TPO Assessment & Question Bank
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure practical skill tests, passing thresholds, and question curriculum
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/assessments/questions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Database className="w-4 h-4 text-blue-600" />
              Manage Question Bank
            </Link>

            <Link
              href="/admin/assessments/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Create Assessment
            </Link>
          </div>
        </div>

        {/* Assessment List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading assessments catalog...</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No assessments configured yet.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Configured Assessments ({assessments.length})
              </h3>
              <span className="text-xs text-slate-400">
                11 Default Technical Subjects Initialized
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {assessments.map((a) => (
                <div
                  key={a._id || a.id}
                  className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 uppercase">
                        {a.subject}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                        {a.difficulty}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          a.status === "published"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {a.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {a.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-xl">
                      {a.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-500 shrink-0">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {a.durationMinutes} mins
                    </span>
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      {a.questionCount || 0} Questions
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pass: {a.passingThreshold}%
                    </span>

                    <Link
                      href={`/dashboard/assessments/${a._id || a.id}`}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 hover:text-blue-600 transition"
                      title="Preview Student View"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

