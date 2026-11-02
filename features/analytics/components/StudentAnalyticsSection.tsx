"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  Users,
  GraduationCap,
  Code,
  FileCheck,
  Compass,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { IStudentAnalytics } from "@/types/analytics";

interface StudentAnalyticsSectionProps {
  data: IStudentAnalytics | null;
  isLoading: boolean;
}

const PIE_COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#64748b"];

export function StudentAnalyticsSection({
  data,
  isLoading,
}: StudentAnalyticsSectionProps) {
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
    totalStudents,
    activeStudents,
    registrationTrends,
    profileCompletionDistribution,
    educationDistribution,
    topTechnicalSkills,
    careerPreferences,
    resumeUploadStats,
  } = data;

  return (
    <div className="space-y-6">
      {/* Top Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Total Registered</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalStudents}</div>
          <p className="text-xs text-slate-400 mt-0.5">Students in selected period</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Active Profiles</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{activeStudents}</div>
          <p className="text-xs text-slate-400 mt-0.5">Configured profiles</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Resumes Uploaded</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {resumeUploadStats.totalResumes}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {resumeUploadStats.approvedResumes} approved ({resumeUploadStats.approvalRate}%)
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Pending Review</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {resumeUploadStats.pendingResumes}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Awaiting verification</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Registration Trends */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Student Registration Velocity
              </h3>
              <p className="text-xs text-slate-500">
                Daily and cumulative signups over the selected timeframe
              </p>
            </div>
          </div>
          <div className="h-64">
            {registrationTrends.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No registration activity in this period.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={registrationTrends}>
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
                    dataKey="cumulative"
                    name="Cumulative Students"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Daily Signups"
                    stroke="#06b6d4"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Profile Completion Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                Profile Completion Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Distribution of students across profile readiness brackets
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profileCompletionDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value} students (${item.payload.percentage}%)`,
                    "Count",
                  ]}
                />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top Technical Skills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Code className="h-4 w-4 text-purple-600" />
                Top Technical Skills in Profiles
              </h3>
              <p className="text-xs text-slate-500">
                Normalized student competencies (Strict Java ≠ JavaScript separation)
              </p>
            </div>
          </div>
          <div className="h-64">
            {topTechnicalSkills.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No student skills recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topTechnicalSkills.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "#334155" }}
                    width={85}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(val: any, name: any, item: any) => [
                      `${val} students (${item.payload.percentage}%)`,
                      "Count",
                    ]}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 4: Education Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                Degree & Education Breakdown
              </h3>
              <p className="text-xs text-slate-500">
                Academic backgrounds of registered students
              </p>
            </div>
          </div>
          <div className="h-64">
            {educationDistribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No education records available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={educationDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="degree"
                    label={({ degree, percentage }) => `${degree}: ${percentage}%`}
                  >
                    {educationDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
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
            )}
          </div>
        </div>
      </div>

      {/* Career Preferences Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
          <Compass className="h-4 w-4 text-indigo-600" />
          Student Career Preferences
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Target Career Roles
            </span>
            <div className="space-y-1.5">
              {careerPreferences.preferredRoles.length === 0 ? (
                <p className="text-xs text-slate-400">None declared yet.</p>
              ) : (
                careerPreferences.preferredRoles.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">{r.preference}</span>
                    <span className="text-slate-500 font-semibold">{r.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Employment Types
            </span>
            <div className="space-y-1.5">
              {careerPreferences.employmentTypes.length === 0 ? (
                <p className="text-xs text-slate-400">None declared yet.</p>
              ) : (
                careerPreferences.employmentTypes.map((e, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">{e.preference}</span>
                    <span className="text-slate-500 font-semibold">{e.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Work Modes Preferred
            </span>
            <div className="space-y-1.5">
              {careerPreferences.workModes.length === 0 ? (
                <p className="text-xs text-slate-400">None declared yet.</p>
              ) : (
                careerPreferences.workModes.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50"
                  >
                    <span className="font-medium text-slate-700">{w.preference}</span>
                    <span className="text-slate-500 font-semibold">{w.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

