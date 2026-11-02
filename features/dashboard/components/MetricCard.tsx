import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  iconColor?: "indigo" | "emerald" | "amber" | "slate";
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = "indigo",
  trend,
}: MetricCardProps) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className={cn("p-2 rounded-lg", colorMap[iconColor])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {(description || trend) && (
            <div className="mt-1 flex items-center gap-2 text-xs">
              {trend && (
                <span
                  className={cn(
                    "font-semibold",
                    trend.isPositive ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {trend.value}
                </span>
              )}
              {description && (
                <span className="text-slate-500">{description}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

