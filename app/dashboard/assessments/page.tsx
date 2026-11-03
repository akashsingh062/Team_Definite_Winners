"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { AssessmentCard } from "@/features/assessments/components/AssessmentCard";
import { IAssessment } from "@/types/assessment";
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileBadge,
} from "lucide-react";
import { toast } from "sonner";

export default function AssessmentsCatalogPage() {
  const [assessments, setAssessments] = useState<IAssessment[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [verifiedEvidences, setVerifiedEvidences] = useState<
    Array<{ skill: string; percentage: number; proficiency: string }>
  >([]);

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setIsLoading(true);
        const [assessRes, historyRes] = await Promise.all([
          fetch("/api/assessments"),
          fetch("/api/assessments/history"),
        ]);

        const assessJson = await assessRes.json();
        const historyJson = await historyRes.json();

        if (!ignore && assessJson.success && assessJson.data) {
          setAssessments(assessJson.data);
        }
        if (!ignore && historyJson.success && historyJson.data?.evidences) {
          setVerifiedEvidences(historyJson.data.evidences);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load assessments:", err);
          toast.error("Failed to load assessments.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      ignore = true;
    };
  }, []);

  const subjects = [
    "all",
    "JavaScript",
    "HTML",
    "CSS",
    "React",
    "Node.js",
    "Express.js",
    "MongoDB",
    "SQL",
    "Python",
    "Java",
    "Data Structures and Algorithms",
  ];

  const filtered = assessments.filter((a) => {
    if (selectedSubject !== "all" && a.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
      return false;
    }
    if (selectedDifficulty !== "all" && a.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.subject.toLowerCase().includes(q) ||
        a.topics?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Award className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Practical Skill Readiness Assessments
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Validate your technical competencies through structured conceptual, output prediction, and debugging tests
            </p>
          </div>

          <Link
            href="/dashboard/skills-passport"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition"
          >
            <FileBadge className="w-4 h-4 text-blue-600" />
            Skills Passport Evidence
          </Link>
        </div>

        {/* Verified Badges Banner */}
        {verifiedEvidences.length > 0 && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/60">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Your Verified Assessment Badges ({verifiedEvidences.length})
              </h2>
              <span className="text-[11px] text-blue-600 dark:text-blue-400">
                Synchronized with Skills Passport
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {verifiedEvidences.map((e, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-xs"
                >
                  <Award className="w-3.5 h-3.5 text-blue-600" />
                  <strong>{e.skill}</strong>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {e.percentage}% ({e.proficiency})
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assessments by title, subject, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Subject Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              >
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === "all" ? "All Subjects" : sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Dropdown */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="text-xs py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>
        </div>

        {/* Assessment Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading skill assessments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              No assessments match your filters
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Try resetting your subject or difficulty filter.
            </p>
            <button
              onClick={() => {
                setSelectedSubject("all");
                setSelectedDifficulty("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((assessment) => {
              const matchingEvidence = verifiedEvidences.find(
                (e) => e.skill.toLowerCase() === assessment.subject.toLowerCase()
              );
              return (
                <AssessmentCard
                  key={assessment._id || assessment.id}
                  assessment={assessment}
                  isCompleted={Boolean(matchingEvidence)}
                  score={matchingEvidence?.percentage}
                />
              );
            })}
          </div>
        )}
      </div>
    </StudentPortalLayout>
  );
}

