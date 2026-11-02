"use client";

import * as React from "react";
import { AlertCircle, Flame, Info, Check } from "lucide-react";
import { SkillPriority } from "@/types/skill-gap";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: SkillPriority;
  size?: "sm" | "md";
  className?: string;
}

export function PriorityBadge({
  priority,
  size = "md",
  className,
}: PriorityBadgeProps) {
  const config: Record<
    SkillPriority,
    { label: string; icon: React.ComponentType<{ className?: string }>; style: string }
  > = {
    critical: {
      label: "Critical Priority",
      icon: AlertCircle,
      style: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20",
    },
    high: {
      label: "High Priority",
      icon: Flame,
      style: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20",
    },
    medium: {
      label: "Medium Priority",
      icon: Info,
      style: "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20",
    },
    low: {
      label: "Low Priority",
      icon: Check,
      style: "bg-slate-50 text-slate-600 border-slate-200 ring-slate-400/20",
    },
  };

  const item = config[priority] || config.low;
  const Icon = item.icon;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-bold gap-1.5",
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

