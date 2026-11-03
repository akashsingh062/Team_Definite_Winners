"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IMentorProfile } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import {
  Send,
  CalendarCheck,
  Star,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Video,
} from "lucide-react";

export default function MentorDashboardPage() {
  const [profile, setProfile] = useState<IMentorProfile | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchDashboard() {
      try {
        const [profileRes, requestsRes, sessionsRes] = await Promise.all([
          fetch("/api/mentor/profile"),
          fetch("/api/mentorship/requests?as=mentor"),
          fetch("/api/mentorship/sessions?as=mentor"),
        ]);

        const profileData = await profileRes.json();
        const requestsData = await requestsRes.json();
        const sessionsData = await sessionsRes.json();

        if (!ignore && profileData.success) setProfile(profileData.data);
        if (!ignore && requestsData.success) setRequests(requestsData.data || []);
        if (!ignore && sessionsData.success) setSessions(sessionsData.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const upcomingSessions = sessions.filter((s) => s.status === "scheduled");

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === "verified";

  return (
    <div className="space-y-6">
      {/* Verification Status Alert if not verified */}
      {!isVerified && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-semibold text-amber-900">
              Profile Verification Status:{" "}
              <span className="uppercase tracking-wider font-bold">
                {profile?.verificationStatus?.replace("_", " ") || "Pending"}
              </span>
            </h4>
            <p className="text-amber-800 mt-0.5 leading-relaxed">
              Your mentor profile is awaiting administrative review. Verified mentors are displayed in student search and discovery. You can preview and edit your profile credentials at any time.
            </p>
            {profile?.verificationNotes && (
              <p className="mt-1 text-amber-950 font-medium">
                Admin Notes: {profile.verificationNotes}
              </p>
            )}
          </div>
          <Link href="/mentor/profile">
            <Button size="sm" variant="outline" className="text-xs bg-white">
              Edit Profile
            </Button>
          </Link>
        </div>
      )}

      {/* Top Banner */}
      <div className="rounded-3xl border border-slate-200 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-400/30">
                <CheckCircle2 className="h-3 w-3" />
                {isVerified ? "Verified Industry Mentor" : "Mentor Onboarding Portal"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {profile?.displayName || "Mentor"}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {profile?.headline || "Help ambitious students navigate career paths, polish resumes, and land internships."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/mentor/requests">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                View All Requests ({pendingRequests.length})
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending Requests</span>
            <Send className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {pendingRequests.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires your review</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Upcoming Sessions</span>
            <CalendarCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {upcomingSessions.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled calls</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Average Student Rating</span>
            <Star className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 flex items-center gap-1.5">
            <span>{profile?.rating?.average ? profile.rating.average.toFixed(1) : "—"}</span>
            <span className="text-xs text-slate-400 font-normal">
              ({profile?.rating?.count || 0} reviews)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Helpfulness feedback</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Weekly Commitment</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {profile?.availability?.weeklyHours || 4} hrs
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {profile?.availability?.isAcceptingRequests ? "Open to mentees" : "Unavailable"}
          </p>
        </div>
      </div>

      {/* Two columns: Pending requests & Upcoming sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests Column */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Incoming Mentorship Requests
            </h3>
            <Link
              href="/mentor/requests"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              See all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No pending requests at the moment.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 3).map((req) => (
                <div
                  key={req._id || req.id}
                  className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {req.student?.name || "Student"}
                      </p>
                      <p className="text-xs text-indigo-600 font-medium mt-0.5">
                        {req.topic}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                        Goal: {req.careerGoal}
                      </p>
                    </div>
                    <Link href="/mentor/requests">
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions Column */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm">
              Upcoming Scheduled Sessions
            </h3>
            <Link
              href="/mentor/sessions"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              See all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No upcoming sessions scheduled.
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.slice(0, 3).map((sess) => {
                const date = new Date(sess.scheduledAt);
                return (
                  <div
                    key={sess._id || sess.id}
                    className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/70 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Session with {sess.student?.name || "Student"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({sess.durationMinutes} mins)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {sess.meetingUrl ? (
                        <a href={sess.meetingUrl} target="_blank" rel="noreferrer">
                          <Button
                            size="sm"
                            className="text-xs h-7 bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Video className="h-3 w-3 mr-1" />
                            Join
                          </Button>
                        </a>
                      ) : (
                        <Link href="/mentor/sessions">
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Add Link
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
