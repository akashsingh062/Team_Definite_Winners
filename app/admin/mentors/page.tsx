"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { IMentorProfile, IMentorshipReport, MentorVerificationStatus } from "@/types/mentor";
import { AdminPortalLayout } from "@/components/layout/AdminPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
  Search,
  Filter,
  Briefcase,
  Users,
  RotateCcw,
  X,
  FileText,
  Calendar,
  MessageSquare,
  Sparkles,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<IMentorProfile[]>([]);
  const [reports, setReports] = useState<IMentorshipReport[]>([]);
  const [activeTab, setActiveTab] = useState<"verification" | "moderation">("verification");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Verification Action Dialog state
  const [actionTarget, setActionTarget] = useState<IMentorProfile | null>(null);
  const [targetStatus, setTargetStatus] = useState<MentorVerificationStatus>("verified");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  // Moderation Resolution Dialog state
  const [reportTarget, setReportTarget] = useState<IMentorshipReport | null>(null);
  const [reportResolution, setReportResolution] = useState<"resolved" | "dismissed">("resolved");
  const [reportNotes, setReportNotes] = useState("");
  const [resolvingReport, setResolvingReport] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setLoading(true);
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
        console.error("Failed to load admin mentors data:", err);
        toast.error("Failed to load mentor verification records.");
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

  // Filtered mentors list
  const filteredMentors = useMemo(() => {
    if (!searchQuery.trim()) return mentors;
    const q = searchQuery.toLowerCase().trim();
    return mentors.filter(
      (m) =>
        m.displayName?.toLowerCase().includes(q) ||
        m.organization?.toLowerCase().includes(q) ||
        m.currentRole?.toLowerCase().includes(q) ||
        m.headline?.toLowerCase().includes(q) ||
        m.expertise?.some((e) => e.toLowerCase().includes(q))
    );
  }, [mentors, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = mentors.length;
    const pending = mentors.filter((m) => m.verificationStatus === "pending").length;
    const verified = mentors.filter((m) => m.verificationStatus === "verified").length;
    const underReview = mentors.filter((m) => m.verificationStatus === "under_review").length;
    const pendingReports = reports.filter((r) => r.status === "pending").length;
    return { total, pending, verified, underReview, pendingReports };
  }, [mentors, reports]);

  const openActionModal = (
    mentor: IMentorProfile,
    newStatus: MentorVerificationStatus
  ) => {
    setActionTarget(mentor);
    setTargetStatus(newStatus);
    if (newStatus === "verified") {
      setAdminNotes("Credentials, role at organization, and professional background verified.");
    } else if (newStatus === "under_review") {
      setAdminNotes("Additional identity and employment verification requested from candidate.");
    } else if (newStatus === "rejected") {
      setAdminNotes("Profile does not meet minimum technical experience criteria at this time.");
    } else if (newStatus === "suspended") {
      setAdminNotes("Account temporarily suspended due to policy or inactivity review.");
    } else {
      setAdminNotes("");
    }
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

      toast.success(
        `Mentor ${actionTarget.displayName} successfully marked as ${targetStatus.replace("_", " ")}.`
      );
      setActionTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating verification status.");
    } finally {
      setUpdating(false);
    }
  };

  const openReportModal = (report: IMentorshipReport, resolution: "resolved" | "dismissed") => {
    setReportTarget(report);
    setReportResolution(resolution);
    setReportNotes(
      resolution === "resolved"
        ? "Investigation completed and appropriate advisory corrective action taken."
        : "Report reviewed and dismissed after auditing session transcript and notes."
    );
  };

  const handleConfirmReportResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;

    setResolvingReport(true);
    try {
      const res = await fetch("/api/admin/mentors/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: reportTarget._id || reportTarget.id,
          status: reportResolution,
          adminNotes: reportNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resolve report");
      }

      toast.success(`Conduct report marked as ${reportResolution}.`);
      setReportTarget(null);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update report.");
    } finally {
      setResolvingReport(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            Under Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            Declined
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-300">
            <Ban className="h-3.5 w-3.5 text-slate-500" />
            Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
            Pending Verification
          </span>
        );
    }
  };

  return (
    <AdminPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* --- Top Command Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Mentor Network & Credential Verification
              </h1>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-slate-900 text-emerald-400 border border-slate-800">
                Administrative Desk
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed font-medium">
              Audit mentor professional credentials, evaluate onboarding submissions, enforce platform quality, and moderate student feedback & conduct reports.
            </p>
          </div>

          {/* View Tab Switch */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs shrink-0">
            <button
              onClick={() => setActiveTab("verification")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "verification"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              Verification Queue ({mentors.length})
            </button>
            <button
              onClick={() => setActiveTab("moderation")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "moderation"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Flag className="h-3.5 w-3.5 text-rose-500" />
              <span>Conduct Reports</span>
              {metrics.pendingReports > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-black bg-rose-500 text-white">
                  {metrics.pendingReports}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- KPI Performance Strip --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Approval
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.pending} Mentors
              </h3>
              <p className="text-xs text-amber-600 font-semibold mt-0.5">
                Awaiting credential review
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Verified Advisors
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.verified} Active
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                Live in public directory
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Under Review
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.underReview} In Progress
              </h3>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">
                Background verification
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Open Reports
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.pendingReports} Flagged
              </h3>
              <p className="text-xs text-rose-600 font-semibold mt-0.5">
                Requires moderator action
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <Flag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* --- TAB 1: VERIFICATION QUEUE --- */}
        {activeTab === "verification" ? (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by mentor name, company, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-600 font-bold">
                  Showing <strong className="text-slate-900">{filteredMentors.length}</strong> of <strong className="text-slate-900">{mentors.length}</strong> Advisors
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-500 mr-1">Status:</span>
                {[
                  { id: "all", label: "All Statuses" },
                  { id: "pending", label: "Pending" },
                  { id: "under_review", label: "Under Review" },
                  { id: "verified", label: "Verified" },
                  { id: "rejected", label: "Declined" },
                  { id: "suspended", label: "Suspended" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === f.id
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mentors List */}
            {loading ? (
              <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold text-slate-700">Loading mentor verification queue...</p>
              </div>
            ) : filteredMentors.length === 0 ? (
              <div className="text-center py-16 p-8 space-y-3.5 rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                  <UserCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  No mentors match the selected filter
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Try adjusting the verification status filter or clearing your keyword search.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className="mt-2 text-xs font-bold rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMentors.map((m) => (
                  <div
                    key={m._id || m.userId}
                    className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="space-y-3.5 flex-1 min-w-0">
                        {/* Header: Name, Status, Experience */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 text-base font-bold text-white shadow-xs">
                            {m.displayName
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                                {m.displayName}
                              </h3>
                              {renderStatusBadge(m.verificationStatus)}
                            </div>
                            <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                              <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span>
                                {m.currentRole} at <strong className="text-slate-900 font-bold">{m.organization}</strong>
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-600 font-semibold">{m.experienceYears}+ years experience</span>
                            </p>
                          </div>
                        </div>

                        {/* Headline */}
                        <p className="text-xs font-semibold text-slate-700">
                          {m.headline || "Industry advisor ready to guide students on roadmaps and interviews."}
                        </p>

                        {/* Bio Box */}
                        {m.biography && (
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-normal">
                            <span className="font-bold text-slate-900 block mb-1">Biography & Focus:</span>
                            {m.biography}
                          </div>
                        )}

                        {/* Expertise Badges */}
                        {m.expertise && m.expertise.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-xs font-bold text-slate-500">Domains:</span>
                            {m.expertise.map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Professional Links */}
                        <div className="flex items-center gap-3 pt-1 flex-wrap">
                          {m.professionalLinks?.linkedin && (
                            <a
                              href={m.professionalLinks.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200"
                            >
                              <Linkedin className="h-3.5 w-3.5" />
                              <span>LinkedIn</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                          {m.professionalLinks?.github && (
                            <a
                              href={m.professionalLinks.github}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:underline bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200"
                            >
                              <Github className="h-3.5 w-3.5" />
                              <span>GitHub</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                          {m.professionalLinks?.portfolio && (
                            <a
                              href={m.professionalLinks.portfolio}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200"
                            >
                              <Globe className="h-3.5 w-3.5" />
                              <span>Portfolio / Web</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          )}
                        </div>

                        {/* Previous Review Notes if any */}
                        {m.verificationNotes && (
                          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                            <span className="font-extrabold flex items-center gap-1.5 text-amber-950">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                              Administrative Review Audit Note:
                            </span>
                            <p className="leading-relaxed font-medium pl-5">{m.verificationNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Admin Action Buttons */}
                      <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 pt-2 lg:pt-0">
                        {m.verificationStatus !== "verified" && (
                          <Button
                            size="sm"
                            onClick={() => openActionModal(m, "verified")}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs h-9 px-4"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Approve & Verify
                          </Button>
                        )}

                        {m.verificationStatus !== "under_review" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionModal(m, "under_review")}
                            className="text-xs font-bold text-blue-700 border-blue-200 hover:bg-blue-50 rounded-xl h-9 px-3.5"
                          >
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                            Under Review
                          </Button>
                        )}

                        {m.verificationStatus !== "rejected" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionModal(m, "rejected")}
                            className="text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl h-9 px-3.5"
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
                            Decline
                          </Button>
                        )}

                        {m.verificationStatus !== "suspended" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openActionModal(m, "suspended")}
                            className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-100 rounded-xl h-9 px-3.5"
                          >
                            <Ban className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                            Suspend
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* --- TAB 2: CONDUCT REPORTS --- */
          <div className="space-y-4">
            {reports.length === 0 ? (
              <div className="text-center py-16 p-8 space-y-3.5 rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Zero Outstanding Conduct Reports
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  All student mentorship consultations and session notes are currently in good standing without safety violations.
                </p>
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep._id || rep.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                            rep.status === "pending"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {rep.status}
                        </span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Reported on {new Date(rep.createdAt || "").toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-base">
                        Issue Category: <span className="text-rose-600">{rep.reason}</span>
                      </h4>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal">
                        <span className="font-bold text-slate-900 block mb-1">Student Statement / Evidence:</span>
                        {rep.description}
                      </div>

                      {rep.adminNotes && (
                        <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                          <span className="font-bold">Moderator Resolution Note: </span>
                          <span>{rep.adminNotes}</span>
                        </div>
                      )}
                    </div>

                    {rep.status === "pending" && (
                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        <Button
                          size="sm"
                          onClick={() => openReportModal(rep, "resolved")}
                          className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Resolve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReportModal(rep, "dismissed")}
                          className="text-xs font-bold text-slate-700 border-slate-300 hover:bg-slate-100 rounded-xl"
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

        {/* --- Verification Action Modal --- */}
        {actionTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Credential Audit
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Transition Status:{" "}
                  <span className="capitalize text-indigo-600">
                    {targetStatus.replace("_", " ")}
                  </span>
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Updating status for <strong className="text-slate-900">{actionTarget.displayName}</strong> ({actionTarget.currentRole} at {actionTarget.organization}).
                </p>
              </div>

              <form onSubmit={handleConfirmVerification} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Administrative Review Notes / Decision Feedback <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    required
                    placeholder="Enter factual verification notes, employment check findings, or instructions..."
                    className="w-full p-3 rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActionTarget(null)}
                    disabled={updating}
                    className="rounded-xl border-slate-300 text-slate-700 font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updating}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Saving Decision...
                      </>
                    ) : (
                      "Confirm Status Transition"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- Report Resolution Modal --- */}
        {reportTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  Conduct Moderation
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1 capitalize">
                  {reportResolution} Conduct Report
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1">
                  Reason flagged: <strong className="text-slate-900">{reportTarget.reason}</strong>
                </p>
              </div>

              <form onSubmit={handleConfirmReportResolution} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Resolution Notes & Action Log <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    required
                    placeholder="Enter audit findings, policy enforcement action, or justification..."
                    className="w-full p-3 rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReportTarget(null)}
                    disabled={resolvingReport}
                    className="rounded-xl border-slate-300 text-slate-700 font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={resolvingReport}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs capitalize"
                  >
                    {resolvingReport ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        Saving Resolution...
                      </>
                    ) : (
                      `Confirm ${reportResolution}`
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminPortalLayout>
  );
}
