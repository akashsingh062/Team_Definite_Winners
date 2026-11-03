"use client";

import * as React from "react";
import { useState } from "react";
import { ResourceShareType } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Share2,
  FileText,
  Github,
  Globe,
  Lock,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface ShareResourceModalProps {
  mentorId: string;
  mentorName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ShareResourceModal({
  mentorId,
  mentorName,
  isOpen,
  onClose,
  onSuccess,
}: ShareResourceModalProps) {
  const [resourceType, setResourceType] = useState<ResourceShareType>("resume");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a resource title");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mentorship/resources/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId,
          resourceType,
          resourceReference: {
            title: title.trim(),
            url: url.trim() || undefined,
            description: description.trim() || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to share resource");
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 animate-bounce">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Resource Shared!
            </h3>
            <p className="text-xs text-slate-600">
              Access granted to {mentorName}. You can revoke access at any time from your shared resources panel.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">
                <Share2 className="h-4 w-4" />
                <span>Explicit Resource Sharing</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Share Material with {mentorName}
              </h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>Never shared automatically. You can revoke access anytime.</span>
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
                {error}
              </div>
            )}

            {/* Resource Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resource Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "resume", label: "Resume", icon: FileText },
                  { id: "project", label: "Project", icon: Globe },
                  { id: "github", label: "GitHub Repo", icon: Github },
                  { id: "portfolio", label: "Portfolio", icon: Globe },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSelected = resourceType === type.id;
                  return (
                    <button
                      type="button"
                      key={type.id}
                      onClick={() => setResourceType(type.id as ResourceShareType)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/70 text-indigo-900"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-4 w-4 text-indigo-600" />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resource Title <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Current Full-Stack ATS Resume, Distributed Cache Project"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link / URL (Optional)
              </label>
              <Input
                placeholder="https://github.com/my-profile/project or drive link"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Review Requests
              </label>
              <textarea
                rows={2}
                placeholder="What specific sections or feedback are you seeking?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    Grant Access
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

