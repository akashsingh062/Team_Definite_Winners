"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  TrendingUp,
  Building2,
  ExternalLink,
} from "lucide-react";
import { ISimulatedOpportunityDelta } from "@/types/career-path";
import { Button } from "@/components/ui/button";

interface OpportunityImpactListProps {
  opportunities: ISimulatedOpportunityDelta[];
  totalEvaluated: number;
}

export function OpportunityImpactList({
  opportunities,
  totalEvaluated,
}: OpportunityImpactListProps) {
  if (opportunities.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            Live Opportunities Affected by this Simulation
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real postings on CareerBridge AI where your hypothetical skills unlock requirements
          </p>
        </div>
        <span className="text-2xs font-semibold text-slate-400">
          Evaluated {totalEvaluated} live opportunities
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {opportunities.map((opp) => (
          <div
            key={opp.opportunityId}
            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">
                  {opp.title}
                </h4>
                <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                  {opp.category}
                </span>
              </div>
              <p className="text-2xs text-slate-500 flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span>{opp.companyName}</span>
              </p>

              {opp.newlySatisfiedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <span className="text-2xs text-slate-400">Unlocked:</span>
                  {opp.newlySatisfiedSkills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-2xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <span className="text-xs font-bold text-slate-400">
                    {opp.originalScore}%
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                  <span className="text-xs font-black text-indigo-600">
                    {opp.simulatedScore}%
                  </span>
                  {opp.scoreDelta > 0 && (
                    <span className="text-2xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      +{opp.scoreDelta}%
                    </span>
                  )}
                </div>
                <span className="text-2xs text-slate-400 block mt-0.5">
                  Simulated Match
                </span>
              </div>

              <Link href={`/opportunities/${opp.opportunityId}`} target="_blank">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs flex items-center gap-1"
                >
                  <span>View</span>
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

