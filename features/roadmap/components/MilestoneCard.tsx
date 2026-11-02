"use client";

import * as React from "react";
import {
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  FolderGit2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Check,
  Flame,
  AlertCircle,
  FileText,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { IRoadmapMilestone, MilestoneStatus } from "@/types/roadmap";
import { PriorityBadge } from "@/features/skill-gap/components/PriorityBadge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface MilestoneCardProps {
  roadmapId: string;
  milestone: IRoadmapMilestone;
  onUpdate: () => void;
  className?: string;
}

export function MilestoneCard({
  roadmapId,
  milestone,
  onUpdate,
  className,
}: MilestoneCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(
    milestone.status === "in_progress"
  );
  const [notes, setNotes] = React.useState(milestone.notes || "");
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false);

  // Status Styling
  const statusStyles: Record<
    MilestoneStatus,
    { label: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    not_started: {
      label: "Not Started",
      bg: "bg-white",
      border: "border-slate-200",
      icon: Circle,
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-indigo-50/20",
      border: "border-indigo-300 ring-1 ring-indigo-500/20",
      icon: PlayCircle,
    },
    completed: {
      label: "Completed",
      bg: "bg-emerald-50/20",
      border: "border-emerald-300",
      icon: CheckCircle2,
    },
    skipped: {
      label: "Skipped",
      bg: "bg-slate-50",
      border: "border-slate-200",
      icon: Check,
    },
  };

  const currentStatusConfig = statusStyles[milestone.status] || statusStyles.not_started;
  const StatusIcon = currentStatusConfig.icon;

  // Toggle Task Completion
  const handleToggleTask = async (taskId: string, currentVal: boolean) => {
    try {
      const res = await fetch(
        `/api/roadmap/${roadmapId}/milestones/${milestone.id}/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId,
            isCompleted: !currentVal,
          }),
        }
      );

      const json = await res.json();
      if (json.success) {
        onUpdate();
      } else {
        toast.error(json.message || "Failed to update task");
      }
    } catch {
      toast.error("Network error updating task");
    }
  };

  // Update Milestone Status
  const handleStatusChange = async (newStatus: MilestoneStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(
        `/api/roadmap/${roadmapId}/milestones/${milestone.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const json = await res.json();
      if (json.success) {
        toast.success(`Milestone marked as ${newStatus}!`);
        onUpdate();
      } else {
        toast.error(json.message || "Failed to update milestone status");
      }
    } catch {
      toast.error("Network error updating status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      const res = await fetch(
        `/api/roadmap/${roadmapId}/milestones/${milestone.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes,
          }),
        }
      );

      const json = await res.json();
      if (json.success) {
        toast.success("Milestone study notes saved!");
        onUpdate();
      } else {
        toast.error(json.message || "Failed to save notes");
      }
    } catch {
      toast.error("Network error saving notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const completedTasksCount =
    milestone.tasks?.filter((t) => t.isCompleted).length || 0;
  const totalTasksCount = milestone.tasks?.length || 0;

  return (
    <Card
      className={cn(
        "border transition-all duration-200 overflow-hidden shadow-2xs",
        currentStatusConfig.border,
        currentStatusConfig.bg,
        className
      )}
    >
      {/* Milestone Header */}
      <div
        className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3.5">
          {/* Week & Status Indicator */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-sm border shadow-2xs",
              milestone.status === "completed"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : milestone.status === "in_progress"
                ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
                : "bg-slate-100 text-slate-700 border-slate-200"
            )}
          >
            {milestone.status === "completed" ? (
              <Check className="w-5 h-5 stroke-[3]" />
            ) : (
              <span>W{milestone.weekNumber}</span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo" className="text-[10px] font-bold py-0">
                {milestone.skillName}
              </Badge>
              <PriorityBadge priority={milestone.priority} size="sm" />
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {milestone.estimatedDuration}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {milestone.title}
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
              {milestone.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-semibold text-slate-700">
              {completedTasksCount}/{totalTasksCount} tasks
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase",
                milestone.status === "completed"
                  ? "text-emerald-700"
                  : milestone.status === "in_progress"
                  ? "text-indigo-600"
                  : "text-slate-400"
              )}
            >
              {currentStatusConfig.label}
            </span>
          </div>

          <button className="p-1 rounded-md text-slate-400 hover:text-slate-700">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Milestone Details */}
      {isExpanded && (
        <CardContent className="px-4 pb-5 sm:px-6 space-y-5 border-t border-slate-100 bg-white/70 pt-4">
          {/* Learning Objectives */}
          {milestone.objectives && milestone.objectives.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Milestone Learning Objectives:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {milestone.objectives.map((obj, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-medium text-slate-700 flex items-start gap-2"
                  >
                    <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily / Weekly Checklist Tasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Actionable Milestone Tasks ({completedTasksCount}/{totalTasksCount})
              </h4>
              <span className="text-[11px] text-slate-400">
                Click checkbox to track completion
              </span>
            </div>

            <div className="space-y-1.5">
              {milestone.tasks?.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id, task.isCompleted)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                    task.isCompleted
                      ? "bg-emerald-50/40 border-emerald-200 text-slate-500 line-through"
                      : "bg-white border-slate-200 hover:border-indigo-300 text-slate-800"
                  }`}
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      task.isCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 bg-white"
                    )}
                  >
                    {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="space-y-0.5">
                    <p className="font-semibold">{task.title}</p>
                    {task.description && (
                      <p className="text-[11px] text-slate-500 not-italic">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Practical Assignment */}
          {milestone.assignment && (
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <FolderGit2 className="w-4 h-4 text-indigo-600" />
                  <span>Practical Assignment: {milestone.assignment.title}</span>
                </div>
                <Badge variant="indigo" className="text-[10px] capitalize">
                  {milestone.assignment.difficultyLevel}
                </Badge>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {milestone.assignment.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 bg-white rounded border border-indigo-100">
                  <strong className="text-slate-800 block mb-0.5">Expected Deliverable:</strong>
                  <span className="text-slate-600">{milestone.assignment.expectedDeliverable}</span>
                </div>
                <div className="p-2 bg-white rounded border border-indigo-100">
                  <strong className="text-slate-800 block mb-0.5">Completion Criteria:</strong>
                  <span className="text-slate-600">{milestone.assignment.completionCriteria}</span>
                </div>
              </div>
            </div>
          )}

          {/* Curated Resources */}
          {milestone.resources && milestone.resources.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recommended Free Learning Resources</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {milestone.resources.map((res) => (
                  <div
                    key={res.id || res.title}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 truncate max-w-[200px]">
                        {res.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {res.provider} • {res.estimatedDuration}
                      </p>
                    </div>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button size="sm" variant="outline" className="text-[10px] h-6 px-2 gap-1">
                        <span>Open</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes and Milestone Actions */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {milestone.status !== "in_progress" && milestone.status !== "completed" && (
                <Button
                  size="sm"
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={isUpdatingStatus}
                  className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Start This Milestone</span>
                </Button>
              )}

              {milestone.status !== "completed" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("completed")}
                  disabled={isUpdatingStatus}
                  className="text-xs h-8 border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-semibold gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mark Milestone Completed</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleStatusChange("in_progress")}
                  disabled={isUpdatingStatus}
                  className="text-xs h-8 text-slate-500 hover:text-slate-800"
                >
                  Reopen Milestone
                </Button>
              )}
            </div>

            <span className="text-[11px] text-slate-400 italic">
              Estimated: {milestone.estimatedHours} study hours
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
