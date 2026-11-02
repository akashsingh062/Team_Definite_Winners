"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  ChevronRight,
  Sparkles,
  AlertCircle,
  FolderGit2,
  ArrowUpRight,
} from "lucide-react";
import { IOpportunityMatchResult } from "@/types/matching";
import { ScoreBadge } from "./ScoreBadge";
import { EligibilityBadge } from "./EligibilityBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RecommendationCardProps {
  match: IOpportunityMatchResult;
  className?: string;
}

export function RecommendationCard({ match, className }: RecommendationCardProps) {
  const { opportunity, overallScore, eligibilityStatus, matchedSkills, missingRequiredSkills, explanation, relevantProjects } = match;

  const categoryLabel: Record<string, string> = {
    internship: "Internship",
    job: "Full-Time Job",
    "skill-development": "Skill Development",
  };

  const categoryColor: Record<string, string> = {
    internship: "bg-blue-50 text-blue-700 border-blue-200",
    job: "bg-purple-50 text-purple-700 border-purple-200",
    "skill-development": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  // Format compensation
  const compensationText = opportunity.category === "skill-development"
    ? (opportunity.isPaid ? "Paid Course" : "Free Learning")
    : (opportunity.stipend || opportunity.salaryRange || (opportunity.isPaid ? "Paid" : "Unpaid"));

  // Format deadline
  const deadlineText = opportunity.applicationDeadline
    ? new Date(opportunity.applicationDeadline).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Rolling";

  return (
    <Card
      className={cn(
        "group border border-slate-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md bg-white overflow-hidden",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6 space-y-4">
        {/* Top Header: Company, Title, Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            {/* Company Avatar / Initials */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 font-bold text-base shadow-2xs">
              {opportunity.companyName ? opportunity.companyName.substring(0, 2).toUpperCase() : "CB"}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {opportunity.companyName}
                </span>
                <Badge
                  variant="slate"
                  className={cn("text-[11px] font-medium py-0 px-2", categoryColor[opportunity.category])}
                >
                  {categoryLabel[opportunity.category] || opportunity.category}
                </Badge>
              </div>

              <Link
                href={`/dashboard/recommendations/${match.opportunityId}`}
                className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors inline-flex items-center gap-1"
              >
                <span>{opportunity.title}</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 -ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Score & Eligibility */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <EligibilityBadge status={eligibilityStatus} size="sm" />
            <ScoreBadge score={overallScore} size="md" />
          </div>
        </div>

        {/* Opportunity Meta Details */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600 border-y border-slate-100 py-2.5">
          <span className="flex items-center gap-1.5 capitalize font-medium">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            {opportunity.workMode}
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {opportunity.location || "Remote"}
          </span>
          <span className="font-semibold text-slate-700">
            {compensationText}
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 ml-auto">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            Deadline: <span className="font-medium text-slate-700">{deadlineText}</span>
          </span>
        </div>

        {/* Explanation Preview */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
          {explanation}
        </p>

        {/* Skills Alignment Matrix preview */}
        <div className="space-y-2">
          {/* Matched Skills */}
          {matchedSkills && matchedSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-emerald-800 shrink-0">
                Matched ({matchedSkills.length}):
              </span>
              {matchedSkills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-md text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
              {matchedSkills.length > 5 && (
                <span className="text-[11px] text-slate-400 font-medium">
                  +{matchedSkills.length - 5} more
                </span>
              )}
            </div>
          )}

          {/* Missing Required Skills */}
          {missingRequiredSkills && missingRequiredSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-amber-800 shrink-0 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Missing Required:
              </span>
              {missingRequiredSkills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
              {missingRequiredSkills.length > 4 && (
                <span className="text-[11px] text-slate-400 font-medium">
                  +{missingRequiredSkills.length - 4} more
                </span>
              )}
            </div>
          )}

          {/* Relevant Projects Indicator */}
          {relevantProjects && relevantProjects.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                Demonstrated in portfolio:{" "}
                <span className="font-semibold text-slate-700">
                  {relevantProjects.map((p) => p.title).join(", ")}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 italic">
            Deterministic match computed from approved profile
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href={`/dashboard/recommendations/${match.opportunityId}`}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200"
              >
                Match Breakdown
              </Button>
            </Link>

            <Link
              href={`/opportunities/${match.opportunityId}`}
              className="w-full sm:w-auto"
            >
              <Button
                size="sm"
                className="w-full sm:w-auto text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
              >
                <span>View Role</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
