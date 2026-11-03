"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { IMentorshipRequest } from "@/types/mentor";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Users,
  CalendarCheck,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
  ArrowRight,
  Loader2,
  Calendar,
  AlertCircle,
  Briefcase,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadRequests() {
      try {
        setLoading(true);
        const res = await fetch("/api/mentorship/requests");
        const data = await res.json();
        if (!ignore && data.success) {
          setRequests(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadRequests();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCancel = async (requestId: string) => {
    if (!confirm("Are you sure you want to cancel this mentorship request?")) return;
    setCancellingId(requestId);
    try {
      const res = await fetch(`/api/mentorship/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Mentorship request cancelled.");
        setRequests((prev) =>
          prev.map((r) =>
            r._id === requestId || r.id === requestId
              ? { ...r, status: "cancelled" }
              : r
          )
        );
      } else {
        toast.error(data.error || "Failed to cancel request.");
      }
    } catch (err) {
      toast.error("Network error cancelling request.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            Accepted
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            Declined
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
            <Ban className="h-3.5 w-3.5 text-slate-500" />
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
            <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const accepted = requests.filter((r) => r.status === "accepted").length;
    const completed = requests.filter((r) => r.status === "completed").length;
    return { total, pending, accepted, completed };
  }, [requests]);

  return (
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* --- Top Command Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                My Mentorship Requests
              </h1>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Outreach & Advisory Tracker
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              Track the live status of your 1-on-1 advisory, resume review, and career consultation requests sent to verified mentors.
            </p>
          </div>

          <Link href="/dashboard/mentors">
            <Button size="sm" className="text-xs gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-4 py-2.5 shadow-xs">
              <Users className="w-4 h-4" />
              <span>Discover More Mentors</span>
            </Button>
          </Link>
        </div>

        {/* --- Mentorship Portal Tabs --- */}
        <div className="border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/dashboard/mentors"
              className="flex items-center gap-2 py-3 px-4 border-b-2 border-transparent text-slate-600 hover:text-slate-900 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Discover Mentors</span>
            </Link>

            <Link
              href="/dashboard/mentorship-requests"
              className="flex items-center gap-2 py-3 px-4 border-b-2 border-indigo-600 text-indigo-600 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>My Requests</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                {requests.length}
              </span>
            </Link>

            <Link
              href="/dashboard/mentorship-sessions"
              className="flex items-center gap-2 py-3 px-4 border-b-2 border-transparent text-slate-600 hover:text-slate-900 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <CalendarCheck className="w-4 h-4 text-slate-400" />
              <span>My Sessions</span>
            </Link>

            <Link
              href="/dashboard/mentorship-resources"
              className="flex items-center gap-2 py-3 px-4 border-b-2 border-transparent text-slate-600 hover:text-slate-900 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>Shared Resources</span>
            </Link>
          </div>
        </div>

        {/* --- KPI Performance Strip --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Requests
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.total} Sent
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                Lifetime mentorship outreach
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Send className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Pending Review
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.pending} Awaiting
              </h3>
              <p className="text-xs text-amber-600 font-semibold mt-0.5">
                Mentors usually reply within 48h
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Accepted Requests
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.accepted} Ready
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                Ready for live booking
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Completed Sessions
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {metrics.completed} Done
              </h3>
              <p className="text-xs text-purple-600 font-semibold mt-0.5">
                Consultations wrapped
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* --- Requests List --- */}
        {loading ? (
          <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Loading your mentorship requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 p-8 space-y-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Send className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              No mentorship requests sent yet
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Browse our directory of verified tech experts, engineering leads, and alumni to send a personalized request for career guidance.
            </p>
            <Link href="/dashboard/mentors">
              <Button size="sm" className="mt-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs px-4 py-2">
                Discover Mentors
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id || req.id}
                className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {getStatusBadge(req.status)}
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Sent {new Date(req.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold capitalize">
                        {req.preferredSessionType?.replace(/_/g, " ")}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900">
                      {req.topic}
                    </h3>

                    {req.mentor ? (
                      <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>
                          Target Mentor: <strong className="text-slate-900 font-bold">{req.mentor.displayName}</strong> ({req.mentor.currentRole} at {req.mentor.organization})
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">Target Mentor</p>
                    )}

                    {/* Content Box */}
                    <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm space-y-2.5">
                      <div>
                        <span className="font-bold text-slate-900">Target Career Goal: </span>
                        <span className="text-slate-700 font-medium">{req.careerGoal}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Introduction & Query: </span>
                        <span className="text-slate-700 leading-relaxed font-normal">{req.introduction}</span>
                      </div>
                    </div>

                    {req.mentorResponse && (
                      <div className="mt-3 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-xs sm:text-sm text-slate-900 space-y-1.5">
                        <span className="font-bold flex items-center gap-2 text-indigo-950">
                          <MessageSquare className="w-4 h-4 text-indigo-600" />
                          Mentor Response / Meeting Note:
                        </span>
                        <p className="text-slate-800 leading-relaxed font-medium pl-6">{req.mentorResponse}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center md:flex-col justify-end md:items-end gap-2.5 shrink-0 pt-2 md:pt-0">
                    {req.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(req._id || req.id)}
                        disabled={cancellingId === (req._id || req.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 rounded-xl"
                      >
                        {cancellingId === (req._id || req.id) ? "Cancelling..." : "Cancel Request"}
                      </Button>
                    )}

                    {req.status === "accepted" && (
                      <Link href="/dashboard/mentorship-sessions">
                        <Button size="sm" className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs gap-1.5 px-3.5 py-2">
                          <span>View Session</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentPortalLayout>
  );
}
