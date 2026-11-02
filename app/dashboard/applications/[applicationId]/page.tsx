"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ClipboardList,
  Building2,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Trash2,
  History,
  FileText,
  Sparkles,
  Compass,
  ArrowUpRight,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ApplicationStatusBadge,
  ActivityTimeline,
  StatusUpdateModal,
} from "@/features/applications/components";
import {
  IApplication,
  IApplicationActivity,
  ApplicationMethod,
} from "@/types/application";

const METHOD_LABELS: Record<string, string> = {
  company_website: "Company Career Portal / Website",
  referral: "Employee / Alumni Referral",
  email: "Direct Email to Recruiter",
  campus_placement: "Campus Placement Cell / Drive",
  other: "Other Channel",
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId = params?.applicationId as string;
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [application, setApplication] = React.useState<IApplication | null>(
    null
  );
  const [activities, setActivities] = React.useState<IApplicationActivity[]>(
    []
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Editable fields state
  const [notes, setNotes] = React.useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = React.useState("");
  const [isSavingDetails, setIsSavingDetails] = React.useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
    if (!applicationId) return;
    try {
      setIsLoading(true);
      setError(null);

      const [appRes, actRes] = await Promise.all([
        fetch(`/api/applications/${applicationId}`),
        fetch(`/api/applications/${applicationId}/activities`),
      ]);

      if (appRes.status === 401) {
        router.push(
          `/login?callbackUrl=/dashboard/applications/${applicationId}`
        );
        return;
      }

      if (appRes.status === 403) {
        setError("You do not have permission to view this application.");
        return;
      }

      if (!appRes.ok) {
        setError("Application record not found or unavailable.");
        return;
      }

      const appJson = await appRes.json();
      const actJson = await actRes.json();

      if (appJson.success && appJson.data) {
        setApplication(appJson.data);
        setNotes(appJson.data.notes || "");
        if (appJson.data.nextFollowUpDate) {
          const d = new Date(appJson.data.nextFollowUpDate);
          setNextFollowUpDate(d.toISOString().split("T")[0]);
        } else {
          setNextFollowUpDate("");
        }
      }

      if (actJson.success && actJson.data) {
        setActivities(actJson.data);
      }
    } catch (err: any) {
      console.error("Failed to load application details:", err);
      setError("Failed to load application information");
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, router]);

  React.useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push(
        `/login?callbackUrl=/dashboard/applications/${applicationId}`
      );
      return;
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, isAuthLoading, loadData, applicationId, router]);

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDetails(true);

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: notes.trim(),
          nextFollowUpDate: nextFollowUpDate || null,
          note: "Updated application notes and follow-up date",
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Application notes & follow-up saved!");
        await loadData();
      } else {
        toast.error(json.message || "Failed to update details");
      }
    } catch {
      toast.error("Network error while saving details");
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to remove this application from your tracker? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Application removed from tracking");
        router.push("/dashboard/applications");
      } else {
        toast.error(json.message || "Failed to remove application");
      }
    } catch {
      toast.error("Network error while removing application");
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <StudentPortalLayout>
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-8">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="h-40 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-slate-200 rounded-xl" />
            <div className="h-64 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </StudentPortalLayout>
    );
  }

  if (error || !application) {
    return (
      <StudentPortalLayout>
        <div className="max-w-xl mx-auto py-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {error || "Application Not Found"}
          </h2>
          <p className="text-xs text-slate-500">
            This tracking record may have been removed or belongs to another user.
          </p>
          <Link href="/dashboard/applications">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Applications</span>
            </Button>
          </Link>
        </div>
      </StudentPortalLayout>
    );
  }

  const opp = application.opportunity;
  const oppId = opp?._id || opp?.id || application.opportunityId;

  // Deadline calculation
  const deadlineDate = application.deadline
    ? new Date(application.deadline)
    : opp?.applicationDeadline
      ? new Date(opp.applicationDeadline)
      : null;

  let deadlineText = "Rolling Application";
  let deadlineVariant: "slate" | "amber" | "danger" = "slate";

  if (deadlineDate) {
    const now = new Date();
    const diffMs = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      deadlineText = "Deadline Passed";
      deadlineVariant = "danger";
    } else if (diffDays === 0) {
      deadlineText = "Deadline Today!";
      deadlineVariant = "danger";
    } else if (diffDays === 1) {
      deadlineText = "Due Tomorrow";
      deadlineVariant = "amber";
    } else {
      deadlineText = `${diffDays} days remaining`;
      deadlineVariant = diffDays <= 7 ? "amber" : "slate";
    }
  }

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link
              href="/dashboard/applications"
              className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Applications Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-xs">
              {opp?.title || "Application"}
            </span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-xs text-slate-400 hover:text-rose-600 gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove from Tracking</span>
          </Button>
        </div>

        {/* Hero Card */}
        <Card className="border border-slate-200/90 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {opp?.companyName || "Organization"}
                  </span>
                  {opp?.category && (
                    <Badge variant="slate" className="text-[10px] capitalize">
                      {opp.category}
                    </Badge>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {opp?.title || "Tracked Opportunity"}
                </h1>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  {opp?.workMode && <span className="capitalize">{opp.workMode}</span>}
                  {opp?.location && <span>• {opp.location}</span>}
                  {(opp?.stipend || opp?.salaryRange) && (
                    <span className="font-medium text-slate-700">
                      • {opp.stipend || opp.salaryRange}
                    </span>
                  )}
                </div>
              </div>

              {/* Status & Update Action */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <ApplicationStatusBadge status={application.status} size="lg" />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsUpdateModalOpen(true)}
                  className="text-xs gap-1.5 cursor-pointer text-indigo-700 hover:bg-indigo-50 border-indigo-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Status</span>
                </Button>
              </div>
            </div>

            {/* Application Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
              {/* Applied Date & Method */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Application Method
                </span>
                <p className="font-bold text-slate-800">
                  {application.applicationMethod
                    ? METHOD_LABELS[application.applicationMethod] || application.applicationMethod
                    : "Not specified"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {application.appliedAt
                    ? `Submitted on ${new Date(application.appliedAt).toLocaleDateString()}`
                    : `Saved on ${new Date(application.savedAt).toLocaleDateString()}`}
                </p>
              </div>

              {/* Deadline countdown */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Opportunity Deadline
                </span>
                <p className="font-bold text-slate-800">
                  {deadlineDate ? deadlineDate.toLocaleDateString() : "Rolling"}
                </p>
                <Badge variant={deadlineVariant} className="text-[10px] font-bold">
                  {deadlineText}
                </Badge>
              </div>

              {/* External URL */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Job Portal URL
                </span>
                {application.applicationUrl || opp?.externalApplicationUrl ? (
                  <a
                    href={application.applicationUrl || opp?.externalApplicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 truncate"
                  >
                    <span>Visit External Portal</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <p className="text-slate-400 italic">No link recorded</p>
                )}
                <p className="text-[10px] text-slate-400">Official application link</p>
              </div>
            </div>

            {/* Quick Cross-Module Integration Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">
                Connected Modules:
              </span>

              {oppId && (
                <>
                  <Link href={`/opportunities/${oppId}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1 hover:text-indigo-600"
                    >
                      <span>Role Specs</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>

                  <Link href={`/dashboard/recommendations/${oppId}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1 hover:text-indigo-600 text-indigo-700 bg-indigo-50/50 border-indigo-200"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      <span>Match Explanation</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </>
              )}

              <Link href="/dashboard/skill-gap">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1 hover:text-indigo-600"
                >
                  <span>Skill Gap</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>

              <Link href="/dashboard/roadmap">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1 hover:text-indigo-600"
                >
                  <Compass className="w-3 h-3 text-emerald-600" />
                  <span>Roadmap</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Private Notes & Follow-up Scheduler Form */}
        <Card className="border border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Private Notes & Next Follow-up
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Personal interview prep notes, referral contacts, and scheduled reminder dates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveDetails} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Notes Input */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Application Notes (Confidential)
                  </label>
                  <textarea
                    placeholder="e.g. Sent referral request to John on LinkedIn. Recruiter mentioned technical round involves React state management."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs leading-relaxed"
                  />
                </div>

                {/* Follow-up Date Input */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Next Follow-up Date</span>
                  </label>
                  <input
                    type="date"
                    value={nextFollowUpDate}
                    onChange={(e) => setNextFollowUpDate(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs font-mono"
                  />
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Schedule a follow-up date to receive reminders on your applications dashboard.
                  </p>
                  {nextFollowUpDate && (
                    <button
                      type="button"
                      onClick={() => setNextFollowUpDate("")}
                      className="text-[11px] text-rose-600 hover:underline pt-1 block cursor-pointer"
                    >
                      Clear reminder date
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSavingDetails}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes & Reminder</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Activity Timeline Section */}
        <Card className="border border-slate-200/90 shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Chronological Activity History ({activities.length})
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Audit trail of every status transition and recruitment update.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ActivityTimeline activities={activities} />
          </CardContent>
        </Card>

        {/* Status Update Modal */}
        <StatusUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          applicationId={applicationId}
          currentStatus={application.status}
          opportunityTitle={opp?.title}
          onStatusUpdated={() => loadData()}
        />
      </div>
    </StudentPortalLayout>
  );
}
