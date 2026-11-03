"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { IMentorProfile } from "@/types/mentor";
import { MentorCard } from "@/features/mentorship/components/MentorCard";
import { RequestMentorshipModal } from "@/features/mentorship/components/RequestMentorshipModal";
import { InAppNotificationBell } from "@/features/mentorship/components/InAppNotificationBell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  Search,
  SlidersHorizontal,
  CalendarCheck,
  Send,
  Share2,
  Loader2,
  UserCheck,
  Sparkles,
} from "lucide-react";

export default function MentorsDiscoveryPage() {
  const [mentors, setMentors] = useState<IMentorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expertise, setExpertise] = useState("");
  const [minExperience, setMinExperience] = useState<string>("");
  const [language, setLanguage] = useState("");
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  // Selected mentor for modal
  const [selectedMentor, setSelectedMentor] = useState<IMentorProfile | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadMentors() {
      try {
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

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (expertise) params.set("expertise", expertise);
      if (minExperience) params.set("minExperience", minExperience);
      if (language) params.set("language", language);
      if (acceptingOnly) params.set("acceptingOnly", "true");

      const res = await fetch(`/api/mentors?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMentors(data.data || []);
      }
    } catch (err) {
      console.error("Failed to load mentors", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMentors();
  };

  const handleOpenRequest = (mentor: IMentorProfile) => {
    setSelectedMentor(mentor);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
              <Sparkles className="h-3 w-3" />
              Verified Expert Network
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Human Mentor & Career Counsellor Network
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect 1-on-1 with experienced tech leaders, engineers, and career advisors to accelerate your journey.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <InAppNotificationBell />
          <Link href="/mentor/profile">
            <Button variant="outline" size="sm" className="text-xs">
              <UserCheck className="h-3.5 w-3.5 mr-1" />
              Become a Mentor
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <Link href="/dashboard/mentors">
          <Button
            size="sm"
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
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

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
        >
          {/* Keyword Search */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by mentor name, company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          {/* Domain / Expertise Filter */}
          <div className="md:col-span-3">
            <select
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
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
          <div className="md:col-span-2">
            <select
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="">Any Experience</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
              <option value="8">8+ Years</option>
              <option value="10">10+ Years</option>
            </select>
          </div>

          {/* Accepting toggle & submit */}
          <div className="md:col-span-3 flex items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptingOnly}
                onChange={(e) => setAcceptingOnly(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Accepting Mentees</span>
            </label>

            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white"
            >
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Mentors Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
          <p className="text-xs">Loading verified mentors...</p>
        </div>
      ) : mentors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">
            No verified mentors found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Try adjusting your search criteria, domain filters, or experience range.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setExpertise("");
              setMinExperience("");
              setLanguage("");
              setAcceptingOnly(false);
            }}
            className="text-xs"
          >
            Clear Filters
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

      {/* Request Mentorship Modal */}
      <RequestMentorshipModal
        mentor={selectedMentor}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchMentors();
        }}
      />
    </div>
  );
}
