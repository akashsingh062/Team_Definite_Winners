"use client";

import React from "react";
import { IPassportEducation } from "@/types/skills-passport";
import { GraduationCap, Building2 } from "lucide-react";

interface PassportEducationCardProps {
  education: IPassportEducation[];
}

export function PassportEducationCard({ education }: PassportEducationCardProps) {
  if (!education || education.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs text-center">
        <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No academic qualifications recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Academic Foundations
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Degree coursework, major, and institutional credentials
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {education.map((edu, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3"
          >
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {edu.degree} {edu.branch && `in ${edu.branch}`}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {edu.institution}
              </p>
              <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                {edu.graduationYear && <span>Class of {edu.graduationYear}</span>}
                {edu.cgpa !== undefined && edu.cgpa !== null && (
                  <span>CGPA: {edu.cgpa} / 10</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
