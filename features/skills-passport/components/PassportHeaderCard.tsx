"use client";

import React, { useState } from "react";
import {
  QrCode,
  ExternalLink,
  RefreshCw,
  Edit3,
  Check,
  Eye,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { ISkillsPassport } from "@/types/skills-passport";
import { toast } from "sonner";

interface PassportHeaderCardProps {
  passport: ISkillsPassport;
  onOpenQR: () => void;
  onSync: () => Promise<void>;
  onUpdateHeader: (displayName: string, headline: string, summary: string) => Promise<void>;
  isSyncing?: boolean;
}

export function PassportHeaderCard({
  passport,
  onOpenQR,
  onSync,
  onUpdateHeader,
  isSyncing = false,
}: PassportHeaderCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(passport.displayName || "");
  const [headline, setHeadline] = useState(passport.headline || "");
  const [summary, setSummary] = useState(passport.summary || "");
  const [isSaving, setIsSaving] = useState(false);

  const publicUrl = `/passport/${passport.publicId}`;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateHeader(displayName, headline, summary);
      setIsEditing(false);
      toast.success("Passport header updated!");
    } catch {
      toast.error("Failed to save updates.");
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "CB";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left: Avatar & Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
            {getInitials(passport.displayName)}
          </div>

          <div className="flex-1">
            {!isEditing ? (
              <>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {passport.displayName || "Student"}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    Verified Digital Passport
                  </span>
                </div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                  {passport.headline}
                </p>
                {passport.summary && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mb-3">
                    {passport.summary}
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-3 mb-3 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Full Stack Developer | CS Senior"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Passport Summary
                  </label>
                  <textarea
                    rows={3}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief background, core technical focus, and career aspirations..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Metadata & Stats */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                {passport.analytics?.viewCount || 0} Total Views
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Issued:{" "}
                {new Date(passport.issuedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                ID: {passport.publicId}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenQR}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 text-xs font-medium shadow-xs transition"
            >
              <QrCode className="w-4 h-4" />
              Share QR Code
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Public View
            </a>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Bio
              </button>
            )}

            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition"
              title="Pull newly added skills or projects from profile and approved resume"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
