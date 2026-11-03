"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardList,
  Bookmark,
  Send,
  UserCheck,
  Gift,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  Plus,
  RefreshCw,
  Clock,
  Sparkles,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ApplicationCard,
  ApplicationPipelineBar,
  UpcomingFollowUpsCard,
} from "@/features/applications/components";
import {
  IApplication,
  IApplicationStatistics,
  ApplicationStatus,
} from "@/types/application";

export default function ApplicationsDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [applications, setApplications] = React.useState<IApplication[]>([]);
  const [statistics, setStatistics] =
    React.useState<IApplicationStatistics | null>(null);
  const [upcomingFollowUps, setUpcomingFollowUps] = React.useState<
    IApplication[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filters & Pagination state
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<
    "recently_updated" | "recently_applied" | "deadline_approaching" | "oldest"
  >("recently_updated");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalApplications, setTotalApplications] = React.useState(0);

  const fetchApplications = React.useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("sortBy", sortBy);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/applications?${params.toString()}`);
      if (res.status === 401) {
        router.push("/login?callbackUrl=/dashboard/applications");
        return;
      }
      const json = await res.json();
      if (json.success) {
        setApplications(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
          setTotalApplications(json.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    }
  }, [statusFilter, categoryFilter, search, sortBy, page, router]);

  const fetchStatsAndFollowUps = React.useCallback(async () => {
    try {
      const [statsRes, followRes] = await Promise.all([
        fetch("/api/applications/statistics"),
        fetch("/api/applications?hasFollowUp=true&limit=6"),
      ]);

      const statsJson = await statsRes.json();
      if (statsJson.success) {
        setStatistics(statsJson.data);
      }

      const followJson = await followRes.json();
      if (followJson.success) {
        setUpcomingFollowUps(followJson.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login?callbackUrl=/dashboard/applications");
      return;
    }

    let isMounted = true;

    async function loadData() {
      try {
        await Promise.all([fetchApplications(), fetchStatsAndFollowUps()]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (isAuthenticated) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [
    isAuthenticated,
    isAuthLoading,
    fetchApplications,
    fetchStatsAndFollowUps,
    router,
  ]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchApplications(), fetchStatsAndFollowUps()]);
    setIsRefreshing(false);
    toast.success("Applications updated");
  };

  const handleDeleteApplication = async (appId: string) => {
    if (
      !confirm("Are you sure you want to remove this opportunity from your tracker?")
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Application removed from tracking");
        await Promise.all([fetchApplications(), fetchStatsAndFollowUps()]);
      } else {
        toast.error(json.message || "Failed to delete application");
      }
    } catch {
      toast.error("Network error while deleting application");
    }
  };

  const handleStatusUpdated = async () => {
    await Promise.all([fetchApplications(), fetchStatsAndFollowUps()]);
  };

  const handleResetFilters = () => {
    setStatusFilter("");
    setCategoryFilter("");
    setSearch("");
    setPage(1);
  };

  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (statusFilter) count++;
    if (categoryFilter) count++;
    if (search.trim()) count++;
    return count;
  }, [statusFilter, categoryFilter, search]);

  if (isAuthLoading || (isLoading && !statistics)) {
    return (
      <StudentPortalLayout>
        <div className="max-w-6xl mx-auto space-y-6 animate-pulse py-8">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-44 bg-slate-200 rounded-2xl" />
          <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
      </StudentPortalLayout>
    );
  }

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* --- Header Section --- */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <ClipboardList className="w-5 h-5" />
                </span>
                Application Tracking System
              </h1>
              <Badge variant="indigo" className="text-xs px-2.5 py-0.5 font-semibold">
                NexSkill ATS
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Organize saved bookmarks, track recruitment stages, and monitor interview schedules in one central dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-xs gap-1.5 bg-white text-slate-700"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`}
              />
              <span>Refresh</span>
            </Button>

            <Link href="/opportunities">
              <Button
                size="sm"
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs"
              >
                <span>Explore Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* --- Section A: 6 Overview Metric Cards --- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Total Tracked */}
          <Card className="p-3.5 border-slate-200 shadow-xs hover:border-slate-300 transition">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Tracked
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {statistics?.totalTracked || 0}
            </p>
            <span className="text-[10px] text-slate-400">All saved & applied</span>
          </Card>

          {/* 2. Saved */}
          <Card className="p-3.5 border-slate-200 shadow-xs hover:border-slate-300 transition">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <Bookmark className="w-3 h-3 text-slate-500" />
              <span>Saved</span>
            </span>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {statistics?.savedCount || 0}
            </p>
            <span className="text-[10px] text-slate-400">To review / apply</span>
          </Card>

          {/* 3. Submitted */}
          <Card className="p-3.5 border-purple-200 bg-purple-50/20 shadow-xs hover:border-purple-300 transition">
            <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider block flex items-center gap-1">
              <Send className="w-3 h-3 text-purple-600" />
              <span>Submitted</span>
            </span>
            <p className="text-2xl font-bold text-purple-950 mt-0.5">
              {statistics?.submittedTotal || 0}
            </p>
            <span className="text-[10px] text-purple-700">Active applications</span>
          </Card>

          {/* 4. Interviews */}
          <Card className="p-3.5 border-amber-200 bg-amber-50/20 shadow-xs hover:border-amber-300 transition">
            <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-amber-600" />
              <span>Interviews</span>
            </span>
            <p className="text-2xl font-bold text-amber-950 mt-0.5">
              {statistics?.interviewCount || 0}
            </p>
            <span className="text-[10px] text-amber-700">Rounds in progress</span>
          </Card>

          {/* 5. Offers Received */}
          <Card className="p-3.5 border-emerald-200 bg-emerald-50/20 shadow-xs hover:border-emerald-300 transition">
            <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block flex items-center gap-1">
              <Gift className="w-3 h-3 text-emerald-600" />
              <span>Offers</span>
            </span>
            <p className="text-2xl font-bold text-emerald-950 mt-0.5">
              {statistics?.offerReceivedCount || 0}
            </p>
            <span className="text-[10px] text-emerald-700">Offers extended</span>
          </Card>

          {/* 6. Selected */}
          <Card className="p-3.5 border-emerald-300 bg-emerald-50/40 shadow-xs hover:border-emerald-400 transition">
            <span className="text-[11px] font-semibold text-emerald-900 uppercase tracking-wider block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Selected</span>
            </span>
            <p className="text-2xl font-bold text-emerald-950 mt-0.5">
              {statistics?.selectedCount || 0}
            </p>
            <span className="text-[10px] text-emerald-700">Confirmed placement</span>
          </Card>
        </div>

        {/* --- Section B: Recruitment Pipeline Visualizer --- */}
        {statistics && (
          <ApplicationPipelineBar
            pipeline={statistics.pipeline}
            selectedStatus={statusFilter}
            onSelectStatus={(status) => {
              setStatusFilter(status);
              setPage(1);
            }}
          />
        )}

        {/* --- Section C: Upcoming Follow-ups Card --- */}
        {upcomingFollowUps.length > 0 && (
          <UpcomingFollowUpsCard applications={upcomingFollowUps} />
        )}

        {/* --- Section D: Search, Filter & Application List --- */}
        <Card className="border border-slate-200 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Tracked Opportunities ({totalApplications})
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Manage stages, notes, and deadlines for all recorded positions.
                </CardDescription>
              </div>

              {/* Filters & Search Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search title, company..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="saved">Saved</option>
                  <option value="planning">Planning to Apply</option>
                  <option value="applied">Applied</option>
                  <option value="assessment">Assessment</option>
                  <option value="interview">Interview</option>
                  <option value="offer_received">Offer Received</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                  <option value="expired">Expired</option>
                </select>

                {/* Category Filter */}
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  <option value="internship">Internships</option>
                  <option value="job">Jobs</option>
                  <option value="skill-development">Skill Development</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="recently_updated">Recently Updated</option>
                  <option value="recently_applied">Recently Applied</option>
                  <option value="deadline_approaching">Deadline Approaching</option>
                  <option value="oldest">Oldest First</option>
                </select>

                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="h-8 text-xs text-slate-500 hover:text-slate-800"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.map((app) => (
                  <ApplicationCard
                    key={app.id || app._id}
                    application={app}
                    onStatusUpdated={handleStatusUpdated}
                    onDeleteRequested={handleDeleteApplication}
                  />
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Page {page} of {totalPages} ({totalApplications} total)
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="text-xs"
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={page >= totalPages}
                        className="text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {statusFilter || search || categoryFilter
                    ? "No matching applications found"
                    : "No tracked applications yet"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {statusFilter || search || categoryFilter
                    ? "Try clearing your filters or search keywords."
                    : "Save interesting opportunities from the discovery catalog or record positions you have applied for to track recruitment progress."}
                </p>
                <div className="pt-2 flex justify-center gap-2">
                  {(statusFilter || search || categoryFilter) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetFilters}
                      className="text-xs"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Link href="/opportunities">
                    <Button
                      size="sm"
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Explore Opportunities
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentPortalLayout>
  );
}
