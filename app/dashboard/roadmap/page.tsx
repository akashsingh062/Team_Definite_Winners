"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Sparkles,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  PlayCircle,
  Sliders,
  Layers,
  BookOpen,
  FolderGit2,
  ArrowRight,
  Plus,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MilestoneCard } from "@/features/roadmap/components/MilestoneCard";
import { RoadmapWizardModal } from "@/features/roadmap/components/RoadmapWizardModal";
import { RoadmapAdjustModal } from "@/features/roadmap/components/RoadmapAdjustModal";
import { IRoadmap } from "@/types/roadmap";

export default function RoadmapDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [roadmap, setRoadmap] = React.useState<IRoadmap | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  // Fetch active roadmap
  React.useEffect(() => {
    let isMounted = true;

    async function fetchRoadmap() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push("/login?callbackUrl=/dashboard/roadmap");
        return;
      }

      setIsLoading(true);

      try {
        const res = await fetch("/api/roadmap");
        if (res.status === 401) {
          router.push("/login?callbackUrl=/dashboard/roadmap");
          return;
        }

        const json = await res.json();
        if (isMounted) {
          if (json.success && json.data) {
            setRoadmap(json.data);
          } else {
            setRoadmap(null);
          }
        }
      } catch (err) {
        console.error("Error fetching roadmap:", err);
        if (isMounted) {
          toast.error("Failed to load active roadmap");
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
  }, [isAuthenticated, isAuthLoading, router, refreshTrigger]);

  const handleUpdate = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const completedMilestones =
    roadmap?.milestones.filter(
      (m) => m.status === "completed" || m.status === "skipped"
    ).length || 0;
  const totalMilestones = roadmap?.milestones.length || 0;
  const remainingMilestones = totalMilestones - completedMilestones;

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 border border-indigo-200/60 rounded-xl text-indigo-600">
                <Compass className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Personalized AI Learning Roadmap
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Step-by-step sequential learning plan engineered to close your Stage 5 skill gaps and prepare you for target career roles.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {roadmap && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdjustOpen(true)}
                  className="text-xs font-semibold text-slate-700 hover:text-indigo-600 gap-1.5 shadow-2xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Adjust Timeline</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsWizardOpen(true)}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Roadmap</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-slate-200 rounded-xl" />
              ))}
            </div>
            <div className="h-40 bg-slate-200 rounded-xl" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        ) : !roadmap ? (
          /* Empty State: Prompt to generate roadmap */
          <Card className="border-dashed border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/30 via-white to-white p-8 sm:p-12 text-center shadow-xs">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
                <Compass className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  No Active Learning Roadmap Found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Transform the missing skills identified in your Skill Gap Analyzer into an actionable, weekly step-by-step learning roadmap tailored to your schedule.
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-left space-y-1.5 text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>What your roadmap includes:</span>
                </div>
                <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-500">
                  <li>Topologically sequenced prerequisites (e.g. JavaScript before React)</li>
                  <li>Weekly milestones matching your daily study hours</li>
                  <li>Verified free learning resources and official documentation</li>
                  <li>Practical GitHub portfolio project deliverables for every skill</li>
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => setIsWizardOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-5 py-2.5 gap-2 shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate My AI Roadmap</span>
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Active Roadmap Dashboard */
          <>
            {/* Overview Metric Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border border-slate-200 bg-white shadow-2xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Roadmap Progress</p>
                    <p className="text-2xl font-extrabold text-indigo-600 mt-0.5">
                      {roadmap.progressPercentage}%
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {completedMilestones} of {totalMilestones} milestones
                    </p>
                  </div>
                  <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                    <Target className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-white shadow-2xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Target Role</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5 truncate max-w-[150px]">
                      {roadmap.targetRole}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                      {roadmap.learningPace} pace
                    </p>
                  </div>
                  <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600">
                    <Compass className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-white shadow-2xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Estimated Timeline</p>
                    <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {roadmap.estimatedDuration}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {roadmap.studyHoursPerDay}h/day • {roadmap.studyDaysPerWeek}d/wk
                    </p>
                  </div>
                  <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                    <Clock className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-white shadow-2xs">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Pending Milestones</p>
                    <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
                      {remainingMilestones}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {remainingMilestones === 0 ? "All completed!" : "Upcoming milestones"}
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Roadmap Banner & Progress Bar */}
            <Card className="border border-indigo-100 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/30 shadow-2xs">
              <CardContent className="p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="indigo" className="text-xs font-semibold">
                        Active Roadmap
                      </Badge>
                      <Badge variant="slate" className="text-xs font-medium capitalize">
                        {roadmap.learningPace} Pacing
                      </Badge>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                      {roadmap.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                      {roadmap.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
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

                {/* Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">
                      Curriculum Completion Progress
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

            {/* Milestones Learning Timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Weekly Learning Milestones ({roadmap.milestones.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Arranged sequentially according to technical prerequisites and Stage 5 priority.
                  </p>
                </div>
              </div>

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

            {/* Fairness and Academic Responsibility Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Learning Integrity Disclaimer:</strong> Completing roadmap tasks and self-directed milestones builds your competency profile and informs your Stage 4 matching scores. Roadmap completion represents dedicated student preparation and does not constitute an employer hiring guarantee.
              </span>
            </div>
          </>
        )}

        {/* Wizard Modal */}
        <RoadmapWizardModal
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onGenerated={(newRoadmap) => {
            setRoadmap(newRoadmap);
            setRefreshTrigger((prev) => prev + 1);
          }}
          initialRole={roadmap?.targetRole || user?.name ? "Full Stack Developer" : "Software Engineer"}
        />

        {/* Adjust Modal */}
        {roadmap && (
          <RoadmapAdjustModal
            isOpen={isAdjustOpen}
            onClose={() => setIsAdjustOpen(false)}
            roadmap={roadmap}
            onAdjusted={(updatedRoadmap) => {
              setRoadmap(updatedRoadmap);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        )}
      </div>
    </StudentPortalLayout>
  );
}
