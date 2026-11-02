import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, id, options, children, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-slate-700 select-none"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined
          }
          className={cn(
            "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors cursor-pointer",
            "border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="text-xs text-rose-600 font-medium">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="text-xs text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
