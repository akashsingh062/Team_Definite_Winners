"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FolderGit2,
  FileText,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ISkillAnalysisItem } from "@/types/explanation";

interface SkillsComparisonCardProps {
  matchingSkills: ISkillAnalysisItem[];
  missingRequiredSkills: ISkillAnalysisItem[];
  missingPreferredSkills: ISkillAnalysisItem[];
  skillsRequiringVerification: ISkillAnalysisItem[];
}

export function SkillsComparisonCard({
  matchingSkills,
  missingRequiredSkills,
  missingPreferredSkills,
  skillsRequiringVerification,
}: SkillsComparisonCardProps) {
  const [activeTab, setActiveTab] = React.useState<
    "matching" | "missing_required" | "missing_preferred" | "verification"
  >("matching");

  return (
    <Card className="border border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Detailed Skills Analysis & Verification
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Verified from your approved profile, portfolio projects, and resume records.
            </CardDescription>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("matching")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "matching"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Matching ({matchingSkills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("missing_required")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "missing_required"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Missing Required ({missingRequiredSkills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("missing_preferred")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "missing_preferred"
                ? "bg-indigo-600 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Missing Preferred ({missingPreferredSkills.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verification")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "verification"
                ? "bg-slate-700 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Requires Verification ({skillsRequiringVerification.length})</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Tab 1: Matching Skills */}
        {activeTab === "matching" && (
          <div className="space-y-3">
            {matchingSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matchingSkills.map((skill) => {
                  let sourceIcon = <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
                  if (skill.evidenceSource === "project") {
                    sourceIcon = <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />;
                  } else if (skill.evidenceSource === "resume") {
                    sourceIcon = <FileText className="w-3.5 h-3.5 text-blue-600" />;
                  }

                  return (
                    <div
                      key={skill.name}
                      className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-950">
                          {skill.name}
                        </span>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="emerald"
                            className="text-[10px]"
                          >
                            {skill.type === "required" ? "Required Skill" : "Preferred Skill"}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                        {sourceIcon}
                        <span>{skill.evidenceDetail || "Verified in student record"}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-snug">
                        {skill.reason}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-xs text-slate-500">
                  No matching skills detected between your current profile and this opportunity.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Missing Required Skills */}
        {activeTab === "missing_required" && (
          <div className="space-y-3">
            {missingRequiredSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {missingRequiredSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-amber-950">
                          {skill.name}
                        </span>
                        <Badge
                          variant="amber"
                          className="text-[10px]"
                        >
                          Mandatory
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug">
                        {skill.reason}
                      </p>
                    </div>

                    {skill.skillGapUrl && (
                      <div className="pt-2 border-t border-amber-100">
                        <Link
                          href={skill.skillGapUrl}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 hover:underline"
                        >
                          <span>Analyze in Skill Gap & Find Courses</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-emerald-900">
                  All required skills covered!
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  You possess all mandatory competencies specified by the hiring team.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Missing Preferred Skills */}
        {activeTab === "missing_preferred" && (
          <div className="space-y-3">
            {missingPreferredSkills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {missingPreferredSkills.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/30 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-indigo-950">
                          {skill.name}
                        </span>
                        <Badge
                          variant="indigo"
                          className="text-[10px]"
                        >
                          Optional Bonus
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {skill.reason}
                      </p>
                    </div>

                    {skill.skillGapUrl && (
                      <div className="pt-2 border-t border-indigo-100/60">
                        <Link
                          href={skill.skillGapUrl}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 hover:underline"
                        >
                          <span>View Learning Path</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-xs text-slate-500">
                  No missing preferred bonus skills.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Skills Requiring Verification */}
        {activeTab === "verification" && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-100/80 border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <span>
                <strong>Verification Policy:</strong> CareerBridge AI never assumes a skill is absent simply because it was not detected in a resume. These competencies have ambiguous or partial indicators and require student confirmation.
              </span>
            </div>

            {skillsRequiringVerification.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skillsRequiringVerification.map((skill) => (
                  <div
                    key={skill.name}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">
                          {skill.name}
                        </span>
                        <Badge
                          variant="slate"
                          className="text-[10px]"
                        >
                          Unverified
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 italic">
                        {skill.evidenceDetail}
                      </p>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        {skill.reason}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <Link
                        href="/profile"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        <span>Update Skill in Profile</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/60">
                <p className="text-xs text-slate-500">
                  No skills require verification. All evaluated skills were clearly mapped.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
