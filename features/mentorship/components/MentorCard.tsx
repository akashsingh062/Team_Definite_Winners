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
} from "lucide-react";

interface MentorCardProps {
  mentor: IMentorProfile;
  onRequestClick?: (mentor: IMentorProfile) => void;
}

export function MentorCard({ mentor, onRequestClick }: MentorCardProps) {
  const isVerified = mentor.verificationStatus === "verified";
  const isAccepting = mentor.availability?.isAcceptingRequests;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md">
      <div>
        {/* Header: Avatar, Name, Verification, Rating */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white shadow-xs">
              {mentor.displayName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                  {mentor.displayName}
                </h3>
                {isVerified && (
                  <span
                    title="Verified Mentor"
                    className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Briefcase className="h-3 w-3 shrink-0 text-slate-400" />
                <span>
                  {mentor.currentRole} at <strong className="text-slate-700">{mentor.organization}</strong>
                </span>
              </p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-800 border border-amber-200 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
            <span>{mentor.rating?.average ? mentor.rating.average.toFixed(1) : "New"}</span>
            {mentor.rating?.count > 0 && (
              <span className="text-amber-600 font-normal">({mentor.rating.count})</span>
            )}
          </div>
        </div>

        {/* Headline */}
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">
          {mentor.headline}
        </p>

        {/* Expertise Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {mentor.expertise?.slice(0, 3).map((item, idx) => (
            <Badge
              key={idx}
              variant="indigo"
              className="text-[11px] font-normal px-2 py-0.5"
            >
              {item}
            </Badge>
          ))}
          {mentor.expertise?.length > 3 && (
            <span className="text-[11px] text-slate-400 self-center">
              +{mentor.expertise.length - 3} more
            </span>
          )}
        </div>

        {/* Info Grid: Experience, Languages, Availability */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{mentor.experienceYears}+ years exp</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{mentor.languages?.slice(0, 2).join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
            isAccepting ? "text-emerald-700" : "text-slate-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isAccepting ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
            }`}
          />
          {isAccepting ? "Accepting Mentees" : "Unavailable"}
        </span>

        <div className="flex items-center gap-2">
          <Link href={`/dashboard/mentors/${mentor._id || mentor.userId}`}>
            <Button variant="outline" size="sm" className="text-xs h-8">
              Profile
            </Button>
          </Link>
          {onRequestClick && isAccepting && (
            <Button
              size="sm"
              className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
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

