"use client";

import * as React from "react";
import { Info, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IScoreFactorExplanation } from "@/types/explanation";

interface ScoreBreakdownCardProps {
  scoreBreakdown: IScoreFactorExplanation[];
  overallScore: number;
  onOpenMethodology?: () => void;
}

export function ScoreBreakdownCard({
  scoreBreakdown,
  overallScore,
  onOpenMethodology,
}: ScoreBreakdownCardProps) {
  return (
    <Card className="border border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold text-slate-900">
                Transparent 7-Factor Score Breakdown
              </CardTitle>
              {onOpenMethodology && (
                <button
                  type="button"
                  onClick={onOpenMethodology}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 hover:underline cursor-pointer"
                  title="View transparent scoring formula and weights"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Methodology</span>
                </button>
              )}
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Every point is mathematically calculated from actual database records. Weights sum to 100%.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-medium text-slate-500">Overall Match:</span>
            <span className="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
              {overallScore}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <div className="space-y-3.5">
          {scoreBreakdown.map((factor) => {
            const isUnavailable = factor.status === "unavailable";
            const isSatisfied = factor.status === "satisfied";
            const isPartiallySatisfied = factor.status === "partially_satisfied";

            let barColor = "bg-indigo-600";
            let statusBadge = (
              <Badge variant="slate" className="text-[10px]">
                Unavailable Data
              </Badge>
            );

            if (isSatisfied) {
              barColor = "bg-emerald-600";
              statusBadge = (
                <Badge variant="emerald" className="text-[10px]">
                  Fully Satisfied
                </Badge>
              );
            } else if (isPartiallySatisfied) {
              barColor = "bg-indigo-600";
              statusBadge = (
                <Badge variant="indigo" className="text-[10px]">
                  Partially Satisfied
                </Badge>
              );
            } else if (!isUnavailable) {
              barColor = "bg-amber-500";
              statusBadge = (
                <Badge variant="amber" className="text-[10px]">
                  Unsatisfied
                </Badge>
              );
            }

            return (
              <div
                key={factor.factorKey}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50/80 transition-colors space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{factor.name}</span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      ({factor.weight}% weight)
                    </span>
                    {statusBadge}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600 sm:text-right">
                    <span>
                      Raw Score: <strong className="text-slate-900">{factor.score}%</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-indigo-700 font-semibold">
                      +{factor.weightedContribution} pts
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(0, factor.score))}%` }}
                  />
                </div>

                <div className="flex items-start gap-1.5 text-xs text-slate-600 leading-relaxed pt-0.5">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{factor.explanation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
