"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { IMentorProfile } from "@/types/mentor";
import { RequestMentorshipModal } from "@/features/mentorship/components/RequestMentorshipModal";
import { ShareResourceModal } from "@/features/mentorship/components/ShareResourceModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Star,
  Clock,
  Briefcase,
  GraduationCap,
  Globe,
  Linkedin,
  Github,
  Award,
  Calendar,
  Send,
  Share2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function MentorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params.mentorId as string;

  const [mentor, setMentor] = useState<IMentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadMentor() {
      if (!mentorId) return;
      try {
        const res = await fetch(`/api/mentors/${mentorId}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to load mentor profile");
        }
        if (!ignore) {
          setMentor(data.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Error loading profile");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadMentor();
    return () => {
      ignore = true;
    };
  }, [mentorId]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-xs text-slate-500">Loading mentor profile...</p>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center max-w-lg mx-auto mt-12">
        <h3 className="text-base font-bold text-rose-800 mb-1">
          Mentor Unavailable
        </h3>
        <p className="text-xs text-rose-600 mb-4">
          {error || "This mentor is either not found or their verification is currently pending."}
        </p>
        <Link href="/dashboard/mentors">
          <Button variant="outline" size="sm" className="text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Mentors Directory
          </Button>
        </Link>
      </div>
    );
  }

  const isVerified = mentor.verificationStatus === "verified";
  const isAccepting = mentor.availability?.isAcceptingRequests;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back link */}
      <div>
        <Link
          href="/dashboard/mentors"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Mentors Directory
        </Link>
      </div>

      {/* Main Mentor Card Hero */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-md">
              {mentor.displayName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900">
                  {mentor.displayName}
                </h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Verified Mentor
                  </span>
                )}
              </div>

              <p className="text-sm font-medium text-slate-700 mt-1">
                {mentor.currentRole} at <strong className="text-indigo-600">{mentor.organization}</strong>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{mentor.headline}</p>

              {/* Rating & Experience */}
              <div className="flex items-center gap-3 mt-3 text-xs text-slate-600 flex-wrap">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 text-amber-900 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                  <span>{mentor.rating?.average ? mentor.rating.average.toFixed(1) : "New"}</span>
                  {mentor.rating?.count > 0 && (
                    <span className="text-amber-700 font-normal">
                      ({mentor.rating.count} reviews)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>{mentor.experienceYears}+ years experience</span>
                </div>

                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-slate-400" />
                  <span>{mentor.languages?.join(", ")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            {isAccepting ? (
              <Button
                onClick={() => setRequestModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs text-xs h-9"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Request Mentorship
              </Button>
            ) : (
              <Button disabled variant="outline" size="sm" className="text-xs h-9">
                Currently Unavailable
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              className="text-xs h-9"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
              Share Resume / Project
            </Button>
          </div>
        </div>

        {/* Professional Links */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
          {mentor.professionalLinks?.linkedin && (
            <a
              href={mentor.professionalLinks.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-white hover:text-indigo-600 transition-colors"
            >
              <Linkedin className="h-3.5 w-3.5 text-blue-600" />
              LinkedIn Profile
            </a>
          )}
          {mentor.professionalLinks?.github && (
            <a
              href={mentor.professionalLinks.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-white hover:text-indigo-600 transition-colors"
            >
              <Github className="h-3.5 w-3.5" />
              GitHub
            </a>
          )}
          {mentor.professionalLinks?.portfolio && (
            <a
              href={mentor.professionalLinks.portfolio}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:bg-white hover:text-indigo-600 transition-colors"
            >
              <Globe className="h-3.5 w-3.5 text-emerald-600" />
              Portfolio Website
            </a>
          )}
        </div>
      </div>

      {/* Grid: Biography & Expertise vs Education & Availability */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Biography, Skills, Credentials */}
        <div className="md:col-span-2 space-y-6">
          {/* Biography */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              About {mentor.displayName}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {mentor.biography}
            </p>
          </div>

          {/* Expertise & Skills */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3">
              Expertise & Specializations
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5">
                  Core Advisory Domains
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.expertise?.map((exp, idx) => (
                    <Badge
                      key={idx}
                      variant="indigo"
                      className="text-xs font-normal px-2.5 py-1"
                    >
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5">
                  Technical Stack & Tooling
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mentor.skills?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Credentials & Certifications */}
          {mentor.credentials && mentor.credentials.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3">
                Verified Credentials & Certifications
              </h3>
              <div className="space-y-2">
                {mentor.credentials.map((cred, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Award className="h-4 w-4 text-indigo-600 shrink-0" />
                      <div>
                        <p className="font-semibold text-slate-900">{cred.title}</p>
                        <p className="text-slate-500">
                          {cred.issuingOrg} {cred.year ? `• ${cred.year}` : ""}
                        </p>
                      </div>
                    </div>
                    {cred.verified && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Availability & Education */}
        <div className="space-y-6">
          {/* Availability Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-600" />
              Mentorship Availability
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Status</span>
                <span
                  className={`font-semibold ${
                    isAccepting ? "text-emerald-700" : "text-slate-500"
                  }`}
                >
                  {isAccepting ? "Open for Mentees" : "Currently Full"}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Weekly Commitment</span>
                <span className="font-semibold text-slate-800">
                  {mentor.availability?.weeklyHours || 4} hours/week
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Preferred Days</span>
                <span className="font-semibold text-slate-800">
                  {mentor.availability?.preferredDays?.join(", ") || "Weekends"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Timezone</span>
                <span className="font-semibold text-slate-800">
                  {mentor.availability?.timezone || "Asia/Kolkata"}
                </span>
              </div>
            </div>

            {mentor.availability?.timeSlots && mentor.availability.timeSlots.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                  Available Slots:
                </p>
                <div className="space-y-1">
                  {mentor.availability.timeSlots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-1.5 rounded-md bg-indigo-50/50 text-[11px] text-indigo-900 border border-indigo-100 flex justify-between"
                    >
                      <span>{slot.day}</span>
                      <span>
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Education Card */}
          {mentor.education && mentor.education.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
                Education History
              </h3>
              <div className="space-y-3">
                {mentor.education.map((edu, idx) => (
                  <div key={idx} className="text-xs">
                    <p className="font-semibold text-slate-900">{edu.degree}</p>
                    <p className="text-slate-600">{edu.institution}</p>
                    <p className="text-[11px] text-slate-400">
                      {edu.field} {edu.year ? `• Class of ${edu.year}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <RequestMentorshipModal
        mentor={mentor}
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => router.push("/dashboard/mentorship-requests")}
      />

      {/* Explicit Resource Share Modal */}
      <ShareResourceModal
        mentorId={mentor._id || mentor.userId}
        mentorName={mentor.displayName}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onSuccess={() => router.push("/dashboard/mentorship-resources")}
      />
    </div>
  );
}
