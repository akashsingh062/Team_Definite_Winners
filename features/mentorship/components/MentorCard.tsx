"use client";

import * as React from "react";
import Link from "next/link";
import { IMentorProfile } from "@/types/mentor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Star,
  Clock,
  Briefcase,
  Globe2,
  Calendar,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface MentorCardProps {
  mentor: IMentorProfile;
  onRequestClick?: (mentor: IMentorProfile) => void;
}

export function MentorCard({ mentor, onRequestClick }: MentorCardProps) {
  const isVerified = mentor.verificationStatus === "verified";
  const isAccepting = mentor.availability?.isAcceptingRequests;

  return (
    <div className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-0.5">
      <div>
        {/* Header: Avatar, Name, Verification, Rating */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 text-lg font-bold text-white shadow-sm ring-2 ring-indigo-100">
              {mentor.displayName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/dashboard/mentors/${mentor._id || mentor.userId}`}
                  className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base truncate"
                >
                  {mentor.displayName}
                </Link>
                {isVerified && (
                  <span
                    title="Verified Mentor"
                    className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5 truncate">
                <Briefcase className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span className="truncate">
                  {mentor.currentRole} at <strong className="text-slate-800 font-semibold">{mentor.organization}</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 rounded-xl bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200 shrink-0 shadow-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>{mentor.rating?.average ? mentor.rating.average.toFixed(1) : "New"}</span>
            {mentor.rating?.count > 0 && (
              <span className="text-amber-700 font-medium text-[11px]">({mentor.rating.count})</span>
            )}
          </div>
        </div>

        {/* Headline */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3.5 min-h-[32px]">
          {mentor.headline || "Industry practitioner passionate about engineering mentorship and career roadmap growth."}
        </p>

        {/* Expertise Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.expertise?.slice(0, 3).map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              {item}
            </span>
          ))}
          {mentor.expertise && mentor.expertise.length > 3 && (
            <span className="text-[11px] font-medium text-slate-500 self-center px-1">
              +{mentor.expertise.length - 3} more
            </span>
          )}
        </div>

        {/* Info Grid: Experience, Languages, Availability */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mb-4 bg-slate-50/90 p-3 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span>{mentor.experienceYears}+ years exp</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium truncate">
            <Globe2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">{mentor.languages?.slice(0, 2).join(", ") || "English"}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            isAccepting ? "text-emerald-700" : "text-slate-500"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isAccepting ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
            }`}
          />
          {isAccepting ? "Accepting Mentees" : "Unavailable"}
        </span>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/mentors/${mentor._id || mentor.userId}`}>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-3 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Profile
            </Button>
          </Link>
          {onRequestClick && isAccepting && (
            <Button
              size="sm"
              className="text-xs h-8 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
              onClick={() => onRequestClick(mentor)}
            >
              Request
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
