"use client";

import * as React from "react";
import { useState } from "react";
import { FeedbackHelpfulness } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import {
  X,
  Star,
  CheckCircle,
  Loader2,
  HeartHandshake,
} from "lucide-react";

interface FeedbackModalProps {
  sessionId: string;
  mentorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function FeedbackModal({
  sessionId,
  mentorName,
  isOpen,
  onClose,
  onSuccess,
}: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [helpfulness, setHelpfulness] =
    useState<FeedbackHelpfulness>("very_helpful");
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const availableTags = [
    "Actionable Advice",
    "Detailed Resume Feedback",
    "Great Listener",
    "Technical Depth",
    "Interview Preparation",
    "Inspiring & Encouraging",
    "Realistic Guidance",
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mentorship/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          rating,
          helpfulness,
          feedback,
          tags: selectedTags,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit feedback");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 animate-bounce">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Thank You!
            </h3>
            <p className="text-xs text-slate-600">
              Your feedback helps {mentorName} and fellow students on the platform.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">
                <HeartHandshake className="h-4 w-4" />
                <span>Session Review</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Rate your session with {mentorName}
              </h2>
              <p className="text-xs text-slate-500">
                How was your mentorship session experience?
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* Star Rating */}
            <div className="flex flex-col items-center justify-center py-2 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 ${
                        (hoveredRating !== null ? hoveredRating >= star : rating >= star)
                          ? "fill-amber-400 text-amber-500"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-700 mt-1">
                {rating === 5
                  ? "Outstanding!"
                  : rating === 4
                  ? "Very Helpful"
                  : rating === 3
                  ? "Satisfactory"
                  : rating === 2
                  ? "Needs Improvement"
                  : "Disappointing"}
              </span>
            </div>

            {/* Helpfulness */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                How impactful was this guidance?
              </label>
              <select
                value={helpfulness}
                onChange={(e) =>
                  setHelpfulness(e.target.value as FeedbackHelpfulness)
                }
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="extremely_helpful">Extremely Helpful</option>
                <option value="very_helpful">Very Helpful</option>
                <option value="moderately_helpful">Moderately Helpful</option>
                <option value="slightly_helpful">Slightly Helpful</option>
                <option value="not_helpful">Not Helpful</option>
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Highlight Strengths
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        active
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Written Feedback & Key Takeaways
              </label>
              <textarea
                rows={3}
                placeholder="What did you learn? What actions will you take next?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                Skip
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

