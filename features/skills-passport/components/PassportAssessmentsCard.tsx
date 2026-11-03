"use client";

import React from "react";
import { IPassportAssessment } from "@/types/skills-passport";
import { ShieldCheck, CheckCircle2, Calendar } from "lucide-react";

interface PassportAssessmentsCardProps {
  assessments: IPassportAssessment[];
}

export function PassportAssessmentsCard({
  assessments,
}: PassportAssessmentsCardProps) {
  if (!assessments || assessments.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs text-center">
        <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No platform assessments completed yet. Complete roadmap capstone milestones to earn verified badges.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Practical Platform Assessments ({assessments.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Validated by NexSkill AI curriculum capstones and practical skill readiness assessments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {assessments.map((item) => (
          <div
            key={item.id}
            className="p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {item.assessmentTitle}
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shrink-0">
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-0.5">
                Target Competency: {item.skillName}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.completedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  Verified Engine
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
