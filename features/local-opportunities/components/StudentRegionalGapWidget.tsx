"use client";

import React from "react";
import Link from "next/link";
import { IRegionalSkillGapAnalysis } from "@/types/local-opportunity";
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Compass,
} from "lucide-react";

interface StudentRegionalGapWidgetProps {
  analysis: IRegionalSkillGapAnalysis;
}

export default function StudentRegionalGapWidget({
  analysis,
}: StudentRegionalGapWidgetProps) {
  const { summary, gapItems, region, sampleSizeDisclaimer } = analysis;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            Your Skill Alignment in {region.state || "Active Region"}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare your demonstrated profile competencies against top skills demanded by regional employers
          </p>
        </div>

        {/* Action link to roadmap */}
        <Link
          href="/dashboard/roadmap"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Update Learning Roadmap
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold block">
              Skills Demonstrated
            </span>
            <span className="text-2xl font-black text-emerald-900 dark:text-emerald-100">
              {summary.skillsDemonstrated}
            </span>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-800 dark:text-amber-300 font-semibold block">
              Missing Required
            </span>
            <span className="text-2xl font-black text-amber-900 dark:text-amber-100">
              {summary.missingRequired}
            </span>
          </div>
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-800 dark:text-blue-300 font-semibold block">
              Missing Preferred
            </span>
            <span className="text-2xl font-black text-blue-900 dark:text-blue-100">
              {summary.missingPreferred}
            </span>
          </div>
          <BookOpen className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Skills Matrix Table */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
        {gapItems.map((item) => (
          <div
            key={item.skillName}
            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {item.skillName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                  {item.regionalDemandCount} regional postings ({item.demandPercentage}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {item.isRequired ? "Frequently required" : "Frequently preferred as a bonus"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {item.studentHasSkill ? (
                <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Demonstrated ({item.studentProficiency || "Verified"})
                </span>
              ) : item.gapStatus === "missing_required" ? (
                <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Target Gap (High Priority)
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold text-[11px]">
                  Bonus Recommendation
                </span>
              )}

              {!item.studentHasSkill && (
                <Link
                  href="/dashboard/skill-gap"
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition"
                  title="Analyze in Skill Gap Analyzer"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Sample Size Disclaimer */}
      <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">
        * {sampleSizeDisclaimer}
      </p>
    </div>
  );
}

