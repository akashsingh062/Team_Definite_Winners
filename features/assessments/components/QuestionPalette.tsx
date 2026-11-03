"use client";

import React from "react";
import { IAssessmentQuestionPublic, IStudentAnswer } from "@/types/assessment";

interface QuestionPaletteProps {
  questions: IAssessmentQuestionPublic[];
  answers: Record<string, IStudentAnswer>;
  currentIndex: number;
  onSelectIndex: (index: number) => void;
}

export function QuestionPalette({
  questions,
  answers,
  currentIndex,
  onSelectIndex,
}: QuestionPaletteProps) {
  let answeredCount = 0;
  let flaggedCount = 0;
  let unansweredCount = 0;

  questions.forEach((q) => {
    const a = answers[q.id];
    if (a?.isFlaggedForReview) {
      flaggedCount++;
    } else if (a?.selectedOptionId) {
      answeredCount++;
    } else {
      unansweredCount++;
    }
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
        Question Navigation ({questions.length})
      </h4>

      {/* Grid of buttons */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        {questions.map((q, idx) => {
          const answer = answers[q.id];
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(answer?.selectedOptionId);
          const isFlagged = Boolean(answer?.isFlaggedForReview);

          let bg = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
          if (isFlagged) {
            bg = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300";
          } else if (isAnswered) {
            bg = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-300";
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectIndex(idx)}
              className={`h-9 rounded-lg border text-xs font-bold transition flex items-center justify-center ${bg} ${
                isCurrent ? "ring-2 ring-blue-600 scale-105" : "hover:opacity-80"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Answered
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {answeredCount}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Flagged for Review
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {flaggedCount}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            Unanswered
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {unansweredCount}
          </span>
        </div>
      </div>
    </div>
  );
}

