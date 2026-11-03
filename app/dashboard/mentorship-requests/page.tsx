"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IMentorshipRequest } from "@/types/mentor";
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
} from "lucide-react";

export default function StudentRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadRequests() {
      try {
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
        setRequests(
          requests.map((r) =>
            r._id === requestId || r.id === requestId
              ? { ...r, status: "cancelled" }
              : r
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            Pending Response
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" />
            Declined
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
            <Ban className="h-3 w-3" />
            Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
            Completed
          </span>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Mentorship Requests
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track the status of all your outreach and advisory requests to mentors.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <Link href="/dashboard/mentors">
          <Button variant="outline" size="sm" className="h-8 text-xs text-slate-600">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Discover Mentors
          </Button>
        </Link>
        <Link href="/dashboard/mentorship-requests">
          <Button
            size="sm"
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            My Requests
          </Button>
        </Link>
        <Link href="/dashboard/mentorship-sessions">
          <Button variant="outline" size="sm" className="h-8 text-xs text-slate-600">
            <CalendarCheck className="h-3.5 w-3.5 mr-1.5" />
            My Sessions
          </Button>
        </Link>
        <Link href="/dashboard/mentorship-resources">
          <Button variant="outline" size="sm" className="h-8 text-xs text-slate-600">
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Shared Resources
          </Button>
        </Link>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Send className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">
            No mentorship requests sent yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Browse our directory of verified experts and send a personalized request for career guidance.
          </p>
          <Link href="/dashboard/mentors">
            <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              Discover Mentors
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id || req.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    {getStatusBadge(req.status)}
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Sent {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {req.preferredSessionType?.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {req.topic}
                  </h3>

                  {req.mentor ? (
                    <p className="text-xs text-slate-600 mt-1">
                      Mentor: <strong className="text-slate-800">{req.mentor.displayName}</strong> ({req.mentor.currentRole} at {req.mentor.organization})
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Target Mentor</p>
                  )}

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1.5">
                    <div>
                      <span className="font-semibold text-slate-500">Career Goal: </span>
                      <span>{req.careerGoal}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">Introduction & Query: </span>
                      <span>{req.introduction}</span>
                    </div>
                  </div>

                  {req.mentorResponse && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900">
                      <span className="font-semibold">Mentor Feedback / Response: </span>
                      <p className="mt-0.5">{req.mentorResponse}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
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
                      <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                        View Scheduled Session
                        <ArrowRight className="h-3 w-3 ml-1" />
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
  );
}
