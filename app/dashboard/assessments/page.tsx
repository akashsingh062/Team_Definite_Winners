"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { AssessmentCard } from "@/features/assessments/components/AssessmentCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IAssessment } from "@/types/assessment";
import {
  Award,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileBadge,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  Code2,
  Target,
  X,
  Clock,
  Compass,
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

  const filtered = useMemo(() => {
    return assessments.filter((a) => {
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
  }, [assessments, selectedSubject, selectedDifficulty, searchQuery]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedSubject !== "all") count++;
    if (selectedDifficulty !== "all") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedSubject, selectedDifficulty, searchQuery]);

  const handleResetFilters = () => {
    setSelectedSubject("all");
    setSelectedDifficulty("all");
    setSearchQuery("");
  };

  const highestScore = useMemo(() => {
    if (verifiedEvidences.length === 0) return 0;
    return Math.max(...verifiedEvidences.map((e) => e.percentage));
  }, [verifiedEvidences]);

  return (
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* --- Top Command Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-5 h-5" />
                </span>
                Practical Skill Readiness Assessments
              </h1>
              <Badge variant="indigo" className="text-xs px-2.5 py-0.5 font-semibold">
                NexSkill AI Testing Engine
              </Badge>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Demonstrate measurable evidence through timed conceptual, output prediction, and code debugging tests that directly stamp your Digital Skills Passport.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs text-slate-600 dark:text-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ({activeFilterCount})</span>
              </Button>
            )}

            <Link href="/dashboard/skills-passport">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                <FileBadge className="w-3.5 h-3.5" />
                <span>Skills Passport Evidence</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* --- KPI Performance Strip --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Verified Credentials
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {verifiedEvidences.length} Passed
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                Stamped on Passport
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Top Score Achieved
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {highestScore > 0 ? `${highestScore}%` : "—"}
              </h3>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                {highestScore >= 80 ? "Advanced Mastery" : highestScore > 0 ? "Passing Grade" : "Take your first test"}
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Assessment Catalog
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {assessments.length} Tests
              </h3>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                Across 11 technical stacks
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Test Categories
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                3 Modes
              </h3>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-0.5">
                Concept • Output • Debugging
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Code2 className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* --- Verified Badges Showcase Banner --- */}
        {verifiedEvidences.length > 0 && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-emerald-500/10 border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Your Verified Assessment Badges ({verifiedEvidences.length})
              </h2>
              <Link
                href="/dashboard/skills-passport"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View on Passport</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {verifiedEvidences.map((e, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/60 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-xs"
                >
                  <Award className="w-4 h-4 text-indigo-600" />
                  <strong>{e.skill}</strong>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                    {e.percentage}% ({e.proficiency})
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* --- Interactive Subject Filter Matrix --- */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {subjects.map((sub) => {
              const count =
                sub === "all"
                  ? assessments.length
                  : assessments.filter(
                      (a) => a.subject.toLowerCase() === sub.toLowerCase()
                    ).length;
              const isSelected = selectedSubject.toLowerCase() === sub.toLowerCase();

              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <span>{sub === "all" ? "All Subjects" : sub}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Difficulty Control Bar */}
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tests by title, subject, or syllabus topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Difficulty Select */}
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Filter className="w-3.5 h-3.5" />
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>

                  <span className="text-slate-400 hidden sm:inline">&bull;</span>

                  <span className="text-[11px] text-slate-500 font-medium">
                    Showing <strong>{filtered.length}</strong> of {assessments.length} Tests
                  </span>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- Assessments Grid --- */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-500">Loading skill assessments...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-16 p-8 space-y-3 border-dashed border-2 border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No assessments match your filters
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try choosing a different technical subject, selecting another difficulty tier, or clearing your search term.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 text-xs"
            >
              Reset Filters
            </Button>
          </Card>
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
                  proficiency={matchingEvidence?.proficiency}
                />
              );
            })}
          </div>
        )}
      </div>
    </StudentPortalLayout>
  );
}
