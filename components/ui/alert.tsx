import * as React from "react";
import { Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const icons = {
    info: <Info className="h-5 w-5 text-indigo-600 shrink-0" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
  };

  const variantStyles = {
    info: "bg-indigo-50/70 border-indigo-200 text-indigo-900",
    success: "bg-emerald-50/70 border-emerald-200 text-emerald-900",
    warning: "bg-amber-50/70 border-amber-200 text-amber-900",
    error: "bg-rose-50/70 border-rose-200 text-rose-900",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-sm leading-relaxed",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="space-y-1">
        {title && <h5 className="font-semibold">{title}</h5>}
        <div className="text-slate-700">{children}</div>
      </div>
    </div>
  );
}

