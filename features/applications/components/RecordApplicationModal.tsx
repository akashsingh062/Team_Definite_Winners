"use client";

import * as React from "react";
import { X, Send, Calendar, Globe, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ApplicationMethod } from "@/types/application";
import { APPLICATION_METHODS } from "@/features/applications/schemas/applicationSchema";

interface RecordApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
  opportunityTitle?: string;
  companyName?: string;
  onApplicationRecorded?: (application: any) => void;
}

const METHOD_LABELS: Record<ApplicationMethod, string> = {
  company_website: "Company Career Portal / Website",
  referral: "Employee / Alumni Referral",
  email: "Direct Email to Recruiter",
  campus_placement: "Campus Placement Cell / Drive",
  other: "Other Channel",
};

export function RecordApplicationModal({
  isOpen,
  onClose,
  opportunityId,
  opportunityTitle,
  companyName,
  onApplicationRecorded,
}: RecordApplicationModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [appliedAt, setAppliedAt] = React.useState(todayStr);
  const [applicationMethod, setApplicationMethod] =
    React.useState<ApplicationMethod>("company_website");
  const [applicationUrl, setApplicationUrl] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "record_application",
          opportunityId,
          appliedAt: appliedAt || todayStr,
          applicationMethod,
          applicationUrl: applicationUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Application recorded in your tracking dashboard!");
        onApplicationRecorded?.(json.data);
        onClose();
      } else {
        toast.error(json.message || "Failed to record application");
      }
    } catch {
      toast.error("Network error while recording application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-indigo-900">
            <Send className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Record Applied Opportunity
              </h3>
              <p className="text-[11px] text-slate-500">
                {opportunityTitle ? `${opportunityTitle} at ${companyName || ""}` : "Update your recruitment pipeline"}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Note Notice */}
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl text-purple-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span className="leading-snug">
              This records the application in your personal dashboard. It does not automatically submit an application to external portals.
            </span>
          </div>

          {/* Applied Date */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date Applied</span>
            </label>
            <input
              type="date"
              value={appliedAt}
              onChange={(e) => setAppliedAt(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono"
            />
          </div>

          {/* Application Method */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">
              How did you apply?
            </label>
            <select
              value={applicationMethod}
              onChange={(e) =>
                setApplicationMethod(e.target.value as ApplicationMethod)
              }
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
            >
              {APPLICATION_METHODS.map((m) => (
                <option key={m} value={m}>
                  {METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          {/* Application URL */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Application or Job Link (Optional)</span>
            </label>
            <input
              type="url"
              placeholder="https://company.com/careers/job-123"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Personal Notes or Referrer Contact (Optional)</span>
            </label>
            <textarea
              placeholder="e.g. Applied via John's referral. HR recruiter mentioned 2-week turnaround."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              rows={3}
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
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Save</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

