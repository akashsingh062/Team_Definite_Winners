"use client";

import * as React from "react";
import { Sliders, Clock, Calendar, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { IRoadmap, LearningPace } from "@/types/roadmap";

interface RoadmapAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  roadmap: IRoadmap;
  onAdjusted: (updatedRoadmap: IRoadmap) => void;
}

export function RoadmapAdjustModal({
  isOpen,
  onClose,
  roadmap,
  onAdjusted,
}: RoadmapAdjustModalProps) {
  const [studyHoursPerDay, setStudyHoursPerDay] = React.useState(
    roadmap.studyHoursPerDay || 2
  );
  const [studyDaysPerWeek, setStudyDaysPerWeek] = React.useState(
    roadmap.studyDaysPerWeek || 5
  );
  const [learningPace, setLearningPace] = React.useState<LearningPace>(
    roadmap.learningPace || "moderate"
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const completedCount = roadmap.milestones.filter(
    (m) => m.status === "completed" || m.status === "skipped"
  ).length;

  const handleAdjust = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/roadmap/${roadmap.id || roadmap._id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStudyHoursPerDay: studyHoursPerDay,
          newStudyDaysPerWeek: studyDaysPerWeek,
          newLearningPace: learningPace,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        toast.success("Roadmap timeline adjusted successfully!");
        onAdjusted(json.data);
        onClose();
      } else {
        toast.error(json.message || "Failed to adjust roadmap");
      }
    } catch {
      toast.error("Network error adjusting roadmap");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Active Roadmap Timeline"
    >
      <div className="space-y-4">
        {/* Preservation Guarantee Banner */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold">Completed Progress Is Preserved</span>
            <p className="text-[11px] text-emerald-800/90">
              Your {completedCount} completed milestone(s) and historical tasks remain intact. Only future pending milestones will be recalculated to fit your new schedule.
            </p>
          </div>
        </div>

        {/* Form Controls */}
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
                { value: "2", label: "2 hours / day" },
                { value: "3", label: "3 hours / day" },
                { value: "4", label: "4 hours / day" },
                { value: "6", label: "6 hours / day" },
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
                { value: "5", label: "5 days / week" },
                { value: "6", label: "6 days / week" },
                { value: "7", label: "7 days / week" },
              ]}
            />
          </div>
        </div>

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
              { value: "relaxed", label: "Relaxed (Lower weekly hours)" },
              { value: "moderate", label: "Moderate (Standard pacing)" },
              { value: "intensive", label: "Intensive (Fast-track completion)" },
            ]}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAdjust}
            disabled={isSubmitting}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            {isSubmitting ? "Adjusting..." : "Apply Adjustment"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

