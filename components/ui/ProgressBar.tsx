import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  showLabel?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "indigo" | "emerald" | "amber" | "rose" | "slate";
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const variantClasses = {
  indigo: "bg-indigo-600",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-600",
};

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  label,
  size = "md",
  variant = "indigo",
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs font-medium text-slate-700">
          <span>{label || "Progress"}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-100",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

