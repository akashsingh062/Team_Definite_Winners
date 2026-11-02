"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Target,
  Sparkles,
  BookOpen,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Clock,
  Layers,
  Save,
  Check,
  ShieldCheck,
  FolderGit2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge } from "@/features/skill-gap/components/PriorityBadge";
import { StatusBadge } from "@/features/skill-gap/components/StatusBadge";
import {
  SkillPriority,
  SkillProgressStatus,
  ILearningResource,
  IStudentSkillProgress,
  IOpportunitySkillRef,
} from "@/types/skill-gap";

interface SkillDetailResponse {
  skillName: string;
  category: string;
  priority: SkillPriority;
  isPossessed: boolean;
  demandPercentage: number;
  opportunityCount: number;
  requiredByCount: number;
  preferredByCount: number;
  relevantOpportunities: IOpportunitySkillRef[];
  explanation: {
    skillName: string;
    whatIsIt: string;
    whyItMatters: string;
    keyConcepts: string[];
    suggestedProject: string;
    relevantOpportunities: string[];
  };
  learningResources: ILearningResource[];
  progress: IStudentSkillProgress | null;
}

export default function SkillGapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSkillId = params?.skillId as string;
  const decodedSkill = decodeURIComponent(rawSkillId || "");

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [detail, setDetail] = React.useState<SkillDetailResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Progress form state
  const [progressStatus, setProgressStatus] = React.useState<SkillProgressStatus>("not_started");
  const [progressNotes, setProgressNotes] = React.useState("");
  const [isSavingProgress, setIsSavingProgress] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push(`/login?callbackUrl=/dashboard/skill-gap/${encodeURIComponent(decodedSkill)}`);
        return;
      }

      if (!decodedSkill) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/skill-gap/skills/${encodeURIComponent(decodedSkill)}`);
        if (res.status === 401) {
          router.push(`/login?callbackUrl=/dashboard/skill-gap/${encodeURIComponent(decodedSkill)}`);
          return;
        }

        const json = await res.json();
        if (isMounted) {
          if (json.success && json.data) {
            setDetail(json.data);
            if (json.data.progress) {
              setProgressStatus(json.data.progress.status);
              setProgressNotes(json.data.progress.notes || "");
            }
          } else {
            setError(json.message || "Failed to load skill details");
          }
        }
      } catch (err) {
        console.error("Skill detail fetch error:", err);
        if (isMounted) {
          setError("Network error fetching skill details");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!isAuthLoading) {
      fetchDetail();
    }

    return () => {
      isMounted = false;
    };
  }, [decodedSkill, isAuthenticated, isAuthLoading, router]);

  // Save Progress Handler
  const handleSaveProgress = async () => {
    if (!detail) return;

    setIsSavingProgress(true);
    try {
      const res = await fetch("/api/skill-gap/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillName: detail.skillName,
          status: progressStatus,
          notes: progressNotes,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setDetail({
          ...detail,
          progress: json.data,
        });
        toast.success(`Progress updated for ${detail.skillName}!`);
      } else {
        toast.error(json.message || "Failed to update progress");
      }
    } catch {
      toast.error("Failed to save progress");
    } finally {
      setIsSavingProgress(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <StudentPortalLayout>
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse py-8">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-32 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-xl" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </StudentPortalLayout>
    );
  }

  if (error || !detail) {
    return (
      <StudentPortalLayout>
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {error || "Skill Details Not Found"}
          </h2>
          <p className="text-xs text-slate-500">
            Could not retrieve gap analysis for &ldquo;{decodedSkill}&rdquo;.
          </p>
          <Link href="/dashboard/skill-gap">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Skill Gap Dashboard</span>
            </Button>
          </Link>
        </div>
      </StudentPortalLayout>
    );
  }

  const {
    skillName,
    category,
    priority,
    isPossessed,
    demandPercentage,
    opportunityCount,
    requiredByCount,
    preferredByCount,
    relevantOpportunities,
    explanation,
    learningResources,
    progress,
  } = detail;

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/dashboard/skill-gap"
            className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Skill Gap Analyzer</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">{skillName}</span>
        </div>

        {/* Hero Header Card */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="indigo" className="text-xs font-semibold">
                    {category}
                  </Badge>
                  {isPossessed ? (
                    <Badge variant="emerald" className="text-xs font-semibold gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Possessed on Profile</span>
                    </Badge>
                  ) : (
                    <Badge variant="amber" className="text-xs font-semibold gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Missing Skill Gap</span>
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {skillName}
                </h1>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl pt-1">
                  {explanation.whatIsIt}
                </p>
              </div>

              {/* Priority & Status Badges */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <PriorityBadge priority={priority} size="md" />
                <StatusBadge status={progress?.status || "not_started"} size="sm" />
              </div>
            </div>

            {/* Demand Stats Strip */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-600">
              <span>
                Market Demand: <strong className="text-slate-900">{demandPercentage}%</strong>
              </span>
              <span>
                Required by: <strong className="text-slate-900">{requiredByCount} roles</strong>
              </span>
              <span>
                Preferred by: <strong className="text-slate-900">{preferredByCount} roles</strong>
              </span>
              <span className="text-slate-400">
                Total matching opportunities: {opportunityCount}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 2-Column Grid: Left: Contextual Insights & Project. Right: Learning Progress Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: AI/Deterministic Insights (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Why this skill matters */}
            <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white shadow-2xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-base font-bold">
                    Why {skillName} Matters for Your Career
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-indigo-100 shadow-2xs">
                  {explanation.whyItMatters}
                </p>

                {/* Key Concepts */}
                {explanation.keyConcepts && explanation.keyConcepts.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h3 className="text-xs font-bold text-slate-800">
                      Key Concepts to Master:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {explanation.keyConcepts.map((concept, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-800 flex items-start gap-2"
                        >
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                          <span>{concept}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Beginner Showcase Project */}
                {explanation.suggestedProject && (
                  <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                      <FolderGit2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Recommended Proof Project to Build:</span>
                    </div>
                    <p className="text-xs text-emerald-900/90 leading-relaxed">
                      {explanation.suggestedProject}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Learning Resources */}
            <Card className="border border-slate-200 shadow-2xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    Curated Free Learning Resources
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Verified, high-quality documentation, interactive tutorials, and open courses.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {learningResources.map((resource) => (
                  <div
                    key={resource.id || resource.title}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-indigo-600">
                            {resource.provider}
                          </span>
                          <span className="text-slate-300">•</span>
                          <Badge variant="slate" className="text-[10px] capitalize">
                            {resource.resourceType}
                          </Badge>
                          {resource.isFree && (
                            <Badge variant="emerald" className="text-[10px]">
                              Free
                            </Badge>
                          )}
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {resource.title}
                        </h4>
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2.5 gap-1 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </a>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {resource.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {resource.estimatedDuration}
                      </span>
                      <span className="capitalize">
                        Level: {resource.difficultyLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Relevant Opportunities Requiring This Skill */}
            {relevantOpportunities.length > 0 && (
              <Card className="border border-slate-200 shadow-2xs">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-700" />
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Opportunities Requiring {skillName} ({relevantOpportunities.length})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {relevantOpportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{opp.title}</p>
                          <p className="text-[11px] text-slate-500">{opp.companyName}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {opp.isRequired ? (
                            <Badge variant="danger" className="text-[10px]">
                              Required
                            </Badge>
                          ) : (
                            <Badge variant="indigo" className="text-[10px]">
                              Preferred
                            </Badge>
                          )}
                          <Link href={`/opportunities/${opp.id}`}>
                            <Button size="sm" variant="outline" className="text-[11px] h-7 px-2">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Learning Progress Tracker */}
          <div className="space-y-6">
            <Card className="border border-indigo-200 bg-indigo-50/20 shadow-2xs sticky top-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-indigo-900">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-sm font-bold">
                    My Learning Progress
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Track your preparation milestones for {skillName}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Current Learning Status
                  </label>
                  <Select
                    value={progressStatus}
                    onChange={(e) => setProgressStatus(e.target.value as SkillProgressStatus)}
                    className="text-xs bg-white"
                    options={[
                      { value: "not_started", label: "Not Started" },
                      { value: "learning", label: "In Progress (Learning)" },
                      { value: "practicing", label: "Building / Practicing" },
                      { value: "completed", label: "Completed / Proficient" },
                    ]}
                  />
                </div>

                {/* Personal Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Personal Study Notes & Repo Links
                  </label>
                  <Textarea
                    placeholder="Document your notes, GitHub links to code experiments, or key takeaways..."
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    rows={4}
                    className="text-xs bg-white resize-none"
                  />
                </div>

                {/* Save Button */}
                <Button
                  size="sm"
                  onClick={handleSaveProgress}
                  disabled={isSavingProgress}
                  className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProgress ? "Saving..." : "Save Progress"}</span>
                </Button>

                {progress?.completedAt && (
                  <p className="text-[11px] text-emerald-700 font-medium text-center flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed on {new Date(progress.completedAt).toLocaleDateString()}</span>
                  </p>
                )}

                {/* Responsible Progress Disclaimer */}
                <div className="p-3 bg-white rounded-lg border border-indigo-100 text-[11px] text-slate-500 leading-relaxed">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 inline mr-1" />
                  <span>
                    Self-tracked progress helps organize your study timeline. Official evaluation remains grounded in demonstrated project proof.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentPortalLayout>
  );
}

