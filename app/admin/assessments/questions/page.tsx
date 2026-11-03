"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IAssessmentQuestion } from "@/types/assessment";
import {
  ChevronLeft,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminQuestionBankPage() {
  const [questions, setQuestions] = useState<IAssessmentQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for creating a new question
  const [newTitle, setNewTitle] = useState("");
  const [newText, setNewText] = useState("");
  const [newSnippet, setNewSnippet] = useState("");
  const [newSubject, setNewSubject] = useState("JavaScript");
  const [newTopic, setNewTopic] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [newType, setNewType] = useState<"multiple_choice" | "output_prediction" | "code_debugging">("multiple_choice");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOpt, setCorrectOpt] = useState("opt_a");
  const [newExplanation, setNewExplanation] = useState("");
  const [newMarks, setNewMarks] = useState(5);

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

  useEffect(() => {
    let ignore = false;
    async function loadQuestions() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/assessments/questions");
        const json = await res.json();
        if (!ignore && json.success && json.data) {
          setQuestions(json.data);
        } else if (!json.success) {
          toast.error(json.error || "Failed to load questions.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load questions:", err);
          toast.error("Network error loading questions.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadQuestions();
    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newText || !newTopic || !optA || !optB) {
      toast.error("Please fill in all required question fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const options = [
        { id: "opt_a", text: optA },
        { id: "opt_b", text: optB },
      ];
      if (optC) options.push({ id: "opt_c", text: optC });
      if (optD) options.push({ id: "opt_d", text: optD });

      const payload = {
        title: newTitle,
        questionText: newText,
        codeSnippet: newSnippet,
        subject: newSubject,
        topic: newTopic,
        difficulty: newDifficulty,
        questionType: newType,
        options,
        correctAnswer: correctOpt,
        explanation: newExplanation,
        marks: Number(newMarks) || 5,
        status: "published",
      };

      const res = await fetch("/api/admin/assessments/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setQuestions((prev) => [json.data, ...prev]);
        toast.success("Question created and published!");
        setShowAddModal(false);
        // Reset form
        setNewTitle("");
        setNewText("");
        setNewSnippet("");
        setNewTopic("");
        setOptA("");
        setOptB("");
        setOptC("");
        setOptD("");
        setNewExplanation("");
      } else {
        toast.error(json.error || "Failed to create question.");
      }
    } catch {
      toast.error("Network error creating question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = questions.filter((q) => {
    if (selectedSubject !== "all" && q.subject.toLowerCase() !== selectedSubject.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      return (
        q.title.toLowerCase().includes(term) ||
        q.questionText.toLowerCase().includes(term) ||
        q.topic.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/admin/assessments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Assessments Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Curriculum Question Bank
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse, filter, and author conceptual, output prediction, and debugging questions
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add New Question
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, question text, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
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
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading questions bank...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No questions found for the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((q, idx) => (
              <div
                key={q._id || q.id || idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase">
                      {q.subject}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                      {q.topic}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {q.difficulty}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {q.questionType}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-500">
                    {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {q.title}: {q.questionText}
                </h3>

                {q.codeSnippet && (
                  <div className="rounded-xl bg-slate-900 text-slate-100 p-3 font-mono text-xs overflow-x-auto">
                    <pre>{q.codeSnippet}</pre>
                  </div>
                )}

                {/* Options preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt) => {
                    const isCorrect = q.correctAnswer === opt.id;
                    return (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold"
                            : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span>{opt.text}</span>
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-700 font-bold">
                            ✔ Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 italic">
                  Rationale: {q.explanation}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Question */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Author Assessment Question
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Subject</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      {subjects.filter((s) => s !== "all").map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Closures, Event Loop"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Difficulty</label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Question Title</label>
                  <input
                    type="text"
                    placeholder="Brief concept title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Question Prompt Text</label>
                  <textarea
                    rows={2}
                    placeholder="Full question instructions..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Code Snippet (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Paste code snippet here..."
                    value={newSnippet}
                    onChange={(e) => setNewSnippet(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-slate-100 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block font-semibold">Answer Options</label>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold text-slate-400">Opt A:</span>
                    <input
                      type="text"
                      placeholder="Option A text"
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold text-slate-400">Opt B:</span>
                    <input
                      type="text"
                      placeholder="Option B text"
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold text-slate-400">Opt C:</span>
                    <input
                      type="text"
                      placeholder="Option C text (optional)"
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-12 font-bold text-slate-400">Opt D:</span>
                    <input
                      type="text"
                      placeholder="Option D text (optional)"
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Correct Answer</label>
                    <select
                      value={correctOpt}
                      onChange={(e) => setCorrectOpt(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="opt_a">Option A</option>
                      <option value="opt_b">Option B</option>
                      <option value="opt_c">Option C</option>
                      <option value="opt_d">Option D</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Marks</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newMarks}
                      onChange={(e) => setNewMarks(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Solution Explanation</label>
                  <textarea
                    rows={2}
                    placeholder="Explanation shown to students post-submission..."
                    value={newExplanation}
                    onChange={(e) => setNewExplanation(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    {isSubmitting ? "Publishing..." : "Publish Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

