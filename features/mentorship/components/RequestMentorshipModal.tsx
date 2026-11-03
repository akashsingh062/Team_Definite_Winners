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
  Briefcase,
  UserCheck,
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
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
              <CheckCircle className="h-9 w-9" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Request Delivered!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your mentorship request has been submitted to <strong className="text-slate-900">{mentor.displayName}</strong>. You will receive a notification as soon as they review it.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>1-on-1 Mentorship Request</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Connect with {mentor.displayName}
              </h2>
              <p className="text-xs font-medium text-slate-600 mt-0.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{mentor.currentRole} at <strong className="text-slate-800">{mentor.organization}</strong></span>
              </p>
            </div>

            {error && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            {/* Mentorship Topic */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Mentorship Topic / Focus Area <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. System Design Interview Prep, Full-Stack Architecture Review"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Career Goal */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Your Primary Career Goal <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Land a Senior Frontend role at a product tech company within 6 months"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Session Type */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Preferred Mentorship Format
              </label>
              <select
                value={preferredSessionType}
                onChange={(e) =>
                  setPreferredSessionType(
                    e.target.value as MentorshipSessionType
                  )
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
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
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Introduction & Specific Questions <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Briefly introduce your current experience level and outline 2-3 specific questions you'd like to ask..."
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                required
                className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Language & Preferred Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Preferred Language
                </label>
                <input
                  type="text"
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  placeholder="e.g. English, Hindi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Suggested Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={preferredDate1}
                  onChange={(e) => setPreferredDate1(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Submitting...
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
