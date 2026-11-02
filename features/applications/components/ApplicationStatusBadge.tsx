"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { ApplicationStatus } from "@/types/application";
import {
  Bookmark,
  Calendar,
  Send,
  FileCheck,
  UserCheck,
  Gift,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ClockAlert,
} from "lucide-react";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "md" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function ApplicationStatusBadge({
  status,
  size = "md",
  className = "",
  showIcon = true,
}: ApplicationStatusBadgeProps) {
  const statusConfig: Record<
    ApplicationStatus,
    {
      label: string;
      variant: "default" | "indigo" | "emerald" | "amber" | "slate" | "danger";
      icon: React.ReactNode;
      customClasses?: string;
    }
  > = {
    saved: {
      label: "Saved",
      variant: "slate",
      icon: <Bookmark className="w-3 h-3" />,
    },
    planning: {
      label: "Planning to Apply",
      variant: "indigo",
      icon: <Calendar className="w-3 h-3" />,
    },
    applied: {
      label: "Applied",
      variant: "indigo",
      icon: <Send className="w-3 h-3" />,
      customClasses: "bg-purple-50 text-purple-700 border-purple-200",
    },
    assessment: {
      label: "Assessment",
      variant: "indigo",
      icon: <FileCheck className="w-3 h-3" />,
    },
    interview: {
      label: "Interview",
      variant: "amber",
      icon: <UserCheck className="w-3 h-3" />,
    },
    offer_received: {
      label: "Offer Received",
      variant: "emerald",
      icon: <Gift className="w-3 h-3" />,
    },
    selected: {
      label: "Selected",
      variant: "emerald",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    rejected: {
      label: "Rejected",
      variant: "danger",
      icon: <XCircle className="w-3 h-3" />,
    },
    withdrawn: {
      label: "Withdrawn",
      variant: "slate",
      icon: <RotateCcw className="w-3 h-3" />,
    },
    expired: {
      label: "Expired",
      variant: "slate",
      icon: <ClockAlert className="w-3 h-3" />,
      customClasses: "bg-slate-100 text-slate-500 border-slate-200 line-through",
    },
  };

  const config = statusConfig[status] || statusConfig.saved;

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.2",
    md: "text-xs px-2.5 py-0.5",
    lg: "text-sm px-3 py-1 font-semibold",
  };

  return (
    <Badge
      variant={config.variant}
      className={`gap-1.5 font-medium shrink-0 ${sizeClasses[size]} ${config.customClasses || ""} ${className}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
