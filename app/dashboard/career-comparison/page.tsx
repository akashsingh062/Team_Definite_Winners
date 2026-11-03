"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  GitCompare,
  Sparkles,
  Plus,
  X,
  Loader2,
  Route,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { CareerComparisonTable } from "@/features/career-simulator/components";
import { ICareerPath, ICareerComparisonResult } from "@/types/career-path";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function ComparisonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCareersParam = searchParams.get("careers") || "";

  const [careerPaths, setCareerPaths] = useState<ICareerPath[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ICareerComparisonResult | null>(null);

  const [isLoadingPaths, setIsLoadingPaths] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  // 1. Fetch available career paths
  useEffect(() => {
    let ignore = false;

    async function loadPaths() {
      setIsLoadingPaths(true);
      try {
        const res = await fetch("/api/career-paths");
        if (res.ok && !ignore) {
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            setCareerPaths(json.data);

            // Handle initial query param
            if (initialCareersParam) {
              const slugs = initialCareersParam.split(",").map((s) => s.trim()).filter(Boolean);
              setSelectedSlugs(slugs.slice(0, 3));
            } else {
              // Default to top 2 paths
              setSelectedSlugs([json.data[0].slug, json.data[1]?.slug || json.data[0].slug]);
            }
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load career paths for comparison:", err);
          toast.error("Failed to load career paths");
        }
      } finally {
        if (!ignore) setIsLoadingPaths(false);
      }
    }

    loadPaths();

    return () => {
      ignore = true;
    };
  }, [initialCareersParam]);

  useEffect(() => {
    let ignore = false;

    if (selectedSlugs.length === 0) {
      return;
    }

    async function runComparison() {
      setIsComparing(true);
      try {
        const res = await fetch("/api/career-simulator/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ careerPathIds: selectedSlugs }),
        });

        if (res.ok && !ignore) {
          const json = await res.json();
          if (json.success) {
            setComparisonResult(json.data);
          } else {
            toast.error(json.error || "Failed to compare career paths");
          }
        } else if (!ignore) {
          toast.error("Failed to execute career comparison");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Comparison execution error:", err);
          toast.error("Error executing career comparison");
        }
      } finally {
        if (!ignore) {
          setIsComparing(false);
        }
      }
    }

    runComparison();

    return () => {
      ignore = true;
    };
  }, [selectedSlugs]);

  const handleAddSlug = (slug: string) => {
    if (selectedSlugs.includes(slug)) return;
    if (selectedSlugs.length >= 3) {
      toast.warning("You can compare up to 3 career paths at once.");
      return;
    }
    const updated = [...selectedSlugs, slug];
    setSelectedSlugs(updated);
    router.replace(`/dashboard/career-comparison?careers=${updated.join(",")}`);
  };

  const handleRemoveSlug = (slug: string) => {
    const updated = selectedSlugs.filter((s) => s !== slug);
    setSelectedSlugs(updated);
    if (updated.length > 0) {
      router.replace(`/dashboard/career-comparison?careers=${updated.join(",")}`);
    } else {
      router.replace("/dashboard/career-comparison");
    }
  };

  const availablePathsToAdd = careerPaths.filter(
    (cp) => !selectedSlugs.includes(cp.slug)
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <GitCompare className="h-3.5 w-3.5" />
            <span>Multi-Pathway Comparative Analysis</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Compare Career Pathways Side-by-Side
          </h1>
          <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Evaluate up to 3 target roles simultaneously. Contrast your skill coverage, discover overlapping competencies that build multiple pathways, and inspect AI-synthesized strategic tradeoffs.
          </p>
        </div>

        {/* Selected Career Tags & Selector */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          {selectedSlugs.map((slug) => {
            const cp = careerPaths.find((c) => c.slug === slug);
            return (
              <span
                key={slug}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-2xs"
              >
                <span>{cp?.title || slug}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlug(slug)}
                  className="hover:bg-indigo-700 p-0.5 rounded-full cursor-pointer"
                  title="Remove from comparison"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            );
          })}

          {selectedSlugs.length < 3 && availablePathsToAdd.length > 0 && (
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddSlug(e.target.value);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
                className="px-3 py-1.5 border border-dashed border-slate-300 rounded-xl text-xs font-semibold bg-white text-slate-600 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer focus:outline-hidden"
              >
                <option value="" disabled>
                  + Add another role to compare ({selectedSlugs.length}/3)
                </option>
                {availablePathsToAdd.map((cp) => (
                  <option key={cp.slug} value={cp.slug}>
                    {cp.title} ({cp.category})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Body */}
      {isComparing ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-600">
            Analyzing comparative skill overlap and synthesizing AI tradeoffs...
          </span>
        </div>
      ) : selectedSlugs.length === 0 ? (
        <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-2xs">
          <GitCompare className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            No Career Paths Selected
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Choose 1 to 3 career paths from the selector above to generate a side-by-side comparison matrix.
          </p>
        </div>
      ) : comparisonResult ? (
        <CareerComparisonTable
          comparison={comparisonResult}
          onRemovePath={selectedSlugs.length > 1 ? handleRemoveSlug : undefined}
        />
      ) : null}
    </div>
  );
}

export default function CareerComparisonPage() {
  return (
    <StudentPortalLayout>
      <Suspense
        fallback={
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
            Loading Career Comparison...
          </div>
        }
      >
        <ComparisonContent />
      </Suspense>
    </StudentPortalLayout>
  );
}
