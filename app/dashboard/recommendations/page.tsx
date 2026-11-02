"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Briefcase,
  GraduationCap,
  FileText,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { RecommendationCard } from "@/features/matching/components/RecommendationCard";
import { IOpportunityMatchResult, IMatchingSummary } from "@/types/matching";

export default function RecommendationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [recommendations, setRecommendations] = React.useState<IOpportunityMatchResult[]>([]);
  const [summary, setSummary] = React.useState<IMatchingSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Filter & pagination state
  const [category, setCategory] = React.useState<string>("");
  const [workMode, setWorkMode] = React.useState<string>("");
  const [eligibility, setEligibility] = React.useState<string>("");
  const [sortBy, setSortBy] = React.useState<"score" | "deadline" | "newest">("score");
  const [page, setPage] = React.useState<number>(1);
  const [pagination, setPagination] = React.useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  // Fetch summary once and recommendations on filter/page changes
  React.useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push("/login?callbackUrl=/dashboard/recommendations");
        return;
      }

      setIsLoading(true);

      try {
        // Fetch recommendations query params
        const params = new URLSearchParams();
        if (category) params.set("category", category);
        if (workMode) params.set("workMode", workMode);
        if (eligibility) params.set("eligibility", eligibility);
        if (sortBy) params.set("sortBy", sortBy);
        params.set("page", page.toString());
        params.set("limit", "10");

        const [recsRes, summaryRes] = await Promise.all([
          fetch(`/api/matching/recommendations?${params.toString()}`),
          fetch("/api/matching/summary"),
        ]);

        if (recsRes.status === 401 || summaryRes.status === 401) {
          router.push("/login?callbackUrl=/dashboard/recommendations");
          return;
        }

        const recsJson = await recsRes.json();
        const summaryJson = await summaryRes.json();

        if (isMounted) {
          if (recsJson.success) {
            setRecommendations(recsJson.data || []);
            if (recsJson.pagination) {
              setPagination(recsJson.pagination);
            }
          }
          if (summaryJson.success) {
            setSummary(summaryJson.data);
          }
        }
      } catch (err) {
        console.error("Error loading recommendations:", err);
        if (isMounted) {
          toast.error("Failed to load smart recommendations");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!isAuthLoading) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, router, category, workMode, eligibility, sortBy, page, refreshTrigger]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/matching/refresh");
      const json = await res.json();
      if (json.success) {
        toast.success("Recommendations recalculated with latest profile data!");
        setRefreshTrigger((prev) => prev + 1);
      } else {
        toast.error(json.message || "Failed to refresh recommendations");
      }
    } catch {
      toast.error("Network error refreshing recommendations");
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = () => {
    setCategory("");
    setWorkMode("");
    setEligibility("");
    setSortBy("score");
    setPage(1);
  };

  const hasActiveFilters = Boolean(category || workMode || eligibility || sortBy !== "score");

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 border border-indigo-200/60 rounded-xl text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Smart Opportunity Matches
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Explainable, skill-weighted recommendations matched to your verified profile and portfolio.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="text-xs font-semibold text-slate-700 hover:text-indigo-600 gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
              <span>{isRefreshing ? "Recalculating..." : "Recalculate Matches"}</span>
            </Button>
          </div>
        </div>

        {/* Summary Metric Strip */}
        {summary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Available Matches</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {summary.totalRecommendations}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Verified opportunities
                  </p>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Briefcase className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Top Match Score</p>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-0.5">
                    {Math.round(summary.topScore)}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Highest compatibility
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Eligible Roles</p>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">
                    {summary.eligibleCount}
                  </p>
                  <p className="text-[11px] text-emerald-600/80 mt-0.5">
                    Academic criteria satisfied
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Avg Compatibility</p>
                  <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
                    {Math.round(summary.averageScore)}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Across current catalog
                  </p>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Bar */}
        <Card className="border border-slate-200 bg-slate-50/60 shadow-2xs">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
                {/* Category Filter */}
                <Select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 text-xs bg-white"
                  options={[
                    { value: "", label: "All Categories" },
                    { value: "internship", label: "Internships" },
                    { value: "job", label: "Full-Time Jobs" },
                    { value: "skill-development", label: "Skill Development" },
                  ]}
                />

                {/* Work Mode Filter */}
                <Select
                  value={workMode}
                  onChange={(e) => {
                    setWorkMode(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 text-xs bg-white"
                  options={[
                    { value: "", label: "All Work Modes" },
                    { value: "remote", label: "Remote" },
                    { value: "hybrid", label: "Hybrid" },
                    { value: "on-site", label: "On-site" },
                  ]}
                />

                {/* Eligibility Filter */}
                <Select
                  value={eligibility}
                  onChange={(e) => {
                    setEligibility(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 text-xs bg-white"
                  options={[
                    { value: "", label: "All Eligibility Statuses" },
                    { value: "eligible", label: "Eligible Only" },
                    { value: "potentially_eligible", label: "Potentially Eligible" },
                  ]}
                />

                {/* Sort By */}
                <Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as "score" | "deadline" | "newest");
                    setPage(1);
                  }}
                  className="h-9 text-xs bg-white"
                  options={[
                    { value: "score", label: "Best Match Score" },
                    { value: "deadline", label: "Application Deadline" },
                    { value: "newest", label: "Newest Opportunities" },
                  ]}
                />
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-xs text-slate-500 hover:text-slate-800 self-end lg:self-auto shrink-0"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scoring & Fairness Transparency Banner */}
        <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/40 rounded-xl border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold text-indigo-900">
              Fair & Explainable Recommendation Engine
            </span>
            <p className="text-slate-600 text-[11px]">
              Scores are calculated via a transparent, deterministic algorithm: Required Skills (40%), Preferred Skills (15%), Projects & Experience (15%), Eligibility (10%), Role Alignment (10%), Location (5%), and Compensation (5%). Institutional pedigree, caste, religion, and social background are strictly excluded from calculations.
            </p>
          </div>
        </div>

        {/* Recommendations List Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2.5 w-2/3">
                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                  </div>
                  <div className="h-10 w-24 bg-slate-200 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 p-12 text-center">
            <div className="max-w-md mx-auto space-y-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {hasActiveFilters ? "No matching opportunities found" : "No recommendations available yet"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {hasActiveFilters
                  ? "Try adjusting your filters or resetting them to view more recommendations."
                  : "To receive high-confidence recommendations, make sure your profile includes at least 3 technical skills, academic information, and portfolio projects."}
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                {hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs">
                    Reset All Filters
                  </Button>
                ) : (
                  <>
                    <Link href="/profile">
                      <Button size="sm" className="text-xs bg-indigo-600 text-white">
                        Complete Profile
                      </Button>
                    </Link>
                    <Link href="/dashboard/resume">
                      <Button variant="outline" size="sm" className="text-xs gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Upload Resume</span>
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {recommendations.map((match) => (
              <RecommendationCard key={match.opportunityId} match={match} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-bold text-slate-800">{pagination.page}</span> of{" "}
              <span className="font-bold text-slate-800">{pagination.totalPages}</span> ({pagination.total} total recommendations)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || isLoading}
                className="text-xs h-8 px-2.5 gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages || isLoading}
                className="text-xs h-8 px-2.5 gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Disclaimer Note */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
          <p>
            <strong>Disclaimer:</strong> Recommendation percentages represent algorithmic estimates of profile compatibility to aid exploration. They do not represent employment guarantees, interview promises, or evaluations of candidate potential. Final qualification is determined solely by respective hiring organizations.
          </p>
        </div>
      </div>
    </StudentPortalLayout>
  );
}

