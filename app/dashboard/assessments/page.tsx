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
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchSubject = a.subject.toLowerCase().includes(q);
        const matchTopics = a.topics?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchSubject && !matchTopics) return false;
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
              <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
                <Award className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Practical Skill Readiness Assessments
              </h1>
              <Badge variant="indigo" className="text-xs px-2.5 py-0.5 font-bold">
                NexSkill AI Testing Engine
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              Demonstrate measurable competency through timed technical assessments. Scoring $\ge 70\%$ automatically creates verified credentials stamped directly onto your Digital Skills Passport.
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="gap-1.5 text-xs text-slate-700 border-slate-300 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ({activeFilterCount})</span>
              </Button>
            )}

            <Link href="/dashboard/skills-passport">
              <Button variant="primary" size="sm" className="gap-1.5 text-xs font-semibold px-4">
                <FileBadge className="w-3.5 h-3.5" />
                <span>Skills Passport Evidence</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* --- KPI Performance Strip --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center justify-between hover:border-emerald-300 transition rounded-2xl">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Verified Credentials
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {verifiedEvidences.length} Passed
              </h3>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
                Stamped on Passport
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center justify-between hover:border-indigo-300 transition rounded-2xl">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Top Score Achieved
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {highestScore > 0 ? `${highestScore}%` : "—"}
              </h3>
              <p className="text-[11px] text-indigo-700 font-bold mt-0.5">
                {highestScore >= 80 ? "Advanced Mastery" : highestScore > 0 ? "Passing Grade" : "Take your first test"}
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center justify-between hover:border-blue-300 transition rounded-2xl">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Assessment Catalog
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                {assessments.length} Tests
              </h3>
              <p className="text-[11px] text-blue-700 font-bold mt-0.5">
                Across 11 technical stacks
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200/90 shadow-xs flex items-center justify-between hover:border-purple-300 transition rounded-2xl">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Question Modes
              </p>
              <h3 className="text-2xl font-black text-slate-900 mt-0.5">
                3 Formats
              </h3>
              <p className="text-[11px] text-purple-700 font-bold mt-0.5">
                Concept • Output • Debugging
              </p>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100">
              <Code2 className="w-5 h-5" />
            </div>
          </Card>
        </div>

        {/* --- Verified Badges Showcase Banner --- */}
        {verifiedEvidences.length > 0 && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-emerald-500/10 border border-indigo-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-indigo-950 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Your Verified Assessment Badges ({verifiedEvidences.length})
              </h2>
              <Link
                href="/dashboard/skills-passport"
                className="text-[11px] font-bold text-indigo-700 hover:underline flex items-center gap-1"
              >
                <span>View on Passport</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              {verifiedEvidences.map((e, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white border border-indigo-200 text-xs font-bold text-slate-900 shadow-2xs"
                >
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>{e.skill}</span>
                  <span className="text-[11px] text-emerald-800 font-bold px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200">
                    {e.percentage}% ({e.proficiency})
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* --- Interactive Subject Filter Matrix --- */}
        <div className="space-y-3.5">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{sub === "all" ? "All Subjects" : sub}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Difficulty Control Bar */}
          <Card className="border-slate-200/90 bg-white shadow-xs rounded-2xl">
            <CardContent className="p-3.5 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search tests by title, subject, or syllabus topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs font-medium transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Difficulty Select */}
                  <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium cursor-pointer"
                    >
                      <option value="all">All Difficulties</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Mixed">Mixed</option>
                    </select>
                  </div>

                  <span className="text-slate-300 hidden sm:inline">&bull;</span>

                  <span className="text-[11px] text-slate-600 font-semibold">
                    Showing <strong>{filtered.length}</strong> of {assessments.length} Tests
                  </span>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold transition"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-6 rounded-3xl border border-slate-200 bg-white space-y-4 animate-pulse shadow-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="h-5 w-20 bg-slate-200 rounded-full" />
                  <div className="h-5 w-24 bg-slate-200 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-3/4 bg-slate-200 rounded-lg" />
                  <div className="h-4 w-full bg-slate-200 rounded" />
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="h-5 w-16 bg-slate-200 rounded-lg" />
                  <div className="h-5 w-16 bg-slate-200 rounded-lg" />
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="h-5 w-24 bg-slate-200 rounded" />
                  <div className="h-8 w-24 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-16 p-8 space-y-3.5 border-dashed border-2 border-slate-200 bg-white rounded-3xl">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">
              No assessments match your filters
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Try choosing a different technical subject, selecting another difficulty tier, or clearing your search term to see more tests.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-2 text-xs font-semibold px-4 py-2 border-slate-300 text-slate-700"
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
