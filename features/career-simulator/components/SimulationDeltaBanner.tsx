"use client";

import React from "react";
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { IWhatIfSimulationResult } from "@/types/career-path";

interface SimulationDeltaBannerProps {
  simulation: IWhatIfSimulationResult;
}

export function SimulationDeltaBanner({ simulation }: SimulationDeltaBannerProps) {
  const {
    baselineAlignment,
    simulatedAlignment,
    alignmentDelta,
    hypotheticalSkillsAdded,
    newlySatisfiedRequiredSkills,
    newlySatisfiedPreferredSkills,
    remainingMissingRequiredSkills,
    aiExplanation,
  } = simulation;

  return (
    <div className="space-y-4">
      {/* Prominent Hypothetical Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-900 shadow-2xs">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <span className="font-bold uppercase tracking-wider text-2xs block text-amber-700">
            Hypothetical Simulation Mode Active
          </span>
          <p className="text-amber-800 leading-relaxed">
            {simulation.safetyDisclaimer}
          </p>
        </div>
      </div>

      {/* Before & After Delta Metrics Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider block">
              Simulation Impact
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Readiness Projection with {hypotheticalSkillsAdded.length} Simulated Skill(s)
            </h3>
          </div>

          {/* Delta Pill */}
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <div className="text-center px-2">
              <span className="text-2xs text-slate-400 font-semibold block">Original</span>
              <span className="text-lg font-bold text-slate-700">
                {baselineAlignment.overallScore}%
              </span>
            </div>

            <ArrowRight className="h-4 w-4 text-slate-400" />

            <div className="text-center px-2">
              <span className="text-2xs text-indigo-500 font-semibold block">Simulated</span>
              <span className="text-lg font-black text-indigo-600">
                {simulatedAlignment.overallScore}%
              </span>
            </div>

            <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-sm">
              +{alignmentDelta}%
            </div>
          </div>
        </div>

        {/* Newly Satisfied Requirements vs Remaining Gaps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Newly Satisfied */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Requirements Unlocked Under Simulation (
              {newlySatisfiedRequiredSkills.length + newlySatisfiedPreferredSkills.length})
            </span>
            {newlySatisfiedRequiredSkills.length === 0 && newlySatisfiedPreferredSkills.length === 0 ? (
              <p className="text-2xs text-slate-500">
                Added skills do not match specific missing core competencies for this role.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {newlySatisfiedRequiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-900 font-semibold text-2xs border border-emerald-200"
                  >
                    ✓ {skill} (Required)
                  </span>
                ))}
                {newlySatisfiedPreferredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-teal-100/80 text-teal-900 font-medium text-2xs border border-teal-200"
                  >
                    ✓ {skill} (Preferred)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Remaining Gaps */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-slate-500" />
              Remaining Missing Required Skills ({remainingMissingRequiredSkills.length})
            </span>
            {remainingMissingRequiredSkills.length === 0 ? (
              <p className="text-2xs text-emerald-700 font-semibold">
                🎉 All required technical skills satisfied in this simulation!
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {remainingMissingRequiredSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white text-slate-700 font-medium text-2xs border border-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Strategic Value Explanation */}
        {aiExplanation && (
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-indigo-900 font-bold">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>AI Strategic Guidance</span>
              {aiExplanation.isAiGenerated && (
                <span className="text-2xs font-normal text-indigo-500 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  Powered by Gemini
                </span>
              )}
            </div>
            <p className="text-slate-700 leading-relaxed text-2xs">
              {aiExplanation.summary}
            </p>
            <p className="text-slate-600 leading-relaxed text-2xs">
              <strong className="text-slate-800">Industry Value:</strong> {aiExplanation.strategicValue}
            </p>
            {aiExplanation.suggestedProjectIdea && (
              <div className="pt-1 text-2xs text-slate-700">
                <strong className="text-indigo-900">Recommended Project:</strong>{" "}
                {aiExplanation.suggestedProjectIdea}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

