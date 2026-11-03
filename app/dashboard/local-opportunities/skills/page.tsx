"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  IRegionalSkillDemand,
  IRegionalSkillGapAnalysis,
  IAvailableRegion,
} from "@/types/local-opportunity";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import RegionalSkillDemandChart from "@/features/local-opportunities/components/RegionalSkillDemandChart";
import StudentRegionalGapWidget from "@/features/local-opportunities/components/StudentRegionalGapWidget";
import {
  ChevronLeft,
  TrendingUp,
  MapPin,
  Filter,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function RegionalSkillsIntelligencePage() {
  const [demand, setDemand] = useState<IRegionalSkillDemand | null>(null);
  const [studentGapAnalysis, setStudentGapAnalysis] = useState<IRegionalSkillGapAnalysis | null>(null);
  const [regions, setRegions] = useState<IAvailableRegion[]>([]);
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // Load available regions
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

  // Load skills intelligence
  useEffect(() => {
    let ignore = false;
    async function loadIntelligence() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedState !== "all") params.set("state", selectedState);
        if (selectedDistrict !== "all") params.set("district", selectedDistrict);

        const res = await fetch(`/api/local-opportunities/skills?${params.toString()}`);
        const json = await res.json();

        if (!ignore && json.success && json.data) {
          setDemand(json.data.demand);
          setStudentGapAnalysis(json.data.studentGapAnalysis);
        } else if (!json.success) {
          toast.error(json.error || "Failed to load skill demand data.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Skill demand load error:", err);
          toast.error("Network error loading skill demand.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadIntelligence();
    return () => {
      ignore = true;
    };
  }, [selectedState, selectedDistrict]);

  const activeStateData = regions.find((r) => r.state === selectedState);
  const availableDistricts = activeStateData ? activeStateData.districts : [];

  return (
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
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
              <TrendingUp className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Regional Skill Demand Intelligence
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Data-driven analysis of skills required by employers across specific states and districts
            </p>
          </div>

          {/* Region Filter Selector */}
          <div className="flex items-center gap-2 text-xs bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <MapPin className="w-4 h-4 text-slate-400" />
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict("all");
              }}
              className="p-1.5 rounded-xl border-none bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:ring-0"
            >
              <option value="all">All India Overview</option>
              {regions.map((r) => (
                <option key={r.state} value={r.state}>
                  {r.state} ({r.totalOpportunities} Postings)
                </option>
              ))}
            </select>

            {selectedState !== "all" && availableDistricts.length > 0 && (
              <>
                <span className="text-slate-300 dark:text-slate-700">/</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="p-1.5 rounded-xl border-none bg-transparent font-semibold text-slate-800 dark:text-slate-200 focus:ring-0"
                >
                  <option value="all">All Districts</option>
                  {availableDistricts.map((d) => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Aggregating regional opportunity records...</p>
          </div>
        ) : !demand ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No regional opportunity data available for the chosen filters.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Regional Demand Charts */}
            <RegionalSkillDemandChart demand={demand} />

            {/* Personalized Student Regional Gap Analysis (if student profile available) */}
            {studentGapAnalysis && (
              <StudentRegionalGapWidget analysis={studentGapAnalysis} />
            )}
          </div>
        )}
      </div>
    </StudentPortalLayout>
  );
}

