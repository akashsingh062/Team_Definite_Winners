"use client";

import React from "react";
import Link from "next/link";
import { Clock, HelpCircle, Award, ArrowRight, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";
import { IAssessment } from "@/types/assessment";

interface AssessmentCardProps {
  assessment: IAssessment;
  isCompleted?: boolean;
  score?: number;
  proficiency?: string;
}

export function AssessmentCard({
  assessment,
  isCompleted = false,
  score,
  proficiency,
}: AssessmentCardProps) {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60";
      case "Advanced":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800/60";
      case "Intermediate":
      default:
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800/60";
    }
  };

  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("javascript")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (s.includes("react")) return "bg-cyan-50 text-cyan-700 border-cyan-200";
    if (s.includes("node") || s.includes("express")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (s.includes("python")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (s.includes("sql") || s.includes("mongo")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (s.includes("data structure")) return "bg-purple-50 text-purple-700 border-purple-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getSubjectColor(
              assessment.subject
            )}`}
          >
            {assessment.subject}
          </span>

          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyColor(
              assessment.difficulty
            )}`}
          >
            {assessment.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-2 leading-snug">
          <Link href={`/dashboard/assessments/${assessment._id || assessment.id}`}>
            {assessment.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {assessment.description}
        </p>

        {/* Topics Preview Chips */}
        {assessment.topics && assessment.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {assessment.topics.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              >
                {topic}
              </span>
            ))}
            {assessment.topics.length > 3 && (
              <span className="text-[10px] text-slate-400 px-1 py-0.5 font-medium">
                +{assessment.topics.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Metrics Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs">
              {assessment.durationMinutes}m
            </span>
            <span className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5 text-slate-400">
              <Clock className="w-2.5 h-2.5" />
              Duration
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span className="block font-bold text-slate-900 dark:text-slate-100 text-xs">
              {assessment.questionCount || 10}
            </span>
            <span className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5 text-slate-400">
              <HelpCircle className="w-2.5 h-2.5" />
              Questions
            </span>
          </div>

          <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <span className="block font-bold text-emerald-600 dark:text-emerald-400 text-xs">
              {assessment.passingThreshold}%
            </span>
            <span className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5 text-slate-400">
              <Award className="w-2.5 h-2.5" />
              Passing
            </span>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="flex items-center justify-between gap-2">
          {isCompleted && score !== undefined ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified: {score}%{proficiency ? ` (${proficiency})` : ""}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400 pl-1">
              Untested Skill
            </span>
          )}

          <Link
            href={`/dashboard/assessments/${assessment._id || assessment.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs"
          >
            {isCompleted ? (
              <>
                <RotateCcw className="w-3 h-3" />
                Retake
              </>
            ) : (
              <>
                Start Test
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
