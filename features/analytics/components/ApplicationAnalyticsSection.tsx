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
  LineChart,
  Line,
} from "recharts";
import {
  Layers,
  ArrowRight,
  TrendingUp,
  Percent,
  CheckCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { IApplicationAnalytics } from "@/types/analytics";

interface ApplicationAnalyticsSectionProps {
  data: IApplicationAnalytics | null;
  isLoading: boolean;
}

export function ApplicationAnalyticsSection({
  data,
  isLoading,
}: ApplicationAnalyticsSectionProps) {
  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
          <div className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  const {
    totalTracked,
    submittedTotal,
    savedToAppliedRate,
    funnel,
    statusDistribution,
    applicationsOverTime,
  } = data;

  return (
    <div className="space-y-6">
      {/* Top Headline Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Total Tracked Opportunities</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalTracked}</div>
          <p className="text-xs text-slate-400 mt-0.5">Bookmarks and submissions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Submitted Applications</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{submittedTotal}</div>
          <p className="text-xs text-slate-400 mt-0.5">Formally applied</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Saved-to-Applied Conversion</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {savedToAppliedRate}%
          </div>
          <p className="text-xs text-slate-400 mt-0.5">High intent student conversion</p>
        </div>
      </div>

      {/* Recruitment Funnel Visual Progression */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            Recruitment Funnel Progression
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end transition rates from initial bookmark to confirmed placement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
          {funnel.map((stage, idx) => (
            <div
              key={stage.stage}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Step {idx + 1}</span>
                  {idx > 0 && (
                    <span className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold">
                      {stage.conversionFromPrevious}%
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1">
                  {stage.label}
                </h4>
                <div className="text-xl font-extrabold text-slate-800 mt-1">
                  {stage.count}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 text-2xs text-slate-500">
                <span className="block font-medium">Overall Conv:</span>
                <span className="font-bold text-slate-700">
                  {stage.conversionFromInitial}% of initial
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-blue-600" />
            Application Status Distribution
          </h3>
          <div className="space-y-3">
            {statusDistribution.map((item) => {
              const pct = totalTracked > 0 ? ((item.count / totalTracked) * 100).toFixed(1) : "0";
              return (
                <div key={item.status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500 font-semibold">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Velocity Over Time */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
            Application Velocity
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Daily saved opportunities vs formal applications submitted
          </p>
          <div className="h-60">
            {applicationsOverTime.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No activity in this time range.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={applicationsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="saved"
                    name="Saved"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="applied"
                    name="Applied"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

