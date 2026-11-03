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
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
                <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                </span>
                Human Mentor & Career Advisor Network
              </h1>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                NexSkill AI Mentorship Platform
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 max-w-2xl leading-relaxed">
              Connect 1-on-1 with verified tech leaders, software engineers, and industry advisors to get personalized roadmap reviews, mock interviews, and career guidance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <InAppNotificationBell />
            <Link href="/mentor/profile">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 bg-white border-slate-300 text-slate-800 hover:bg-slate-50 font-bold rounded-xl shadow-xs">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                <span>Become a Mentor</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* --- Mentorship Portal Tabs --- */}
        <div className="border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/dashboard/mentors"
              className="flex items-center gap-2 py-3 px-4 border-b-2 border-indigo-600 text-indigo-600 font-bold text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>Discover Mentors</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                {mentors.length}
              </span>
            </Link>

            <Link
              href="/dashboard/mentorship-requests"
              className="flex items-center gap-2 py-3 px-4 border-b-2 border-transparent text-slate-600 hover:text-slate-900 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors"
            >
              <Send className="w-4 h-4 text-slate-400" />
              <span>My Requests</span>
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
                Verified Mentors
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {mentors.length} Advisors
              </h3>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Credential verified</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Currently Available
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {acceptingCount} Open
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Accepting new mentees</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Industry Domains
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                5 Tech Tracks
              </h3>
              <p className="text-xs text-blue-600 font-semibold mt-0.5 truncate max-w-[150px]">
                Full-Stack • AI • Cloud • Career
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                1-on-1 Guidance
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                Free & Inclusive
              </h3>
              <p className="text-xs text-purple-600 font-semibold mt-0.5">
                Career Bridge Mission
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>

        {/* --- Search & Filters Bar --- */}
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 text-xs sm:text-sm">
            {/* Keyword Search */}
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by mentor name, company, or skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Domain / Expertise Filter */}
            <div className="lg:col-span-3">
              <select
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">All Expertise Domains</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Artificial Intelligence">Artificial Intelligence / ML</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="Cloud Architecture">Cloud Architecture & DevOps</option>
                <option value="Career Counselling">Career Counselling & Resumes</option>
              </select>
            </div>

            {/* Minimum Experience */}
            <div className="lg:col-span-2">
              <select
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 bg-slate-50 text-slate-900 text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Any Experience</option>
                <option value="3">3+ Years</option>
                <option value="5">5+ Years</option>
                <option value="8">8+ Years</option>
                <option value="10">10+ Years</option>
              </select>
            </div>

            {/* Accepting toggle */}
            <div className="lg:col-span-2 flex items-center justify-between sm:justify-end gap-2 px-1">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800 text-xs sm:text-sm select-none">
                <input
                  type="checkbox"
                  checked={acceptingOnly}
                  onChange={(e) => setAcceptingOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span>Accepting Only</span>
              </label>
            </div>
          </div>

          {/* Active Filters Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">
              Showing <strong className="text-slate-900">{mentors.length}</strong> Verified Mentors
            </span>

            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold text-xs transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* --- Mentors Grid --- */}
        {loading ? (
          <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">Discovering verified career mentors...</p>
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-16 p-8 space-y-3 rounded-3xl border-2 border-dashed border-slate-200 bg-white shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              No verified mentors found
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Try adjusting your search criteria, domain filters, or unticking the accepting-only checkbox.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 text-xs font-bold rounded-xl border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Clear All Filters
            </Button>
          </div>
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
