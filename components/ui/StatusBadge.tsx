import * as React from "react";
import { Badge, BadgeProps } from "./badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Bookmark,
  Send,
  Calendar,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Award,
} from "lucide-react";

export type StatusCategory =
  | "application"
  | "verification"
  | "mentorship"
  | "opportunity"
  | "assessment"
  | "generic";

export interface StatusBadgeProps {
  status: string;
  category?: StatusCategory;
  showIcon?: boolean;
  className?: string;
  label?: string;
}

interface StatusConfig {
  variant: BadgeProps["variant"];
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const statusMap: Record<string, StatusConfig> = {
  // Applications
  saved: { variant: "slate", label: "Saved", icon: Bookmark },
  applied: { variant: "indigo", label: "Applied", icon: Send },
  under_review: { variant: "amber", label: "Under Review", icon: Clock },
  shortlisted: { variant: "emerald", label: "Shortlisted", icon: Sparkles },
  interview_scheduled: { variant: "indigo", label: "Interview Scheduled", icon: Calendar },
  offered: { variant: "emerald", label: "Offer Received", icon: CheckCircle2 },
  rejected: { variant: "danger", label: "Not Selected", icon: XCircle },
  withdrawn: { variant: "slate", label: "Withdrawn", icon: AlertCircle },

  // Skill verification / Passport evidence
  "self-reported": { variant: "slate", label: "Self-Reported", icon: Clock },
  "resume-extracted": { variant: "indigo", label: "Resume-Extracted", icon: FileCheck },
  "project-demonstrated": { variant: "amber", label: "Project-Demonstrated", icon: Sparkles },
  "assessment-verified": { variant: "emerald", label: "Assessment-Verified", icon: Award },
  "externally-verified": { variant: "emerald", label: "Externally Verified", icon: ShieldCheck },

  // Mentorship request / sessions
  pending: { variant: "amber", label: "Pending", icon: Clock },
  accepted: { variant: "emerald", label: "Accepted", icon: CheckCircle2 },
  declined: { variant: "danger", label: "Declined", icon: XCircle },
  scheduled: { variant: "indigo", label: "Scheduled", icon: Calendar },
  completed: { variant: "emerald", label: "Completed", icon: CheckCircle2 },
  cancelled: { variant: "slate", label: "Cancelled", icon: XCircle },

  // Opportunities
  draft: { variant: "slate", label: "Draft", icon: Clock },
  verified: { variant: "emerald", label: "Verified", icon: ShieldCheck },
  published: { variant: "indigo", label: "Published", icon: CheckCircle2 },
  active: { variant: "emerald", label: "Active", icon: CheckCircle2 },
  archived: { variant: "slate", label: "Archived", icon: Clock },

  // Assessments
  passed: { variant: "emerald", label: "Passed", icon: CheckCircle2 },
  failed: { variant: "danger", label: "Needs Practice", icon: AlertCircle },
  in_progress: { variant: "indigo", label: "In Progress", icon: Clock },
};

export function StatusBadge({
  status,
  showIcon = true,
  className,
  label: customLabel,
}: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase().trim();
  const config = statusMap[normalized] || {
    variant: "default",
    label: customLabel || status,
  };

  const Icon = config.icon;
  const displayLabel = customLabel || config.label;

  return (
    <Badge
      variant={config.variant}
      className={cn("inline-flex items-center gap-1.5 font-medium", className)}
    >
      {showIcon && Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span>{displayLabel}</span>
    </Badge>
  );
}

