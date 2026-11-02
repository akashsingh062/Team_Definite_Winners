"use client";

import * as React from "react";
import { Sparkles, Clock, Calendar, Zap, Layers, Target } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { LearningPace } from "@/types/roadmap";

interface RoadmapWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (roadmap: any) => void;
  initialRole?: string;
}

export function RoadmapWizardModal({
  isOpen,
  onClose,
  onGenerated,
  initialRole = "Full Stack Developer",
}: RoadmapWizardModalProps) {
  const [targetRole, setTargetRole] = React.useState(initialRole);
  const [prevInitialRole, setPrevInitialRole] = React.useState(initialRole);
  const [studyHoursPerDay, setStudyHoursPerDay] = React.useState(2);
  const [studyDaysPerWeek, setStudyDaysPerWeek] = React.useState(5);
  const [learningPace, setLearningPace] = React.useState<LearningPace>("moderate");
  const [currentSkillLevel, setCurrentSkillLevel] = React.useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (initialRole !== prevInitialRole) {
    setPrevInitialRole(initialRole);
    setTargetRole(initialRole);
  }

  const handleGenerate = async () => {
    if (!targetRole.trim()) {
      toast.error("Please enter your target career role.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          studyHoursPerDay,
          studyDaysPerWeek,
          learningPace,
          currentSkillLevel,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        toast.success("Personalized AI Learning Roadmap generated!");
        onGenerated(json.data);
        onClose();
      } else {
        toast.error(json.message || "Failed to generate roadmap");
      }
    } catch {
      toast.error("Network error during roadmap generation");
    } finally {
      setIsGenerating(false);
    }
  };

  const totalWeeklyHours = studyHoursPerDay * studyDaysPerWeek;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Personalized AI Learning Roadmap"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          Configure your study preferences. The system will convert your Stage 5 skill gaps into a structured, step-by-step milestone schedule.
        </p>

        {/* Target Role */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Target Career Role
          </label>
          <Input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Frontend Engineer, Cloud Architect, Full Stack Developer"
            className="text-xs h-9"
          />
        </div>

        {/* Hours & Days Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Study Hours / Day</span>
            </label>
            <Select
              value={studyHoursPerDay.toString()}
              onChange={(e) => setStudyHoursPerDay(Number(e.target.value))}
              className="text-xs bg-white"
              options={[
                { value: "1", label: "1 hour / day" },
                { value: "2", label: "2 hours / day (Recommended)" },
                { value: "3", label: "3 hours / day" },
                { value: "4", label: "4 hours / day" },
                { value: "6", label: "6 hours / day (Intensive)" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>Study Days / Week</span>
            </label>
            <Select
              value={studyDaysPerWeek.toString()}
              onChange={(e) => setStudyDaysPerWeek(Number(e.target.value))}
              className="text-xs bg-white"
              options={[
                { value: "3", label: "3 days / week" },
                { value: "4", label: "4 days / week" },
                { value: "5", label: "5 days / week (Standard)" },
                { value: "6", label: "6 days / week" },
                { value: "7", label: "7 days / week (Every day)" },
              ]}
            />
          </div>
        </div>

        {/* Pace & Current Level */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Learning Pace</span>
            </label>
            <Select
              value={learningPace}
              onChange={(e) => setLearningPace(e.target.value as LearningPace)}
              className="text-xs bg-white"
              options={[
                { value: "relaxed", label: "Relaxed (Gentle)" },
                { value: "moderate", label: "Moderate (Standard)" },
                { value: "intensive", label: "Intensive (Fast-track)" },
              ]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Current Level</span>
            </label>
            <Select
              value={currentSkillLevel}
              onChange={(e) => setCurrentSkillLevel(e.target.value as any)}
              className="text-xs bg-white"
              options={[
                { value: "beginner", label: "Beginner / Fresher" },
                { value: "intermediate", label: "Intermediate" },
                { value: "advanced", label: "Advanced" },
              ]}
            />
          </div>
        </div>

        {/* Summary Pill */}
        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-medium">Weekly Study Commitment:</span>
          <span className="font-extrabold text-indigo-700">
            {totalWeeklyHours} hours / week
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isGenerating}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGenerating ? "Synthesizing Roadmap..." : "Generate AI Roadmap"}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
