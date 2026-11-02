"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Target,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Info,
  BookOpen,
  Briefcase,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SkillGapCard } from "@/features/skill-gap/components/SkillGapCard";
import { SkillCoverageChart } from "@/features/skill-gap/components/SkillCoverageChart";
import { ISkillGapAnalysisResult, SkillPriority } from "@/types/skill-gap";

interface OpportunityOption {
  id: string;
  title: string;
  companyName: string;
  category: string;
  requiredSkills: string[];
}

export default function SkillGapDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [analysis, setAnalysis] = React.useState<ISkillGapAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // Filter missing skills by priority tab
  const [activeTab, setActiveTab] = React.useState<"all" | SkillPriority>("all");

  // Multi-opportunity selector modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [availableOpps, setAvailableOpps] = React.useState<OpportunityOption[]>([]);
  const [selectedOppIds, setSelectedOppIds] = React.useState<string[]>([]);
  const [oppSearch, setOppSearch] = React.useState("");

  // Target role state
  const [targetRole, setTargetRole] = React.useState("");

  // Initial load: Fetch overview & available opportunities
  React.useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push("/login?callbackUrl=/dashboard/skill-gap");
        return;
      }

      setIsLoading(true);

      try {
        const [overviewRes, oppsRes] = await Promise.all([
          fetch("/api/skill-gap/overview"),
          fetch("/api/skill-gap/opportunities"),
        ]);

        if (overviewRes.status === 401 || oppsRes.status === 401) {
          router.push("/login?callbackUrl=/dashboard/skill-gap");
          return;
        }

        const overviewJson = await overviewRes.json();
        const oppsJson = await oppsRes.json();

        if (isMounted) {
          if (overviewJson.success && overviewJson.data) {
            setAnalysis(overviewJson.data);
            setTargetRole(overviewJson.data.targetRole || "");
            const preselected = overviewJson.data.selectedOpportunities?.map(
              (o: { id: string }) => o.id
            ) || [];
            setSelectedOppIds(preselected);
          }
          if (oppsJson.success && oppsJson.data) {
            setAvailableOpps(oppsJson.data);
          }
        }
      } catch (err) {
        console.error("Failed to load skill gap overview:", err);
        if (isMounted) {
          toast.error("Failed to load skill gap analysis");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (!isAuthLoading) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, router]);

  // Run multi-opportunity combined analysis
  const handleRunAnalysis = async () => {
    if (selectedOppIds.length === 0) {
      toast.error("Please select at least 1 opportunity to analyze.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/skill-gap/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityIds: selectedOppIds,
          targetRole: targetRole || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis(json.data);
        setIsModalOpen(false);
        toast.success(`Skill gap analysis updated for ${selectedOppIds.length} opportunities!`);
      } else {
        toast.error(json.message || "Analysis failed");
      }
    } catch {
      toast.error("Network error during skill gap analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleOpportunitySelection = (id: string) => {
    if (selectedOppIds.includes(id)) {
      if (selectedOppIds.length === 1) {
        toast.error("At least one opportunity must remain selected.");
        return;
      }
      setSelectedOppIds(selectedOppIds.filter((item) => item !== id));
    } else {
      if (selectedOppIds.length >= 6) {
        toast.error("You can select up to 6 opportunities simultaneously.");
        return;
      }
      setSelectedOppIds([...selectedOppIds, id]);
    }
  };

  // Filter missing skills by active tab
  const filteredMissingSkills = React.useMemo(() => {
    if (!analysis) return [];
    if (activeTab === "all") return analysis.missingSkills;
    return analysis.missingSkills.filter((s) => s.priority === activeTab);
  }, [analysis, activeTab]);

  const filteredAvailableOpps = availableOpps.filter(
    (o) =>
      o.title.toLowerCase().includes(oppSearch.toLowerCase()) ||
      o.companyName.toLowerCase().includes(oppSearch.toLowerCase())
  );

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 border border-indigo-200/60 rounded-xl text-indigo-600">
                <Target className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  AI Skill Gap Analyzer
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Compare your approved skills against target opportunities, prioritize missing competencies, and track learning progress.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-slate-700 hover:text-indigo-600 gap-1.5 shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
              <span>Select Opportunities ({selectedOppIds.length})</span>
            </Button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        {analysis && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card className="border border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Existing Skills</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {analysis.existingSkills.length}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Approved in profile</p>
                </div>
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Missing Gaps</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                    {analysis.missingSkills.length}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Across selection</p>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-rose-100 bg-rose-50/20 shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-700 font-medium">Critical Gaps</p>
                  <p className="text-2xl font-extrabold text-rose-700 mt-0.5">
                    {analysis.priorityCounts.critical}
                  </p>
                  <p className="text-[11px] text-rose-600/80 mt-0.5">Mandatory skills</p>
                </div>
                <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-amber-100 bg-amber-50/20 shadow-2xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-700 font-medium">High Priority</p>
                  <p className="text-2xl font-extrabold text-amber-700 mt-0.5">
                    {analysis.priorityCounts.high}
                  </p>
                  <p className="text-[11px] text-amber-600/80 mt-0.5">High demand</p>
                </div>
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700">
                  <Flame className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-2xs col-span-2 lg:col-span-1">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">Combined Coverage</p>
                  <p className="text-2xl font-extrabold text-indigo-600 mt-0.5">
                    {analysis.coverage.combinedCoverage}%
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Req & Pref overlap</p>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Selected Opportunities Strip */}
        {analysis && (
          <Card className="border border-slate-200 bg-slate-50/60 shadow-2xs">
            <CardContent className="p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    Selected Target Opportunities ({analysis.selectedOpportunities.length}):
                  </span>
                </span>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold underline text-[11px]"
                >
                  Change Selection
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {analysis.selectedOpportunities.map((opp) => (
                  <span
                    key={opp.id}
                    className="px-2.5 py-1 bg-white border border-slate-200/90 rounded-lg text-xs font-medium text-slate-700 shadow-2xs flex items-center gap-1"
                  >
                    <span className="font-bold text-slate-900">{opp.title}</span>
                    <span className="text-slate-400 font-normal">({opp.companyName})</span>
                  </span>
                ))}
              </div>

              {analysis.commonSkills.length > 0 && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-indigo-900">
                    Common across all selected:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {analysis.commonSkills.map((s) => (
                      <span
                        key={s}
                        className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded text-[10px] font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Missing Skills & Priority Tabs (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Missing Skill Gaps
                </h2>
                <p className="text-xs text-slate-500">
                  Prioritized deterministically based on mandatory status and market demand across your selected opportunities.
                </p>
              </div>
            </div>

            {/* Priority Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit text-xs border border-slate-200/60">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Gaps ({analysis?.missingSkills.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("critical")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  activeTab === "critical"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "text-rose-700 hover:bg-rose-50"
                }`}
              >
                <span>Critical</span>
                <span>({analysis?.priorityCounts.critical || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("high")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  activeTab === "high"
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                <span>High</span>
                <span>({analysis?.priorityCounts.high || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("medium")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  activeTab === "medium"
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "text-indigo-700 hover:bg-indigo-50"
                }`}
              >
                <span>Medium</span>
                <span>({analysis?.priorityCounts.medium || 0})</span>
              </button>
              <button
                onClick={() => setActiveTab("low")}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                  activeTab === "low"
                    ? "bg-slate-700 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>Low</span>
                <span>({analysis?.priorityCounts.low || 0})</span>
              </button>
            </div>

            {/* Missing Skills Feed */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-5 animate-pulse border-slate-200">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-2/3" />
                  </Card>
                ))}
              </div>
            ) : filteredMissingSkills.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50 p-8 text-center">
                <div className="max-w-md mx-auto space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeTab === "all"
                      ? "Zero missing skill gaps!"
                      : `No missing skills in ${activeTab} priority`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeTab === "all"
                      ? "You satisfy all required and preferred technical competencies across the selected opportunities."
                      : "Try switching tabs to view other priority tiers."}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredMissingSkills.map((skill) => (
                  <SkillGapCard key={skill.skillName} skill={skill} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Skill Coverage & Existing Skills */}
          <div className="space-y-6">
            {/* Skill Coverage Card */}
            {analysis && (
              <Card className="border border-slate-200 shadow-2xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Skill Coverage Breakdown
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Raw percentage of required vs preferred skills possessed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillCoverageChart coverage={analysis.coverage} />
                </CardContent>
              </Card>
            )}

            {/* Existing Approved Skills */}
            {analysis && (
              <Card className="border border-slate-200 shadow-2xs">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <CardTitle className="text-sm font-bold text-slate-900">
                        Your Approved Skills ({analysis.existingSkills.length})
                      </CardTitle>
                    </div>
                    <Link
                      href="/profile"
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                    >
                      Edit
                    </Link>
                  </div>
                  <CardDescription className="text-xs">
                    Extracted from your profile and approved resume.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.existingSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No approved skills registered. Add skills in your profile to improve coverage.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto pr-1">
                      {analysis.existingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-md text-xs font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Responsible AI Disclaimer */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Fairness & Responsible Learning</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Priorities are computed deterministically from opportunity requirements. All recommended resources prioritize free, high-quality documentation.
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Opportunity Selector Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Select Target Opportunities to Compare"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Select 1 to 6 opportunities to evaluate combined skill demand and identify overlapping requirements.
            </p>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <Input
                placeholder="Search opportunities by title or company..."
                value={oppSearch}
                onChange={(e) => setOppSearch(e.target.value)}
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* List of Opportunities */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredAvailableOpps.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No opportunities match your search.
                </p>
              ) : (
                filteredAvailableOpps.map((opp) => {
                  const isSelected = selectedOppIds.includes(opp.id);
                  return (
                    <div
                      key={opp.id}
                      onClick={() => toggleOpportunitySelection(opp.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-500/20"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900">{opp.title}</p>
                        <p className="text-slate-500 text-[11px]">{opp.companyName}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {opp.requiredSkills?.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                <strong className="text-slate-800">{selectedOppIds.length}</strong> selected
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || selectedOppIds.length === 0}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  {isAnalyzing ? "Analyzing..." : "Apply & Analyze"}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </StudentPortalLayout>
  );
}

