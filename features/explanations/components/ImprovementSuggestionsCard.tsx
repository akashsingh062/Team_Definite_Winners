"use client";

import * as React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowRight,
  BookOpen,
  Map,
  Code2,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IImprovementSuggestion } from "@/types/explanation";

interface ImprovementSuggestionsCardProps {
  suggestions: IImprovementSuggestion[];
}

export function ImprovementSuggestionsCard({
  suggestions,
}: ImprovementSuggestionsCardProps) {
  if (suggestions.length === 0) {
    return (
      <Card className="border border-emerald-100 bg-emerald-50/40 shadow-2xs">
        <CardContent className="p-6 text-center space-y-1.5">
          <p className="text-sm font-bold text-emerald-950">
            Exceptional Alignment!
          </p>
          <p className="text-xs text-emerald-800">
            You fulfill all core skill and qualification criteria for this opportunity. Ready to submit your application.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-base font-bold text-slate-900">
            Actionable Next Steps to Maximize Your Match
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500 mt-0.5">
          Direct pathways connected to your Skill Gap Analyzer, Learning Roadmap, and Portfolio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <div className="space-y-3">
          {suggestions.map((item) => {
            let icon = <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />;
            if (item.type === "milestone") {
              icon = <Map className="w-4 h-4 text-emerald-600 shrink-0" />;
            } else if (item.type === "project") {
              icon = <Code2 className="w-4 h-4 text-purple-600 shrink-0" />;
            } else if (item.type === "profile") {
              icon = <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />;
            }

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-bold text-xs text-slate-900">
                      {item.title}
                    </span>
                    {item.isMandatory ? (
                      <Badge variant="amber" className="text-[10px]">
                        High Priority
                      </Badge>
                    ) : (
                      <Badge variant="slate" className="text-[10px]">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-6">
                    {item.description}
                  </p>
                </div>

                <div className="shrink-0 pl-6 sm:pl-0">
                  <Link href={item.actionUrl}>
                    <Button
                      size="sm"
                      className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-2xs w-full sm:w-auto"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
