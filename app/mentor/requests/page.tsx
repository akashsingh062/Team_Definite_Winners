"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Loader2,
  CalendarPlus,
} from "lucide-react";

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [actingId, setActingId] = useState<string | null>(null);

  // Accept & schedule session dialog
  const [acceptingReq, setAcceptingReq] = useState<any | null>(null);
  const [mentorResponse, setMentorResponse] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadRequests() {
      try {
        const res = await fetch("/api/mentorship/requests?as=mentor");
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

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/mentorship/requests?as=mentor");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickReject = async (requestId: string) => {
    const reason = prompt(
      "Reason for declining this request (will be shared politely with the student):"
    );
    if (!reason) return;

    setActingId(requestId);
    try {
      const res = await fetch(`/api/mentorship/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          mentorResponse: reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActingId(null);
    }
  };

  const handleConfirmAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingReq) return;

    setSubmitting(true);
    try {
      // 1. Accept request
      const reqRes = await fetch(`/api/mentorship/requests/${acceptingReq._id || acceptingReq.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "accepted",
          mentorResponse: mentorResponse.trim() || "Request accepted. Looking forward to speaking!",
        }),
      });
      const reqData = await reqRes.json();
      if (!reqData.success) throw new Error(reqData.error);

      // 2. If scheduledAt is provided, automatically create session
      if (scheduledAt) {
        await fetch("/api/mentorship/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId: acceptingReq._id || acceptingReq.id,
            studentId: acceptingReq.studentId,
            mentorId: acceptingReq.mentorId,
            scheduledAt,
            sessionType: acceptingReq.preferredSessionType || "1_on_1_advisory",
            meetingUrl: meetingUrl.trim() || undefined,
            agenda: acceptingReq.topic,
          }),
        });
      }

      setAcceptingReq(null);
      setMentorResponse("");
      setScheduledAt("");
      setMeetingUrl("");
      fetchRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error accepting request");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mentorship Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review incoming student requests, schedule advisory sessions, or provide directional feedback.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl text-xs">
          {["pending", "accepted", "rejected", "all"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                filter === st
                  ? "bg-white text-indigo-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Send className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">
            No {filter !== "all" ? filter : ""} requests found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Students discovering your verified profile will submit requests here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req._id || req.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                        req.status === "accepted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : req.status === "pending"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      Received {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {req.preferredSessionType?.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {req.topic}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1">
                    Student:{" "}
                    <strong className="text-slate-800">
                      {req.student?.name || "Student"}
                    </strong>{" "}
                    ({req.student?.email})
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1.5">
                    <div>
                      <span className="font-semibold text-slate-500">
                        Career Objective:{" "}
                      </span>
                      <span>{req.careerGoal}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-500">
                        Student Introduction:{" "}
                      </span>
                      <span>{req.introduction}</span>
                    </div>
                    {req.preferredDates && req.preferredDates.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-500">
                          Suggested Dates:{" "}
                        </span>
                        <span>{req.preferredDates.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {req.mentorResponse && (
                    <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900">
                      <span className="font-semibold">Your Response: </span>
                      <span>{req.mentorResponse}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => setAcceptingReq(req)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReject(req._id || req.id)}
                        disabled={actingId === (req._id || req.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 border-rose-200"
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Decline
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept & Schedule Modal */}
      {acceptingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Accept Request from {acceptingReq.student?.name || "Student"}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Confirm acceptance, send an encouraging welcome note, and optionally schedule the call.
            </p>

            <form onSubmit={handleConfirmAccept} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note to Student
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Glad to connect! Let's discuss your system design interview strategy."
                  value={mentorResponse}
                  onChange={(e) => setMentorResponse(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Schedule Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting Link (Google Meet / Zoom URL)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc or https://zoom.us/j/..."
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-2 text-xs text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAcceptingReq(null)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {submitting ? "Accepting..." : "Confirm Acceptance"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
