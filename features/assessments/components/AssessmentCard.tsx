"use client";

import React from "react";
import Link from "next/link";
import { Clock, HelpCircle, Award, ChevronRight, CheckCircle2 } from "lucide-react";
import { IAssessment } from "@/types/assessment";

interface AssessmentCardProps {
  assessment: IAssessment;
  isCompleted?: boolean;
  score?: number;
}

export function AssessmentCard({
  assessment,
  isCompleted = false,
  score,
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
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

        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
          {assessment.title}
        </h3>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {assessment.description}
        </p>

        {/* Topics Preview */}
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
              <span className="text-[10px] text-slate-400 px-1 py-0.5">
                +{assessment.topics.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Metrics Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs text-slate-500 dark:text-slate-400 mb-4">
          <div>
            <span className="block font-bold text-slate-800 dark:text-slate-200">
              {assessment.durationMinutes}m
            </span>
            <span className="text-[10px] flex items-center justify-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              Duration
            </span>
          </div>

          <div>
            <span className="block font-bold text-slate-800 dark:text-slate-200">
              {assessment.questionCount || 10}
            </span>
            <span className="text-[10px] flex items-center justify-center gap-1">
              <HelpCircle className="w-2.5 h-2.5" />
              Questions
            </span>
          </div>

          <div>
            <span className="block font-bold text-slate-800 dark:text-slate-200">
              {assessment.passingThreshold}%
            </span>
            <span className="text-[10px] flex items-center justify-center gap-1">
              <Award className="w-2.5 h-2.5" />
              Passing
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center justify-between gap-3">
          {isCompleted && score !== undefined ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified: {score}%
            </span>
          ) : (
            <span className="text-xs text-slate-400">Untested</span>
          )}

          <Link
            href={`/dashboard/assessments/${assessment._id || assessment.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition"
          >
            Take Test
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

