"use client";

import React from "react";
import Link from "next/link";
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Clock,
  Briefcase,
  X,
} from "lucide-react";
import { ICareerComparisonResult } from "@/types/career-path";
import { Button } from "@/components/ui/button";

interface CareerComparisonTableProps {
  comparison: ICareerComparisonResult;
  onRemovePath?: (slug: string) => void;
}

export function CareerComparisonTable({
  comparison,
  onRemovePath,
}: CareerComparisonTableProps) {
  const { careers, commonSkills, distinctSkillsByCareer, aiSynthesis } = comparison;

  return (
    <div className="space-y-6">
      {/* AI Synthesis Card */}
      {aiSynthesis && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            <span>AI Comparative Strategy</span>
            {aiSynthesis.isAiGenerated && (
              <span className="text-2xs font-normal text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Gemini Synthesized
              </span>
            )}
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {aiSynthesis.overview}
          </p>
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 font-medium">
            <span className="font-bold text-emerald-900">Recommendation:</span>{" "}
            {aiSynthesis.recommendation}
          </div>
          {aiSynthesis.keyTradeoffs.length > 0 && (
            <div className="space-y-1 pt-1">
              <span className="text-2xs font-bold text-slate-500 uppercase tracking-wider block">
                Key Strategic Tradeoffs
              </span>
              <ul className="list-disc pl-5 text-2xs text-slate-600 space-y-0.5">
                {aiSynthesis.keyTradeoffs.map((t, idx) => (
                  <li key={idx}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Common Overlapping Skills */}
      {commonSkills.length > 0 && (
        <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs space-y-1.5">
          <span className="font-bold text-indigo-900 flex items-center gap-1.5">
            <GitCompare className="h-4 w-4 text-indigo-600" />
            Shared Core Competencies Across These Roles ({commonSkills.length})
          </span>
          <p className="text-2xs text-slate-600">
            Skills that build simultaneous readiness across all selected pathways:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {commonSkills.map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-white text-indigo-900 font-semibold text-2xs border border-indigo-200 shadow-2xs"
              >
                ★ {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Columns */}
      <div className={`grid grid-cols-1 md:grid-cols-${careers.length} gap-4`}>
        {careers.map((item) => {
          const cp = item.careerPath;
          const align = item.alignment;
          const distinct = distinctSkillsByCareer[cp.title] || [];

          return (
            <div
              key={cp.slug}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                      {cp.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                      {cp.title}
                    </h4>
                    <span className="text-2xs text-slate-500 capitalize">
                      {cp.learningDifficulty} Level
                    </span>
                  </div>

                  {onRemovePath && (
                    <button
                      type="button"
                      onClick={() => onRemovePath(cp.slug)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Score */}
                <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Readiness Score</span>
                  <span className="text-xl font-black text-indigo-600">
                    {align.overallScore}%
                  </span>
                </div>

                {/* Ramp-up Estimate */}
                <div className="text-xs space-y-1">
                  <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Estimated Ramp-Up
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {item.learningEffortEstimate}
                  </span>
                </div>

                {/* Matched Required Skills */}
                <div className="text-xs space-y-1.5">
                  <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Matched Skills ({align.skills.matchedRequired.length} of {align.skills.totalRequiredCount})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {align.skills.matchedRequired.length === 0 ? (
                      <span className="text-2xs text-slate-400">None yet</span>
                    ) : (
                      align.skills.matchedRequired.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-2xs font-semibold border border-emerald-100"
                        >
                          ✓ {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="text-xs space-y-1.5">
                  <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Missing Required Skills ({align.skills.missingRequired.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {align.skills.missingRequired.length === 0 ? (
                      <span className="text-2xs text-emerald-600 font-bold">All satisfied</span>
                    ) : (
                      align.skills.missingRequired.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-medium"
                        >
                          {s}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Unique Distinct Skills for this path */}
                {distinct.length > 0 && (
                  <div className="text-xs space-y-1.5">
                    <span className="text-2xs font-semibold text-purple-600 uppercase tracking-wider block">
                      Unique to this Role
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {distinct.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-2xs font-medium border border-purple-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opportunities in platform */}
                <div className="text-xs space-y-1 pt-2 border-t border-slate-100">
                  <span className="text-2xs text-slate-400 font-semibold block">
                    Live Platform Postings:
                  </span>
                  <span className="font-bold text-slate-800">
                    {item.relatedOpportunitiesCount} active listings
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <Link
                  href={`/dashboard/career-simulator?career=${cp.slug}`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Sliders className="h-3 w-3 mr-1" />
                    <span>Simulate</span>
                  </Button>
                </Link>
                <Link
                  href={`/dashboard/career-explorer/${cp.slug}`}
                  className="flex-1"
                >
                  <Button variant="primary" size="sm" className="w-full text-xs">
                    <span>View Role</span>
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

