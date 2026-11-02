"use client";

import * as React from "react";
import { Circle, PlayCircle, Code2, CheckCircle2 } from "lucide-react";
import { SkillProgressStatus } from "@/types/skill-gap";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: SkillProgressStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({
  status = "not_started",
  size = "md",
  className,
}: StatusBadgeProps) {
  const config: Record<
    SkillProgressStatus,
    { label: string; icon: React.ComponentType<{ className?: string }>; style: string }
  > = {
    not_started: {
      label: "Not Started",
      icon: Circle,
      style: "bg-slate-50 text-slate-600 border-slate-200",
    },
    learning: {
      label: "Learning",
      icon: PlayCircle,
      style: "bg-amber-50 text-amber-700 border-amber-200",
    },
    practicing: {
      label: "Practicing",
      icon: Code2,
      style: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  };

  const item = config[status] || config.not_started;
  const Icon = item.icon;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border shadow-2xs transition-all",
        item.style,
        sizeStyles,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{item.label}</span>
    </span>
  );
}

