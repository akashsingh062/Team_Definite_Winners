"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { IMentorshipNote, NoteCategory, NoteVisibility } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  FileText,
  Plus,
  Lock,
  Users,
  CheckCircle2,
  Loader2,
  BookOpen,
} from "lucide-react";

interface SessionNotesModalProps {
  sessionId: string;
  mentorName: string;
  isMentor?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionNotesModal({
  sessionId,
  mentorName,
  isMentor = false,
  isOpen,
  onClose,
}: SessionNotesModalProps) {
  const [notes, setNotes] = useState<IMentorshipNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Note state
  const [category, setCategory] = useState<NoteCategory>("general_note");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [actionItemInput, setActionItemInput] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [visibility, setVisibility] =
    useState<NoteVisibility>("private_mentor_student");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadNotes() {
      if (!isOpen || !sessionId) return;
      try {
        const res = await fetch(`/api/mentorship/sessions/${sessionId}/notes`);
        const data = await res.json();
        if (!ignore && data.success) {
          setNotes(data.data);
        }
      } catch (err) {
        console.error("Failed to load notes", err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadNotes();
    return () => {
      ignore = true;
    };
  }, [isOpen, sessionId]);

  const handleAddActionItem = () => {
    if (actionItemInput.trim()) {
      setActionItems([...actionItems, actionItemInput.trim()]);
      setActionItemInput("");
    }
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/mentorship/sessions/${sessionId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: title.trim(),
          content: content.trim(),
          actionItems,
          visibility,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNotes([...notes, data.data]);
        setShowAddForm(false);
        setTitle("");
        setContent("");
        setActionItems([]);
      }
    } catch (err) {
      console.error("Failed to save note", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-slate-900">
                  Mentorship Guidance & Notes
                </h3>
                <p className="text-xs text-slate-500">Session with {mentorName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Notes list */}
          {loading ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : notes.length === 0 && !showAddForm ? (
            <div className="py-10 text-center">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                No guidance notes recorded yet.
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Structured takeaways, action points, and recommendations will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {notes.map((note) => (
                <div
                  key={note._id || note.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">
                        {note.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {note.category.replace("_", " ")}
                      </Badge>
                    </div>
                    {note.visibility === "mentor_only" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm border border-amber-200">
                        <Lock className="h-2.5 w-2.5" />
                        Private Note
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm border border-indigo-200">
                        <Users className="h-2.5 w-2.5" />
                        Shared
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 whitespace-pre-line">
                    {note.content}
                  </p>
                  {note.actionItems && note.actionItems.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/80">
                      <p className="text-[11px] font-semibold text-slate-800 mb-1">
                        Action Items:
                      </p>
                      <ul className="space-y-1">
                        {note.actionItems.map((item, i) => (
                          <li
                            key={i}
                            className="text-xs text-slate-600 flex items-start gap-1.5"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Note Form */}
          {showAddForm && (
            <form
              onSubmit={handleSaveNote}
              className="space-y-3 p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 mb-4"
            >
              <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                Add Guidance Note
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NoteCategory)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                  >
                    <option value="resume_feedback">Resume Feedback</option>
                    <option value="project_feedback">Project Feedback</option>
                    <option value="learning_recommendation">
                      Learning Recommendation
                    </option>
                    <option value="career_advice">Career Advice</option>
                    <option value="interview_prep">Interview Prep</option>
                    <option value="general_note">General Note</option>
                  </select>
                </div>
                {isMentor && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Visibility
                    </label>
                    <select
                      value={visibility}
                      onChange={(e) =>
                        setVisibility(e.target.value as NoteVisibility)
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800"
                    >
                      <option value="private_mentor_student">
                        Visible to Student & Mentor
                      </option>
                      <option value="mentor_only">Private to Mentor Only</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Title
                </label>
                <Input
                  placeholder="e.g. ATS Resume Keywords to Add"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-xs h-8"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Guidance Content
                </label>
                <textarea
                  rows={2}
                  placeholder="Specific suggestions and feedback..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-md border border-slate-200 p-2 text-xs text-slate-800"
                  required
                />
              </div>

              {/* Action Item Adding */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  Action Items (Optional)
                </label>
                <div className="flex gap-1.5">
                  <Input
                    placeholder="e.g. Add Docker compose config to GitHub"
                    value={actionItemInput}
                    onChange={(e) => setActionItemInput(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddActionItem}
                    className="h-8 text-xs shrink-0"
                  >
                    Add
                  </Button>
                </div>
                {actionItems.length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {actionItems.map((item, idx) => (
                      <li
                        key={idx}
                        className="text-[11px] text-slate-600 flex items-center justify-between"
                      >
                        <span>• {item}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setActionItems(actionItems.filter((_, i) => i !== idx))
                          }
                          className="text-rose-500 hover:text-rose-700 text-xs px-1"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  disabled={saving}
                  className="text-xs h-7"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={saving}
                  className="text-xs h-7 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {saving ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Footer controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {!showAddForm ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Guidance Note
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-8"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
