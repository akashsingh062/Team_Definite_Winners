"use client";

import React from "react";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  ShieldCheck,
} from "lucide-react";
import { ICareerAlignmentResult } from "@/types/career-path";

interface CareerReadinessScoreCardProps {
  alignment: ICareerAlignmentResult;
}

export function CareerReadinessScoreCard({ alignment }: CareerReadinessScoreCardProps) {
  const { overallScore, pillars, missingInformationNotes } = alignment;

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 50) return "text-indigo-600 bg-indigo-50 border-indigo-200";
    if (score >= 30) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-slate-600 bg-slate-100 border-slate-200";
  };

  const getBarColor = (score: number) => {
    if (score >= 75) return "bg-emerald-500";
    if (score >= 50) return "bg-indigo-500";
    if (score >= 30) return "bg-amber-500";
    return "bg-slate-400";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
            Objective Career Readiness
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            {alignment.careerTitle} Alignment
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent 4-pillar methodology evaluating skills, portfolio, and academic alignment
          </p>
        </div>

        {/* Big Overall Score Badge */}
        <div
          className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border ${getScoreColor(
            overallScore
          )} min-w-[110px] text-center shadow-2xs`}
        >
          <span className="text-3xl font-black">{overallScore}%</span>
          <span className="text-2xs font-bold uppercase tracking-wider mt-0.5">
            Readiness Score
          </span>
        </div>
      </div>

      {/* 4 Pillars Progress Grid */}
      <div className="space-y-4">
        {/* Pillar 1: Required Technical Skills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{pillars.requiredSkills.label}</span>
              <span className="text-2xs text-slate-400 font-normal">
                ({pillars.requiredSkills.weight}% weight)
              </span>
            </span>
            <span className="font-bold text-slate-900">
              {pillars.requiredSkills.score}% ({pillars.requiredSkills.weightedScore} pts)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                pillars.requiredSkills.score
              )}`}
              style={{ width: `${pillars.requiredSkills.score}%` }}
            />
          </div>
          <p className="text-2xs text-slate-500">{pillars.requiredSkills.details}</p>
        </div>

        {/* Pillar 2: Preferred Auxiliary Skills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{pillars.preferredSkills.label}</span>
              <span className="text-2xs text-slate-400 font-normal">
                ({pillars.preferredSkills.weight}% weight)
              </span>
            </span>
            <span className="font-bold text-slate-900">
              {pillars.preferredSkills.score}% ({pillars.preferredSkills.weightedScore} pts)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                pillars.preferredSkills.score
              )}`}
              style={{ width: `${pillars.preferredSkills.score}%` }}
            />
          </div>
          <p className="text-2xs text-slate-500">{pillars.preferredSkills.details}</p>
        </div>

        {/* Pillar 3: Project Evidence Relevance */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{pillars.projects.label}</span>
              <span className="text-2xs text-slate-400 font-normal">
                ({pillars.projects.weight}% weight)
              </span>
            </span>
            <span className="font-bold text-slate-900">
              {pillars.projects.score}% ({pillars.projects.weightedScore} pts)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                pillars.projects.score
              )}`}
              style={{ width: `${pillars.projects.score}%` }}
            />
          </div>
          <p className="text-2xs text-slate-500">{pillars.projects.details}</p>
        </div>

        {/* Pillar 4: Education & Foundation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>{pillars.educationExperience.label}</span>
              <span className="text-2xs text-slate-400 font-normal">
                ({pillars.educationExperience.weight}% weight)
              </span>
            </span>
            <span className="font-bold text-slate-900">
              {pillars.educationExperience.score}% ({pillars.educationExperience.weightedScore} pts)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                pillars.educationExperience.score
              )}`}
              style={{ width: `${pillars.educationExperience.score}%` }}
            />
          </div>
          <p className="text-2xs text-slate-500">{pillars.educationExperience.details}</p>
        </div>
      </div>

      {/* Missing Information Notes */}
      {missingInformationNotes.length > 0 && (
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-900">
          <span className="font-semibold flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-amber-600" />
            Profile Completeness Note
          </span>
          <ul className="list-disc pl-5 text-amber-800 space-y-0.5 text-2xs">
            {missingInformationNotes.map((note, idx) => (
              <li key={idx}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimers & Methodology Assurance */}
      <div className="p-3 bg-slate-50 rounded-xl text-2xs text-slate-500 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>
          Readiness is calculated using deterministic formula version {alignment.methodologyVersion}. This score indicates current qualification overlap, not a hiring guarantee or recruitment probability.
        </span>
      </div>
    </div>
  );
}

