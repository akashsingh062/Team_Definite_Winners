"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Flame,
  Cpu,
} from "lucide-react";
import { IMatchingAnalytics } from "@/types/analytics";

interface MatchingAnalyticsSectionProps {
  data: IMatchingAnalytics | null;
  isLoading: boolean;
}

const ELIGIBILITY_COLORS = {
  eligible: "#10b981",
  partially_eligible: "#f59e0b",
  ineligible: "#ef4444",
};

export function MatchingAnalyticsSection({
  data,
  isLoading,
}: MatchingAnalyticsSectionProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  const {
    totalRecommendationsGenerated,
    uniqueStudentsMatched,
    uniqueOpportunitiesMatched,
    averageMatchScore,
    scoreDistribution,
    eligibilityDistribution,
    mostRecommendedOpportunities,
    aiGenerationStats,
  } = data;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">
            Recommendations Evaluated
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {totalRecommendationsGenerated}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {uniqueStudentsMatched} distinct students
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Average Match Score</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {averageMatchScore}%
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Across all explanations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">
            AI Narrative Coverage
          </span>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {aiGenerationStats.aiCoveragePercentage}%
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {aiGenerationStats.aiNarrativeCount} AI explanations
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">
            Deterministic Fallback
          </span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {aiGenerationStats.deterministicFallbackCount}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Safety rule-based explanations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Score Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-600" />
                Recommendation Match Score Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Frequency of recommendations across 5 score brackets
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val} evaluations (${item.payload.percentage}%)`,
                    "Recommendations",
                  ]}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Eligibility Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Eligibility Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Graduation, major, and criteria eligibility compliance
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eligibilityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="label"
                  label={({ label, percentage }) => `${label}: ${percentage}%`}
                >
                  {eligibilityDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        ELIGIBILITY_COLORS[
                          entry.status as keyof typeof ELIGIBILITY_COLORS
                        ] || "#94a3b8"
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most Recommended Opportunities */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Flame className="h-4 w-4 text-amber-500" />
          Most Frequently Recommended Opportunities
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Opportunities with highest student compatibility across the platform
        </p>

        {mostRecommendedOpportunities.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">
            No recommendation activity recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Title</th>
                  <th className="py-2.5 px-3 font-semibold">Company</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Recommendation Count
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mostRecommendedOpportunities.map((opp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {opp.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{opp.companyName}</td>
                    <td className="py-2.5 px-3">
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-2xs font-medium">
                        {opp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-indigo-600">
                      {opp.recommendationCount} students
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

