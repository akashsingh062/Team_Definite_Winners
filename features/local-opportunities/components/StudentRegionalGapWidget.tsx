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
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" />
            Your Skill Alignment in {region.state || "Active Region"}
          </h3>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Compare your demonstrated profile competencies against top skills demanded by regional employers
          </p>
        </div>

        {/* Action link to roadmap */}
        <Link
          href="/dashboard/roadmap"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shrink-0 shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Update Learning Roadmap
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-900 font-bold block">
              Skills Demonstrated
            </span>
            <span className="text-2xl font-black text-emerald-950 mt-0.5 block">
              {summary.skillsDemonstrated}
            </span>
          </div>
          <CheckCircle2 className="w-7 h-7 text-emerald-600" />
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-900 font-bold block">
              Missing Required
            </span>
            <span className="text-2xl font-black text-amber-950 mt-0.5 block">
              {summary.missingRequired}
            </span>
          </div>
          <AlertCircle className="w-7 h-7 text-amber-600" />
        </div>

        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-blue-900 font-bold block">
              Missing Preferred
            </span>
            <span className="text-2xl font-black text-blue-950 mt-0.5 block">
              {summary.missingPreferred}
            </span>
          </div>
          <BookOpen className="w-7 h-7 text-blue-600" />
        </div>
      </div>

      {/* Skills Matrix Table */}
      <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
        {gapItems.map((item) => (
          <div
            key={item.skillName}
            className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/80 transition"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-slate-900 text-sm">
                  {item.skillName}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold border border-slate-200">
                  {item.regionalDemandCount} regional postings ({item.demandPercentage}%)
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {item.isRequired ? "Frequently required by employers" : "Frequently preferred as a bonus skill"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {item.studentHasSkill ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center gap-1.5 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Demonstrated ({item.studentProficiency || "Verified"})
                </span>
              ) : item.gapStatus === "missing_required" ? (
                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Target Gap (High Priority)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-900 font-bold text-xs border border-blue-200">
                  Bonus Recommendation
                </span>
              )}

              {!item.studentHasSkill && (
                <Link
                  href="/dashboard/skill-gap"
                  className="p-2 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition"
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
      <p className="text-xs text-slate-500 italic">
        * {sampleSizeDisclaimer}
      </p>
    </div>
  );
}
