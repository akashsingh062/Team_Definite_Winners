import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface DashboardHeaderProps {
  userName: string;
  completeness: number;
}

export function DashboardHeader({
  userName,
  completeness,
}: DashboardHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 md:p-8 text-white shadow-lg">
      {/* Background subtle decoration */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="indigo" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Matching Engine Active
            </Badge>
            <Badge variant="emerald" className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Fairness Audited
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-indigo-200 text-sm max-w-xl leading-relaxed">
            Your profile is analyzed across skill breadth, project evidence, and career preferences to connect you with high-signal employment opportunities.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-indigo-200">Profile Readiness</span>
              <span className="font-bold text-white">{completeness}%</span>
            </div>
            <div className="w-36 h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>

          <Link href="/student/profile">
            <Button
              variant="accent"
              size="sm"
              className="whitespace-nowrap gap-1.5 shadow-sm"
            >
              Complete Profile
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

