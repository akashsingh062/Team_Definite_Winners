"use client";

import * as React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Building2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { ISkillGapItem } from "@/types/skill-gap";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SkillGapCardProps {
  skill: ISkillGapItem;
  className?: string;
}

export function SkillGapCard({ skill, className }: SkillGapCardProps) {
  const isCompleted = skill.progress?.status === "completed";

  return (
    <Card
      className={cn(
        "group border border-slate-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md bg-white overflow-hidden",
        isCompleted && "bg-slate-50/60 border-slate-200",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5 space-y-3">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Link
                href={`/dashboard/skill-gap/${encodeURIComponent(skill.skillName)}`}
                className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
              >
                <span>{skill.skillName}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600" />
              </Link>
              <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-2">
                {skill.category}
              </span>
            </div>
            {skill.isMandatory && (
              <p className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Marked as required core competency</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={skill.progress?.status || "not_started"} size="sm" />
            <PriorityBadge priority={skill.priority} size="sm" />
          </div>
        </div>

        {/* Demand Bar & Relevant Opportunities */}
        <div className="space-y-1.5 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Market Demand in Selection</span>
            <span className="font-bold text-slate-800">
              {skill.demandPercentage}%{" "}
              <span className="text-[11px] text-slate-400 font-normal">
                ({skill.opportunityCount} of {skill.relevantOpportunities.length} opportunities)
              </span>
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                skill.priority === "critical"
                  ? "bg-rose-500"
                  : skill.priority === "high"
                  ? "bg-amber-500"
                  : skill.priority === "medium"
                  ? "bg-indigo-500"
                  : "bg-slate-400"
              )}
              style={{ width: `${Math.max(5, skill.demandPercentage)}%` }}
            />
          </div>

          {/* Opportunities preview */}
          {skill.relevantOpportunities.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <span className="font-semibold text-slate-600">Required by:</span>
              {skill.relevantOpportunities.slice(0, 3).map((opp, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-slate-700 font-medium truncate max-w-[200px]"
                >
                  {opp.title} ({opp.companyName})
                </span>
              ))}
              {skill.relevantOpportunities.length > 3 && (
                <span className="text-slate-400">
                  +{skill.relevantOpportunities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Link */}
        <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-slate-400">
            {isCompleted ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tracked as completed
              </span>
            ) : (
              "Vetted learning resources and AI study advice available"
            )}
          </span>

          <Link href={`/dashboard/skill-gap/${encodeURIComponent(skill.skillName)}`}>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 px-3 font-semibold group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 gap-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explore Skill Path</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

