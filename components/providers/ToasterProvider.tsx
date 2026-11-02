"use client";

import { Toaster as SonnerToaster } from "sonner";

export function ToasterProvider() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "border border-slate-200 bg-white text-slate-900 shadow-md rounded-xl font-sans text-sm",
          description: "text-slate-500",
          actionButton: "bg-indigo-600 text-white font-medium hover:bg-indigo-700",
          cancelButton: "bg-slate-100 text-slate-700 hover:bg-slate-200",
          error: "text-rose-600",
          success: "text-emerald-700",
          warning: "text-amber-700",
          info: "text-indigo-700",
        },
      }}
    />
  );
}

