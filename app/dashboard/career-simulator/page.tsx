"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sliders,
  Sparkles,
  RotateCcw,
  Bookmark,
  History,
  Trash2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Loader2,
  Layers,
} from "lucide-react";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import {
  WhatIfSkillSelector,
  SimulationDeltaBanner,
  OpportunityImpactList,
  RoadmapActionPlanButton,
} from "@/features/career-simulator/components";
import {
  ICareerPath,
  IWhatIfSimulationResult,
  ICareerSimulationDoc,
} from "@/types/career-path";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function SimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCareerParam = searchParams.get("career") || "";

  const [careerPaths, setCareerPaths] = useState<ICareerPath[]>([]);
  const [selectedCareerId, setSelectedCareerId] = useState<string>("");
  const [hypotheticalSkills, setHypotheticalSkills] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<IWhatIfSimulationResult | null>(null);

  const [isLoadingPaths, setIsLoadingPaths] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Saved simulations drawer/modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState<ICareerSimulationDoc[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 1. Fetch available career paths on mount
  useEffect(() => {
    let ignore = false;

    async function loadCareerPaths() {
      setIsLoadingPaths(true);
      try {
        const res = await fetch("/api/career-paths");
        if (res.ok && !ignore) {
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            setCareerPaths(json.data);

            // Preselect matching path or first
            let target = json.data[0];
            if (initialCareerParam) {
              const matched = json.data.find(
                (cp: ICareerPath) =>
                  cp.slug.toLowerCase() === initialCareerParam.toLowerCase() ||
                  cp.id === initialCareerParam ||
                  cp._id === initialCareerParam
              );
              if (matched) target = matched;
            }
            setSelectedCareerId(target.id || target._id);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load career paths for simulator:", err);
          toast.error("Failed to load career pathways");
        }
      } finally {
        if (!ignore) setIsLoadingPaths(false);
      }
    }

    loadCareerPaths();

    return () => {
      ignore = true;
    };
  }, [initialCareerParam]);

  // 2. Run simulation when selected career or hypothetical skills change
  useEffect(() => {
    let ignore = false;

    if (!selectedCareerId) return;

    async function runAnalysis() {
      setIsSimulating(true);

      try {
        const res = await fetch("/api/career-simulator/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            careerPathId: selectedCareerId,
            hypotheticalSkills,
          }),
        });

        if (res.ok && !ignore) {
          const json = await res.json();
          if (json.success) {
            setSimulationResult(json.data);
          } else {
            toast.error(json.error || "Simulation failed");
          }
        } else if (!ignore) {
          toast.error("Failed to analyze career pathway");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Simulation run error:", err);
          toast.error("An error occurred during simulation analysis");
        }
      } finally {
        if (!ignore) {
          setIsSimulating(false);
        }
      }
    }

    runAnalysis();

    return () => {
      ignore = true;
    };
  }, [selectedCareerId, hypotheticalSkills]);

  const handleCareerChange = (id: string) => {
    setSelectedCareerId(id);
    setHypotheticalSkills([]); // reset hypothetical additions for new role
  };

  const handleAddSkill = (skill: string) => {
    if (
      hypotheticalSkills.some(
        (s) => s.toLowerCase() === skill.toLowerCase().trim()
      )
    ) {
      toast.info(`'${skill}' is already in your simulated skill set.`);
      return;
    }
    setHypotheticalSkills([...hypotheticalSkills, skill.trim()]);
  };

  const handleRemoveSkill = (skill: string) => {
    setHypotheticalSkills(
      hypotheticalSkills.filter(
        (s) => s.toLowerCase() !== skill.toLowerCase().trim()
      )
    );
  };

  const handleAddAllMissingRequired = () => {
    if (!simulationResult) return;
    const missing = simulationResult.baselineAlignment.skills.missingRequired;
    const merged = Array.from(new Set([...hypotheticalSkills, ...missing]));
    setHypotheticalSkills(merged);
    toast.success(`Added all ${missing.length} missing required skills to simulation.`);
  };

  const handleReset = () => {
    setHypotheticalSkills([]);
    toast.info("Simulation reset to baseline profile.");
  };

  // 3. Save simulation to history
  const handleSaveSimulation = async () => {
    if (!simulationResult) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/career-simulator/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerPathId: simulationResult.careerPathId,
          targetCareerTitle: simulationResult.careerTitle,
          hypotheticalSkills,
          baselineScore: simulationResult.baselineAlignment.overallScore,
          simulatedScore: simulationResult.simulatedAlignment.overallScore,
          scoreDelta: simulationResult.alignmentDelta,
          simulationSnapshot: simulationResult,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          toast.success("Simulation experiment saved to history.");
        }
      } else {
        toast.error("Failed to save simulation.");
      }
    } catch (err) {
      console.error("Save simulation error:", err);
      toast.error("Error saving simulation snapshot.");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Fetch saved simulations history
  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setIsLoadingHistory(true);
    try {
      const res = await fetch("/api/career-simulator/history");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setSavedSimulations(json.data || []);
        }
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    try {
      const res = await fetch(`/api/career-simulator/history/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSavedSimulations((prev) => prev.filter((item) => (item.id || item._id) !== id));
        toast.success("Simulation removed from history.");
      }
    } catch (err) {
      toast.error("Failed to delete simulation record.");
    }
  };

  const handleLoadSavedSimulation = (record: ICareerSimulationDoc) => {
    setSelectedCareerId(record.careerPathId);
    setHypotheticalSkills(record.hypotheticalSkills || []);
    setShowHistoryModal(false);
    toast.info(`Loaded simulation for ${record.targetCareerTitle}.`);
  };

  const currentCareer = careerPaths.find(
    (cp) => (cp.id || cp._id) === selectedCareerId
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
              <Sliders className="h-3.5 w-3.5" />
              <span>Interactive What-If Simulation Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              AI Career Pathway & What-If Simulator
            </h1>
            <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Model hypothetical skill acquisitions in real-time. See exactly how learning new technologies increases your career readiness, satisfies requirements, and unlocks live opportunity matches.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenHistory}
              className="flex items-center gap-1.5 text-xs h-9"
            >
              <History className="h-4 w-4" />
              <span>Saved Experiments</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveSimulation}
              disabled={isSaving || hypotheticalSkills.length === 0}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9"
            >
              <Bookmark className="h-4 w-4" />
              <span>{isSaving ? "Saving..." : "Save Simulation"}</span>
            </Button>
          </div>
        </div>

        {/* Role Selection Dropdown */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-700 shrink-0">
            Target Career Role:
          </label>
          <div className="relative flex-1 max-w-md">
            <select
              value={selectedCareerId}
              onChange={(e) => handleCareerChange(e.target.value)}
              disabled={isLoadingPaths || isSimulating}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs md:text-sm font-semibold bg-white text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {careerPaths.map((cp) => (
                <option key={cp.slug} value={cp.id || cp._id}>
                  {cp.title} ({cp.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Simulation Workspace */}
      <div className="space-y-6">
        {/* Skill Selector Component */}
        {simulationResult && (
          <WhatIfSkillSelector
            missingRequiredSkills={
              simulationResult.baselineAlignment.skills.missingRequired
            }
            missingPreferredSkills={
              simulationResult.baselineAlignment.skills.missingPreferred
            }
            selectedHypotheticalSkills={hypotheticalSkills}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
            onAddAllMissingRequired={handleAddAllMissingRequired}
            onReset={handleReset}
            disabled={isSimulating}
          />
        )}

        {/* Loading Spinner Indicator */}
        {isSimulating && (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center flex flex-col items-center justify-center gap-3 shadow-2xs">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="text-xs font-semibold text-slate-600">
              Recalculating 4-pillar readiness and evaluating live opportunity impact...
            </span>
          </div>
        )}

        {/* Simulation Results Delta */}
        {!isSimulating && simulationResult && (
          <SimulationDeltaBanner simulation={simulationResult} />
        )}

        {/* Live Opportunities Impact List */}
        {!isSimulating && simulationResult && (
          <OpportunityImpactList
            opportunities={
              simulationResult.opportunityImpact.topImpactedOpportunities
            }
            totalEvaluated={simulationResult.opportunityImpact.totalEvaluated}
          />
        )}

        {/* Bridge to Stage 6 Personalized Roadmap */}
        {!isSimulating && simulationResult && currentCareer && (
          <RoadmapActionPlanButton
            careerTitle={currentCareer.title}
            missingSkills={
              simulationResult.remainingMissingRequiredSkills.length > 0
                ? simulationResult.remainingMissingRequiredSkills
                : simulationResult.baselineAlignment.skills.missingRequired
            }
          />
        )}
      </div>

      {/* Saved Simulations Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  Your Saved What-If Experiments
                </h3>
                <p className="text-xs text-slate-500">
                  Reload previously modeled skill experiments
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {isLoadingHistory ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  Loading your saved simulations...
                </div>
              ) : savedSimulations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <History className="h-8 w-8 text-slate-300 mx-auto" />
                  <p>You have not saved any simulation experiments yet.</p>
                </div>
              ) : (
                savedSimulations.map((rec) => (
                  <div
                    key={rec.id || rec._id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-900">
                        {rec.targetCareerTitle}
                      </h4>
                      <p className="text-2xs text-slate-500">
                        Tested: {rec.hypotheticalSkills?.join(", ") || "None"}
                      </p>
                      <div className="flex items-center gap-2 text-2xs">
                        <span className="font-semibold text-slate-600">
                          {rec.baselineScore}% → {rec.simulatedScore}%
                        </span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                          +{rec.scoreDelta}%
                        </span>
                        <span className="text-slate-400">
                          • {new Date(rec.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleLoadSavedSimulation(rec)}
                        className="text-xs h-8 px-2.5"
                      >
                        Load
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleDeleteHistoryItem(rec.id || rec._id || "")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete simulation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CareerSimulatorPage() {
  return (
    <StudentPortalLayout>
      <Suspense
        fallback={
          <div className="p-12 text-center text-xs text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600 mb-2" />
            Loading What-If Simulator...
          </div>
        }
      >
        <SimulatorContent />
      </Suspense>
    </StudentPortalLayout>
  );
}
