import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: "indigo" | "emerald" | "amber" | "rose" | "slate" | "violet" | "blue";
  badge?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

const colorVariants = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  slate: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "indigo",
  badge,
  trend,
  onClick,
  className,
}: StatCardProps) {
  const styles = colorVariants[iconColor] || colorVariants.indigo;

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all",
        onClick && "cursor-pointer hover:border-slate-300 hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-slate-900 truncate">
            {value}
          </div>
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
              styles.bg,
              styles.text,
              styles.border
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(description || trend || badge) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
          {description && (
            <p className="text-slate-500 truncate">{description}</p>
          )}
          {trend && (
            <span
              className={cn(
                "font-semibold whitespace-nowrap",
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value} {trend.label && <span className="font-normal text-slate-400">({trend.label})</span>}
            </span>
          )}
          {badge && <div className="shrink-0">{badge}</div>}
        </div>
      )}
    </div>
  );
}

