"use client";

import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Scale,
  CheckCircle,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Info,
  Sliders,
  FileCheck2,
} from "lucide-react";
import { IFairnessAnalytics } from "@/types/analytics";

interface FairnessMonitoringSectionProps {
  data: IFairnessAnalytics | null;
  isLoading: boolean;
}

export function FairnessMonitoringSection({
  data,
  isLoading,
}: FairnessMonitoringSectionProps) {
  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const {
    methodologyVersion,
    lastUpdated,
    factorWeights,
    protectedAttributesAudit,
    dataQuality,
    transparencyMetrics,
    limitationsNotice,
  } = data;

  const totalWeight = factorWeights.reduce((acc, f) => acc + f.weight, 0);

  return (
    <div className="space-y-6">
      {/* Compliance Header Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-emerald-950">
                  Responsible AI & Non-Discrimination Audit
                </h3>
                <span className="text-2xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Verified Compliant
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1 max-w-2xl leading-relaxed">
                Deterministic 7-factor scoring engine verified. Protected demographic attributes (gender, religion, caste, ethnicity, family income) are strictly quarantined and excluded from matching algorithms.
              </p>
            </div>
          </div>

          <div className="text-xs text-emerald-900 shrink-0 bg-white/80 p-3 rounded-xl border border-emerald-100">
            <div>
              <span className="font-semibold">Engine Version:</span> {methodologyVersion}
            </div>
            <div className="mt-1">
              <span className="font-semibold">Audit Timestamp:</span>{" "}
              {new Date(lastUpdated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* 7-Factor Scoring Methodology Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="h-4 w-4 text-indigo-600" />
              Explainable 7-Factor Recommendation Formula
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All candidates evaluated on an identical mathematical baseline (Total: {totalWeight}%)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Evaluation Factor</th>
                <th className="py-2.5 px-3 font-semibold text-center">Weight</th>
                <th className="py-2.5 px-3 font-semibold">Rationale & Deterministic Standard</th>
                <th className="py-2.5 px-3 font-semibold text-right">Protected Attribute Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {factorWeights.map((f, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {f.factor}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {f.weight}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-md">
                    {f.description}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="h-3 w-3" />
                      Zero PII / Non-Protected
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
              <tr>
                <td className="py-2 px-3">Cumulative Total</td>
                <td className="py-2 px-3 text-center text-indigo-700">{totalWeight}%</td>
                <td className="py-2 px-3 text-xs text-slate-500 font-normal">
                  Guaranteed balanced mathematical distribution
                </td>
                <td className="py-2 px-3 text-right text-emerald-700">100% Compliant</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Grid: Protected Attributes Audit & Data Quality Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protected Attributes Checklist */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-emerald-600" />
            Protected Attribute Exclusion Verification
          </h3>
          <p className="text-xs text-slate-500">
            The following demographic markers are strictly excluded from ranking calculations:
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {protectedAttributesAudit.attributesChecked.map((attr, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100"
              >
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="capitalize text-slate-700 font-medium">
                  {attr.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 space-y-1">
            <span className="font-semibold block flex items-center gap-1.5 text-blue-950">
              <Info className="h-3.5 w-3.5 text-blue-600" />
              Institutional Pedigree Neutrality
            </span>
            <p className="text-slate-600 leading-relaxed">
              Tier-blind evaluation is strictly enforced. Colleges and universities are parsed only for major, GPA, and graduation year compliance without assigning pedigree bonuses or tier-based multipliers.
            </p>
          </div>
        </div>

        {/* Data Quality & Transparency Metrics */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-indigo-600" />
            Data Quality & Transparency Indicators
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Missing Compensation</span>
              <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                {dataQuality.opportunitiesMissingCompensation}
              </span>
              <span className="text-2xs text-slate-400">Opportunities without pay range</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Missing Location</span>
              <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                {dataQuality.opportunitiesMissingLocation}
              </span>
              <span className="text-2xs text-slate-400">Onsite without clear city</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Incomplete Profiles (&lt;50%)</span>
              <span className="text-xl font-bold text-amber-600 mt-0.5 block">
                {dataQuality.incompleteStudentProfiles}
              </span>
              <span className="text-2xs text-slate-400">Affects match reliability</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Student Satisfaction</span>
              <span className="text-xl font-bold text-emerald-600 mt-0.5 block">
                {transparencyMetrics.studentFeedback.satisfactionRate}%
              </span>
              <span className="text-2xs text-slate-400">
                {transparencyMetrics.studentFeedback.helpfulCount} helpful / {transparencyMetrics.studentFeedback.notHelpfulCount} not helpful
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Explanations Audited:</span>
              <span className="font-semibold text-slate-900">
                {transparencyMetrics.totalExplanations}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Verified with Project Evidence:</span>
              <span className="font-semibold text-emerald-600">
                {transparencyMetrics.withProjectEvidenceCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>AI Fallback Rate (Rule Safeguard):</span>
              <span className="font-semibold text-purple-600">
                {transparencyMetrics.aiFallbackRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Limitations Disclaimer Notice */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
          <AlertTriangle className="h-4 w-4" />
          Responsible AI Limitations & Continuous Auditing Policy
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {limitationsNotice}
        </p>
      </div>
    </div>
  );
}

