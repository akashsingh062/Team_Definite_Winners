"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { ISkillCoverage } from "@/types/skill-gap";

interface SkillCoverageChartProps {
  coverage: ISkillCoverage;
  className?: string;
}

export function SkillCoverageChart({ coverage, className }: SkillCoverageChartProps) {
  const data = [
    {
      name: "Required Skills",
      percentage: coverage.requiredCoverage,
      matched: coverage.matchedRequiredCount,
      total: coverage.totalRequiredCount,
      color: "#4f46e5", // Indigo
    },
    {
      name: "Preferred Skills",
      percentage: coverage.preferredCoverage,
      matched: coverage.matchedPreferredCount,
      total: coverage.totalPreferredCount,
      color: "#0ea5e9", // Sky
    },
    {
      name: "Combined Coverage",
      percentage: coverage.combinedCoverage,
      matched: coverage.matchedRequiredCount + coverage.matchedPreferredCount,
      total: coverage.totalRequiredCount + coverage.totalPreferredCount,
      color: "#10b981", // Emerald
    },
  ];

  return (
    <div className={className}>
      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fontWeight: 500 }}
              width={120}
            />
            <Tooltip
              formatter={(value: any, _name: any, item: any) => [
                `${value}% (${item.payload.matched} of ${item.payload.total} skills possessed)`,
                "Coverage",
              ]}
              contentStyle={{
                fontSize: "12px",
                borderRadius: "8px",
                borderColor: "#e2e8f0",
              }}
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <span className="italic">
          *Skill coverage measures raw competency fulfillment and differs from Stage 4 weighted compatibility scores.
        </span>
        <span className="font-semibold text-slate-700">
          Combined: {coverage.combinedCoverage}%
        </span>
      </div>
    </div>
  );
}

