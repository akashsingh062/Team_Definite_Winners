"use client";

import React, { useState } from "react";
import { IPassportSkill, SkillEvidenceType } from "@/types/skills-passport";
import { EvidenceBadge } from "./EvidenceBadge";
import { Filter, Calendar, Award } from "lucide-react";

interface SkillsEvidenceGridProps {
  skills: IPassportSkill[];
}

export function SkillsEvidenceGrid({ skills }: SkillsEvidenceGridProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredSkills = skills.filter((s) => {
    if (filter === "all") return true;
    if (filter === "verified") {
      return (
        s.evidenceType === "assessment_verified" ||
        s.evidenceType === "externally_verified"
      );
    }
    return s.evidenceType === filter;
  });

  const getProficiencyColor = (p: string) => {
    switch (p) {
      case "Expert":
        return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300";
      case "Advanced":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300";
      case "Intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
      case "Beginner":
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Skills & Evidence Matrix ({skills.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Skills backed by platform assessments, projects, and credentials
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          {[
            { id: "all", label: "All" },
            { id: "verified", label: "Verified Only" },
            { id: "project_demonstrated", label: "Projects" },
            { id: "resume_extracted", label: "Resume" },
            { id: "self_reported", label: "Self-Reported" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                filter === tab.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredSkills.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          No skills match the selected evidence filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {skill.name}
                  </h4>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${getProficiencyColor(
                      skill.proficiency
                    )}`}
                  >
                    {skill.proficiency}
                  </span>
                </div>

                <div className="mb-2">
                  <EvidenceBadge evidenceType={skill.evidenceType as SkillEvidenceType} size="sm" />
                </div>

                {skill.evidenceReference && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                    {skill.evidenceReference}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="truncate max-w-[150px]">{skill.issuingSource}</span>
                {skill.verificationDate && (
                  <span className="flex items-center gap-1 shrink-0">
                    <Calendar className="w-2.5 h-2.5" />
                    {new Date(skill.verificationDate).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
