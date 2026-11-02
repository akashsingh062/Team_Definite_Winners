"use client";

import * as React from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface SaveOpportunityButtonProps {
  opportunityId: string;
  initialSaved?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "ghost" | "primary" | "secondary";
  showLabel?: boolean;
  className?: string;
  onSavedChange?: (isSaved: boolean) => void;
}

export function SaveOpportunityButton({
  opportunityId,
  initialSaved = false,
  size = "sm",
  variant = "outline",
  showLabel = true,
  className = "",
  onSavedChange,
}: SaveOpportunityButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = React.useState(initialSaved);
  const [isLoading, setIsLoading] = React.useState(false);

  // Check saved state from API if authenticated and not already marked saved
  React.useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated || !opportunityId || initialSaved) return;

    async function checkSavedStatus() {
      try {
        const res = await fetch(`/api/applications/check?opportunityId=${opportunityId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setIsSaved(Boolean(json.data.isSaved));
        }
      } catch {
        // Silently ignore check errors
      }
    }

    checkSavedStatus();
    return () => {
      isMounted = false;
    };
  }, [opportunityId, isAuthenticated, initialSaved]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please log in to save opportunities to your tracker.");
      return;
    }

    setIsLoading(true);
    const nextSavedState = !isSaved;

    try {
      if (nextSavedState) {
        // Save
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opportunityId }),
        });
        const json = await res.json();
        if (json.success) {
          setIsSaved(true);
          toast.success("Opportunity saved to your applications tracker!");
          onSavedChange?.(true);
        } else {
          toast.error(json.message || "Failed to save opportunity");
        }
      } else {
        // Unsave
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "remove_saved", opportunityId }),
        });
        const json = await res.json();
        if (json.success) {
          setIsSaved(false);
          toast.success("Removed from saved opportunities");
          onSavedChange?.(false);
        } else {
          toast.error(json.message || "Failed to remove from saved list");
        }
      }
    } catch {
      toast.error("Network error while updating saved opportunity");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={size}
      variant={isSaved ? "outline" : variant}
      onClick={handleToggleSave}
      disabled={isLoading}
      title={isSaved ? "Saved to tracker (click to remove)" : "Save to applications tracker"}
      className={`transition-all cursor-pointer ${
        isSaved
          ? "border-indigo-300 bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      } ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isSaved ? (
        <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600" />
      ) : (
        <Bookmark className="w-3.5 h-3.5" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold ml-1.5">
          {isSaved ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
}
