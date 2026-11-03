"use client";

import * as React from "react";
import { useState } from "react";
import { IMentorProfile, MentorshipSessionType } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Send,
  Calendar,
  Sparkles,
  HelpCircle,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface RequestMentorshipModalProps {
  mentor: IMentorProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RequestMentorshipModal({
  mentor,
  isOpen,
  onClose,
  onSuccess,
}: RequestMentorshipModalProps) {
  const [careerGoal, setCareerGoal] = useState("");
  const [topic, setTopic] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [preferredSessionType, setPreferredSessionType] =
    useState<MentorshipSessionType>("1_on_1_advisory");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [preferredDate1, setPreferredDate1] = useState("");
  const [preferredDate2, setPreferredDate2] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !mentor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerGoal.trim() || !topic.trim() || !introduction.trim()) {
      setError("Please fill in your career goal, mentorship topic, and introduction.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const preferredDates = [preferredDate1, preferredDate2].filter(Boolean);

      const res = await fetch("/api/mentorship/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: mentor._id || mentor.userId,
          careerGoal,
          topic,
          introduction,
          preferredSessionType,
          preferredLanguage,
          preferredDates,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Request Sent!</h3>
            <p className="text-sm text-slate-600">
              Your mentorship request has been forwarded to {mentor.displayName}. You will be notified when they respond.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Request Mentorship
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Connect with {mentor.displayName}
              </h2>
              <p className="text-xs text-slate-500">
                {mentor.currentRole} at {mentor.organization}
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* Mentorship Topic */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mentorship Topic <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g., Resume Review for Software Engineering Roles, System Design Guidance"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Career Goal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Primary Career Goal <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g., Land a full-stack internship at a high-growth tech startup by Summer 2026"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Mentorship Format
              </label>
              <select
                value={preferredSessionType}
                onChange={(e) =>
                  setPreferredSessionType(
                    e.target.value as MentorshipSessionType
                  )
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="1_on_1_advisory">1-on-1 Career Advisory (30-45 mins)</option>
                <option value="resume_review">Resume & Portfolio Review</option>
                <option value="project_critique">Technical Project Critique</option>
                <option value="mock_interview">Mock Interview Preparation</option>
                <option value="general_qa">General Q&A Session</option>
              </select>
            </div>

            {/* Introduction & Questions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Introduction & Specific Questions <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Tell the mentor briefly about your current studies/experience and 2-3 specific questions you'd like to ask..."
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Language & Preferred Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Language
                </label>
                <Input
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  placeholder="e.g. English, Hindi"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Suggested Date (Optional)
                </label>
                <Input
                  type="date"
                  value={preferredDate1}
                  onChange={(e) => setPreferredDate1(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-1.5" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

