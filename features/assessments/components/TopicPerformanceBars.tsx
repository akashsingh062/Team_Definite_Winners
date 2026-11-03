"use client";

import React from "react";
import { ITopicPerformance } from "@/types/assessment";

interface TopicPerformanceBarsProps {
  topicPerformance: ITopicPerformance[];
}

export function TopicPerformanceBars({
  topicPerformance,
}: TopicPerformanceBarsProps) {
  if (!topicPerformance || topicPerformance.length === 0) {
    return null;
  }

  const getBarColor = (pct: number) => {
    if (pct >= 70) return "bg-emerald-500";
    if (pct >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
        Curriculum Topic Breakdown
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Performance across individual conceptual domains
      </p>

      <div className="space-y-4">
        {topicPerformance.map((topic, i) => (
          <div key={i}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {topic.topic}
              </span>
              <span className="font-mono text-slate-600 dark:text-slate-400">
                {topic.obtainedMarks}/{topic.totalMarks} pts ({topic.percentage}%)
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(
                  topic.percentage
                )}`}
                style={{ width: `${Math.min(100, Math.max(0, topic.percentage))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

