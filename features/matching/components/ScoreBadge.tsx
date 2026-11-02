"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreBadge({
  score,
  size = "md",
  showLabel = true,
  className,
}: ScoreBadgeProps) {
  const rounded = Math.round(score);

  // Determine color theme based on score thresholds
  let colorStyles = "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20";
  let label = "High Match";

  if (rounded < 40) {
    colorStyles = "bg-slate-50 text-slate-700 border-slate-200 ring-slate-400/20";
    label = "Low Alignment";
  } else if (rounded < 60) {
    colorStyles = "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20";
    label = "Moderate Match";
  } else if (rounded < 80) {
    colorStyles = "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20";
    label = "Good Match";
  }

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1",
    md: "px-2.5 py-1 text-sm font-bold gap-1.5",
    lg: "px-3.5 py-1.5 text-base font-extrabold gap-2",
  }[size];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border shadow-2xs font-sans transition-all",
        colorStyles,
        sizeStyles,
        className
      )}
    >
      <span className="tabular-nums tracking-tight">{rounded}%</span>
      {showLabel && (
        <span className="text-[11px] font-medium opacity-90 tracking-normal border-l border-current/25 pl-1.5">
          {label}
        </span>
      )}
    </div>
  );
}

