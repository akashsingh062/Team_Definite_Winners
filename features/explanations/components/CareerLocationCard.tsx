"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ICareerAlignmentExplanation,
  ILocationCompensationExplanation,
} from "@/types/explanation";

interface CareerLocationCardProps {
  careerAlignment: ICareerAlignmentExplanation;
  locationCompensation: ILocationCompensationExplanation;
}

export function CareerLocationCard({
  careerAlignment,
  locationCompensation,
}: CareerLocationCardProps) {
  const { roleAlignment, employmentType, industry, overallExplanation } = careerAlignment;
  const { workMode, location, compensation } = locationCompensation;

  return (
    <Card className="border border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-base font-bold text-slate-900">
            Career, Location & Compensation Alignment
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500 mt-0.5">
          Comparing position attributes against your stated preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* 1. Job Role Match */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Job Role Congruence</span>
              </span>
              {roleAlignment.matches ? (
                <Badge variant="emerald" className="text-[10px]">
                  Matches Target
                </Badge>
              ) : (
                <Badge variant="slate" className="text-[10px]">
                  Related Domain
                </Badge>
              )}
            </div>
            <div className="text-[11px] space-y-0.5">
              <p className="text-slate-500">
                Preferred: <strong className="text-slate-800">{roleAlignment.studentRole}</strong>
              </p>
              <p className="text-slate-500">
                Opportunity: <strong className="text-slate-800">{roleAlignment.opportunityTitle}</strong>
              </p>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {roleAlignment.explanation}
            </p>
          </div>

          {/* 2. Employment Type */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Employment Category</span>
              </span>
              {employmentType.matches ? (
                <Badge variant="emerald" className="text-[10px]">
                  Matches
                </Badge>
              ) : (
                <Badge variant="slate" className="text-[10px]">
                  Different Type
                </Badge>
              )}
            </div>
            <div className="text-[11px] space-y-0.5">
              <p className="text-slate-500">
                Preferred: <strong className="text-slate-800">{employmentType.studentPreference}</strong>
              </p>
              <p className="text-slate-500">
                Opportunity: <strong className="text-slate-800">{employmentType.opportunityType}</strong>
              </p>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {employmentType.explanation}
            </p>
          </div>

          {/* 3. Work Mode */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600" />
                <span>Work Mode (Remote / Hybrid)</span>
              </span>
              {workMode.matches ? (
                <Badge variant="emerald" className="text-[10px]">
                  Compatible
                </Badge>
              ) : (
                <Badge variant="amber" className="text-[10px]">
                  Check Schedule
                </Badge>
              )}
            </div>
            <div className="text-[11px] space-y-0.5">
              <p className="text-slate-500">
                Preferred: <strong className="text-slate-800">{workMode.studentPreference}</strong>
              </p>
              <p className="text-slate-500">
                Opportunity: <strong className="text-slate-800">{workMode.opportunityMode}</strong>
              </p>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {workMode.explanation}
            </p>
          </div>

          {/* 4. Compensation */}
          <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Compensation Structure</span>
              </span>
              {compensation.isDisclosed ? (
                <Badge variant="emerald" className="text-[10px]">
                  Disclosed
                </Badge>
              ) : (
                <Badge variant="slate" className="text-[10px]">
                  Not Disclosed
                </Badge>
              )}
            </div>
            <div className="text-[11px] space-y-0.5">
              <p className="text-slate-500">
                Offer / Budget: <strong className="text-slate-800">{compensation.opportunityCompensation}</strong>
              </p>
              <p className="text-slate-500">
                Expected: <strong className="text-slate-800">{compensation.studentPreference || "Not specified"}</strong>
              </p>
            </div>
            <p className="text-[11px] text-slate-600 leading-snug">
              {compensation.explanation}
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            <span>Update Career & Location Preferences</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
