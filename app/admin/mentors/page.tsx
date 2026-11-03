"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { IMentorProfile, IMentorshipReport, MentorVerificationStatus } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Ban,
  Linkedin,
  Github,
  Globe,
  Award,
  Shield,
  Loader2,
  ExternalLink,
  Flag,
} from "lucide-react";

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<IMentorProfile[]>([]);
  const [reports, setReports] = useState<IMentorshipReport[]>([]);
  const [activeTab, setActiveTab] = useState<"verification" | "moderation">("verification");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  // Action Dialog state
  const [actionTarget, setActionTarget] = useState<IMentorProfile | null>(null);
  const [targetStatus, setTargetStatus] = useState<MentorVerificationStatus>("verified");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const statusParam = statusFilter !== "all" ? `?status=${statusFilter}` : "";
        const [mentorsRes, reportsRes] = await Promise.all([
          fetch(`/api/admin/mentors${statusParam}`),
          fetch("/api/admin/mentors/reports"),
        ]);

        const mentorsData = await mentorsRes.json();
        const reportsData = await reportsRes.json();

        if (!ignore && mentorsData.success) setMentors(mentorsData.data || []);
        if (!ignore && reportsData.success) setReports(reportsData.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const statusParam = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const [mentorsRes, reportsRes] = await Promise.all([
        fetch(`/api/admin/mentors${statusParam}`),
        fetch("/api/admin/mentors/reports"),
      ]);

      const mentorsData = await mentorsRes.json();
      const reportsData = await reportsRes.json();

      if (mentorsData.success) setMentors(mentorsData.data || []);
      if (reportsData.success) setReports(reportsData.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openActionModal = (
    mentor: IMentorProfile,
    newStatus: MentorVerificationStatus
  ) => {
    setActionTarget(mentor);
    setTargetStatus(newStatus);
    setAdminNotes(
      newStatus === "verified"
        ? "Credentials and professional background verified."
        : ""
    );
  };

  const handleConfirmVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTarget) return;

    setUpdating(true);
    try {
      const res = await fetch(
        `/api/admin/mentors/${actionTarget._id || actionTarget.userId}/verification`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: targetStatus,
            notes: adminNotes.trim(),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update verification status");
      }

      setActionTarget(null);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating verification");
    } finally {
      setUpdating(false);
    }
  };

  const handleResolveReport = async (
    reportId: string,
    status: "resolved" | "dismissed"
  ) => {
    const notes = prompt(`Notes for marking report as ${status}:`);
    try {
      const res = await fetch("/api/admin/mentors/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId,
          status,
          adminNotes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800 border border-blue-300">
            <Clock className="h-3 w-3" />
            Under Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 border border-rose-300">
            <XCircle className="h-3 w-3" />
            Declined
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-800 border border-slate-300">
            <Ban className="h-3 w-3" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-300">
            <AlertCircle className="h-3 w-3" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-emerald-400">
              <Shield className="h-3 w-3" />
              Administrative Verification Desk
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mentor Network & Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit mentor credentials, evaluate applications, enforce platform quality, and moderate reports.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab("verification")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeTab === "verification"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Verification Queue ({mentors.length})
          </button>
          <button
            onClick={() => setActiveTab("moderation")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              activeTab === "moderation"
                ? "bg-white text-indigo-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Flag className="h-3 w-3 text-rose-500" />
            Conduct Reports ({reports.length})
          </button>
        </div>
      </div>

      {activeTab === "verification" ? (
        <>
          {/* Status filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs w-fit">
            {[
              { id: "all", label: "All Mentors" },
              { id: "pending", label: "Pending" },
              { id: "under_review", label: "Under Review" },
              { id: "verified", label: "Verified" },
              { id: "rejected", label: "Rejected" },
              { id: "suspended", label: "Suspended" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  statusFilter === f.id
                    ? "bg-white text-indigo-700 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : mentors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
              No mentors found matching filter &quot;{statusFilter}&quot;.
            </div>
          ) : (
            <div className="space-y-4">
              {mentors.map((m) => (
                <div
                  key={m._id || m.userId}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">
                          {m.displayName}
                        </h3>
                        {renderStatusBadge(m.verificationStatus)}
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">
                          {m.experienceYears} years experience
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-700">
                        {m.currentRole} at <strong className="text-indigo-600">{m.organization}</strong>
                      </p>
                      <p className="text-xs text-slate-500">{m.headline}</p>

                      {/* Bio snippet */}
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {m.biography}
                      </p>

                      {/* Links */}
                      <div className="flex items-center gap-3 pt-1">
                        {m.professionalLinks?.linkedin && (
                          <a
                            href={m.professionalLinks.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <Linkedin className="h-3 w-3" />
                            LinkedIn
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                        {m.professionalLinks?.github && (
                          <a
                            href={m.professionalLinks.github}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-slate-800 hover:underline"
                          >
                            <Github className="h-3 w-3" />
                            GitHub
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                        {m.professionalLinks?.portfolio && (
                          <a
                            href={m.professionalLinks.portfolio}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                          >
                            <Globe className="h-3 w-3" />
                            Portfolio
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>

                      {/* Verification Notes if any */}
                      {m.verificationNotes && (
                        <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                          <span className="font-semibold">Review Notes: </span>
                          {m.verificationNotes}
                        </p>
                      )}
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
                      {m.verificationStatus !== "verified" && (
                        <Button
                          size="sm"
                          onClick={() => openActionModal(m, "verified")}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white h-8"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          Approve & Verify
                        </Button>
                      )}

                      {m.verificationStatus !== "under_review" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionModal(m, "under_review")}
                          className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-8"
                        >
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          Under Review
                        </Button>
                      )}

                      {m.verificationStatus !== "rejected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionModal(m, "rejected")}
                          className="text-xs text-rose-600 border-rose-200 hover:bg-rose-50 h-8"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          Decline
                        </Button>
                      )}

                      {m.verificationStatus !== "suspended" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionModal(m, "suspended")}
                          className="text-xs text-slate-600 hover:bg-slate-100 h-8"
                        >
                          <Ban className="h-3.5 w-3.5 mr-1" />
                          Suspend
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        /* Conduct Reports Tab */
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
              No conduct or harassment reports logged.
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep._id || rep.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          rep.status === "pending"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {rep.status}
                      </span>
                      <span className="text-xs text-slate-500">
                        Reported on {new Date(rep.createdAt || "").toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm">
                      Reason: {rep.reason}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {rep.description}
                    </p>
                    {rep.adminNotes && (
                      <p className="text-xs text-indigo-900 mt-2">
                        <span className="font-bold">Resolution Notes: </span>
                        {rep.adminNotes}
                      </p>
                    )}
                  </div>

                  {rep.status === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleResolveReport(rep._id || rep.id || "", "resolved")}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Resolve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveReport(rep._id || rep.id || "", "dismissed")}
                        className="text-xs text-slate-600"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Action Dialog */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Update Status:{" "}
              <span className="uppercase text-indigo-600">
                {targetStatus.replace("_", " ")}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Updating verification status for <strong>{actionTarget.displayName}</strong>.
            </p>

            <form onSubmit={handleConfirmVerification} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Administrative Notes / Feedback to Mentor
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes explaining this verification status decision..."
                  className="w-full rounded-md border border-slate-200 p-2 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActionTarget(null)}
                  disabled={updating}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={updating}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {updating ? "Saving..." : "Confirm Status Change"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
