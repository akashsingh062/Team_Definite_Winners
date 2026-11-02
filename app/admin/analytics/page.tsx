"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminPortalLayout } from "@/components/layout/AdminPortalLayout";
import { AnalyticsHeader } from "@/features/analytics/components/AnalyticsHeader";
import { OverviewCardsSection } from "@/features/analytics/components/OverviewCardsSection";
import { StudentAnalyticsSection } from "@/features/analytics/components/StudentAnalyticsSection";
import { OpportunityAnalyticsSection } from "@/features/analytics/components/OpportunityAnalyticsSection";
import { MatchingAnalyticsSection } from "@/features/analytics/components/MatchingAnalyticsSection";
import { ApplicationAnalyticsSection } from "@/features/analytics/components/ApplicationAnalyticsSection";
import { SkillGapLearningSection } from "@/features/analytics/components/SkillGapLearningSection";
import { FairnessMonitoringSection } from "@/features/analytics/components/FairnessMonitoringSection";
import { AuditLogsSection } from "@/features/analytics/components/AuditLogsSection";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Sparkles,
  Layers,
  GitPullRequest,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  IAnalyticsDateFilter,
  IPlatformOverviewAnalytics,
  IStudentAnalytics,
  IOpportunityAnalytics,
  IMatchingAnalytics,
  IApplicationAnalytics,
  ISkillGapAnalytics,
  ILearningRoadmapAnalytics,
  IFairnessAnalytics,
} from "@/types/analytics";
import { toast } from "sonner";

type TabId =
  | "overview"
  | "students"
  | "opportunities"
  | "matching"
  | "applications"
  | "skills"
  | "fairness"
  | "audit";

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "opportunities", label: "Opportunities", icon: Briefcase },
  { id: "matching", label: "Matching Engine", icon: Sparkles },
  { id: "applications", label: "Applications & Funnel", icon: Layers },
  { id: "skills", label: "Skills & Learning", icon: GitPullRequest },
  { id: "fairness", label: "Fairness & Responsible AI", icon: ShieldCheck },
  { id: "audit", label: "Audit Logs", icon: ShieldAlert },
];

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [dateFilter, setDateFilter] = useState<IAnalyticsDateFilter>({ range: "30d" });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Cached dataset state
  const [overviewData, setOverviewData] = useState<IPlatformOverviewAnalytics | null>(null);
  const [studentData, setStudentData] = useState<IStudentAnalytics | null>(null);
  const [opportunityData, setOpportunityData] = useState<IOpportunityAnalytics | null>(null);
  const [matchingData, setMatchingData] = useState<IMatchingAnalytics | null>(null);
  const [applicationData, setApplicationData] = useState<IApplicationAnalytics | null>(null);
  const [skillGapData, setSkillGapData] = useState<ISkillGapAnalytics | null>(null);
  const [roadmapData, setRoadmapData] = useState<ILearningRoadmapAnalytics | null>(null);
  const [fairnessData, setFairnessData] = useState<IFairnessAnalytics | null>(null);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    if (dateFilter.range) params.set("range", dateFilter.range);
    if (dateFilter.startDate) params.set("startDate", dateFilter.startDate);
    if (dateFilter.endDate) params.set("endDate", dateFilter.endDate);
    return params.toString();
  }, [dateFilter]);

  useEffect(() => {
    let ignore = false;

    async function fetchData() {
      setIsLoading(true);
      const query = buildQuery();

      try {
        switch (activeTab) {
          case "overview": {
            const res = await fetch(`/api/admin/analytics/overview?${query}`);
            if (res.ok && !ignore) {
              const json = await res.json();
              setOverviewData(json.data);
            }
            break;
          }

          case "students": {
            const res = await fetch(`/api/admin/analytics/students?${query}`);
            if (res.ok && !ignore) {
              const json = await res.json();
              setStudentData(json.data);
            }
            break;
          }

          case "opportunities": {
            const res = await fetch(`/api/admin/analytics/opportunities?${query}`);
            if (res.ok && !ignore) {
              const json = await res.json();
              setOpportunityData(json.data);
            }
            break;
          }

          case "matching": {
            const res = await fetch(`/api/admin/analytics/matching?${query}`);
            if (res.ok && !ignore) {
              const json = await res.json();
              setMatchingData(json.data);
            }
            break;
          }

          case "applications": {
            const res = await fetch(`/api/admin/analytics/applications?${query}`);
            if (res.ok && !ignore) {
              const json = await res.json();
              setApplicationData(json.data);
            }
            break;
          }

          case "skills": {
            const [sgRes, rmRes] = await Promise.all([
              fetch(`/api/admin/analytics/skills?${query}`),
              fetch(`/api/admin/analytics/learning?${query}`),
            ]);
            if (sgRes.ok && !ignore) {
              const json = await sgRes.json();
              setSkillGapData(json.data);
            }
            if (rmRes.ok && !ignore) {
              const json = await rmRes.json();
              setRoadmapData(json.data);
            }
            break;
          }

          case "fairness": {
            const res = await fetch(`/api/admin/analytics/fairness?${query}`);
            if (res.ok && !ignore) {
              const json = await res.json();
              setFairnessData(json.data);
            }
            break;
          }

          case "audit": {
            // Handled internally in AuditLogsSection
            break;
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error(`Failed to load data for tab ${activeTab}:`, err);
          toast.error("Failed to load analytics metrics");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [activeTab, buildQuery, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <AdminPortalLayout>
      <div className="flex flex-col min-h-screen bg-slate-50">
        {/* Header with Global Time Range Filter and CSV Export */}
        <AnalyticsHeader
          dateFilter={dateFilter}
          onDateFilterChange={(newFilter) => setDateFilter(newFilter)}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          activeTab={activeTab}
        />

        {/* Tab Navigation Bar */}
        <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto scrollbar-none">
          <div className="flex space-x-1 py-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Body */}
        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {activeTab === "overview" && (
            <OverviewCardsSection data={overviewData} isLoading={isLoading} />
          )}

          {activeTab === "students" && (
            <StudentAnalyticsSection data={studentData} isLoading={isLoading} />
          )}

          {activeTab === "opportunities" && (
            <OpportunityAnalyticsSection
              data={opportunityData}
              isLoading={isLoading}
            />
          )}

          {activeTab === "matching" && (
            <MatchingAnalyticsSection
              data={matchingData}
              isLoading={isLoading}
            />
          )}

          {activeTab === "applications" && (
            <ApplicationAnalyticsSection
              data={applicationData}
              isLoading={isLoading}
            />
          )}

          {activeTab === "skills" && (
            <SkillGapLearningSection
              skillGapData={skillGapData}
              roadmapData={roadmapData}
              isLoading={isLoading}
            />
          )}

          {activeTab === "fairness" && (
            <FairnessMonitoringSection
              data={fairnessData}
              isLoading={isLoading}
            />
          )}

          {activeTab === "audit" && <AuditLogsSection />}
        </main>
      </div>
    </AdminPortalLayout>
  );
}
