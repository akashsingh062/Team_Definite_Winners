import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "indigo" | "emerald" | "amber" | "slate" | "danger";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

