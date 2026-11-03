"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IOpportunity } from "@/types/opportunity";
import { IAvailableRegion } from "@/types/local-opportunity";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
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
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Navigation */}
        <Link
          href="/dashboard/local-opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Local Opportunities Catalog
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
                <ShieldCheck className="w-6 h-6" />
              </span>
              Government & Public Skill Initiatives
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 font-medium">
              Verified public apprenticeships (NAPS), Skill India programs (PMKVY), and state skill development missions
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-slate-700 font-bold pl-1">State:</span>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
              className="p-1 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-900 focus:bg-white cursor-pointer"
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
        <div className="bg-purple-50/80 border border-purple-200 rounded-3xl p-5 flex items-start gap-3.5 text-xs">
          <FileCheck2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-purple-950 text-sm">
              Official Program Provenance & Invariant
            </h4>
            <p className="text-purple-900 leading-relaxed font-medium">
              Every listing in this section represents an authenticated, government-supported scheme retrieved from verified registries (e.g. MSDE, NAPS, NSDC, State IT Missions). All entries link directly to official government portals without middleman fabrication.
            </p>
          </div>
        </div>

        {/* Programs Grid */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
            <p className="text-xs text-slate-600 font-bold">Loading verified government initiatives...</p>
          </div>
        ) : programs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              No government initiatives found for the selected state.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((prog) => (
              <div
                key={prog._id || prog.id}
                className="bg-white rounded-3xl border border-purple-200/80 p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      {prog.opportunitySource?.toUpperCase() || "GOVT"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 capitalize bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {prog.employmentType}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 hover:text-purple-600 transition">
                      <Link href={`/opportunities/${prog._id || prog.id}`}>
                        {prog.title}
                      </Link>
                    </h3>
                    <p className="text-xs font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      {prog.companyName}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{prog.locationName || prog.location}</span>
                  </div>

                  {prog.governmentProgramDetails && (
                    <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
                      <span className="font-extrabold text-purple-950 block">
                        Scheme: {prog.governmentProgramDetails.schemeName}
                      </span>
                      <span className="text-slate-600 font-semibold block">
                        Dept: {prog.governmentProgramDetails.ministryOrDepartment}
                      </span>
                      {prog.governmentProgramDetails.stipendProvided && (
                        <span className="text-emerald-700 font-bold block">
                          ✔ Monthly Stipend Covered
                        </span>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {prog.description}
                  </p>
                </div>

                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-900">
                    {prog.stipend || "Free Training"}
                  </span>

                  <div className="flex items-center gap-2">
                    {prog.sourceUrl && (
                      <a
                        href={prog.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
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
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold disabled:opacity-40 hover:bg-white text-slate-700 transition"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold disabled:opacity-40 hover:bg-white text-slate-700 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </StudentPortalLayout>
  );
}
