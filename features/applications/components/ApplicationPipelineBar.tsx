"use client";

import * as React from "react";
import { ApplicationStatus } from "@/types/application";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface ApplicationPipelineBarProps {
  pipeline: Array<{
    status: ApplicationStatus;
    label: string;
    count: number;
    color: string;
  }>;
  selectedStatus?: string;
  onSelectStatus?: (status: string) => void;
}

export function ApplicationPipelineBar({
  pipeline,
  selectedStatus,
  onSelectStatus,
}: ApplicationPipelineBarProps) {
  const total = pipeline.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card className="border border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900">
            Recruitment Funnel & Pipeline
          </CardTitle>
          <span className="text-xs text-slate-500 font-medium">
            {total} total opportunities in pipeline
          </span>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Click any phase to filter your applications below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {/* Horizontal Stacked Bar */}
        {total > 0 ? (
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {pipeline.map((item) => {
              if (item.count === 0) return null;
              const pct = (item.count / total) * 100;
              return (
                <div
                  key={item.status}
                  style={{ width: `${pct}%` }}
                  className={`${item.color} h-full transition-all duration-300 hover:opacity-80`}
                  title={`${item.label}: ${item.count} (${Math.round(pct)}%)`}
                />
              );
            })}
          </div>
        ) : (
          <div className="h-3 w-full bg-slate-100 rounded-full" />
        )}

        {/* Phase Pill Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {pipeline.map((item) => {
            const isSelected = selectedStatus === item.status;
            return (
              <button
                key={item.status}
                type="button"
                onClick={() =>
                  onSelectStatus?.(isSelected ? "" : item.status)
                }
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-50 border-indigo-300 shadow-2xs ring-1 ring-indigo-400"
                    : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/70"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {item.label}
                  </span>
                </div>
                <span className="text-base font-extrabold text-slate-900 mt-1">
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
