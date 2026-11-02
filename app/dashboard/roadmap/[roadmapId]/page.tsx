"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Compass,
  Sparkles,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MilestoneCard } from "@/features/roadmap/components/MilestoneCard";
import { RoadmapAdjustModal } from "@/features/roadmap/components/RoadmapAdjustModal";
import { IRoadmap } from "@/types/roadmap";

export default function IndividualRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const roadmapId = params?.roadmapId as string;
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [roadmap, setRoadmap] = React.useState<IRoadmap | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchRoadmap() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push(`/login?callbackUrl=/dashboard/roadmap/${roadmapId}`);
        return;
      }

      if (!roadmapId) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/roadmap/${roadmapId}`);
        if (res.status === 401) {
          router.push(`/login?callbackUrl=/dashboard/roadmap/${roadmapId}`);
          return;
        }

        const json = await res.json();
        if (isMounted) {
          if (json.success && json.data) {
            setRoadmap(json.data);
          } else {
            setError(json.message || "Failed to load roadmap details");
          }
        }
      } catch (err) {
        console.error("Error fetching roadmap:", err);
        if (isMounted) {
          setError("Network error loading roadmap");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!isAuthLoading) {
      fetchRoadmap();
    }

    return () => {
      isMounted = false;
    };
  }, [roadmapId, isAuthenticated, isAuthLoading, router, refreshTrigger]);

  const handleUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading || isAuthLoading) {
    return (
      <StudentPortalLayout>
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse py-8">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-32 bg-slate-200 rounded-xl" />
          <div className="space-y-4">
            <div className="h-28 bg-slate-200 rounded-xl" />
            <div className="h-28 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </StudentPortalLayout>
    );
  }

  if (error || !roadmap) {
    return (
      <StudentPortalLayout>
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {error || "Roadmap Not Found"}
          </h2>
          <p className="text-xs text-slate-500">
            This roadmap could not be loaded or belongs to another student.
          </p>
          <Link href="/dashboard/roadmap">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Roadmaps</span>
            </Button>
          </Link>
        </div>
      </StudentPortalLayout>
    );
  }

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/dashboard/roadmap"
            className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Learning Roadmap</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-sm">
            {roadmap.title}
          </span>
        </div>

        {/* Roadmap Hero Card */}
        <Card className="border border-indigo-100 bg-gradient-to-r from-indigo-50/40 via-white to-white shadow-2xs">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="indigo" className="text-xs font-semibold">
                    {roadmap.targetRole}
                  </Badge>
                  <Badge variant="slate" className="text-xs capitalize">
                    {roadmap.learningPace} Pacing
                  </Badge>
                  <Badge
                    variant={roadmap.status === "completed" ? "emerald" : "slate"}
                    className="text-xs capitalize"
                  >
                    {roadmap.status}
                  </Badge>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {roadmap.title}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {roadmap.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdjustOpen(true)}
                  className="text-xs font-semibold text-slate-700 hover:text-indigo-600 gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Adjust Timeline</span>
                </Button>
              </div>
            </div>

            {/* Progress Meter */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Completion Progress
                </span>
                <span className="font-extrabold text-indigo-600">
                  {roadmap.progressPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${roadmap.progressPercentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Milestones List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Roadmap Milestones ({roadmap.milestones.length})
          </h2>

          <div className="space-y-3">
            {roadmap.milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                roadmapId={roadmap.id || roadmap._id || ""}
                milestone={milestone}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        </div>

        {/* Adjust Modal */}
        <RoadmapAdjustModal
          isOpen={isAdjustOpen}
          onClose={() => setIsAdjustOpen(false)}
          roadmap={roadmap}
          onAdjusted={(updated) => {
            setRoadmap(updated);
            handleUpdate();
          }}
        />
      </div>
    </StudentPortalLayout>
  );
}
