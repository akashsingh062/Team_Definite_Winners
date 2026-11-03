"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Route,
  Search,
  Filter,
  Sliders,
  GitCompare,
  ArrowRight,
  Sparkles,
  Layers,
  Compass,
} from "lucide-react";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { CareerPathCard } from "@/features/career-simulator/components";
import { ICareerPath, CareerDifficulty } from "@/types/career-path";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORIES = [
  "All",
  "Software Engineering",
  "Data & AI",
  "Cloud & Infrastructure",
  "Security & Operations",
  "Design",
  "Quality & Reliability",
];

const DIFFICULTIES = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner Friendly" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function CareerExplorerPage() {
  const router = useRouter();
  const [careerPaths, setCareerPaths] = useState<ICareerPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    let ignore = false;

    async function fetchCareerPaths() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "All") params.set("category", selectedCategory);
        if (selectedDifficulty !== "all") params.set("difficulty", selectedDifficulty);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());

        const res = await fetch(`/api/career-paths?${params.toString()}`);
        if (res.ok && !ignore) {
          const json = await res.json();
          if (json.success) {
            setCareerPaths(json.data || []);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load career paths:", err);
          toast.error("Failed to load career paths");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchCareerPaths();

    return () => {
      ignore = true;
    };
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const toggleCompare = (slug: string) => {
    if (selectedForCompare.includes(slug)) {
      setSelectedForCompare(selectedForCompare.filter((s) => s !== slug));
    } else {
      if (selectedForCompare.length >= 3) {
        toast.warning("You can compare a maximum of 3 career paths at one time.");
        return;
      }
      setSelectedForCompare([...selectedForCompare, slug]);
    }
  };

  const handleLaunchCompare = () => {
    if (selectedForCompare.length < 1) {
      toast.error("Please select at least one career path to compare.");
      return;
    }
    router.push(`/dashboard/career-comparison?careers=${selectedForCompare.join(",")}`);
  };

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
        {/* Hero Header */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xs relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Route className="h-3.5 w-3.5" />
              <span>Career Exploration & Navigation</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Discover & Navigate Modern Career Pathways
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore in-demand tech roles curated with transparent industry competency standards. Review required skills, portfolio expectations, and simulate how learning new skills accelerates your readiness.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link href="/dashboard/career-simulator">
                <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Launch What-If Simulator</span>
                </Button>
              </Link>
              <Link href="/dashboard/career-comparison">
                <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                  <GitCompare className="h-3.5 w-3.5" />
                  <span>Compare Roles</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role title, description, or skill (e.g. React, Python, Cloud)..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              />
            </div>

            {/* Difficulty Filter */}
            <div className="relative shrink-0 w-full md:w-52">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm font-medium bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Career Paths Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"
              />
            ))}
          </div>
        ) : careerPaths.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Route className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              No matching career paths found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, difficulty filter, or category selection to discover available career pathways.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedDifficulty("all");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {careerPaths.map((career) => (
              <CareerPathCard
                key={career.slug}
                careerPath={career}
                isSelectedForCompare={selectedForCompare.includes(career.slug)}
                onToggleCompare={toggleCompare}
              />
            ))}
          </div>
        )}

        {/* Floating Bottom Compare Bar */}
        {selectedForCompare.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-4 animate-in slide-in-from-bottom-6 max-w-md w-full justify-between">
            <div className="flex items-center gap-2 text-xs">
              <GitCompare className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold">
                {selectedForCompare.length} role(s) selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedForCompare([])}
                className="text-2xs text-slate-400 hover:text-white px-2 py-1"
              >
                Clear
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleLaunchCompare}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs px-3 h-8 text-white font-bold"
              >
                <span>Compare Now</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </StudentPortalLayout>
  );
}

