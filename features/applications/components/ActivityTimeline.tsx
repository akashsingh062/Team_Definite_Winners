"use client";

import * as React from "react";
import { History, Clock, ArrowRight } from "lucide-react";
import { IApplicationActivity } from "@/types/application";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

interface ActivityTimelineProps {
  activities: IApplicationActivity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-500">
        No activity recorded yet. Status updates will be tracked chronologically here.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {activities.map((act, idx) => (
        <div key={act.id || act._id || idx} className="relative group">
          {/* Dot */}
          <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white" />

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {act.previousStatus && (
                  <>
                    <ApplicationStatusBadge status={act.previousStatus} size="sm" />
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </>
                )}
                <ApplicationStatusBadge status={act.newStatus} size="sm" />
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>{new Date(act.createdAt).toLocaleString()}</span>
              </span>
            </div>

            {act.note && (
              <p className="text-xs text-slate-700 leading-snug pl-0.5 pt-0.5">
                {act.note}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
