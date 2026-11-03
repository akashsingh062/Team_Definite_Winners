"use client";

import React from "react";
import {
  ShieldCheck,
  FolderGit2,
  Award,
  FileText,
  UserCheck,
} from "lucide-react";
import { SkillEvidenceType } from "@/types/skills-passport";

interface EvidenceBadgeProps {
  evidenceType: SkillEvidenceType;
  showIcon?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function EvidenceBadge({
  evidenceType,
  showIcon = true,
  size = "md",
  className = "",
}: EvidenceBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-medium";

  switch (evidenceType) {
    case "assessment_verified":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60 ${sizeClasses} ${className}`}
          title="Verified through completed NexSkill AI practical assessment or milestone capstone."
        >
          {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          Assessment Verified
        </span>
      );

    case "externally_verified":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60 ${sizeClasses} ${className}`}
          title="Confirmed through an authentic third-party certification provider portal."
        >
          {showIcon && <Award className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
          Externally Verified
        </span>
      );

    case "project_demonstrated":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60 ${sizeClasses} ${className}`}
          title="Demonstrated in a practical software project in student portfolio."
        >
          {showIcon && <FolderGit2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
          Project Demonstrated
        </span>
      );

    case "resume_extracted":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60 ${sizeClasses} ${className}`}
          title="Extracted from an approved student resume."
        >
          {showIcon && <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
          Resume Extracted
        </span>
      );

    case "self_reported":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 ${sizeClasses} ${className}`}
          title="Self-reported by student in profile."
        >
          {showIcon && <UserCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
          Self-Reported
        </span>
      );
  }
}
