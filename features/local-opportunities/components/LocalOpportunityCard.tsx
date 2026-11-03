"use client";

import React from "react";
import Link from "next/link";
import { ILocalOpportunityItem } from "@/types/local-opportunity";
import {
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Briefcase,
} from "lucide-react";

interface LocalOpportunityCardProps {
  item: ILocalOpportunityItem;
}

export default function LocalOpportunityCard({ item }: LocalOpportunityCardProps) {
  const { opportunity: opp, distanceKm, isLocalMatch, matchScore, provenance } = item;

  const isGovt = Boolean(opp.isGovernmentProgram);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                opp.category === "internship"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                  : opp.category === "job"
                  ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900"
                  : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
              }`}
            >
              {opp.category}
            </span>

            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
              {opp.workMode}
            </span>

            {isGovt && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                Govt Initiative
              </span>
            )}

            {isLocalMatch && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                Local Match
              </span>
            )}
          </div>

          {/* Match Score Badge (Stage 4) */}
          {typeof matchScore === "number" && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Title & Organization */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 transition">
            <Link href={`/opportunities/${opp._id || opp.id}`}>
              {opp.title}
            </Link>
          </h3>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {opp.companyName}
          </p>
        </div>

        {/* Location & Distance */}
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
            {opp.locationName || opp.location}
          </span>
          {typeof distanceKm === "number" && (
            <span className="font-semibold text-blue-600">
              (~{distanceKm} km away)
            </span>
          )}
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {opp.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {opp.requiredSkills.slice(0, 4).map((sk) => (
            <span
              key={sk}
              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              {sk}
            </span>
          ))}
          {opp.requiredSkills.length > 4 && (
            <span className="text-[10px] text-slate-400 px-1 py-0.5 font-medium">
              +{opp.requiredSkills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Bottom Footer & Provenance */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {opp.stipend || opp.salaryRange || "Unpaid / Academic Credit"}
          </span>

          {opp.applicationDeadline && (
            <span className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Clock className="w-3 h-3" />
              Deadline: {new Date(opp.applicationDeadline).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Source Provenance Link */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
          <span className="truncate max-w-[200px]">
            Source: {provenance.sourceOrganization || provenance.source}
          </span>

          <div className="flex items-center gap-2">
            {provenance.sourceUrl && (
              <a
                href={provenance.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-medium"
                title="Verify Official Portal Source"
              >
                Official Source <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}

            <Link
              href={`/opportunities/${opp._id || opp.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
            >
              Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

