import * as React from "react";
import Link from "next/link";
import { LucideIcon, HelpCircle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    variant?: "primary" | "secondary" | "outline";
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon = HelpCircle,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-xs",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 border border-indigo-100/80">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {action && (
            action.href ? (
              <Link href={action.href} className="w-full sm:w-auto">
                <Button variant={action.variant || "primary"} className="w-full sm:w-auto">
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant={action.variant || "primary"}
                onClick={action.onClick}
                className="w-full sm:w-auto"
              >
                {action.label}
              </Button>
            )
          )}

          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href} className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
                className="w-full sm:w-auto"
              >
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

