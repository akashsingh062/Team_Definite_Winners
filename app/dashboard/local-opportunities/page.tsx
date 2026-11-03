"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ILocalOpportunityItem,
  IAvailableRegion,
  IMapMarkerItem,
  IRegionalSkillDemand,
  IRegionalSkillGapAnalysis,
} from "@/types/local-opportunity";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LocalOpportunityCard from "@/features/local-opportunities/components/LocalOpportunityCard";
import InteractiveOpportunityMap from "@/features/local-opportunities/components/InteractiveOpportunityMap";
import RegionalSkillDemandChart from "@/features/local-opportunities/components/RegionalSkillDemandChart";
import StudentRegionalGapWidget from "@/features/local-opportunities/components/StudentRegionalGapWidget";
import {
  MapPin,
  Search,
  Filter,
  Map as MapIcon,
  TrendingUp,
  ShieldCheck,
  Building2,
  RotateCcw,
  Sparkles,
  Compass,
  Briefcase,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowRight,
  AlertCircle,
  X,
  Info,
  CheckCircle2,
  SlidersHorizontal,
  Building,
  Target,
} from "lucide-react";
import { toast } from "sonner";

export default function LocalOpportunitiesPage() {
  // Navigation & View Tab
  const [activeTab, setActiveTab] = useState<"catalog" | "map" | "skills" | "programs">("catalog");

  // Filter States
  const [selectedState, setSelectedState] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedWorkMode, setSelectedWorkMode] = useState("any");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGovtOnly, setIsGovtOnly] = useState(false);

  // Opportunities State
  const [opportunities, setOpportunities] = useState<ILocalOpportunityItem[]>([]);
  const [regions, setRegions] = useState<IAvailableRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Map Tab State
  const [mapMarkers, setMapMarkers] = useState<IMapMarkerItem[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<IMapMarkerItem | null>(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [unmappedCount, setUnmappedCount] = useState(0);

  // Skills Tab State
  const [demand, setDemand] = useState<IRegionalSkillDemand | null>(null);
  const [studentGap, setStudentGap] = useState<IRegionalSkillGapAnalysis | null>(null);
  const [isSkillsLoading, setIsSkillsLoading] = useState(false);

  // Fetch Available Regions on Mount
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

  // Fetch Catalog Opportunities
  useEffect(() => {
    let ignore = false;
    async function loadOpportunities() {
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
        } else if (!json.success && !ignore) {
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

    loadOpportunities();
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

  // Fetch Map Data when Map tab is active or state changes
  useEffect(() => {
    if (activeTab !== "map") return;
    let ignore = false;
    async function loadMapData() {
      try {
        setIsMapLoading(true);
        const params = new URLSearchParams();
        if (selectedState !== "all") params.set("state", selectedState);
        if (selectedCategory !== "all") params.set("category", selectedCategory);

        const res = await fetch(`/api/local-opportunities/map?${params.toString()}`);
        const json = await res.json();

        if (!ignore && json.success) {
          setMapMarkers(json.data || []);
          if (json.meta) {
            setUnmappedCount(json.meta.unmappedOpportunitiesCount || 0);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Map markers load error:", err);
        }
      } finally {
        if (!ignore) setIsMapLoading(false);
      }
    }

    loadMapData();
    return () => {
      ignore = true;
    };
  }, [activeTab, selectedState, selectedCategory]);

  // Fetch Skills Intelligence when Skills tab is active
  useEffect(() => {
    if (activeTab !== "skills") return;
    let ignore = false;
    async function loadSkillsIntelligence() {
      try {
        setIsSkillsLoading(true);
        const params = new URLSearchParams();
        if (selectedState !== "all") params.set("state", selectedState);
        if (selectedDistrict !== "all") params.set("district", selectedDistrict);

        const res = await fetch(`/api/local-opportunities/skills?${params.toString()}`);
        const json = await res.json();

        if (!ignore && json.success && json.data) {
          setDemand(json.data.demand);
          setStudentGap(json.data.studentGapAnalysis);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Skill demand load error:", err);
        }
      } finally {
        if (!ignore) setIsSkillsLoading(false);
      }
    }

    loadSkillsIntelligence();
    return () => {
      ignore = true;
    };
  }, [activeTab, selectedState, selectedDistrict]);

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

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedState !== "all") count++;
    if (selectedDistrict !== "all") count++;
    if (selectedWorkMode !== "any") count++;
    if (selectedCategory !== "all") count++;
    if (searchQuery.trim()) count++;
    if (isGovtOnly) count++;
    return count;
  }, [selectedState, selectedDistrict, selectedWorkMode, selectedCategory, searchQuery, isGovtOnly]);

  // Calculate Quick Hub Metrics
  const metrics = useMemo(() => {
    const totalPostings = regions.reduce((acc, r) => acc + (r.totalOpportunities || 0), 0);
    const totalStates = regions.length;
    return {
      totalPostings,
      totalStates,
    };
  }, [regions]);

  return (
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* --- Top Command Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Local Opportunity & Regional Intelligence
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Regional Gateway
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed font-medium">
              Location-aware discovery of verified regional internships, apprenticeships, NAPS government initiatives, and physical vocational training institutes across tier-2 and tier-3 hubs.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-50 font-bold rounded-xl shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters ({activeFilterCount})</span>
              </Button>
            )}

            <Button
              variant={activeTab === "map" ? "primary" : "outline"}
              size="sm"
              onClick={() => setActiveTab("map")}
              className={`gap-1.5 text-xs font-bold rounded-xl shadow-xs ${
                activeTab === "map"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "border-slate-300 text-slate-800 hover:bg-slate-50"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </Button>
          </div>
        </div>

        {/* --- Regional Discovery KPI Strip --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Verified Regional Roles
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {totalCount || opportunities.length}
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                {selectedState !== "all" ? `In ${selectedState}` : "Across tier-2/3 regions"}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Coverage Footprint
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.totalStates} States / UTs
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                Multi-state regional directory
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Govt & NAPS Schemes
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                6 Verified
              </h3>
              <p className="text-xs text-amber-600 font-semibold mt-0.5">
                MSDE & Apprenticeship portals
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Training Centres & ITIs
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                10 Mapped
              </h3>
              <p className="text-xs text-purple-600 font-semibold mt-0.5">
                Physical GPS verification
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* --- View Navigation Tabs --- */}
        <div className="border-b border-slate-200">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {[
              { id: "catalog", label: "Opportunity Catalog", count: totalCount, icon: Briefcase },
              { id: "map", label: "Interactive Map", count: mapMarkers.length || undefined, icon: MapIcon },
              { id: "skills", label: "Regional Skill Demand", icon: TrendingUp },
              { id: "programs", label: "Government Programs", icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 font-semibold"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- TAB 1: OPPORTUNITY CATALOG (GRID) --- */}
        {activeTab === "catalog" && (
          <div className="space-y-5">
            {/* Filter Control Box */}
            <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs p-4 sm:p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs sm:text-sm">
                {/* Search Input */}
                <div className="lg:col-span-2 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search roles, companies, skills, or towns..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* State Select */}
                <div>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="all">All States / UTs</option>
                    {regions.map((r) => (
                      <option key={r.state} value={r.state}>
                        {r.state} ({r.totalOpportunities})
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
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="any">Any Work Mode</option>
                    <option value="onsite">On-Site Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote (Pan-India)</option>
                  </select>
                </div>
              </div>

              {/* Secondary Category Pills & Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100 text-xs sm:text-sm">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Category Selector Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { id: "all", label: "All Categories" },
                      { id: "internship", label: "Internships" },
                      { id: "job", label: "Jobs" },
                      { id: "skill-development", label: "Skill Training" },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => {
                          setSelectedCategory(btn.id);
                          setPage(1);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                          selectedCategory === btn.id
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Government Scheme Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 pl-2 sm:border-l sm:border-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={isGovtOnly}
                      onChange={(e) => {
                        setIsGovtOnly(e.target.checked);
                        setPage(1);
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="flex items-center gap-1 text-xs sm:text-sm">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Government & NAPS Only
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3 text-slate-600">
                  <span className="text-xs font-bold text-slate-700">
                    Showing <strong className="text-slate-900">{opportunities.length}</strong> of <strong className="text-slate-900">{totalCount}</strong> Opportunities
                  </span>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-bold transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset All
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="text-xs font-bold text-slate-500">Active Filters:</span>
                  {selectedState !== "all" && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                      State: {selectedState}
                      <button onClick={() => handleStateChange("all")}><X className="w-3.5 h-3.5" /></button>
                    </span>
                  )}
                  {selectedDistrict !== "all" && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
                      District: {selectedDistrict}
                      <button onClick={() => setSelectedDistrict("all")}><X className="w-3.5 h-3.5" /></button>
                    </span>
                  )}
                  {selectedWorkMode !== "any" && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-bold capitalize">
                      Mode: {selectedWorkMode}
                      <button onClick={() => setSelectedWorkMode("any")}><X className="w-3.5 h-3.5" /></button>
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-bold capitalize">
                      Category: {selectedCategory}
                      <button onClick={() => setSelectedCategory("all")}><X className="w-3.5 h-3.5" /></button>
                    </span>
                  )}
                  {isGovtOnly && (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                      Govt Programs Only
                      <button onClick={() => setIsGovtOnly(false)}><X className="w-3.5 h-3.5" /></button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Opportunities List Grid or Shimmering Skeletons */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="p-6 rounded-3xl border border-slate-200/90 bg-white space-y-4 animate-pulse shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="h-5 w-20 bg-slate-200 rounded-full" />
                      <div className="h-5 w-24 bg-slate-200 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                      <div className="h-4 w-1/2 bg-slate-200 rounded-lg" />
                    </div>
                    <div className="h-4 w-1/3 bg-slate-200 rounded-lg" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-full bg-slate-200 rounded" />
                      <div className="h-3 w-4/5 bg-slate-200 rounded" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="h-5 w-16 bg-slate-200 rounded-lg" />
                      <div className="h-5 w-16 bg-slate-200 rounded-lg" />
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="h-5 w-24 bg-slate-200 rounded-lg" />
                      <div className="h-8 w-20 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-16 p-8 space-y-3.5 rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  No matching local opportunities found
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Try broadening your location selection, switching to Pan-India remote roles, or clearing applied filter criteria to discover more openings.
                </p>
                <Button
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 shadow-xs"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {opportunities.map((item) => (
                  <LocalOpportunityCard
                    key={item.opportunity._id || item.opportunity.id}
                    item={item}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="text-xs font-bold rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-700 px-3 font-bold">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="text-xs font-bold rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: INTERACTIVE REGIONAL MAP --- */}
        {activeTab === "map" && (
          <div className="space-y-4">
            {/* Map Controls */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold cursor-pointer focus:bg-white"
                  >
                    <option value="all">Pan-India (All States)</option>
                    {regions.map((r) => (
                      <option key={r.state} value={r.state}>
                        {r.state}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold cursor-pointer focus:bg-white"
                  >
                    <option value="all">All Marker Types</option>
                    <option value="internship">Internships</option>
                    <option value="job">Jobs</option>
                    <option value="skill-development">Skill Training</option>
                  </select>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Showing <strong className="text-slate-900">{mapMarkers.length}</strong> verified geographic markers.
                    {unmappedCount > 0 && ` (${unmappedCount} remote postings excluded from GPS plots)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Screen: Map + Selected Marker Drawer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                {isMapLoading ? (
                  <div className="h-[520px] rounded-3xl bg-slate-50 flex items-center justify-center border border-slate-200">
                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <InteractiveOpportunityMap
                    markers={mapMarkers}
                    selectedMarkerId={selectedMarker?.id}
                    onSelectMarker={(m) => setSelectedMarker(m)}
                  />
                )}
              </div>

              {/* Selected Marker Details Drawer */}
              <div className="lg:col-span-1">
                {selectedMarker ? (
                  <div className="p-5 sm:p-6 border border-slate-200/90 bg-white h-full flex flex-col justify-between space-y-4 rounded-3xl shadow-xs">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            selectedMarker.type === "training_centre"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                              : "bg-blue-100 text-blue-900 border border-blue-200"
                          }`}
                        >
                          {selectedMarker.type === "training_centre"
                            ? "Training Centre"
                            : selectedMarker.category}
                        </span>

                        {selectedMarker.isGovernmentProgram && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                            Govt Initiative
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900">
                        {selectedMarker.title}
                      </h3>

                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {selectedMarker.organization}
                      </p>

                      <p className="text-xs text-slate-600 flex items-start gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{selectedMarker.address}</span>
                      </p>

                      {selectedMarker.stipend && (
                        <p className="text-xs font-extrabold text-emerald-700">
                          Stipend: {selectedMarker.stipend}
                        </p>
                      )}

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                        <div>
                          <span className="font-bold text-slate-900">District: </span>
                          {selectedMarker.district}, {selectedMarker.state}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">GPS: </span>
                          {selectedMarker.coordinates.latitude.toFixed(4)}, {selectedMarker.coordinates.longitude.toFixed(4)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-slate-100">
                      {selectedMarker.sourceUrl && (
                        <a
                          href={selectedMarker.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs font-bold transition shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Official Portal Source</span>
                        </a>
                      )}

                      {selectedMarker.type === "opportunity" && (
                        <Link href={`/opportunities/${selectedMarker.id}`}>
                          <Button size="sm" className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs">
                            View Opportunity Details
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center border-dashed border-2 border-slate-200 bg-white h-full flex flex-col items-center justify-center space-y-2.5 rounded-3xl shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-1">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      Select a Map Marker
                    </h4>
                    <p className="text-xs text-slate-600 max-w-xs leading-relaxed font-medium">
                      Click any pin on the interactive map to inspect local employer specifications, distance, verified ITI courses, and official application portals.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Privacy Invariant Callout */}
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">Strict Geographic Integrity: </strong>
                Physical map markers are strictly placed according to authenticated employer addresses and registered training institutes. Pan-India and remote positions are omitted from physical pins to ensure honest, zero-hallucination geospatial intelligence.
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: REGIONAL SKILL DEMAND & GAP ANALYTICS --- */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            {/* Region Selector Toolbar */}
            <div className="p-4 sm:p-5 border border-slate-200/90 bg-white rounded-3xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-bold text-slate-800">Target Region:</span>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold cursor-pointer focus:bg-white"
                  >
                    <option value="all">Pan-India Aggregate</option>
                    {regions.map((r) => (
                      <option key={r.state} value={r.state}>
                        {r.state}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={selectedState === "all" || availableDistricts.length === 0}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 disabled:opacity-50 cursor-pointer font-bold focus:bg-white"
                  >
                    <option value="all">All Regional Districts</option>
                    {availableDistricts.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Link
                  href="/dashboard/roadmap"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <span>Go to Learning Roadmap</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {isSkillsLoading ? (
              <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-600 font-bold">Aggregating regional skill demand...</p>
              </div>
            ) : (
              <>
                {demand && <RegionalSkillDemandChart demand={demand} />}
                {studentGap && <StudentRegionalGapWidget analysis={studentGap} />}
              </>
            )}
          </div>
        )}

        {/* --- TAB 4: GOVERNMENT INITIATIVES & NAPS SCHEMES --- */}
        {activeTab === "programs" && (
          <div className="space-y-5">
            {/* Hero Explanatory Banner */}
            <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Authenticated Public Sector & NAPS Apprenticeship Schemes
                </h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed max-w-3xl font-medium">
                NexSkill AI links directly to authorized government skill missions including National Apprenticeship Promotion Scheme (NAPS), Pradhan Mantri Kaushal Vikas Yojana (PMKVY), and State Electronic Governance Enterprises (e.g. BELTRON). All postings link to official government domains.
              </p>
            </div>

            {/* Filtered Government Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {opportunities
                .filter((item) => item.opportunity.isGovernmentProgram)
                .map((item) => (
                  <LocalOpportunityCard
                    key={item.opportunity._id || item.opportunity.id}
                    item={item}
                  />
                ))}
            </div>

            {opportunities.filter((item) => item.opportunity.isGovernmentProgram).length === 0 && (
              <div className="text-center py-16 p-8 space-y-3.5 rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  No government initiatives match this specific regional filter
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Try switching the state dropdown to Pan-India to discover national apprenticeship opportunities.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedState("all")}
                  className="text-xs font-bold px-4 py-2 rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Show All Government Initiatives
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </StudentPortalLayout>
  );
}
