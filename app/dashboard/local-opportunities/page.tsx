"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ILocalOpportunityItem, IAvailableRegion } from "@/types/local-opportunity";
import LocalOpportunityCard from "@/features/local-opportunities/components/LocalOpportunityCard";
import {
  MapPin,
  Search,
  Filter,
  Map as MapIcon,
  TrendingUp,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Building,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function LocalOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<ILocalOpportunityItem[]>([]);
  const [regions, setRegions] = useState<IAvailableRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState("any");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGovtOnly, setIsGovtOnly] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch available regions
  useEffect(() => {
    async function loadRegions() {
      try {
        const res = await fetch("/api/local-opportunities/regions");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRegions(json.data);
        }
      } catch (err) {
        console.error("Failed to load regions:", err);
      }
    }
    loadRegions();
  }, []);

  // Fetch opportunities
  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        if (selectedState !== "all") params.set("state", selectedState);
        if (selectedDistrict !== "all") params.set("district", selectedDistrict);
        if (selectedWorkMode !== "any") params.set("workMode", selectedWorkMode);
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());
        if (isGovtOnly) params.set("isGovernmentProgram", "true");
        params.set("page", String(page));
        params.set("limit", "9");

        const res = await fetch(`/api/local-opportunities?${params.toString()}`);
        const json = await res.json();

        if (!ignore && json.success) {
          setOpportunities(json.data || []);
          if (json.pagination) {
            setTotalPages(json.pagination.totalPages || 1);
            setTotalCount(json.pagination.total || 0);
          }
        } else if (!json.success) {
          toast.error(json.error || "Failed to load opportunities.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Local opportunities load error:", err);
          toast.error("Network error loading local opportunities.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [
    selectedState,
    selectedDistrict,
    selectedWorkMode,
    selectedCategory,
    searchQuery,
    isGovtOnly,
    page,
  ]);

  // Available districts for the selected state
  const activeStateData = regions.find((r) => r.state === selectedState);
  const availableDistricts = activeStateData ? activeStateData.districts : [];

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict("all");
    setPage(1);
  };

  const handleResetFilters = () => {
    setSelectedState("all");
    setSelectedDistrict("all");
    setSelectedWorkMode("any");
    setSelectedCategory("all");
    setSearchQuery("");
    setIsGovtOnly(false);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <MapPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Local Opportunity & Regional Intelligence
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Discover verified regional internships, apprenticeships, and government skill initiatives outside major metropolitan areas.
            </p>
          </div>

          {/* Quick Action Navigation Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/dashboard/local-opportunities/map"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <MapIcon className="w-4 h-4 text-blue-600" />
              Interactive Map
            </Link>

            <Link
              href="/dashboard/local-opportunities/skills"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Regional Skill Demand
            </Link>

            <Link
              href="/dashboard/local-opportunities/programs"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Govt Programs
            </Link>
          </div>
        </div>

        {/* Filter Control Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by role, company, or skill..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* State Select */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All States / UTs</option>
                {regions.map((r) => (
                  <option key={r.state} value={r.state}>
                    {r.state} ({r.totalOpportunities} Postings)
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setPage(1);
                }}
                disabled={selectedState === "all" || availableDistricts.length === 0}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="all">All Districts</option>
                {availableDistricts.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.opportunityCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <select
                value={selectedWorkMode}
                onChange={(e) => {
                  setSelectedWorkMode(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any Work Mode</option>
                <option value="onsite">On-Site Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote (Pan-India)</option>
              </select>
            </div>
          </div>

          {/* Secondary Filters & Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={isGovtOnly}
                  onChange={(e) => {
                    setIsGovtOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Government & NAPS Schemes Only</span>
              </label>

              <div className="flex items-center gap-1.5 text-slate-500">
                <span>Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  <option value="all">All Categories</option>
                  <option value="internship">Internships</option>
                  <option value="job">Jobs</option>
                  <option value="skill-development">Skill Training</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-medium">
                Showing {opportunities.length} of {totalCount} Opportunities
              </span>

              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Opportunities Grid */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading regional opportunities...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No matching local opportunities found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try selecting a different district, enabling Pan-India remote roles, or resetting the filter options.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((item) => (
              <LocalOpportunityCard
                key={item.opportunity._id || item.opportunity.id}
                item={item}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-white transition"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-40 hover:bg-white transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

