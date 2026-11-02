"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { EligibilityStatus } from "@/types/matching";
import { cn } from "@/lib/utils";

interface EligibilityBadgeProps {
  status: EligibilityStatus;
  size?: "sm" | "md";
  className?: string;
}

export function EligibilityBadge({
  status,
  size = "md",
  className,
}: EligibilityBadgeProps) {
  const config: Record<
    EligibilityStatus,
    { label: string; icon: React.ComponentType<{ className?: string }>; style: string }
  > = {
    eligible: {
      label: "Eligible",
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    potentially_eligible: {
      label: "Potentially Eligible",
      icon: AlertTriangle,
      style: "bg-amber-50 text-amber-700 border-amber-200",
    },
    not_eligible: {
      label: "Not Eligible",
      icon: XCircle,
      style: "bg-rose-50 text-rose-700 border-rose-200",
    },
    insufficient_information: {
      label: "Info Needed",
      icon: HelpCircle,
      style: "bg-slate-50 text-slate-700 border-slate-200",
    },
  };

  const item = config[status] || config.insufficient_information;
  const Icon = item.icon;

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-semibold gap-1",
    md: "px-2.5 py-1 text-xs font-semibold gap-1.5",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border shadow-2xs",
        item.style,
        sizeStyles,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{item.label}</span>
    </span>
  );
}

