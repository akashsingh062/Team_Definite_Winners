"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  MapPin,
  Building,
  ShieldCheck,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Layers,
  Map,
} from "lucide-react";
import { toast } from "sonner";

interface AdminAnalyticsData {
  summary: {
    totalRegionalOpportunities: number;
    totalTrainingCentres: number;
    withExactCoordinates: number;
    unmappedWithoutCoordinates: number;
    governmentProgramsCount: number;
  };
  stateDistribution: Array<{ state: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  trainingCentreCategories: Array<{ category: string; count: number }>;
}

export default function AdminRegionalAnalyticsPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/regional-analytics");
        const json = await res.json();
        if (!ignore && json.success) {
          setData(json.data);
        } else if (!json.success) {
          toast.error(json.error || "Failed to load regional analytics.");
        }
      } catch (err) {
        console.error("Failed to load regional analytics:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/admin/regional-opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Regional Opportunities
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            TPO Regional Opportunity & Geospatial Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            System overview of regional opportunity distributions, verified training centres, and map coverage integrity
          </p>
        </div>

        {/* Analytics Body */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Aggregating geographic indices...</p>
          </div>
        ) : !data ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Failed to load analytics data.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Regional Postings
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {data.summary.totalRegionalOpportunities}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Training Centres
                </span>
                <span className="text-2xl font-black text-emerald-600">
                  {data.summary.totalTrainingCentres}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Exact Geo-Mapped
                </span>
                <span className="text-2xl font-black text-blue-600">
                  {data.summary.withExactCoordinates}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Unmapped (Remote / Coarse)
                </span>
                <span className="text-2xl font-black text-amber-600">
                  {data.summary.unmappedWithoutCoordinates}
                </span>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Govt Schemes / NAPS
                </span>
                <span className="text-2xl font-black text-purple-600">
                  {data.summary.governmentProgramsCount}
                </span>
              </div>
            </div>

            {/* State Distribution Table */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Opportunity Volume by State / UT
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {data.stateDistribution.map((s) => (
                    <div key={s.state} className="py-2.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {s.state}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {s.count} Postings
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Training Centre Categories */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-600" />
                  Training Institutions by Category
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {data.trainingCentreCategories.map((c) => (
                    <div key={c.category} className="py-2.5 flex items-center justify-between">
                      <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">
                        {c.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                        {c.count} Centres
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

