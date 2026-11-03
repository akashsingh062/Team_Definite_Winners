"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Globe,
  EyeOff,
  Link2,
  RefreshCw,
  AlertTriangle,
  Lock,
  Layers,
} from "lucide-react";
import {
  PassportVisibility,
  IPassportVisibleSections,
} from "@/types/skills-passport";

interface PassportPrivacySettingsProps {
  visibility: PassportVisibility;
  visibleSections: IPassportVisibleSections;
  isRevoked: boolean;
  onUpdateVisibility: (visibility: PassportVisibility) => Promise<void>;
  onToggleSection: (section: keyof IPassportVisibleSections, val: boolean) => Promise<void>;
  onRevokeLink: () => Promise<void>;
  onRegenerateLink: () => Promise<void>;
  isSaving?: boolean;
}

export function PassportPrivacySettings({
  visibility,
  visibleSections,
  isRevoked,
  onUpdateVisibility,
  onToggleSection,
  onRevokeLink,
  onRegenerateLink,
  isSaving = false,
}: PassportPrivacySettingsProps) {
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleRevoke = async () => {
    setLoadingAction("revoke");
    try {
      await onRevokeLink();
      setShowRevokeConfirm(false);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRegen = async () => {
    setLoadingAction("regen");
    try {
      await onRegenerateLink();
      setShowRegenConfirm(false);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Privacy & Section Controls
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose who can view your passport and control public section visibility
          </p>
        </div>
      </div>

      {/* Visibility Radios */}
      <div className="mb-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Passport Visibility Status
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onUpdateVisibility("public")}
            disabled={isSaving}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
              visibility === "public" && !isRevoked
                ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-1 ring-blue-600"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Public</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accessible to anyone with your link or QR code
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onUpdateVisibility("unlisted")}
            disabled={isSaving}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
              visibility === "unlisted" && !isRevoked
                ? "border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 ring-1 ring-amber-600"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
            }`}
          >
            <Link2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Unlisted</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct link only. Not indexed or discoverable
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onUpdateVisibility("private")}
            disabled={isSaving}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
              visibility === "private" || isRevoked
                ? "border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ring-1 ring-slate-700"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
            }`}
          >
            <EyeOff className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Private</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Only you can view. Public visitors receive 403
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Visible Sections Toggles */}
      <div className="mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-slate-500" />
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Publicly Visible Sections
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: "skills", label: "Skills & Evidence" },
            { key: "projects", label: "Project Portfolio" },
            { key: "certifications", label: "Certifications" },
            { key: "education", label: "Academic Info" },
            { key: "assessments", label: "Assessments" },
            { key: "contact", label: "Portfolio Handles" },
          ].map((item) => {
            const isChecked = Boolean(visibleSections[item.key as keyof IPassportVisibleSections]);
            return (
              <label
                key={item.key}
                className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer select-none transition"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isSaving}
                  onChange={(e) =>
                    onToggleSection(
                      item.key as keyof IPassportVisibleSections,
                      e.target.checked
                    )
                  }
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  {item.label}
                </span>
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          * Private contact details (home address, personal phone number, private resume files) are permanently quarantined and never exposed.
        </p>
      </div>

      {/* Security Actions (Revoke & Regenerate) */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Link Security Management
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            If your share link was forwarded or leaked, invalidate it immediately
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowRegenConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate Link
          </button>

          {!isRevoked ? (
            <button
              type="button"
              onClick={() => setShowRevokeConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-xs font-medium transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Revoke Link
            </button>
          ) : (
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-xs font-semibold">
              Passport Revoked
            </span>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Revoke */}
      {showRevokeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-rose-200 dark:border-rose-900/60 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Revoke Public Passport Link?
                </h4>
                <p className="text-xs text-slate-500">
                  Immediate public access cutoff
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Anyone with your existing link or QR code will no longer be able to view your skills passport. Public visitors will receive an official notice that the passport was revoked.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRevokeConfirm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRevoke}
                disabled={loadingAction === "revoke"}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition"
              >
                {loadingAction === "revoke" ? "Revoking..." : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Regenerate */}
      {showRegenConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Regenerate Public Identifier?
                </h4>
                <p className="text-xs text-slate-500">
                  New URL and QR code will be generated
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              This will immediately invalidate your previous share URL and QR code. You will need to share the new link with any active recruiters or employers.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRegenConfirm(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegen}
                disabled={loadingAction === "regen"}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition"
              >
                {loadingAction === "regen" ? "Regenerating..." : "Regenerate Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
