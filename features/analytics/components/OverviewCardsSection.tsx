"use client";

import React from "react";
import {
  Users,
  Briefcase,
  Layers,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  FileText,
  Clock,
  Award,
  Send,
  Calendar,
} from "lucide-react";
import { IPlatformOverviewAnalytics } from "@/types/analytics";

interface OverviewCardsSectionProps {
  data: IPlatformOverviewAnalytics | null;
  isLoading: boolean;
}

export function OverviewCardsSection({ data, isLoading }: OverviewCardsSectionProps) {
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-44 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
          />
        ))}
      </div>
    );
  }

  const { students, opportunities, applications, engagement } = data;

  return (
    <div className="space-y-6">
      {/* 4 Primary Category Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Students Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Students
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">
              {students.totalStudents}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Registered student accounts
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">New This Month</span>
              <span className="font-semibold text-slate-700">
                +{students.newStudentsThisMonth}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Profiles &gt;80%</span>
              <span className="font-semibold text-emerald-600">
                {students.completedProfiles}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Active Profiles</span>
              <span className="font-semibold text-slate-700">
                {students.activeStudents}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Resumes Uploaded</span>
              <span className="font-semibold text-indigo-600">
                {students.uploadedResumes}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Opportunities Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Opportunities
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">
              {opportunities.totalOpportunities}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Active & verified listings
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">Published</span>
              <span className="font-semibold text-emerald-600">
                {opportunities.publishedOpportunities}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Verified</span>
              <span className="font-semibold text-blue-600">
                {opportunities.verifiedOpportunities}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Pending Review</span>
              <span className="font-semibold text-amber-600">
                {opportunities.pendingVerification}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Expired</span>
              <span className="font-semibold text-slate-500">
                {opportunities.expiredOpportunities}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Applications Funnel Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Applications
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">
              {applications.totalTracked}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total tracked by students
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">Submitted</span>
              <span className="font-semibold text-blue-600">
                {applications.applicationsSubmitted}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Interviews</span>
              <span className="font-semibold text-amber-600">
                {applications.interviews}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Offers</span>
              <span className="font-semibold text-emerald-600">
                {applications.offersReceived}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Selected</span>
              <span className="font-semibold text-teal-600">
                {applications.selectedApplications}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Platform Engagement Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Platform Engagement
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">
              {engagement.studentsUsingRecommendations +
                engagement.studentsGeneratingRoadmaps}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Total AI tool interactions
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block">Recommendations</span>
              <span className="font-semibold text-purple-600">
                {engagement.studentsUsingRecommendations}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Skill Gap Analysis</span>
              <span className="font-semibold text-indigo-600">
                {engagement.studentsUsingSkillGap}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Roadmaps Generated</span>
              <span className="font-semibold text-blue-600">
                {engagement.studentsGeneratingRoadmaps}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Application Trackers</span>
              <span className="font-semibold text-emerald-600">
                {engagement.studentsTrackingApplications}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

