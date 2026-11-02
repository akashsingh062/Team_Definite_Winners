"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IEligibilityCriterionExplanation } from "@/types/explanation";
import { EligibilityStatus } from "@/types/matching";

interface EligibilityCheckCardProps {
  eligibilityStatus: EligibilityStatus;
  criteria: IEligibilityCriterionExplanation[];
}

export function EligibilityCheckCard({
  eligibilityStatus,
  criteria,
}: EligibilityCheckCardProps) {
  const isCapped = eligibilityStatus === "not_eligible";

  return (
    <Card className="border border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Academic & Experience Eligibility Check
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Strict evaluation against explicit requirements set by the opportunity poster.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Overall Status:</span>
            {eligibilityStatus === "eligible" ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                Eligible
              </Badge>
            ) : eligibilityStatus === "potentially_eligible" ? (
              <Badge className="bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                Potentially Eligible
              </Badge>
            ) : eligibilityStatus === "not_eligible" ? (
              <Badge className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                Not Eligible
              </Badge>
            ) : (
              <Badge className="bg-slate-600 hover:bg-slate-700 text-white font-semibold">
                Insufficient Information
              </Badge>
            )}
          </div>
        </div>

        {isCapped && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2 text-xs text-rose-900">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Mandatory Eligibility Policy:</strong> Because one or more mandatory criteria (such as minimum CGPA) were not satisfied, your overall match score is capped at 45% to prevent misleading recommendations.
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden bg-white">
          {criteria.map((item, idx) => {
            let statusIcon = <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
            let statusBadge = (
              <Badge variant="emerald" className="text-[10px]">
                Satisfied
              </Badge>
            );

            if (item.status === "not_satisfied") {
              statusIcon = <XCircle className="w-4 h-4 text-rose-600 shrink-0" />;
              statusBadge = (
                <Badge variant="danger" className="text-[10px]">
                  Not Satisfied
                </Badge>
              );
            } else if (item.status === "unknown") {
              statusIcon = <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />;
              statusBadge = (
                <Badge variant="amber" className="text-[10px]">
                  Unknown Data
                </Badge>
              );
            }

            return (
              <div key={idx} className="p-3.5 space-y-2 hover:bg-slate-50/60 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    {statusIcon}
                    <span className="text-xs font-bold text-slate-900">
                      {item.criterion}
                    </span>
                    {item.isMandatory && (
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                        Mandatory
                      </span>
                    )}
                  </div>
                  {statusBadge}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Requirement
                    </p>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {item.requirement}
                    </p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Your Profile Record
                    </p>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {item.studentValue}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-snug pl-6">
                  {item.explanation}
                </p>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            <span>Update Academic Records & CGPA in Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
