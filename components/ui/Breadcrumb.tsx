import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items, className, ...props }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-xs text-slate-500", className)}
      {...props}
    >
      <ol className="flex items-center flex-wrap gap-1.5">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />}
              {isLast || !item.href ? (
                <span className={cn("font-medium", isLast ? "text-slate-800" : "text-slate-500")}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-indigo-600 transition-colors font-normal"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

