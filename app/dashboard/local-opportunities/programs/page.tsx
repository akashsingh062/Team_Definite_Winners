"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IOpportunity } from "@/types/opportunity";
import { IAvailableRegion } from "@/types/local-opportunity";
import {
  ChevronLeft,
  ShieldCheck,
  Building,
  MapPin,
  ExternalLink,
  Award,
  Clock,
  Loader2,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";

export default function GovernmentProgramsPage() {
  const [programs, setPrograms] = useState<IOpportunity[]>([]);
  const [regions, setRegions] = useState<IAvailableRegion[]>([]);
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Load Regions
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

  // Load Government Programs
  useEffect(() => {
    let ignore = false;
    async function loadPrograms() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedState !== "all") params.set("state", selectedState);
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        params.set("page", String(page));
        params.set("limit", "9");

        const res = await fetch(`/api/local-opportunities/programs?${params.toString()}`);
        const json = await res.json();

        if (!ignore && json.success) {
          setPrograms(json.data || []);
          if (json.pagination) {
            setTotalPages(json.pagination.totalPages || 1);
            setTotalCount(json.pagination.total || 0);
          }
        } else if (!json.success) {
          toast.error(json.error || "Failed to load government programs.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Programs load error:", err);
          toast.error("Network error loading programs.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadPrograms();
    return () => {
      ignore = true;
    };
  }, [selectedState, selectedCategory, page]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/dashboard/local-opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Local Opportunities Catalog
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              Government & Public Skill Initiatives
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Verified public apprenticeships (NAPS), Skill India programs (PMKVY), and state skill development missions
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-slate-500 font-medium pl-1">State:</span>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
              className="p-1 rounded-xl border-none bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:ring-0"
            >
              <option value="all">All States</option>
              {regions.map((r) => (
                <option key={r.state} value={r.state}>
                  {r.state}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Verified Notice Banner */}
        <div className="bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-3xl p-5 flex items-start gap-3.5 text-xs">
          <FileCheck2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-purple-900 dark:text-purple-200">
              Official Program Provenance & Invariant
            </h4>
            <p className="text-purple-800/90 dark:text-purple-300 leading-relaxed">
              Every listing in this section represents an authenticated, government-supported scheme retrieved from verified registries (e.g. MSDE, NAPS, NSDC, State IT Missions). All entries link directly to official government portals without middleman fabrication.
            </p>
          </div>
        </div>

        {/* Programs Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading verified government initiatives...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No government initiatives found for the selected state.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <div
                key={prog._id || prog.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200/60 dark:border-purple-900/40 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-600" />
                      {prog.opportunitySource?.toUpperCase() || "GOVT"}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 capitalize">
                      {prog.employmentType}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-purple-600 transition">
                      <Link href={`/opportunities/${prog._id || prog.id}`}>
                        {prog.title}
                      </Link>
                    </h3>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {prog.companyName}
                    </p>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span>{prog.locationName || prog.location}</span>
                  </div>

                  {prog.governmentProgramDetails && (
                    <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 text-[11px] space-y-1">
                      <span className="font-bold text-purple-900 dark:text-purple-200 block">
                        Scheme: {prog.governmentProgramDetails.schemeName}
                      </span>
                      <span className="text-slate-500 block">
                        Dept: {prog.governmentProgramDetails.ministryOrDepartment}
                      </span>
                      {prog.governmentProgramDetails.stipendProvided && (
                        <span className="text-emerald-700 font-semibold block">
                          ✔ Monthly Stipend Covered
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                    {prog.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {prog.stipend || "Free Training"}
                  </span>

                  <div className="flex items-center gap-2">
                    {prog.sourceUrl && (
                      <a
                        href={prog.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                      >
                        Official Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
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

