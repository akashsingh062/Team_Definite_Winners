"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  expiresAt: string | Date;
  onExpire?: () => void;
  className?: string;
}

export function CountdownTimer({
  expiresAt,
  onExpire,
  className = "",
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const diff = Math.floor(
      (new Date(expiresAt).getTime() - new Date().getTime()) / 1000
    );
    return Math.max(0, diff);
  });

  useEffect(() => {
    const targetTime = new Date(expiresAt).getTime();

    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((targetTime - new Date().getTime()) / 1000)
      );
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLow = secondsLeft <= 300; // <= 5 minutes
  const isCritical = secondsLeft <= 60; // <= 1 minute

  let colorClasses = "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700";
  if (isCritical) {
    colorClasses = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border-rose-300 animate-pulse";
  } else if (isLow) {
    colorClasses = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border-amber-300";
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold tracking-wider shadow-xs ${colorClasses} ${className}`}
    >
      <Clock className="w-4 h-4 shrink-0" />
      <span>{formatted}</span>
    </div>
  );
}

