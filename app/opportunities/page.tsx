"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Building2,
  Layers,
} from "lucide-react";
import { IOpportunity, OpportunityCategory, WorkMode, EmploymentType } from "@/types/opportunity";
import { SaveOpportunityButton } from "@/features/applications/components";

export default function OpportunitiesBrowsingPage() {
  const [opportunities, setOpportunities] = React.useState<IOpportunity[]>([]);
  const [pagination, setPagination] = React.useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  // Filter & Search states
  const [search, setSearch] = React.useState("");
  const [activeSearch, setActiveSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [workMode, setWorkMode] = React.useState<string>("all");
  const [employmentType, setEmploymentType] = React.useState<string>("all");
  const [isPaidOnly, setIsPaidOnly] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<"newest" | "deadline" | "alphabetical">("newest");
  const [page, setPage] = React.useState(1);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Mobile filters toggle
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    async function loadOpportunities() {
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(pagination.limit),
        });

        if (activeSearch.trim()) query.set("search", activeSearch.trim());
        if (category !== "all") query.set("category", category);
        if (workMode !== "all") query.set("workMode", workMode);
        if (employmentType !== "all") query.set("employmentType", employmentType);
        if (isPaidOnly) query.set("isPaid", "true");
        if (sortBy) query.set("sortBy", sortBy);

        const res = await fetch(`/api/opportunities?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to load opportunities");

        const json = await res.json();
        if (isMounted) {
          setOpportunities(json.data.opportunities || []);
          setPagination({
            total: json.data.pagination.total,
            page: json.data.pagination.page,
            limit: json.data.pagination.limit,
            totalPages: json.data.pagination.totalPages,
          });
        }
      } catch (err) {
        console.error("Failed to load opportunities:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOpportunities();
    return () => {
      isMounted = false;
    };
  }, [page, category, workMode, employmentType, isPaidOnly, sortBy, activeSearch, refreshKey, pagination.limit]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPage(1);
    setActiveSearch(search);
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    setSearch("");
    setActiveSearch("");
    setCategory("all");
    setWorkMode("all");
    setEmploymentType("all");
    setIsPaidOnly(false);
    setSortBy("newest");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search) ||
    category !== "all" ||
    workMode !== "all" ||
    employmentType !== "all" ||
    isPaidOnly;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "internship":
        return <Badge variant="indigo">Internship</Badge>;
      case "job":
        return <Badge variant="emerald">Full-Time Job</Badge>;
      case "skill-development":
        return <Badge variant="amber">Skill Development</Badge>;
      default:
        return <Badge variant="default">{cat}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white py-12 md:py-16">
        <Container size="xl">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-800/80 px-3 py-1 text-xs font-medium text-indigo-200 border border-indigo-700/60 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              <span>Campus-to-Career Match Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Verified Student Opportunities
            </h1>
            <p className="text-base sm:text-lg text-indigo-200/90 leading-relaxed">
              Explore curated internships, full-time graduate opportunities, and technical skill bootcamps.
              Audited for algorithmic fairness and verified for authenticity.
            </p>

            {/* Quick Search in Hero */}
            <form onSubmit={handleSearchSubmit} className="pt-2">
              <div className="flex flex-col sm:flex-row gap-2 max-w-2xl bg-white/10 p-1.5 rounded-xl border border-white/15 backdrop-blur-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by role title, company, skills (e.g. React, Python), or domain..."
                    className="w-full h-10 pl-10 pr-3 rounded-lg bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <Button type="submit" variant="primary" className="h-10 px-5 shrink-0 bg-indigo-600 hover:bg-indigo-700">
                  Search
                </Button>
              </div>
            </form>
          </div>
        </Container>
      </section>

      {/* Main Content Area */}
      <section className="flex-1 py-8">
        <Container size="xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar (Desktop) */}
            <aside className="hidden lg:block w-72 shrink-0 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6 sticky top-24">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Filter className="h-4 w-4 text-indigo-600" />
                    <span>Filter Opportunities</span>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: "all", label: "All Opportunities" },
                      { id: "internship", label: "Internships" },
                      { id: "job", label: "Full-Time Jobs" },
                      { id: "skill-development", label: "Skill Development" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCategory(opt.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                          category === opt.id
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Work Mode Filter */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Work Arrangement
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: "all", label: "Any Work Mode" },
                      { id: "remote", label: "Remote Only" },
                      { id: "hybrid", label: "Hybrid" },
                      { id: "onsite", label: "On-Site" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setWorkMode(opt.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          workMode === opt.id
                            ? "bg-indigo-50 text-indigo-700 font-semibold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Employment Type */}
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-Time</option>
                    <option value="part-time">Part-Time</option>
                    <option value="contract">Contract</option>
                    <option value="training">Training / Bootcamp</option>
                  </select>
                </div>

                {/* Paid Only Checkbox */}
                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={isPaidOnly}
                      onChange={(e) => setIsPaidOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Paid opportunities only</span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showMobileFilters ? "Hide Filters" : "Filter Opportunities"}
              </Button>
              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-indigo-600"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Mobile Filters Drawer/Modal */}
            {showMobileFilters && (
              <div className="lg:hidden bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">Filters</h4>
                  <button onClick={() => setShowMobileFilters(false)}>
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-9 mt-1 px-3 rounded-lg border border-slate-300 text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="internship">Internships</option>
                      <option value="job">Full-Time Jobs</option>
                      <option value="skill-development">Skill Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Work Arrangement</label>
                    <select
                      value={workMode}
                      onChange={(e) => setWorkMode(e.target.value)}
                      className="w-full h-9 mt-1 px-3 rounded-lg border border-slate-300 text-sm"
                    >
                      <option value="all">Any Work Mode</option>
                      <option value="remote">Remote Only</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-Site</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full h-9 mt-1 px-3 rounded-lg border border-slate-300 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="internship">Internship</option>
                      <option value="full-time">Full-Time</option>
                      <option value="part-time">Part-Time</option>
                      <option value="contract">Contract</option>
                      <option value="training">Training</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={isPaidOnly}
                      onChange={(e) => setIsPaidOnly(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                    />
                    <span>Paid opportunities only</span>
                  </label>
                </div>
              </div>
            )}

            {/* Opportunities List Column */}
            <main className="flex-1 space-y-6">
              {/* Header Bar with Count and Sorting */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{pagination.total}</span>{" "}
                  published opportunities
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 whitespace-nowrap">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="newest">Recently Published</option>
                    <option value="deadline">Application Deadline</option>
                    <option value="alphabetical">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Opportunities Grid / Cards */}
              {isLoading ? (
                <div className="p-16 text-center space-y-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
                  <p className="text-sm text-slate-500 font-medium">
                    Loading verified opportunities...
                  </p>
                </div>
              ) : opportunities.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">No opportunities found</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    We could not find any listings matching your current filter criteria.
                    Try clearing or relaxing some filters.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Clear All Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {opportunities.map((opp) => {
                    const oppId = String(opp._id);

                    return (
                      <Card
                        key={oppId}
                        className="group flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all duration-150 border-slate-200 bg-white rounded-2xl overflow-hidden"
                      >
                        <CardContent className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-3">
                            {/* Top row: Badges */}
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              {getCategoryBadge(opp.category)}
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                              </span>
                            </div>

                            {/* Title & Company */}
                            <div>
                              <Link
                                href={`/opportunities/${oppId}`}
                                className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1"
                              >
                                {opp.title}
                              </Link>
                              <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="font-medium text-slate-800">{opp.companyName}</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-500">{opp.industry}</span>
                              </div>
                            </div>

                            {/* Meta Specs: Location, Mode, Compensation */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{opp.location}</span>
                              </div>
                              <div className="flex items-center gap-1.5 capitalize truncate">
                                <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">{opp.workMode}</span>
                              </div>
                              <div className="flex items-center gap-1.5 truncate">
                                <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate font-medium text-slate-800">
                                  {opp.isPaid
                                    ? opp.category === "internship"
                                      ? opp.stipend || "Stipend Provided"
                                      : opp.salaryRange || "Competitive Pay"
                                    : "Free Program"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 truncate">
                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {opp.applicationDeadline
                                    ? new Date(opp.applicationDeadline).toLocaleDateString()
                                    : "Rolling Basis"}
                                </span>
                              </div>
                            </div>

                            {/* Description snippet */}
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {opp.description}
                            </p>

                            {/* Skills Tags */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {opp.requiredSkills.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                                >
                                  {skill}
                                </span>
                              ))}
                              {opp.requiredSkills.length > 3 && (
                                <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500">
                                  +{opp.requiredSkills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] capitalize text-slate-400 font-medium">
                              {opp.employmentType}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <SaveOpportunityButton
                                opportunityId={oppId}
                                size="sm"
                                showLabel={false}
                              />
                              <Link href={`/opportunities/${oppId}`}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors text-xs h-8 px-3"
                                >
                                  View Details & Apply
                                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                  <div>
                    Page <span className="font-semibold text-slate-900">{pagination.page}</span> of{" "}
                    <span className="font-semibold text-slate-900">{pagination.totalPages}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      disabled={pagination.page <= 1}
                      onClick={() => {
                        setIsLoading(true);
                        setPage(pagination.page - 1);
                      }}
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => {
                        setIsLoading(true);
                        setPage(pagination.page + 1);
                      }}
                    >
                      Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </Container>
      </section>
    </div>
  );
}
