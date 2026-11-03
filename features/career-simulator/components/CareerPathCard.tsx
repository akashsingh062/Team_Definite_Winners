"use client";

import React from "react";
import Link from "next/link";
import {
  Briefcase,
  ArrowRight,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  GitCompare,
} from "lucide-react";
import { ICareerPath, CareerDifficulty } from "@/types/career-path";
import { Button } from "@/components/ui/button";

interface CareerPathCardProps {
  careerPath: ICareerPath;
  alignmentScore?: number;
  isSelectedForCompare?: boolean;
  onToggleCompare?: (slug: string) => void;
}

const DIFFICULTY_STYLES: Record<CareerDifficulty, { label: string; badge: string }> = {
  beginner: { label: "Beginner Friendly", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  intermediate: { label: "Intermediate", badge: "bg-blue-50 text-blue-700 border-blue-200" },
  advanced: { label: "Advanced Specialization", badge: "bg-purple-50 text-purple-700 border-purple-200" },
};

export function CareerPathCard({
  careerPath,
  alignmentScore,
  isSelectedForCompare,
  onToggleCompare,
}: CareerPathCardProps) {
  const diff = DIFFICULTY_STYLES[careerPath.learningDifficulty] || DIFFICULTY_STYLES.intermediate;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group">
      <div className="p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                {careerPath.category}
              </span>
              <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${diff.badge}`}>
                {diff.label}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-indigo-600 transition-colors">
              {careerPath.title}
            </h3>
          </div>

          {alignmentScore !== undefined && (
            <div className="shrink-0 text-center px-2.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-500 block">Readiness</span>
              <span className="text-sm font-extrabold text-indigo-700">{alignmentScore}%</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {careerPath.description}
        </p>

        {/* Skills Preview */}
        <div>
          <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Key Core Competencies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {careerPath.requiredSkills.slice(0, 5).map((skill, idx) => (
              <span
                key={idx}
                className="text-2xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60"
              >
                {skill}
              </span>
            ))}
            {careerPath.requiredSkills.length > 5 && (
              <span className="text-2xs text-slate-500 font-medium px-1.5 py-0.5">
                +{careerPath.requiredSkills.length - 5} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(careerPath.slug)}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isSelectedForCompare
                ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
            <span>{isSelectedForCompare ? "Selected" : "Compare"}</span>
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Link href={`/dashboard/career-simulator?career=${careerPath.slug}`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-1 hover:border-indigo-300 hover:text-indigo-600"
            >
              <Sliders className="h-3 w-3" />
              <span>Simulate</span>
            </Button>
          </Link>

          <Link href={`/dashboard/career-explorer/${careerPath.slug}`}>
            <Button
              variant="primary"
              size="sm"
              className="text-xs flex items-center gap-1"
            >
              <span>Explore</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

