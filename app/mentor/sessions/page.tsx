"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { SessionNotesModal } from "@/features/mentorship/components/SessionNotesModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Calendar,
  Clock,
  Video,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Plus,
} from "lucide-react";

export default function MentorSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Notes Modal state
  const [notesSessionId, setNotesSessionId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");

  // Edit Meeting URL dialog state
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [meetingUrlInput, setMeetingUrlInput] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadSessions() {
      try {
        const res = await fetch("/api/mentorship/sessions?as=mentor");
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
      const res = await fetch("/api/mentorship/sessions?as=mentor");
      const data = await res.json();
      if (data.success) {
        setSessions(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (
    sessionId: string,
    status: "completed" | "cancelled"
  ) => {
    let cancellationReason: string | undefined = undefined;
    if (status === "cancelled") {
      const r = prompt("Reason for cancellation:");
      if (!r) return;
      cancellationReason = r;
    }

    try {
      const res = await fetch(`/api/mentorship/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, cancellationReason }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveMeetingUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/mentorship/sessions/${editingSession._id || editingSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: editingSession.status,
          meetingUrl: meetingUrlInput.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditingSession(null);
        fetchSessions();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating meeting URL");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Scheduled Mentorship Sessions
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Coordinate upcoming meetings, manage conference links, attach private and shared guidance notes.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <CalendarCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">
            No scheduled sessions found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Accepting an incoming mentorship request allows you to schedule a calendar advisory slot.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((sess) => {
            const scheduledDate = new Date(sess.scheduledAt);
            const student = sess.student?.name || "Student";
            const isScheduled = sess.status === "scheduled";

            return (
              <div
                key={sess._id || sess.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${
                          sess.status === "completed"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                            : isScheduled
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {sess.status}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {sess.sessionType?.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {sess.durationMinutes} mins
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      Mentoring: {student}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Email: {sess.student?.email}
                    </p>

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

                    {sess.meetingUrl ? (
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="text-xs text-slate-500">Meeting Room:</span>
                        <a
                          href={sess.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 hover:underline"
                        >
                          <Video className="h-3 w-3" />
                          <span>{sess.meetingUrl}</span>
                          <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                        <button
                          onClick={() => {
                            setEditingSession(sess);
                            setMeetingUrlInput(sess.meetingUrl || "");
                          }}
                          className="text-[11px] text-slate-400 hover:text-slate-600"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            setEditingSession(sess);
                            setMeetingUrlInput("");
                          }}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <Plus className="h-3 w-3" />
                          Add Google Meet / Zoom URL
                        </button>
                      </div>
                    )}

                    {sess.cancellationReason && (
                      <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                        <span className="font-semibold">Cancellation: </span>
                        {sess.cancellationReason}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Guidance notes modal trigger */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNotesSessionId(sess._id || sess.id);
                        setStudentName(student);
                      }}
                      className="text-xs"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1" />
                      Add / View Notes
                    </Button>

                    {isScheduled && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(sess._id || sess.id, "completed")}
                          className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" />
                          Mark Completed
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(sess._id || sess.id, "cancelled")}
                          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                        >
                          Cancel
                        </Button>
                      </>
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
          mentorName={studentName}
          isMentor={true}
          isOpen={!!notesSessionId}
          onClose={() => setNotesSessionId(null)}
        />
      )}

      {/* Edit Meeting URL dialog */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-1">
              Add Meeting URL
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your Google Meet, Zoom, or Microsoft Teams meeting link.
            </p>

            <form onSubmit={handleSaveMeetingUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meeting URL
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/xyz-abc or https://zoom.us/j/..."
                  value={meetingUrlInput}
                  onChange={(e) => setMeetingUrlInput(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 p-2 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingSession(null)}
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
                  {updating ? "Saving..." : "Save Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
