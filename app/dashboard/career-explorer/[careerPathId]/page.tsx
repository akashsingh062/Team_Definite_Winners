"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  Route,
  Sliders,
  Sparkles,
  BookOpen,
  Briefcase,
  CheckCircle2,
  FolderGit2,
  GraduationCap,
  TrendingUp,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import {
  CareerReadinessScoreCard,
  RoadmapActionPlanButton,
} from "@/features/career-simulator/components";
import { ICareerPath, ICareerAlignmentResult } from "@/types/career-path";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function CareerPathDetailPage() {
  const params = useParams();
  const router = useRouter();
  const careerPathId = params.careerPathId as string;

  const [careerPath, setCareerPath] = useState<ICareerPath | null>(null);
  const [alignment, setAlignment] = useState<ICareerAlignmentResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchCareerDetails() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/career-paths/${careerPathId}`);
        if (res.ok && !ignore) {
          const json = await res.json();
          if (json.success) {
            setCareerPath(json.data.careerPath);
            setAlignment(json.data.alignment);
            setAiExplanation(json.data.aiExplanation);
          } else {
            toast.error(json.error || "Career path not found");
          }
        } else if (!ignore) {
          toast.error("Failed to load career path details");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch career details:", err);
          toast.error("Failed to load career path details");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    if (careerPathId) {
      fetchCareerDetails();
    }

    return () => {
      ignore = true;
    };
  }, [careerPathId]);

  if (isLoading) {
    return (
      <StudentPortalLayout>
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          <div className="h-8 w-32 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </StudentPortalLayout>
    );
  }

  if (!careerPath) {
    return (
      <StudentPortalLayout>
        <div className="max-w-md mx-auto py-16 text-center space-y-4">
          <Route className="h-12 w-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Career Path Not Found</h2>
          <p className="text-xs text-slate-500">
            The career pathway you requested does not exist or has been retired.
          </p>
          <Link href="/dashboard/career-explorer">
            <Button variant="primary" size="sm">
              Back to Career Explorer
            </Button>
          </Link>
        </div>
      </StudentPortalLayout>
    );
  }

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-24">
        {/* Breadcrumb Back Link */}
        <div>
          <Link
            href="/dashboard/career-explorer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Career Explorer</span>
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase tracking-wider">
                  {careerPath.category}
                </span>
                <span className="text-2xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
                  {careerPath.learningDifficulty} Difficulty
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {careerPath.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/dashboard/career-simulator?career=${careerPath.slug}`}>
                <Button
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <Sliders className="h-4 w-4" />
                  <span>Simulate What-If</span>
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-3xl">
            {careerPath.description}
          </p>
        </div>

        {/* Career Readiness Scorecard if Alignment Computed */}
        {alignment && <CareerReadinessScoreCard alignment={alignment} />}

        {/* Gemini AI Strategic Guidance */}
        {aiExplanation && (
          <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/50 rounded-2xl border border-indigo-100 p-6 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>AI Guidance for Your Profile</span>
              {aiExplanation.isAiGenerated && (
                <span className="text-2xs font-normal text-indigo-500 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                  Gemini Flash
                </span>
              )}
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {aiExplanation.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-white/80 rounded-xl border border-indigo-100/60 space-y-1">
                <span className="font-bold text-slate-800 block">Identified Strengths:</span>
                <ul className="list-disc pl-5 text-2xs text-slate-600 space-y-0.5">
                  {aiExplanation.strengths?.map((s: string, idx: number) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-white/80 rounded-xl border border-indigo-100/60 space-y-1">
                <span className="font-bold text-slate-800 block">Recommended Focus:</span>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  {aiExplanation.recommendedFocus}
                </p>
              </div>
            </div>

            {aiExplanation.projectIdea && (
              <div className="pt-2 text-xs text-indigo-900 bg-white/60 p-3 rounded-xl border border-indigo-100/40">
                <span className="font-bold block mb-0.5">Recommended Project Concept:</span>
                <p className="text-2xs text-slate-700">{aiExplanation.projectIdea}</p>
              </div>
            )}
          </div>
        )}

        {/* Stage 6 Roadmap Action Plan Bridge */}
        {alignment && alignment.skills.missingRequired.length > 0 && (
          <RoadmapActionPlanButton
            careerTitle={careerPath.title}
            missingSkills={alignment.skills.missingRequired}
          />
        )}

        {/* Skills Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Skills */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              Required Core Competencies ({careerPath.requiredSkills.length})
            </h3>
            <p className="text-xs text-slate-500">
              Fundamental technical capabilities expected by hiring teams for this position
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {careerPath.requiredSkills.map((skill, idx) => {
                const isMatched = alignment?.skills.matchedRequired.includes(skill);
                return (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                      isMatched
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    {isMatched ? "✓ " : ""}{skill}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Preferred Skills */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Preferred Auxiliary Skills ({careerPath.preferredSkills.length})
            </h3>
            <p className="text-xs text-slate-500">
              Differentiating technologies that improve candidate competitiveness
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {careerPath.preferredSkills.map((skill, idx) => {
                const isMatched = alignment?.skills.matchedPreferred.includes(skill);
                return (
                  <span
                    key={idx}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${
                      isMatched
                        ? "bg-teal-50 text-teal-800 border-teal-200 font-semibold"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {isMatched ? "✓ " : ""}{skill}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommended Portfolio Projects */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-blue-600" />
              Recommended Portfolio Projects
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Practical project concepts that showcase production competence to employers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {careerPath.recommendedProjects.map((proj, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-900">{proj.title}</h4>
                  <p className="text-2xs text-slate-600 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200/60">
                  <div className="flex flex-wrap gap-1">
                    {proj.skills.map((s, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-white text-slate-700 text-2xs font-medium border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  {proj.deliverable && (
                    <p className="text-2xs text-slate-500 italic">
                      Deliverable: {proj.deliverable}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsibilities & Progression Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Responsibilities */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              Typical Responsibilities
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {careerPath.responsibilities.map((resp, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed">{resp}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Progression Pathway */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Career Progression Trajectory
            </h3>
            <div className="space-y-2 pt-1">
              {careerPath.careerProgression.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
                >
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-2xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StudentPortalLayout>
  );
}

