"use client";

import * as React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmationDialogProps) {
  const iconConfig = {
    danger: {
      Icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-100",
      buttonVariant: "danger" as const,
    },
    warning: {
      Icon: AlertTriangle,
      color: "text-amber-600 bg-amber-50 border-amber-100",
      buttonVariant: "secondary" as const,
    },
    primary: {
      Icon: Info,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      buttonVariant: "primary" as const,
    },
  }[variant];

  const Icon = iconConfig.Icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
            iconConfig.color
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={iconConfig.buttonVariant}
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

