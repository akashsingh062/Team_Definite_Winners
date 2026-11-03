"use client";

import React from "react";
import { IRegionalSkillDemand } from "@/types/local-opportunity";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Database,
  Briefcase,
  Globe,
} from "lucide-react";

interface RegionalSkillDemandChartProps {
  demand: IRegionalSkillDemand;
}

const WORK_MODE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6"];

export default function RegionalSkillDemandChart({
  demand,
}: RegionalSkillDemandChartProps) {
  const { region, topSkills, categoryDistribution, workModeDistribution } = demand;

  const chartData = topSkills.slice(0, 8).map((s) => ({
    name: s.skillName,
    count: s.opportunityCount,
    required: s.requiredCount,
    preferred: s.preferredCount,
  }));

  const pieData = workModeDistribution.map((w) => ({
    name: w.workMode.charAt(0).toUpperCase() + w.workMode.slice(1),
    value: w.count,
  }));

  return (
    <div className="space-y-6">
      {/* Transparency & Provenance Banner */}
      <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-slate-700 dark:text-slate-300">
            <strong>Sample Size:</strong> Computed from{" "}
            <span className="font-bold text-blue-600">{region.recordCountUsed}</span> verified
            opportunity records in <strong>{region.state || "All Regions"}</strong>.
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {new Date(region.dateRange.from).toLocaleDateString()} &ndash;{" "}
            {new Date(region.dateRange.to).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Demanded Skills Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Most Demanded Technical Skills
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frequency in regional verified opportunities (Required vs Preferred)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
              Top 8 Technologies
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    backgroundColor: "#0f172a",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="required" name="Required" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="preferred" name="Preferred" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Work Mode & Category Distribution */}
        <div className="space-y-6">
          {/* Work Mode Distribution */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Work Mode Distribution
            </h3>

            <div className="space-y-2 text-xs">
              {workModeDistribution.map((w, idx) => (
                <div key={w.workMode} className="space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="capitalize">{w.workMode}</span>
                    <span className="text-slate-500">
                      {w.count} ({w.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${w.percentage}%`,
                        backgroundColor: WORK_MODE_COLORS[idx % WORK_MODE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opportunity Categories */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              Opportunity Types
            </h3>

            <div className="space-y-2 text-xs">
              {categoryDistribution.map((c) => (
                <div
                  key={c.category}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">
                    {c.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold border border-slate-200 dark:border-slate-700">
                    {c.count} Postings
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

