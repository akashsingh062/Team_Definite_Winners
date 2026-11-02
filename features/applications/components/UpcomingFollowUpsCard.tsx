"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Calendar, ArrowRight, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IApplication } from "@/types/application";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

interface UpcomingFollowUpsCardProps {
  applications: IApplication[];
}

export function UpcomingFollowUpsCard({
  applications,
}: UpcomingFollowUpsCardProps) {
  if (applications.length === 0) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  return (
    <Card className="border border-amber-200/80 bg-gradient-to-br from-amber-50/30 via-white to-white shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <CardTitle className="text-sm font-bold text-slate-900">
            Upcoming Action Items & Follow-ups ({applications.length})
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500">
          Reminders scheduled on your applications tracker.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 pt-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {applications.map((app) => {
            const followDate = app.nextFollowUpDate
              ? new Date(app.nextFollowUpDate)
              : null;
            let timeText = "Scheduled";
            if (followDate) {
              const diffMs = followDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              if (diffDays === 0) timeText = "Due Today!";
              else if (diffDays === 1) timeText = "Due Tomorrow";
              else if (diffDays > 1) timeText = `In ${diffDays} days`;
              else timeText = "Overdue";
            }

            return (
              <div
                key={app.id || app._id}
                className="p-3.5 rounded-xl border border-amber-200/60 bg-white hover:border-amber-300 transition-colors flex flex-col justify-between space-y-2 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {app.opportunity?.title || "Tracked Opportunity"}
                    </span>
                    <Badge variant="amber" className="text-[10px] shrink-0 font-bold">
                      {timeText}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-slate-400" />
                    <span>{app.opportunity?.companyName}</span>
                  </p>
                  {app.notes && (
                    <p className="text-[11px] text-slate-600 line-clamp-2 italic bg-slate-50 p-2 rounded border border-slate-100">
                      &ldquo;{app.notes}&rdquo;
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <ApplicationStatusBadge status={app.status} size="sm" />
                  <Link
                    href={`/dashboard/applications/${app.id || app._id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    <span>View Application</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
