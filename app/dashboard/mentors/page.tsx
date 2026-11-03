"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { IMentorProfile } from "@/types/mentor";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { MentorCard } from "@/features/mentorship/components/MentorCard";
import { RequestMentorshipModal } from "@/features/mentorship/components/RequestMentorshipModal";
import { InAppNotificationBell } from "@/features/mentorship/components/InAppNotificationBell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  Filter,
  CalendarCheck,
  Send,
  Share2,
  Loader2,
  UserCheck,
  Sparkles,
  Star,
  CheckCircle2,
  Briefcase,
  Compass,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function MentorsDiscoveryPage() {
  const [mentors, setMentors] = useState<IMentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expertise, setExpertise] = useState("");
  const [minExperience, setMinExperience] = useState<string>("");
  const [language, setLanguage] = useState("");
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  // Selected mentor for request modal
  const [selectedMentor, setSelectedMentor] = useState<IMentorProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadMentors() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (expertise) params.set("expertise", expertise);
        if (minExperience) params.set("minExperience", minExperience);
        if (language) params.set("language", language);
        if (acceptingOnly) params.set("acceptingOnly", "true");

        const res = await fetch(`/api/mentors?${params.toString()}`);
        const data = await res.json();
        if (!ignore && data.success) {
          setMentors(data.data || []);
        }
      } catch (err) {
        console.error("Failed to load mentors", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadMentors();
    return () => {
      ignore = true;
    };
  }, [search, expertise, minExperience, language, acceptingOnly]);

  const handleResetFilters = () => {
    setSearch("");
    setExpertise("");
    setMinExperience("");
    setLanguage("");
    setAcceptingOnly(false);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (expertise) count++;
    if (minExperience) count++;
    if (language) count++;
    if (acceptingOnly) count++;
    return count;
  }, [search, expertise, minExperience, language, acceptingOnly]);

  const handleOpenRequest = (mentor: IMentorProfile) => {
    setSelectedMentor(mentor);
    setModalOpen(true);
  };

  const acceptingCount = useMemo(() => {
    return mentors.filter((m) => m.availability?.isAcceptingRequests).length;
  }, [mentors]);

  return (
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* --- Top Command Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Users className="w-5 h-5" />
                </span>
                Human Mentor & Career Counsellor Network
              </h1>
              <Badge variant="indigo" className="text-xs px-2.5 py-0.5 font-semibold">
                NexSkill AI Mentorship Platform
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Connect 1-on-1 with verified tech leaders, engineers, and career advisors to get tailored roadmap reviews, mock interviews, and career guidance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <InAppNotificationBell />
            <Link href="/mentor/profile">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 bg-white">
                <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>Become a Mentor</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* --- Mentorship Portal Tabs --- */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/dashboard/mentors"
              className="flex items-center gap-2 py-3 px-3.5 border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Discover Mentors</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {mentors.length}
              </span>
            </Link>

            <Link
              href="/dashboard/mentorship-requests"
              className="flex items-center gap-2 py-3 px-3.5 border-b-2 border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>My Requests</span>
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
                Verified Mentors
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {mentors.length} Advisors
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Credential verified
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Currently Available
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {acceptingCount} Open
              </h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                Accepting new mentees
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Industry Domains
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                5 Tech Tracks
              </h3>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                Full-Stack • AI • Cloud • Career
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                1-on-1 Guidance
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                Free & Inclusive
              </h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                Career Bridge Mission
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Compass className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* --- Search & Filters Bar --- */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs">
              {/* Keyword Search */}
              <div className="lg:col-span-5 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by mentor name, current company, or skills..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Domain / Expertise Filter */}
              <div className="lg:col-span-3">
                <select
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Expertise Domains</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Artificial Intelligence">Artificial Intelligence / ML</option>
                  <option value="Frontend Development">Frontend Development</option>
                  <option value="Cloud Architecture">Cloud & DevOps</option>
                  <option value="Career Counselling">Career Counselling & Resumes</option>
                </select>
              </div>

              {/* Minimum Experience */}
              <div className="lg:col-span-2">
                <select
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Any Experience</option>
                  <option value="3">3+ Years</option>
                  <option value="5">5+ Years</option>
                  <option value="8">8+ Years</option>
                  <option value="10">10+ Years</option>
                </select>
              </div>

              {/* Accepting toggle */}
              <div className="lg:col-span-2 flex items-center justify-between sm:justify-end gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={acceptingOnly}
                    onChange={(e) => setAcceptingOnly(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Accepting Only</span>
                </label>
              </div>
            </div>

            {/* Active Filters Row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <span className="font-medium text-[11px]">
                Showing <strong>{mentors.length}</strong> Verified Mentors
              </span>

              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset Filters ({activeFilterCount})
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* --- Mentors Grid --- */}
        {loading ? (
          <div className="py-24 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-500">Discovering verified career mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <Card className="text-center py-16 p-8 space-y-3 border-dashed border-2 border-slate-200 dark:border-slate-800">
            <Users className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No verified mentors found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search criteria, domain filters, or toggling off the accepting-only checkbox.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 text-xs"
            >
              Clear All Filters
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map((mentor) => (
              <MentorCard
                key={mentor._id || mentor.userId}
                mentor={mentor}
                onRequestClick={handleOpenRequest}
              />
            ))}
          </div>
        )}

        {/* --- Request Mentorship Modal --- */}
        <RequestMentorshipModal
          mentor={selectedMentor}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            toast.success("Mentorship request delivered successfully!");
          }}
        />
      </div>
    </StudentPortalLayout>
  );
}
