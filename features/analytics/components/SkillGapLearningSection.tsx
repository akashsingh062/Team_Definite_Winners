"use client";

import React from "react";
import {
  Sparkles,
  GitPullRequest,
  CheckCircle,
  Clock,
  Target,
  AlertTriangle,
  BookOpen,
} from "lucide-react";
import { ISkillGapAnalytics, ILearningRoadmapAnalytics } from "@/types/analytics";

interface SkillGapLearningSectionProps {
  skillGapData: ISkillGapAnalytics | null;
  roadmapData: ILearningRoadmapAnalytics | null;
  isLoading: boolean;
}

export function SkillGapLearningSection({
  skillGapData,
  roadmapData,
  isLoading,
}: SkillGapLearningSectionProps) {
  if (isLoading || !skillGapData || !roadmapData) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  const { skillTriangulation, topMissingRequiredSkills, topMissingPreferredSkills } =
    skillGapData;
  const {
    totalRoadmaps,
    activeRoadmaps,
    completedRoadmaps,
    averageMilestones,
    averageProgressPercentage,
    topTargetedRoles,
    taskCompletionMetrics,
  } = roadmapData;

  return (
    <div className="space-y-6">
      {/* Learning Roadmap Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Personalized Roadmaps</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalRoadmaps}</div>
          <p className="text-xs text-slate-400 mt-0.5">
            {activeRoadmaps} currently in progress
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Completed Plans</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{completedRoadmaps}</div>
          <p className="text-xs text-slate-400 mt-0.5">Fully prepared for placement</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Average Plan Progress</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {averageProgressPercentage}%
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {averageMilestones} milestones per roadmap
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Task Completion Rate</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {taskCompletionMetrics.completionRate}%
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {taskCompletionMetrics.completedTasks} of {taskCompletionMetrics.totalTasks} tasks
          </p>
        </div>
      </div>

      {/* Triangulation Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <GitPullRequest className="h-5 w-5 text-indigo-600" />
              Skill Demand vs Gap vs Active Learning Triangulation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Correlating real employer requirements, diagnosed student deficits, and active curriculum engagement.
            </p>
          </div>
        </div>

        {skillTriangulation.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">
            No skill triangulation data available for this range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Skill</th>
                  <th className="py-2.5 px-3 font-semibold text-center">
                    Employer Postings
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center">
                    Student Gaps Diagnosed
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center">
                    Actively Learning
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-center">
                    Completed Mastery
                  </th>
                  <th className="py-2.5 px-3 font-semibold text-right">
                    Market Deficit Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skillTriangulation.map((item, idx) => {
                  const isHighDeficit =
                    item.employerDemandCount > 0 &&
                    item.studentGapCount >= item.employerDemandCount &&
                    item.activeLearnersCount < item.studentGapCount;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {item.skillName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-700">
                        {item.employerDemandCount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium text-amber-600">
                        {item.studentGapCount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium text-indigo-600">
                        {item.activeLearnersCount}
                      </td>
                      <td className="py-2.5 px-3 text-center font-medium text-emerald-600">
                        {item.completedLearnersCount}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {isHighDeficit ? (
                          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="h-3 w-3" />
                            High Deficit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" />
                            Balanced
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side-by-Side: Missing Skills vs Top Targeted Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-rose-600" />
            Top Missing Required Skills
          </h3>
          <div className="space-y-2">
            {topMissingRequiredSkills.length === 0 ? (
              <p className="text-xs text-slate-400">No missing required skills recorded.</p>
            ) : (
              topMissingRequiredSkills.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-rose-50/50 border border-rose-100"
                >
                  <span className="font-semibold text-slate-800">{s.name}</span>
                  <span className="text-rose-600 font-bold">
                    {s.count} student gaps
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-indigo-600" />
            Top Targeted Career Roles in Roadmaps
          </h3>
          <div className="space-y-2">
            {topTargetedRoles.length === 0 ? (
              <p className="text-xs text-slate-400">No roadmaps generated yet.</p>
            ) : (
              topTargetedRoles.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100"
                >
                  <span className="font-semibold text-slate-800">{r.role}</span>
                  <span className="text-indigo-600 font-bold">
                    {r.count} students enrolled
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

