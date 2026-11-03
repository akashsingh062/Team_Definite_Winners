"use client";

import React from "react";
import Link from "next/link";
import { ILocalOpportunityItem } from "@/types/local-opportunity";
import {
  MapPin,
  Building2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Banknote,
  CheckCircle,
} from "lucide-react";

interface LocalOpportunityCardProps {
  item: ILocalOpportunityItem;
}

export default function LocalOpportunityCard({ item }: LocalOpportunityCardProps) {
  const { opportunity: opp, distanceKm, isLocalMatch, matchScore, provenance } = item;
  const isGovt = Boolean(opp.isGovernmentProgram);

  const getWorkModeBadge = (mode: string) => {
    switch (mode?.toLowerCase()) {
      case "remote":
        return "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800";
      case "hybrid":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "internship":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      case "job":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    }
  };

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* Top Badges Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadge(
                opp.category
              )}`}
            >
              {opp.category}
            </span>

            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize ${getWorkModeBadge(
                opp.workMode
              )}`}
            >
              {opp.workMode}
            </span>

            {isGovt && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                Govt Scheme
              </span>
            )}

            {isLocalMatch && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                Local Match
              </span>
            )}
          </div>

          {/* Match Score Badge (Stage 4) */}
          {typeof matchScore === "number" && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-200/90 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs shadow-xs">
              <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>{matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Title & Organization */}
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
            <Link href={`/opportunities/${opp._id || opp.id}`}>
              {opp.title}
            </Link>
          </h3>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{opp.companyName}</span>
          </p>
        </div>

        {/* Location & Distance Pill */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{opp.locationName || opp.location}</span>
          </span>
          {typeof distanceKm === "number" && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              ~{distanceKm} km away
            </span>
          )}
        </div>

        {/* Description Snippet */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {opp.description}
        </p>

        {/* Required Skills */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {opp.requiredSkills.slice(0, 4).map((sk) => (
            <span
              key={sk}
              className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
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
      <div className="pt-3.5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{opp.stipend || opp.salaryRange || "Unpaid / Academic Credit"}</span>
          </span>

          {opp.applicationDeadline && (
            <span className="flex items-center gap-1 text-slate-400 text-[11px] font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>
                {new Date(opp.applicationDeadline).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </span>
          )}
        </div>

        {/* Source Provenance Link & Action */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 gap-2">
          <span className="truncate max-w-[150px] font-medium" title={provenance.sourceOrganization || provenance.source}>
            {provenance.sourceOrganization || provenance.source}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            {provenance.sourceUrl && (
              <a
                href={provenance.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5 font-semibold text-xs"
                title="Verify Official Portal Source"
              >
                Portal <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            )}

            <Link
              href={`/opportunities/${opp._id || opp.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
            >
              Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
