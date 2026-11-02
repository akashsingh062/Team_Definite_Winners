"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  GraduationCap,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Target,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/features/matching/components/ScoreBadge";
import { EligibilityBadge } from "@/features/matching/components/EligibilityBadge";
import { ComponentScoreBar } from "@/features/matching/components/ComponentScoreBar";
import { IOpportunityMatchResult } from "@/types/matching";

export default function RecommendationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params?.opportunityId as string;
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [match, setMatch] = React.useState<IOpportunityMatchResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push(`/login?callbackUrl=/dashboard/recommendations/${opportunityId}`);
        return;
      }

      if (!opportunityId) return;

      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/matching/recommendations/${opportunityId}`);

        if (res.status === 401) {
          router.push(`/login?callbackUrl=/dashboard/recommendations/${opportunityId}`);
          return;
        }

        const json = await res.json();
        if (isMounted) {
          if (json.success && json.data) {
            setMatch(json.data);
          } else {
            setError(json.message || "Failed to load match analysis");
          }
        }
      } catch (err) {
        console.error("Match detail fetch error:", err);
        if (isMounted) {
          setError("Failed to communicate with matching engine");
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
  }, [opportunityId, isAuthenticated, isAuthLoading, router]);

  if (isLoading || isAuthLoading) {
    return (
      <StudentPortalLayout>
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse py-8">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-40 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-xl" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </StudentPortalLayout>
    );
  }

  if (error || !match) {
    return (
      <StudentPortalLayout>
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {error || "Opportunity Recommendation Not Found"}
          </h2>
          <p className="text-xs text-slate-500">
            This opportunity may no longer be published or active.
          </p>
          <Link href="/dashboard/recommendations">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Smart Matches</span>
            </Button>
          </Link>
        </div>
      </StudentPortalLayout>
    );
  }

  const {
    opportunity,
    overallScore,
    eligibilityStatus,
    componentScores,
    matchedSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    eligibilityIssues,
    strengths,
    improvementAreas,
    explanation,
    relevantProjects,
    dataCompleteness,
  } = match;

  const compensationText =
    opportunity.category === "skill-development"
      ? opportunity.isPaid
        ? "Paid Training"
        : "Free Learning"
      : opportunity.stipend ||
        opportunity.salaryRange ||
        (opportunity.isPaid ? "Paid" : "Unpaid");

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/dashboard/recommendations"
            className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Smart Matches</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">
            {opportunity.title}
          </span>
        </div>

        {/* Hero Card */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-800 font-bold text-lg shadow-2xs">
                  {opportunity.companyName ? opportunity.companyName.substring(0, 2).toUpperCase() : "CB"}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {opportunity.companyName}
                    </span>
                    <Badge variant="slate" className="text-[11px] capitalize">
                      {opportunity.category}
                    </Badge>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    {opportunity.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 capitalize">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      {opportunity.workMode}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {opportunity.location || "Remote"}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {compensationText}
                    </span>
                    {opportunity.applicationDeadline && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Deadline: {new Date(opportunity.applicationDeadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Overall Score Box */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 shrink-0">
                <div className="text-left md:text-right">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Match Confidence
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ScoreBadge score={overallScore} size="lg" />
                  </div>
                </div>
                <EligibilityBadge status={eligibilityStatus} size="md" />
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Profile completeness factor: <strong className="text-slate-800">{dataCompleteness}%</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href={`/opportunities/${match.opportunityId}`}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="sm"
                    className="w-full sm:w-auto text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-2xs"
                  >
                    <span>View Role & How to Apply</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Narrative & Explanation Card */}
        <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <CardTitle className="text-base font-bold">
                Why this opportunity was recommended
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Algorithmic synthesis of your demonstrated skills, portfolio proof, and career criteria.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-white p-4 rounded-lg border border-indigo-100/70 shadow-2xs">
              {explanation}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Strengths */}
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Key Candidate Strengths</span>
                </div>
                <ul className="space-y-1.5 text-xs text-emerald-900/90 pl-5 list-disc">
                  {strengths.map((str, idx) => (
                    <li key={idx} className="leading-snug">
                      {str}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actionable Improvement Areas */}
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Areas to Address</span>
                </div>
                <ul className="space-y-1.5 text-xs text-amber-900/90 pl-5 list-disc">
                  {improvementAreas.map((imp, idx) => (
                    <li key={idx} className="leading-snug">
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7-Part Component Score Breakdown */}
        <Card className="border border-slate-200 shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  7-Component Weighted Scoring Breakdown
                </CardTitle>
                <CardDescription className="text-xs">
                  Deterministic formula weights sum to exactly 100%.
                </CardDescription>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Overall: {overallScore}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <ComponentScoreBar
                label="1. Required Technical Skills"
                weight={40}
                score={componentScores.requiredSkills}
                description="Core competencies marked as non-negotiable by the poster."
              />

              <ComponentScoreBar
                label="2. Preferred Technical Skills"
                weight={15}
                score={componentScores.preferredSkills}
                description="Bonus skills that provide competitive advantage."
              />

              <ComponentScoreBar
                label="3. Projects & Experience"
                weight={15}
                score={componentScores.projectsExperience}
                description="Demonstrated proof in verified GitHub/portfolio projects."
              />

              <ComponentScoreBar
                label="4. Education & Eligibility"
                weight={10}
                score={componentScores.education}
                description="Degree, branch, graduation timeline, and minimum CGPA."
              />

              <ComponentScoreBar
                label="5. Career Role Alignment"
                weight={10}
                score={componentScores.careerAlignment}
                description="Semantic congruence with your specified target career roles."
              />

              <ComponentScoreBar
                label="6. Work Mode & Location"
                weight={5}
                score={componentScores.locationWorkMode}
                description="Preference match for Remote, Hybrid, or On-site setup."
              />

              <ComponentScoreBar
                label="7. Compensation Alignment"
                weight={5}
                score={componentScores.compensation}
                description="Stipend or salary alignment against student career preferences."
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills Alignment Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Skills Card */}
          <Card className="border border-slate-200 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Required Skills Matrix</span>
                <span className="text-xs font-medium text-slate-500">
                  {matchedSkills.length} matched / {missingRequiredSkills.length} missing
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Matched Required */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Matched Skills ({matchedSkills.length})</span>
                </p>
                {matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No required skills matched yet</p>
                )}
              </div>

              {/* Missing Required */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-amber-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Missing Required Skills ({missingRequiredSkills.length})</span>
                </p>
                {missingRequiredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {missingRequiredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 font-medium">
                    All required skills are covered in your profile!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preferred Skills & Eligibility */}
          <Card className="border border-slate-200 shadow-2xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                <span>Preferred Skills & Eligibility</span>
                <span className="text-xs font-medium text-slate-500">
                  {missingPreferredSkills.length} unacquired preferred
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Preferred Skills */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-indigo-900">
                  Missing Preferred Skills ({missingPreferredSkills.length})
                </p>
                {missingPreferredSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {missingPreferredSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-md text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No missing preferred skills</p>
                )}
              </div>

              {/* Eligibility Issues */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-800">
                  Eligibility Assessment
                </p>
                {eligibilityIssues.length > 0 ? (
                  <div className="space-y-1">
                    {eligibilityIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-1.5 text-xs text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200/80"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>You meet all academic and experience criteria for this role.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Projects Supporting Match */}
        {relevantProjects && relevantProjects.length > 0 && (
          <Card className="border border-slate-200 shadow-2xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-900">
                  Portfolio Projects Validating Required Skills
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                These projects in your profile contributed technology evidence during the match calculation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relevantProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <p className="text-xs font-bold text-slate-900">{proj.title}</p>
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 bg-white text-slate-700 border border-slate-200 rounded text-[10px] font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bottom Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
          <p>
            This algorithmic analysis is provided to help you evaluate your fit and strengthen your application. The score is calculated deterministically from your approved profile data.
          </p>
        </div>
      </div>
    </StudentPortalLayout>
  );
}
