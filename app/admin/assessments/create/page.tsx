"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IAssessmentQuestion } from "@/types/assessment";
import {
  ChevronLeft,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  ShieldAlert,
  Loader2,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("JavaScript");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingThreshold, setPassingThreshold] = useState(60);
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced" | "Mixed">("Intermediate");
  const [retakeCooldownHours, setRetakeCooldownHours] = useState(24);
  const [topicsInput, setTopicsInput] = useState("");

  // Questions available for subject
  const [availableQuestions, setAvailableQuestions] = useState<IAssessmentQuestion[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

  const subjects = [
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

  // Fetch available questions when subject changes
  useEffect(() => {
    let ignore = false;
    async function loadSubjectQuestions() {
      try {
        setIsLoadingQuestions(true);
        const res = await fetch(`/api/admin/assessments/questions?subject=${encodeURIComponent(subject)}`);
        const json = await res.json();
        if (!ignore && json.success && Array.isArray(json.data)) {
          setAvailableQuestions(json.data);
          // By default, select all available questions for this subject
          setSelectedQuestionIds(json.data.map((q: IAssessmentQuestion) => (q._id || q.id) as string));
        }
      } catch (err) {
        console.error("Error loading subject questions:", err);
      } finally {
        if (!ignore) setIsLoadingQuestions(false);
      }
    }

    loadSubjectQuestions();
    return () => {
      ignore = true;
    };
  }, [subject]);

  const toggleQuestionSelection = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const selectAllQuestions = () => {
    setSelectedQuestionIds(availableQuestions.map((q) => (q._id || q.id) as string));
  };

  const deselectAllQuestions = () => {
    setSelectedQuestionIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both an assessment title and a description.");
      return;
    }

    const topics = topicsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        subject,
        description: description.trim(),
        durationMinutes: Number(durationMinutes) || 30,
        passingThreshold: Number(passingThreshold) || 60,
        difficulty,
        retakeCooldownHours: Number(retakeCooldownHours) || 24,
        topics: topics.length > 0 ? topics : [subject],
        questionReferences: selectedQuestionIds,
        status: "published",
      };

      const res = await fetch("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Assessment created and published successfully!");
        router.push("/admin/assessments");
      } else {
        toast.error(json.error || "Failed to create assessment.");
      }
    } catch {
      toast.error("Network error while creating assessment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/admin/assessments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Assessments Dashboard
        </Link>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Award className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Configure New Practical Assessment
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define duration, passing threshold, target technical subject, and question curriculum.
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              Assessment Meta & Subject
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Assessment Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. JavaScript Core Readiness Assessment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description & Target Audience <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe what practical concepts this test evaluates..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Pass Threshold (%)
                </label>
                <input
                  type="number"
                  min={30}
                  max={100}
                  value={passingThreshold}
                  onChange={(e) => setPassingThreshold(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  Cooldown (hrs)
                </label>
                <input
                  type="number"
                  min={0}
                  max={720}
                  value={retakeCooldownHours}
                  onChange={(e) => setRetakeCooldownHours(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Key Topics Covered (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Scope, Promises, Closures, Event Loop, Async/Await"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Question Curriculum Selection */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Select Questions from Bank ({selectedQuestionIds.length} Selected)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose specific questions or leave all selected for full subject coverage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllQuestions}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={deselectAllQuestions}
                  className="text-xs font-semibold text-slate-500 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {isLoadingQuestions ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin mb-2" />
                <p className="text-xs text-slate-500">Loading {subject} questions...</p>
              </div>
            ) : availableQuestions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No questions found in bank for {subject}. Please author some questions in the Question Bank first, or create the assessment anyway to auto-link future questions.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
                {availableQuestions.map((q) => {
                  const qId = (q._id || q.id) as string;
                  const isChecked = selectedQuestionIds.includes(qId);
                  return (
                    <div
                      key={qId}
                      onClick={() => toggleQuestionSelection(qId)}
                      className={`p-3.5 rounded-xl cursor-pointer transition flex items-start gap-3 ${
                        isChecked
                          ? "bg-blue-50/50 dark:bg-blue-950/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // handled by div
                        className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                            {q.topic}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {q.difficulty}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {q.questionType}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {q.marks} pts
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {q.title}: {q.questionText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/admin/assessments"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Configuration...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Publish Assessment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

