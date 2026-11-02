"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ComponentScoreBarProps {
  label: string;
  weight: number; // e.g. 40
  score: number; // raw percentage e.g. 85 (0 - 100)
  description?: string;
  className?: string;
}

export function ComponentScoreBar({
  label,
  weight,
  score,
  description,
  className,
}: ComponentScoreBarProps) {
  const weightedContribution = ((score * weight) / 100).toFixed(1);

  // Color theme by score
  let barColor = "bg-emerald-500";
  if (score < 40) {
    barColor = "bg-rose-500";
  } else if (score < 70) {
    barColor = "bg-amber-500";
  } else if (score < 85) {
    barColor = "bg-indigo-500";
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800">{label}</span>
          <span className="text-[11px] text-slate-400">({weight}% weight)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">{Math.round(score)}%</span>
          <span className="text-[11px] text-slate-500 font-medium">
            (+{weightedContribution} pts)
          </span>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      {description && <p className="text-[11px] text-slate-500">{description}</p>}
    </div>
  );
}

