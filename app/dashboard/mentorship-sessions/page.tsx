"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IMentorshipSession } from "@/types/mentor";
import { SessionNotesModal } from "@/features/mentorship/components/SessionNotesModal";
import { FeedbackModal } from "@/features/mentorship/components/FeedbackModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Users,
  Send,
  Share2,
  Calendar,
  Clock,
  Video,
  FileText,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Notes Modal state
  const [notesSessionId, setNotesSessionId] = useState<string | null>(null);
  const [notesMentorName, setNotesMentorName] = useState("");

  // Feedback Modal state
  const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
  const [feedbackMentorName, setFeedbackMentorName] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadSessions() {
      try {
        const res = await fetch("/api/mentorship/sessions");
        const data = await res.json();
        if (!ignore && data.success) {
          setSessions(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSessions();
    return () => {
      ignore = true;
    };
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/mentorship/sessions");
      const data = await res.json();
      if (data.success) {
        setSessions(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    const reason = prompt("Please provide a reason for cancelling this session:");
    if (!reason) return;

    try {
      const res = await fetch(`/api/mentorship/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "cancelled",
          cancellationReason: reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle className="h-3 w-3" />
            Scheduled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
      case "rescheduled":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
            Rescheduled
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
          Mentorship Sessions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your upcoming 1-on-1 calls, access meeting rooms, take notes, and leave feedback.
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
          <Button variant="outline" size="sm" className="h-8 text-xs text-slate-600">
            <Send className="h-3.5 w-3.5 mr-1.5" />
            My Requests
          </Button>
        </Link>
        <Link href="/dashboard/mentorship-sessions">
          <Button
            size="sm"
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
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

      {/* Sessions list */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">
            No scheduled sessions found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Once a mentor accepts your request, your scheduled calendar session and meeting link will appear here.
          </p>
          <Link href="/dashboard/mentors">
            <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              Discover Mentors
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => {
            const scheduledDate = new Date(sess.scheduledAt);
            const mentorName = sess.mentor?.displayName || "Mentor";

            return (
              <div
                key={sess._id || sess.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {getStatusBadge(sess.status)}
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {sess.sessionType?.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {sess.durationMinutes} mins
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      Session with {mentorName}
                    </h3>
                    {sess.mentor && (
                      <p className="text-xs text-slate-500">
                        {sess.mentor.currentRole} at {sess.mentor.organization}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex-wrap">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                        <span>
                          {scheduledDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5 text-indigo-600" />
                        <span>
                          {scheduledDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          ({sess.timezone || "IST"})
                        </span>
                      </div>
                    </div>

                    {sess.agenda && (
                      <p className="text-xs text-slate-600 mt-2">
                        <span className="font-semibold text-slate-700">Agenda: </span>
                        {sess.agenda}
                      </p>
                    )}

                    {sess.cancellationReason && (
                      <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <span className="font-semibold">Cancellation Reason: </span>
                        {sess.cancellationReason}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {sess.meetingUrl && sess.status === "scheduled" && (
                      <a
                        href={sess.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center"
                      >
                        <Button
                          size="sm"
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Video className="h-3.5 w-3.5 mr-1.5" />
                          Join Meeting
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                    )}

                    {/* Guidance Notes */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotesSessionId(sess._id || sess.id);
                        setNotesMentorName(mentorName);
                      }}
                      className="text-xs"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Notes
                    </Button>

                    {/* Submit Feedback for completed session */}
                    {sess.status === "completed" && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setFeedbackSessionId(sess._id || sess.id);
                          setFeedbackMentorName(mentorName);
                        }}
                        className="text-xs bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        <Star className="h-3.5 w-3.5 mr-1" />
                        Feedback
                      </Button>
                    )}

                    {/* Cancel session */}
                    {sess.status === "scheduled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelSession(sess._id || sess.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guidance Notes Modal */}
      {notesSessionId && (
        <SessionNotesModal
          sessionId={notesSessionId}
          mentorName={notesMentorName}
          isOpen={!!notesSessionId}
          onClose={() => setNotesSessionId(null)}
        />
      )}

      {/* Feedback Modal */}
      {feedbackSessionId && (
        <FeedbackModal
          sessionId={feedbackSessionId}
          mentorName={feedbackMentorName}
          isOpen={!!feedbackSessionId}
          onClose={() => setFeedbackSessionId(null)}
          onSuccess={() => fetchSessions()}
        />
      )}
    </div>
  );
}
