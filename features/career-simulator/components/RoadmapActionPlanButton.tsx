"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RoadmapActionPlanButtonProps {
  careerTitle: string;
  missingSkills: string[];
}

export function RoadmapActionPlanButton({
  careerTitle,
  missingSkills,
}: RoadmapActionPlanButtonProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleCreateRoadmap = () => {
    setIsNavigating(true);
    // Navigate to roadmap dashboard with target role preselected
    const params = new URLSearchParams();
    params.set("targetRole", careerTitle);
    if (missingSkills.length > 0) {
      params.set("skills", missingSkills.slice(0, 5).join(","));
    }

    router.push(`/dashboard/roadmap?${params.toString()}`);
  };

  return (
    <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900">
            Generate Personalized Learning Roadmap
          </h4>
        </div>
        <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
          Convert the {missingSkills.length} missing skill(s) for {careerTitle} into a structured weekly milestone plan with curated learning resources and practical projects.
        </p>
      </div>

      <Button
        variant="primary"
        size="md"
        onClick={handleCreateRoadmap}
        disabled={isNavigating}
        className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {isNavigating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading Roadmap...</span>
          </>
        ) : (
          <>
            <span>Create Action Plan</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

