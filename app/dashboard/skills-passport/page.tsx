"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  ISkillsPassport,
  PassportVisibility,
  IPassportVisibleSections,
} from "@/types/skills-passport";
import { PassportHeaderCard } from "@/features/skills-passport/components/PassportHeaderCard";
import { SkillsEvidenceGrid } from "@/features/skills-passport/components/SkillsEvidenceGrid";
import { PassportProjectsList } from "@/features/skills-passport/components/PassportProjectsList";
import { PassportCertificationsList } from "@/features/skills-passport/components/PassportCertificationsList";
import { PassportEducationCard } from "@/features/skills-passport/components/PassportEducationCard";
import { PassportAssessmentsCard } from "@/features/skills-passport/components/PassportAssessmentsCard";
import { PassportPrivacySettings } from "@/features/skills-passport/components/PassportPrivacySettings";
import { PassportQRCodeModal } from "@/features/skills-passport/components/PassportQRCodeModal";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Award, ShieldCheck, Loader2 } from "lucide-react";

export default function SkillsPassportPage() {
  const [passport, setPassport] = useState<ISkillsPassport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    let ignore = false;
    async function loadPassport() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/passport");
        const json = await res.json();
        if (!ignore && json.success && json.data) {
          setPassport(json.data);
        } else if (!json.success) {
          toast.error(json.error || "Failed to load skills passport.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Error loading passport:", err);
          toast.error("Failed to load skills passport.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadPassport();
    return () => {
      ignore = true;
    };
  }, []);

  const handleOpenQR = async () => {
    if (!passport) return;
    setIsQRModalOpen(true);
    if (!qrDataUrl) {
      try {
        const res = await fetch("/api/passport/qr");
        const json = await res.json();
        if (json.success && json.data?.dataUrl) {
          setQrDataUrl(json.data.dataUrl);
        }
      } catch {
        toast.error("Failed to load QR code image.");
      }
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/passport/sync", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        setPassport(json.data);
        toast.success("Passport synced with latest profile & approved resume!");
      } else {
        toast.error(json.error || "Failed to sync passport.");
      }
    } catch {
      toast.error("Network error during sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateHeader = async (
    displayName: string,
    headline: string,
    summary: string
  ) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/passport", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, headline, summary }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPassport(json.data);
      } else {
        throw new Error(json.error || "Update failed");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateVisibility = async (visibility: PassportVisibility) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/passport", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPassport(json.data);
        toast.success(`Visibility set to ${visibility}.`);
      } else {
        toast.error(json.error || "Failed to update visibility.");
      }
    } catch {
      toast.error("Failed to update visibility.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSection = async (
    section: keyof IPassportVisibleSections,
    val: boolean
  ) => {
    if (!passport) return;
    const updatedSections = {
      ...passport.visibleSections,
      [section]: val,
    };

    try {
      const res = await fetch("/api/passport", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibleSections: updatedSections }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setPassport(json.data);
      } else {
        toast.error(json.error || "Failed to update section visibility.");
      }
    } catch {
      toast.error("Failed to update section.");
    }
  };

  const handleRevokeLink = async () => {
    try {
      const res = await fetch("/api/passport/revoke", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data) {
        setPassport(json.data);
        toast.success("Public passport link revoked. Visitors can no longer view it.");
      } else {
        toast.error(json.error || "Failed to revoke link.");
      }
    } catch {
      toast.error("Failed to revoke link.");
    }
  };

  const handleRegenerateLink = async () => {
    try {
      const res = await fetch("/api/passport/regenerate-link", { method: "POST" });
      const json = await res.json();
      if (json.success && json.data?.newPublicId) {
        setPassport((prev) =>
          prev ? { ...prev, publicId: json.data.newPublicId } : prev
        );
        setQrDataUrl(""); // Invalidate cached QR
        toast.success("Generated new public link! Previous link is now inactive.");
      } else {
        toast.error(json.error || "Failed to regenerate link.");
      }
    } catch {
      toast.error("Failed to regenerate link.");
    }
  };

  return (
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Title & Mission Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Award className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Verified Digital Skills Passport
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your tamper-evident, shareable portfolio of verified competencies, projects, and credentials
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Cryptographic Integrity Seal
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading your digital skills passport...</p>
          </div>
        ) : !passport ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Unable to load your digital skills passport.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Header / Bio Card */}
            <PassportHeaderCard
              passport={passport}
              onOpenQR={handleOpenQR}
              onSync={handleSync}
              onUpdateHeader={handleUpdateHeader}
              isSyncing={isSyncing}
            />

            {/* Privacy & Section Controls */}
            <PassportPrivacySettings
              visibility={passport.visibility}
              visibleSections={passport.visibleSections}
              isRevoked={passport.isRevoked}
              onUpdateVisibility={handleUpdateVisibility}
              onToggleSection={handleToggleSection}
              onRevokeLink={handleRevokeLink}
              onRegenerateLink={handleRegenerateLink}
              isSaving={isSaving}
            />

            {/* Skills & Evidence Grid */}
            <SkillsEvidenceGrid skills={passport.skills} />

            {/* Projects */}
            <PassportProjectsList projects={passport.projects} />

            {/* Certifications */}
            <PassportCertificationsList certifications={passport.certifications} />

            {/* Grid of Assessments & Education */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PassportAssessmentsCard assessments={passport.assessments} />
              <PassportEducationCard education={passport.education} />
            </div>

            {/* QR Code Modal */}
            <PassportQRCodeModal
              isOpen={isQRModalOpen}
              onClose={() => setIsQRModalOpen(false)}
              publicId={passport.publicId}
              qrDataUrl={qrDataUrl}
              targetUrl={
                typeof window !== "undefined"
                  ? `${window.location.origin}/passport/${passport.publicId}`
                  : `/passport/${passport.publicId}`
              }
            />
          </>
        )}
      </div>
    </StudentPortalLayout>
  );
}
