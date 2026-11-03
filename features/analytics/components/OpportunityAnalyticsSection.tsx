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
  Legend,
} from "recharts";
import {
  Briefcase,
  CheckCircle,
  MapPin,
  TrendingUp,
  Cpu,
  Layers,
} from "lucide-react";
import { IOpportunityAnalytics } from "@/types/analytics";

interface OpportunityAnalyticsSectionProps {
  data: IOpportunityAnalytics | null;
  isLoading: boolean;
}

const CAT_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

export function OpportunityAnalyticsSection({
  data,
  isLoading,
}: OpportunityAnalyticsSectionProps) {
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
    totalOpportunities,
    publishedOpportunities,
    verifiedOpportunities,
    categoryDistribution,
    workModeDistribution,
    statusDistribution,
    skillDemand,
  } = data;

  return (
    <div className="space-y-6">
      {/* Top Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Total Opportunities</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalOpportunities}</div>
          <p className="text-xs text-slate-400 mt-0.5">Platform inventory</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Verified Listings</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{verifiedOpportunities}</div>
          <p className="text-xs text-slate-400 mt-0.5">TPO authenticated</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Published & Live</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{publishedOpportunities}</div>
          <p className="text-xs text-slate-400 mt-0.5">Visible to students</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Category Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Internships, Full-Time Jobs, and Skill Programs
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="label"
                  label={({ label, percentage }) => `${label}: ${percentage}%`}
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CAT_COLORS[index % CAT_COLORS.length]}
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

        {/* Work Mode Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                Work Mode Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Remote, Hybrid, and Onsite opportunity distribution
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workModeDistribution}>
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
                    `${val} opportunities (${item.payload.percentage}%)`,
                    "Count",
                  ]}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Skill Demand Analysis */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-600" />
              Employer Skill Demand (Required vs Preferred)
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated skill mentions across all verified postings with semantic normalization
            </p>
          </div>
        </div>
        <div className="h-72">
          {skillDemand.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No skill demand recorded.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skillDemand.slice(0, 10)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#334155" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Bar
                  dataKey="requiredCount"
                  name="Required Skill"
                  fill="#4f46e5"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="preferredCount"
                  name="Preferred Skill"
                  fill="#93c5fd"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

