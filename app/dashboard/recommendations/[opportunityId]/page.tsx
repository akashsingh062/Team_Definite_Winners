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
  HelpCircle,
  Bot,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/features/matching/components/ScoreBadge";
import { EligibilityBadge } from "@/features/matching/components/EligibilityBadge";
import {
  SaveOpportunityButton,
  RecordApplicationModal,
} from "@/features/applications/components";
import {
  ScoreBreakdownCard,
  SkillsComparisonCard,
  EligibilityCheckCard,
  ProjectRelevanceCard,
  CareerLocationCard,
  ImprovementSuggestionsCard,
  ExplanationFeedbackCard,
  MethodologyModal,
} from "@/features/explanations/components";
import {
  IOpportunityExplanation,
  IMethodologyInfo,
} from "@/types/explanation";

export default function RecommendationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const opportunityId = params?.opportunityId as string;
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [explanationData, setExplanationData] =
    React.useState<IOpportunityExplanation | null>(null);
  const [methodology, setMethodology] =
    React.useState<IMethodologyInfo | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = React.useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push(
          `/login?callbackUrl=/dashboard/recommendations/${opportunityId}`
        );
        return;
      }

      if (!opportunityId) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch detailed explanation from Stage 7 endpoint
        const res = await fetch(
          `/api/explanations/opportunities/${opportunityId}`
        );

        if (res.status === 401) {
          router.push(
            `/login?callbackUrl=/dashboard/recommendations/${opportunityId}`
          );
          return;
        }

        const json = await res.json();
        if (isMounted) {
          if (json.success && json.data) {
            setExplanationData(json.data);
          } else {
            setError(json.message || "Failed to load match explanation");
          }
        }
      } catch (err) {
        console.error("Match explanation fetch error:", err);
        if (isMounted) {
          setError("Failed to communicate with explanation engine");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!isAuthLoading) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [opportunityId, isAuthenticated, isAuthLoading, router]);

  // Load methodology info lazily
  const handleOpenMethodology = async () => {
    setIsMethodologyOpen(true);
    if (!methodology) {
      try {
        const res = await fetch("/api/explanations/methodology");
        const json = await res.json();
        if (json.success && json.data) {
          setMethodology(json.data);
        }
      } catch (err) {
        console.error("Failed to load methodology:", err);
      }
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <StudentPortalLayout>
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse py-8">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-40 bg-slate-200 rounded-xl" />
          <div className="h-64 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-xl" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </StudentPortalLayout>
    );
  }

  if (error || !explanationData) {
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
    scoreBreakdown,
    skillsAnalysis,
    eligibilityExplanation,
    projectRelevance,
    experienceRelevance,
    certificationsRelevance,
    careerAlignment,
    locationCompensation,
    dataCompleteness,
    improvementSuggestions,
    narrativeExplanation,
    aiGenerated,
    userFeedback,
  } = explanationData;

  const compensationText =
    opportunity.category === "skill-development"
      ? opportunity.isPaid
        ? "Paid Training"
        : "Free Learning"
      : opportunity.stipend ||
        opportunity.salaryRange ||
        (opportunity.isPaid ? "Paid" : "Not disclosed");

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
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

          <button
            type="button"
            onClick={handleOpenMethodology}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:underline cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Scoring Methodology</span>
          </button>
        </div>

        {/* Section 1: Match Overview Hero Card */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-800 font-bold text-lg shadow-2xs">
                  {opportunity.companyName
                    ? opportunity.companyName.substring(0, 2).toUpperCase()
                    : "CB"}
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
                        Deadline:{" "}
                        {new Date(
                          opportunity.applicationDeadline
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Overall Score Box */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 shrink-0">
                <div className="text-left md:text-right">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Compatibility Match
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <ScoreBadge score={overallScore} size="lg" />
                  </div>
                </div>
                <EligibilityBadge status={eligibilityStatus} size="md" />
              </div>
            </div>

            {/* Quick Actions & Data Completeness Bar */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Profile data completeness:{" "}
                  <strong className="text-slate-900">
                    {dataCompleteness.completenessScore}%
                  </strong>{" "}
                  <span className="text-slate-400">
                    ({dataCompleteness.isComplete ? "Complete" : "Partial evaluation"})
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SaveOpportunityButton
                  opportunityId={opportunity.id}
                  size="sm"
                />

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsRecordModalOpen(true)}
                  className="gap-1.5 text-xs font-semibold cursor-pointer"
                  title="Record application to start tracking"
                >
                  <Send className="w-3.5 h-3.5 text-indigo-600" />
                  <span>I Applied</span>
                </Button>

                <Link
                  href={`/opportunities/${opportunity.id}`}
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="sm"
                    className="w-full sm:w-auto text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>View Role</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Why We Recommended This (Explainability Narrative) */}
        <Card className="border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-white shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <CardTitle className="text-base font-bold">
                  Why This Opportunity Matches You
                </CardTitle>
              </div>
              {aiGenerated && (
                <div className="flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  <Bot className="w-3 h-3" />
                  <span>AI-Assisted Synthesis</span>
                </div>
              )}
            </div>
            <CardDescription className="text-xs">
              Transparent synthesis derived strictly from your verified profile and employer requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-indigo-100/70 shadow-2xs">
              {narrativeExplanation.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Top Matching Factors */}
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Top Recommendation Factors</span>
                </div>
                <ul className="space-y-1.5 text-xs text-emerald-900/90 pl-5 list-disc">
                  {narrativeExplanation.topMatchingFactors.map((factor, idx) => (
                    <li key={idx} className="leading-snug">
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key Profile Evidence */}
              <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Verified Profile Proof</span>
                </div>
                <ul className="space-y-1.5 text-xs text-indigo-900/90 pl-5 list-disc">
                  {narrativeExplanation.keyProfileEvidence.map((ev, idx) => (
                    <li key={idx} className="leading-snug">
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: 7-Factor Transparent Score Breakdown */}
        <ScoreBreakdownCard
          scoreBreakdown={scoreBreakdown}
          overallScore={overallScore}
          onOpenMethodology={handleOpenMethodology}
        />

        {/* Section 4: Skills Comparison & Verification */}
        <SkillsComparisonCard
          matchingSkills={skillsAnalysis.matchingSkills}
          missingRequiredSkills={skillsAnalysis.missingRequiredSkills}
          missingPreferredSkills={skillsAnalysis.missingPreferredSkills}
          skillsRequiringVerification={
            skillsAnalysis.skillsRequiringVerification
          }
        />

        {/* Section 5: Academic & Experience Eligibility Check */}
        <EligibilityCheckCard
          eligibilityStatus={eligibilityStatus}
          criteria={eligibilityExplanation}
        />

        {/* Section 6: Project & Experience Relevance */}
        <ProjectRelevanceCard
          projectRelevance={projectRelevance}
          experienceRelevance={experienceRelevance}
          certificationsRelevance={certificationsRelevance}
        />

        {/* Section 7: Career, Location & Compensation Alignment */}
        <CareerLocationCard
          careerAlignment={careerAlignment}
          locationCompensation={locationCompensation}
        />

        {/* Section 8: How to Improve Your Match */}
        <ImprovementSuggestionsCard suggestions={improvementSuggestions} />

        {/* Section 9: System Limitations Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center space-y-1">
          <p className="font-semibold text-slate-700">
            Responsible AI & Match Integrity Notice
          </p>
          <p className="leading-relaxed">
            {narrativeExplanation.limitationsDisclaimer}
          </p>
        </div>

        {/* Section 10: Explanation Feedback Widget */}
        <ExplanationFeedbackCard
          opportunityId={opportunity.id}
          initialFeedback={userFeedback}
        />

        {/* Methodology Modal */}
        <MethodologyModal
          isOpen={isMethodologyOpen}
          onClose={() => setIsMethodologyOpen(false)}
          methodology={methodology}
        />

        {/* Record Application Modal */}
        <RecordApplicationModal
          isOpen={isRecordModalOpen}
          onClose={() => setIsRecordModalOpen(false)}
          opportunityId={opportunity.id}
          opportunityTitle={opportunity.title}
          companyName={opportunity.companyName}
        />
      </div>
    </StudentPortalLayout>
  );
}
