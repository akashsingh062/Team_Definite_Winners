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
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Advanced":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "Intermediate":
      default:
        return "bg-blue-50 text-blue-800 border-blue-200";
    }
  };

  const getSubjectColor = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("javascript")) return "bg-amber-50 text-amber-800 border-amber-200";
    if (s.includes("react")) return "bg-cyan-50 text-cyan-800 border-cyan-200";
    if (s.includes("node") || s.includes("express")) return "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (s.includes("python")) return "bg-blue-50 text-blue-800 border-blue-200";
    if (s.includes("sql") || s.includes("mongo")) return "bg-indigo-50 text-indigo-800 border-indigo-200";
    if (s.includes("data structure")) return "bg-purple-50 text-purple-800 border-purple-200";
    return "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="group relative bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
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
            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getDifficultyColor(
              assessment.difficulty
            )}`}
          >
            {assessment.difficulty}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition mb-2 leading-snug">
          <Link href={`/dashboard/assessments/${assessment._id || assessment.id}`}>
            {assessment.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {assessment.description}
        </p>

        {/* Topics Preview Chips */}
        {assessment.topics && assessment.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {assessment.topics.slice(0, 3).map((topic, i) => (
              <span
                key={i}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
              >
                {topic}
              </span>
            ))}
            {assessment.topics.length > 3 && (
              <span className="text-[10px] text-slate-500 px-1 py-0.5 font-medium">
                +{assessment.topics.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <div>
        {/* Metrics Bar */}
        <div className="pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-500 mb-4">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="block font-black text-slate-900 text-xs">
              {assessment.durationMinutes}m
            </span>
            <span className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5 text-slate-500 font-medium">
              <Clock className="w-2.5 h-2.5 text-slate-400" />
              Duration
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="block font-black text-slate-900 text-xs">
              {assessment.questionCount || 10}
            </span>
            <span className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5 text-slate-500 font-medium">
              <HelpCircle className="w-2.5 h-2.5 text-slate-400" />
              Questions
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="block font-black text-emerald-700 text-xs">
              {assessment.passingThreshold}%
            </span>
            <span className="text-[10px] flex items-center justify-center gap-0.5 mt-0.5 text-slate-500 font-medium">
              <Award className="w-2.5 h-2.5 text-slate-400" />
              Passing
            </span>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="flex items-center justify-between gap-2">
          {isCompleted && score !== undefined ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verified: {score}%{proficiency ? ` (${proficiency})` : ""}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-500 pl-1">
              Untested Skill
            </span>
          )}

          <Link
            href={`/dashboard/assessments/${assessment._id || assessment.id}`}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
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
