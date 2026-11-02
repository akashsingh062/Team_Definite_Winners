"use client";

import * as React from "react";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IApplication, ApplicationStatus } from "@/types/application";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";
import { StatusUpdateModal } from "./StatusUpdateModal";

interface ApplicationCardProps {
  application: IApplication;
  onStatusUpdated?: (updatedApp: any) => void;
  onDeleteRequested?: (appId: string) => void;
}

export function ApplicationCard({
  application,
  onStatusUpdated,
  onDeleteRequested,
}: ApplicationCardProps) {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);

  const opp = application.opportunity;
  const appId = application.id || application._id;

  // Deadline countdown calculation
  const deadlineDate = application.deadline
    ? new Date(application.deadline)
    : opp?.applicationDeadline
      ? new Date(opp.applicationDeadline)
      : null;

  let deadlineText = "Rolling";
  let isDeadlinePassed = false;
  let deadlineBadgeVariant: "slate" | "amber" | "danger" = "slate";

  if (deadlineDate) {
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      isDeadlinePassed = true;
      deadlineText = "Deadline Passed";
      deadlineBadgeVariant = "danger";
    } else if (diffDays === 0) {
      deadlineText = "Deadline Today!";
      deadlineBadgeVariant = "danger";
    } else if (diffDays === 1) {
      deadlineText = "Deadline Tomorrow";
      deadlineBadgeVariant = "amber";
    } else if (diffDays <= 7) {
      deadlineText = `${diffDays} days left`;
      deadlineBadgeVariant = "amber";
    } else {
      deadlineText = `${diffDays} days left`;
      deadlineBadgeVariant = "slate";
    }
  }

  // Follow-up info
  const followUpDate = application.nextFollowUpDate
    ? new Date(application.nextFollowUpDate)
    : null;

  return (
    <Card className="border border-slate-200/90 hover:border-slate-300 transition-all shadow-2xs bg-white">
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {opp?.companyName || "Company"}
              </span>
              {opp?.category && (
                <Badge variant="slate" className="text-[10px] capitalize">
                  {opp.category}
                </Badge>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {opp?.title || "Tracked Opportunity"}
            </h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-0.5">
              {opp?.workMode && (
                <span className="capitalize">{opp.workMode}</span>
              )}
              {opp?.location && <span>• {opp.location}</span>}
              {(opp?.stipend || opp?.salaryRange) && (
                <span className="font-medium text-slate-700">
                  • {opp.stipend || opp.salaryRange}
                </span>
              )}
            </div>
          </div>

          {/* Status & Deadline Badges */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
            <ApplicationStatusBadge status={application.status} size="md" />
            {deadlineDate && (
              <Badge variant={deadlineBadgeVariant} className="text-[10px] font-semibold">
                <Clock className="w-3 h-3 mr-1" />
                <span>{deadlineText}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Middle Metadata (Applied Date, Follow-up, Notes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
          <div className="text-slate-600 space-y-0.5">
            {application.appliedAt ? (
              <p className="flex items-center gap-1 text-[11px]">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>
                  Applied on:{" "}
                  <strong>
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </strong>
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 italic">
                Saved on {new Date(application.savedAt).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="text-slate-600 sm:text-right space-y-0.5">
            {followUpDate && (
              <p className="text-[11px] text-amber-800 font-medium flex sm:justify-end items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>
                  Follow-up: {followUpDate.toLocaleDateString()}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Notes preview if any */}
        {application.notes && (
          <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 line-clamp-2">
            "{application.notes}"
          </p>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsUpdateModalOpen(true)}
              className="text-xs gap-1.5 cursor-pointer text-slate-700 hover:text-indigo-600"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Status</span>
            </Button>

            {onDeleteRequested && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteRequested(appId)}
                title="Remove from tracking"
                className="text-xs text-slate-400 hover:text-rose-600 cursor-pointer p-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <Link href={`/dashboard/applications/${appId}`}>
            <Button
              size="sm"
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 cursor-pointer"
            >
              <span>View Details & Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Status Update Modal */}
        <StatusUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          applicationId={appId}
          currentStatus={application.status}
          opportunityTitle={opp?.title}
          onStatusUpdated={onStatusUpdated}
        />
      </CardContent>
    </Card>
  );
}
