"use client";

import * as React from "react";
import { X, RefreshCw, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApplicationStatus } from "@/types/application";
import { APPLICATION_STATUSES } from "@/features/applications/schemas/applicationSchema";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

interface StatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  currentStatus: ApplicationStatus;
  opportunityTitle?: string;
  onStatusUpdated?: (updatedApp: any) => void;
}

const STATUS_DESCRIPTIONS: Record<ApplicationStatus, string> = {
  saved: "Bookmarked to explore or apply later",
  planning: "Preparing resume, portfolio, or referrals before applying",
  applied: "Submitted official application to the hiring organization",
  assessment: "Online assessment / coding challenge / take-home project",
  interview: "Recruiter screen / technical interview / hiring manager rounds",
  offer_received: "Official job or internship offer letter received",
  selected: "Offer accepted and onboarding confirmed",
  rejected: "Application was not selected for this hiring cycle",
  withdrawn: "Application withdrawn by candidate",
  expired: "Opportunity deadline passed without action",
};

export function StatusUpdateModal(props: StatusUpdateModalProps) {
  if (!props.isOpen) return null;
  return <StatusUpdateModalContent {...props} />;
}

function StatusUpdateModalContent({
  onClose,
  applicationId,
  currentStatus,
  opportunityTitle,
  onStatusUpdated,
}: StatusUpdateModalProps) {
  const [selectedStatus, setSelectedStatus] =
    React.useState<ApplicationStatus>(currentStatus);
  const [note, setNote] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === currentStatus && !note.trim()) {
      toast.info("No status change detected.");
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: selectedStatus,
          note: note.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success(`Application updated to ${selectedStatus}!`);
        onStatusUpdated?.(json.data);
        onClose();
      } else {
        toast.error(json.message || "Failed to update status");
      }
    } catch {
      toast.error("Network error while updating status");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Update Application Status
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-xs">
                {opportunityTitle || "Recruitment Pipeline Update"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">
              Select New Status
            </label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 border border-slate-200 rounded-xl p-2 bg-slate-50/40">
              {APPLICATION_STATUSES.map((status) => {
                const isSelected = selectedStatus === status;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <ApplicationStatusBadge status={status} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {STATUS_DESCRIPTIONS[status]}
                      </p>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Transition Note */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">
              Activity Timeline Note (Optional)
            </label>
            <textarea
              placeholder="e.g. Completed technical round with Lead Engineer. Feedback expected Friday."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={2}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              <span>Save Status</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
