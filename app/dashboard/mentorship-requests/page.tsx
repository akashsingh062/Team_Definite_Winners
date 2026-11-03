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
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
            Accepted
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            Pending Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            Declined
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 border border-slate-200">
            <Ban className="h-3.5 w-3.5 text-slate-500" />
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
            <CheckCircle className="h-3.5 w-3.5 text-indigo-600" />
            Completed
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Send className="w-5 h-5" />
                </span>
                My Mentorship Requests
              </h1>
              <Badge variant="indigo" className="text-xs px-2.5 py-0.5 font-semibold">
                Outreach & Advisory Tracker
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track the live status of your advisory, resume review, and career consultation requests sent to mentors.
            </p>
          </div>

          <Link href="/dashboard/mentors">
            <Button variant="primary" size="sm" className="text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Discover More Mentors</span>
            </Button>
          </Link>
        </div>

        {/* --- Mentorship Portal Tabs --- */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/dashboard/mentors"
              className="flex items-center gap-2 py-3 px-3.5 border-b-2 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Discover Mentors</span>
            </Link>

            <Link
              href="/dashboard/mentorship-requests"
              className="flex items-center gap-2 py-3 px-3.5 border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>My Requests</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {requests.length}
              </span>
            </Link>

            <Link
              href="/dashboard/mentorship-sessions"
              className="flex items-center gap-2 py-3 px-3.5 border-b-2 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>My Sessions</span>
            </Link>

            <Link
              href="/dashboard/mentorship-resources"
              className="flex items-center gap-2 py-3 px-3.5 border-b-2 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Shared Resources</span>
            </Link>
          </div>
        </div>

        {/* --- KPI Performance Strip --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Total Requests
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {metrics.total} Sent
              </h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                Lifetime mentorship outreach
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Send className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Pending Review
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {metrics.pending} Awaiting
              </h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                Mentors usually reply within 48h
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Accepted Requests
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {metrics.accepted} Ready
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Ready for live booking
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Completed Sessions
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {metrics.completed} Done
              </h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                Consultations wrapped
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* --- Requests List --- */}
        {loading ? (
          <div className="py-24 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-500">Loading your mentorship requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <Card className="text-center py-16 p-8 space-y-3 border-dashed border-2 border-slate-200 dark:border-slate-800">
            <Send className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No mentorship requests sent yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Browse our directory of verified tech experts, engineering leads, and alumni to send a personalized request for career guidance.
            </p>
            <Link href="/dashboard/mentors">
              <Button size="sm" className="mt-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                Discover Mentors
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card
                key={req._id || req.id}
                className="p-5 border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(req.status)}
                      <span className="text-xs text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Sent {new Date(req.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <Badge variant="indigo" className="text-[10px] uppercase font-semibold">
                        {req.preferredSessionType?.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {req.topic}
                    </h3>

                    {req.mentor ? (
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Target Mentor: <strong className="text-slate-800 dark:text-slate-200">{req.mentor.displayName}</strong> ({req.mentor.currentRole} at {req.mentor.organization})
                        </span>
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500">Target Mentor</p>
                    )}

                    {/* Content Box */}
                    <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">Target Career Goal: </span>
                        <span>{req.careerGoal}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100">Introduction & Query: </span>
                        <span className="leading-relaxed">{req.introduction}</span>
                      </div>
                    </div>

                    {req.mentorResponse && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                        <span className="font-bold flex items-center gap-1.5 text-indigo-950 dark:text-indigo-100">
                          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                          Mentor Response / Meeting Note:
                        </span>
                        <p className="mt-0.5 leading-relaxed">{req.mentorResponse}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center md:flex-col justify-end md:items-end gap-2 shrink-0 pt-2 md:pt-0">
                    {req.status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(req._id || req.id)}
                        disabled={cancellingId === (req._id || req.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                      >
                        {cancellingId === (req._id || req.id) ? "Cancelling..." : "Cancel Request"}
                      </Button>
                    )}

                    {req.status === "accepted" && (
                      <Link href="/dashboard/mentorship-sessions">
                        <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1">
                          <span>View Session</span>
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentPortalLayout>
  );
}
