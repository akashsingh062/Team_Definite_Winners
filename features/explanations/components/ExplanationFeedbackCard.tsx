"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExplanationFeedbackReason } from "@/types/explanation";

interface ExplanationFeedbackCardProps {
  opportunityId: string;
  initialFeedback?: {
    feedbackType: "helpful" | "not_helpful";
    reason?: string;
    comment?: string;
  };
}

const FEEDBACK_REASONS: ExplanationFeedbackReason[] = [
  "Incorrect information",
  "Missing information",
  "Explanation is unclear",
  "Score breakdown is confusing",
  "Other",
];

export function ExplanationFeedbackCard({
  opportunityId,
  initialFeedback,
}: ExplanationFeedbackCardProps) {
  const [feedbackType, setFeedbackType] = React.useState<
    "helpful" | "not_helpful" | null
  >(initialFeedback?.feedbackType || null);
  const [selectedReason, setSelectedReason] = React.useState<ExplanationFeedbackReason | "">(
    (initialFeedback?.reason as ExplanationFeedbackReason) || ""
  );
  const [comment, setComment] = React.useState(initialFeedback?.comment || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasSubmitted, setHasSubmitted] = React.useState(Boolean(initialFeedback));

  const handleSelectHelpful = async () => {
    setFeedbackType("helpful");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/explanations/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          feedbackType: "helpful",
        }),
      });
      const json = await res.json();
      if (json.success) {
        setHasSubmitted(true);
        toast.success("Thank you for your feedback!");
      } else {
        toast.error(json.message || "Failed to submit feedback");
      }
    } catch {
      toast.error("Network error while submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitNotHelpful = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/explanations/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId,
          feedbackType: "not_helpful",
          reason: selectedReason || undefined,
          comment: comment.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setHasSubmitted(true);
        toast.success("Thank you! Your feedback helps us improve our explainability.");
      } else {
        toast.error(json.message || "Failed to submit feedback");
      }
    } catch {
      toast.error("Network error while submitting feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border border-slate-200/90 shadow-2xs bg-slate-50/60">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>Was this explanation transparent and helpful?</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Your feedback is audited to ensure explainability algorithms remain fair and transparent.
            </p>
          </div>

          {!hasSubmitted ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectHelpful}
                disabled={isSubmitting}
                className={`text-xs gap-1.5 cursor-pointer ${
                  feedbackType === "helpful"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                    : "hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Helpful</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setFeedbackType("not_helpful")}
                disabled={isSubmitting}
                className={`text-xs gap-1.5 cursor-pointer ${
                  feedbackType === "not_helpful"
                    ? "bg-rose-50 text-rose-700 border-rose-300"
                    : "hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                <span>Not Helpful</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Feedback submitted</span>
            </div>
          )}
        </div>

        {/* Not helpful details form */}
        {feedbackType === "not_helpful" && !hasSubmitted && (
          <form
            onSubmit={handleSubmitNotHelpful}
            className="mt-4 pt-3 border-t border-slate-200 space-y-3"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Please tell us what can be improved:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FEEDBACK_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedReason === reason
                        ? "bg-indigo-50 border-indigo-300 text-indigo-950 font-medium"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="feedbackReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <textarea
                placeholder="Optional: Provide more details to help us improve..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setFeedbackType(null)}
                className="text-xs text-slate-500"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Submit Feedback</span>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

