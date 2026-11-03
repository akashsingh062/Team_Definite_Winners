"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ISkillsPassport,
  PassportVisibility,
  IPassportVisibleSections,
  SkillEvidenceType,
  IPassportSkill,
} from "@/types/skills-passport";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PassportQRCodeModal } from "@/features/skills-passport/components/PassportQRCodeModal";
import { EvidenceBadge } from "@/features/skills-passport/components/EvidenceBadge";
import {
  Award,
  ShieldCheck,
  QrCode,
  ExternalLink,
  RefreshCw,
  Edit3,
  Check,
  Eye,
  Calendar,
  Copy,
  CheckCheck,
  Lock,
  Globe,
  EyeOff,
  FolderGit2,
  Github,
  Code,
  GraduationCap,
  Building2,
  FileText,
  Search,
  Sparkles,
  Link2,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Hash,
  Laptop,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function SkillsPassportPage() {
  const [passport, setPassport] = useState<ISkillsPassport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Bio modal / inline state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<"skills" | "projects" | "assessments" | "certifications" | "privacy">("skills");
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");
  const [skillSearchQuery, setSkillSearchQuery] = useState("");

  // Privacy confirmation modals
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadPassport() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/passport");
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setPassport(json.data);
          setDisplayName(json.data.displayName || "");
          setHeadline(json.data.headline || "");
          setSummary(json.data.summary || "");
        } else if (!json.success && isMounted) {
          toast.error(json.error || "Failed to load skills passport.");
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error loading passport:", err);
          toast.error("Failed to load skills passport.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPassport();
    return () => {
      isMounted = false;
    };
  }, []);

  const publicUrl = useMemo(() => {
    if (!passport) return "";
    if (typeof window !== "undefined") {
      return `${window.location.origin}/passport/${passport.publicId}`;
    }
    return `/passport/${passport.publicId}`;
  }, [passport]);

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopiedLink(true);
      toast.success("Public passport link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error("Failed to copy link.");
    }
  };

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
        toast.success("Passport refreshed with latest skills, projects, and assessments!");
      } else {
        toast.error(json.error || "Failed to sync passport.");
      }
    } catch {
      toast.error("Network error during sync.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveBio = async () => {
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
        setIsEditingBio(false);
        toast.success("Passport profile updated successfully!");
      } else {
        throw new Error(json.error || "Update failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile updates.");
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
        toast.success(`Passport visibility updated to ${visibility.toUpperCase()}.`);
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
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} visibility updated.`);
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
        setShowRevokeConfirm(false);
        toast.success("Public passport link revoked. External viewers can no longer access it.");
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
        setShowRegenConfirm(false);
        toast.success("New public URL generated! Old links and QR codes are now deactivated.");
      } else {
        toast.error(json.error || "Failed to regenerate link.");
      }
    } catch {
      toast.error("Failed to regenerate link.");
    }
  };

  // --- Statistics Calculations ---
  const stats = useMemo(() => {
    if (!passport) {
      return {
        total: 0,
        assessmentVerified: 0,
        projectDemonstrated: 0,
        resumeExtracted: 0,
        externallyVerified: 0,
        selfReported: 0,
        verifiedPercent: 0,
      };
    }
    const skills = passport.skills || [];
    const total = skills.length;
    const assessmentVerified = skills.filter((s) => s.evidenceType === "assessment_verified").length;
    const projectDemonstrated = skills.filter((s) => s.evidenceType === "project_demonstrated").length;
    const resumeExtracted = skills.filter((s) => s.evidenceType === "resume_extracted").length;
    const externallyVerified = skills.filter((s) => s.evidenceType === "externally_verified").length;
    const selfReported = skills.filter((s) => s.evidenceType === "self_reported").length;
    const verifiedTotal = assessmentVerified + projectDemonstrated + externallyVerified + resumeExtracted;
    const verifiedPercent = total > 0 ? Math.round((verifiedTotal / total) * 100) : 0;

    return {
      total,
      assessmentVerified,
      projectDemonstrated,
      resumeExtracted,
      externallyVerified,
      selfReported,
      verifiedPercent,
    };
  }, [passport]);

  // Filtered skills list
  const filteredSkills = useMemo(() => {
    if (!passport) return [];
    return (passport.skills || []).filter((skill) => {
      // Evidence filter
      if (evidenceFilter !== "all") {
        if (evidenceFilter === "verified_only") {
          const isV =
            skill.evidenceType === "assessment_verified" ||
            skill.evidenceType === "project_demonstrated" ||
            skill.evidenceType === "externally_verified";
          if (!isV) return false;
        } else if (skill.evidenceType !== evidenceFilter) {
          return false;
        }
      }
      // Text search
      if (skillSearchQuery.trim()) {
        const q = skillSearchQuery.toLowerCase();
        return (
          skill.name.toLowerCase().includes(q) ||
          skill.category.toLowerCase().includes(q) ||
          skill.proficiency.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [passport, evidenceFilter, skillSearchQuery]);

  const getInitials = (name?: string) => {
    if (!name) return "NX";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getProficiencyBadgeClass = (p: string) => {
    switch (p) {
      case "Expert":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Advanced":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Intermediate":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* --- Top Header Command Bar --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-indigo-600" />
                Verified Digital Skills Passport
              </h1>
              <Badge variant="indigo" className="text-xs px-2.5 py-0.5 font-semibold">
                NexSkill AI Registry
              </Badge>
              {passport && !passport.isRevoked && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live & Shareable
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Tamper-evident, shareable portfolio of verified technical competencies, software projects, and platform certifications.
            </p>
          </div>

          {/* Quick Share Toolbar */}
          {passport && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="gap-1.5 text-xs bg-white"
              >
                {copiedLink ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenQR}
                className="gap-1.5 text-xs bg-white"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-600" />
                <span>QR Code</span>
              </Button>

              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="sm" className="gap-1.5 text-xs">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public View</span>
                </Button>
              </a>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="gap-1.5 text-xs text-slate-600 hover:text-indigo-600"
                title="Sync passport with latest profile updates, projects, and assessments"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-indigo-600" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync"}</span>
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-24 text-center space-y-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-9 h-9 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-500">Loading your Verified Digital Skills Passport...</p>
          </div>
        ) : !passport ? (
          <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Passport Record Unavailable</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We were unable to load your skills passport. Click below to initialize or reload your passport record.
            </p>
            <Button variant="primary" size="sm" onClick={() => window.location.reload()}>
              Reload Passport
            </Button>
          </div>
        ) : (
          <>
            {/* --- Holographic Identity Card --- */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-7 sm:p-8 shadow-xl border border-indigo-800/40">
              {/* Background Geometric Accent */}
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                {/* Left: Avatar & Bio */}
                <div className="flex items-start gap-5 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg">
                      <div className="w-full h-full rounded-[14px] bg-slate-900/90 flex items-center justify-center font-bold text-xl sm:text-2xl text-white tracking-tight">
                        {getInitials(passport.displayName)}
                      </div>
                    </div>
                    <span
                      className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-lg text-white shadow-md"
                      title="NexSkill Verified Credential"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {!isEditingBio ? (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                            {passport.displayName || "Student Candidate"}
                          </h2>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                            <Sparkles className="w-3 h-3 text-indigo-300" />
                            Official Credential
                          </span>
                        </div>
                        <p className="text-sm font-medium text-indigo-200/90">
                          {passport.headline || "Aspiring Software Engineer"}
                        </p>
                        {passport.summary && (
                          <p className="text-xs text-slate-300/90 leading-relaxed max-w-2xl pt-1 line-clamp-3">
                            {passport.summary}
                          </p>
                        )}
                      </>
                    ) : (
                      /* Inline Bio Editor */
                      <div className="space-y-3 pt-1 max-w-xl bg-slate-900/80 p-4 rounded-2xl border border-indigo-700/50 backdrop-blur-md">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Display Name
                          </label>
                          <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="Full Name"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Headline / Primary Focus
                          </label>
                          <input
                            type="text"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="e.g. Full Stack Developer | Next.js & Node.js"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                            Executive Bio
                          </label>
                          <textarea
                            rows={3}
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            placeholder="Brief summary of strengths and technical aspirations..."
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={handleSaveBio}
                            disabled={isSaving}
                            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-500"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {isSaving ? "Saving..." : "Save Bio"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsEditingBio(false)}
                            className="h-8 text-xs text-slate-400 hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/70 pt-2">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <strong className="text-white">{passport.analytics?.viewCount || 0}</strong> Views
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        Issued {new Date(passport.issuedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-200 border border-indigo-700/50">
                        ID: {passport.publicId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Integrity Seal */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] tracking-wider uppercase font-semibold text-indigo-300/80 block">
                      Security Seal
                    </span>
                    <span className="text-xs font-mono font-medium text-emerald-400 flex items-center md:justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SHA-256 Verified
                    </span>
                  </div>

                  {!isEditingBio && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingBio(true)}
                      className="text-xs border-indigo-700/70 bg-indigo-950/40 text-indigo-100 hover:bg-indigo-900/80 hover:text-white gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit Bio
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* --- 5-Tier Evidence Intelligence Bar --- */}
            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        Evidence Verification Overview
                      </h3>
                      <Badge variant="emerald" className="text-[10px] py-0 px-1.5 font-bold">
                        {stats.verifiedPercent}% Evidence Rate
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Skills are tiered according to factual, verifiable evidence sources.
                    </p>
                  </div>

                  {/* Visual Rate Bar */}
                  <div className="w-full lg:w-72 space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-600">
                      <span>Verified Evidence</span>
                      <span>{stats.total - stats.selfReported} / {stats.total} skills</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${stats.total > 0 ? (stats.assessmentVerified / stats.total) * 100 : 0}%` }}
                        className="bg-blue-600"
                        title="Assessment Verified"
                      />
                      <div
                        style={{ width: `${stats.total > 0 ? (stats.projectDemonstrated / stats.total) * 100 : 0}%` }}
                        className="bg-emerald-500"
                        title="Project Demonstrated"
                      />
                      <div
                        style={{ width: `${stats.total > 0 ? (stats.externallyVerified / stats.total) * 100 : 0}%` }}
                        className="bg-purple-500"
                        title="Externally Verified"
                      />
                      <div
                        style={{ width: `${stats.total > 0 ? (stats.resumeExtracted / stats.total) * 100 : 0}%` }}
                        className="bg-amber-400"
                        title="Resume Extracted"
                      />
                    </div>
                  </div>
                </div>

                {/* 5 Clickable Evidence Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFilter("assessment_verified");
                      setActiveTab("skills");
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      evidenceFilter === "assessment_verified"
                        ? "border-blue-600 bg-blue-50/70 shadow-xs"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span className="text-lg font-bold text-slate-900">{stats.assessmentVerified}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">Assessment</p>
                    <p className="text-[10px] text-slate-500 truncate">Test-verified mastery</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFilter("project_demonstrated");
                      setActiveTab("skills");
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      evidenceFilter === "project_demonstrated"
                        ? "border-emerald-600 bg-emerald-50/70 shadow-xs"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <FolderGit2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-lg font-bold text-slate-900">{stats.projectDemonstrated}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">Projects</p>
                    <p className="text-[10px] text-slate-500 truncate">Software deliverables</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFilter("resume_extracted");
                      setActiveTab("skills");
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      evidenceFilter === "resume_extracted"
                        ? "border-amber-600 bg-amber-50/70 shadow-xs"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <span className="text-lg font-bold text-slate-900">{stats.resumeExtracted}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">Resume</p>
                    <p className="text-[10px] text-slate-500 truncate">Approved parser claims</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFilter("externally_verified");
                      setActiveTab("skills");
                    }}
                    className={`p-3 rounded-xl border text-left transition ${
                      evidenceFilter === "externally_verified"
                        ? "border-purple-600 bg-purple-50/70 shadow-xs"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-lg font-bold text-slate-900">{stats.externallyVerified}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">External</p>
                    <p className="text-[10px] text-slate-500 truncate">Authorized providers</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEvidenceFilter("self_reported");
                      setActiveTab("skills");
                    }}
                    className={`p-3 rounded-xl border text-left transition col-span-2 sm:col-span-1 ${
                      evidenceFilter === "self_reported"
                        ? "border-slate-600 bg-slate-100 shadow-xs"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <HelpCircle className="w-4 h-4 text-slate-500" />
                      <span className="text-lg font-bold text-slate-900">{stats.selfReported}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">Self-Reported</p>
                    <p className="text-[10px] text-slate-500 truncate">Candidate claims</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* --- Navigation Tabs --- */}
            <div className="border-b border-slate-200">
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: "skills", label: "Skills Matrix", count: stats.total, icon: Award },
                  { id: "projects", label: "Projects", count: passport.projects?.length || 0, icon: FolderGit2 },
                  { id: "assessments", label: "Assessments", count: passport.assessments?.length || 0, icon: ShieldCheck },
                  { id: "certifications", label: "Certs & Education", count: (passport.certifications?.length || 0) + (passport.education?.length || 0), icon: GraduationCap },
                  { id: "privacy", label: "Privacy & Sharing", icon: Sliders },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
                        isActive
                          ? "border-indigo-600 text-indigo-600 font-bold"
                          : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- TAB CONTENT 1: Skills Matrix --- */}
            {activeTab === "skills" && (
              <div className="space-y-4">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search skills by name or category..."
                      value={skillSearchQuery}
                      onChange={(e) => setSkillSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                    {[
                      { id: "all", label: "All Skills" },
                      { id: "verified_only", label: "Verified Only" },
                      { id: "assessment_verified", label: "Assessment" },
                      { id: "project_demonstrated", label: "Projects" },
                      { id: "resume_extracted", label: "Resume" },
                      { id: "self_reported", label: "Self-Reported" },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setEvidenceFilter(btn.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                          evidenceFilter === btn.id
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSkills.length === 0 ? (
                  <Card className="p-12 text-center border-dashed border-2 border-slate-200">
                    <p className="text-sm text-slate-500">
                      No skills match the current search or evidence filter.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEvidenceFilter("all");
                        setSkillSearchQuery("");
                      }}
                      className="mt-3 text-xs"
                    >
                      Clear Filters
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredSkills.map((skill) => (
                      <Card
                        key={skill.id}
                        className="p-4 border-slate-200 hover:border-indigo-200 hover:shadow-xs transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="text-sm font-bold text-slate-900 truncate">
                              {skill.name}
                            </h4>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getProficiencyBadgeClass(
                                skill.proficiency
                              )}`}
                            >
                              {skill.proficiency}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 mb-2">
                            Category: <span className="font-medium text-slate-700">{skill.category || "Technical Skill"}</span>
                          </p>

                          <div className="mb-2">
                            <EvidenceBadge evidenceType={skill.evidenceType} size="sm" />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate max-w-[160px]" title={skill.issuingSource}>
                            {skill.issuingSource}
                          </span>
                          {skill.verificationDate && (
                            <span>{new Date(skill.verificationDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- TAB CONTENT 2: Project Portfolio --- */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                {(!passport.projects || passport.projects.length === 0) ? (
                  <Card className="p-12 text-center border-dashed border-2 border-slate-200 space-y-2">
                    <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700">No Projects Added Yet</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Add practical projects to your student profile or sync from an approved resume to highlight code proof.
                    </p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {passport.projects.map((proj) => (
                      <Card
                        key={proj.id}
                        className="p-5 border-slate-200 hover:border-emerald-200 hover:shadow-xs transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <h4 className="text-base font-bold text-slate-900">
                                {proj.title}
                              </h4>
                              {proj.category && (
                                <p className="text-xs font-medium text-emerald-600">
                                  {proj.category}
                                </p>
                              )}
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              <FolderGit2 className="w-3 h-3" />
                              Project Evidence
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed mb-3">
                            {proj.description}
                          </p>

                          {proj.contribution && (
                            <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                              <span className="font-bold text-slate-900">Core Contribution: </span>
                              {proj.contribution}
                            </div>
                          )}

                          {/* Tech Stack Chips */}
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {proj.technologies.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Project Links Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                              >
                                <Github className="w-3.5 h-3.5" />
                                <span>Repository</span>
                              </a>
                            )}
                            {proj.liveDemoUrl && (
                              <a
                                href={proj.liveDemoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Live Demo</span>
                              </a>
                            )}
                          </div>
                          {proj.completionDate && (
                            <span className="text-[11px] text-slate-400">
                              Completed {proj.completionDate}
                            </span>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- TAB CONTENT 3: Assessments & Badges --- */}
            {activeTab === "assessments" && (
              <div className="space-y-4">
                {(!passport.assessments || passport.assessments.length === 0) ? (
                  <Card className="p-12 text-center border-dashed border-2 border-slate-200 space-y-3">
                    <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700">No Skill Assessments Taken Yet</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Take practical, time-limited tests on JavaScript, React, Python, or SQL in the Assessment Center to convert self-reported skills into official Verified credentials.
                    </p>
                    <Link href="/dashboard/assessments">
                      <Button variant="primary" size="sm" className="text-xs">
                        Go to Assessment Center
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {passport.assessments.map((test) => (
                      <Card
                        key={test.id}
                        className="p-5 border-blue-200/70 bg-gradient-to-br from-blue-50/30 to-white hover:border-blue-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                              <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {test.assessmentTitle}
                              </h4>
                              <p className="text-xs font-semibold text-blue-700">
                                Target: {test.skillName}
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {test.badge}
                          </span>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>
                            {test.score !== undefined ? (
                              <strong className="text-slate-800">{test.score}% Score</strong>
                            ) : (
                              "Passed"
                            )}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            Ref: {test.verificationReference?.slice(0, 16)}...
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* --- TAB CONTENT 4: Certifications & Education --- */}
            {activeTab === "certifications" && (
              <div className="space-y-6">
                {/* Certifications Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    Professional Certifications ({passport.certifications?.length || 0})
                  </h3>

                  {(!passport.certifications || passport.certifications.length === 0) ? (
                    <Card className="p-8 text-center border-dashed border border-slate-200">
                      <p className="text-xs text-slate-500">
                        No external certifications listed. Add credentials in your profile to display verified certificates.
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {passport.certifications.map((cert) => (
                        <Card key={cert.id} className="p-4 border-slate-200 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">
                                  {cert.name}
                                </h4>
                                <p className="text-xs text-slate-600 font-medium">
                                  {cert.issuingOrganization}
                                </p>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                                {cert.verificationStatus === "verified" ? "Authorized Issuer" : "Student Provided"}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Issued: {cert.issueDate || "Not Specified"}
                            </p>
                          </div>

                          {cert.credentialUrl && (
                            <div className="pt-2 mt-2 border-t border-slate-100">
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Verify External Credential</span>
                              </a>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Academic Qualifications Section */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Academic Foundations
                  </h3>

                  {(!passport.education || passport.education.length === 0) ? (
                    <Card className="p-8 text-center border-dashed border border-slate-200">
                      <p className="text-xs text-slate-500">No educational degrees recorded.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {passport.education.map((edu, idx) => (
                        <Card key={idx} className="p-4 border-slate-200 flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-sm font-bold text-slate-900">
                              {edu.degree} {edu.branch && `• ${edu.branch}`}
                            </h4>
                            <p className="text-xs font-semibold text-slate-700">
                              {edu.institution}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                              {edu.graduationYear && <span>Class of {edu.graduationYear}</span>}
                              {edu.cgpa !== undefined && edu.cgpa !== null && (
                                <Badge variant="slate" className="text-[10px] py-0">
                                  CGPA: {edu.cgpa} / 10
                                </Badge>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- TAB CONTENT 5: Privacy & Sharing Management --- */}
            {activeTab === "privacy" && (
              <div className="space-y-6">
                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Globe className="w-5 h-5 text-indigo-600" />
                      Public Visibility Status
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Choose who can discover and inspect your Verified Digital Skills Passport.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateVisibility("public")}
                        disabled={isSaving}
                        className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                          passport.visibility === "public" && !passport.isRevoked
                            ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 text-indigo-950 font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <Globe className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">Public (Recommended)</p>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            Accessible to recruiters, employers, and anyone with your shareable link or QR code.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateVisibility("unlisted")}
                        disabled={isSaving}
                        className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                          passport.visibility === "unlisted" && !passport.isRevoked
                            ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 text-indigo-950 font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <Link2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">Unlisted</p>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            Only individuals with the direct link can access your passport. Hidden from search directories.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUpdateVisibility("private")}
                        disabled={isSaving}
                        className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                          passport.visibility === "private" || passport.isRevoked
                            ? "border-rose-600 bg-rose-50/50 ring-2 ring-rose-600/20 text-rose-950 font-bold"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold">Private</p>
                          <p className="text-xs text-slate-500 font-normal mt-0.5">
                            Public access is completely locked. External visitors will see a restricted private screen.
                          </p>
                        </div>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Visibility Controls */}
                <Card className="border-slate-200 shadow-xs">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-indigo-600" />
                      Granular Section Controls
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Toggle which sections are visible to prospective employers on your public passport view.
                    </p>
                  </CardHeader>
                  <CardContent className="divide-y divide-slate-100">
                    {[
                      { key: "skills", label: "Skills & Evidence Matrix", desc: "Show your verified competencies, evidence statuses, and proficiency tiers." },
                      { key: "projects", label: "Project Portfolio", desc: "Show software project deliverables, descriptions, and GitHub links." },
                      { key: "assessments", label: "Skill Readiness Assessments", desc: "Show validated platform test scores and earned verification badges." },
                      { key: "certifications", label: "Certifications", desc: "Show third-party authorized credentials and certification IDs." },
                      { key: "education", label: "Academic Background", desc: "Show university, degree, major, graduation year, and CGPA." },
                      { key: "contact", label: "Contact & Social Profiles", desc: "Show GitHub, LinkedIn, portfolio website, and profile links." },
                    ].map((item) => {
                      const k = item.key as keyof IPassportVisibleSections;
                      const isVisible = passport.visibleSections?.[k] ?? true;
                      return (
                        <div key={k} className="py-3.5 flex items-center justify-between gap-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{item.label}</h4>
                            <p className="text-[11px] text-slate-500">{item.desc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleSection(k, !isVisible)}
                            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                              isVisible ? "bg-indigo-600" : "bg-slate-300"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                                isVisible ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Security Actions: Regenerate & Revoke */}
                <Card className="border-rose-100 bg-rose-50/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-rose-900 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      Link Security & Access Revocation
                    </CardTitle>
                    <p className="text-xs text-rose-700">
                      Manage credential URLs if you wish to reset or permanently revoke public sharing.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-rose-200">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Regenerate Public Link
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Issues a new unique URL and QR code. All previously shared links will immediately become inactive.
                        </p>
                      </div>
                      {!showRegenConfirm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRegenConfirm(true)}
                          className="text-xs text-slate-700 shrink-0"
                        >
                          Regenerate Link
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleRegenerateLink}
                            className="text-xs bg-indigo-600"
                          >
                            Confirm New URL
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowRegenConfirm(false)}
                            className="text-xs text-slate-500"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-rose-200">
                      <div>
                        <h4 className="text-xs font-bold text-rose-900">
                          Revoke Public Access
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Immediately marks this digital passport as revoked. External visitors will see a revoked notice.
                        </p>
                      </div>
                      {!showRevokeConfirm ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowRevokeConfirm(true)}
                          className="text-xs text-rose-600 border-rose-300 hover:bg-rose-50 shrink-0"
                        >
                          Revoke Passport
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleRevokeLink}
                            className="text-xs bg-rose-600 hover:bg-rose-700 text-white"
                          >
                            Confirm Revoke
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowRevokeConfirm(false)}
                            className="text-xs text-slate-500"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* --- QR Code Modal --- */}
            <PassportQRCodeModal
              isOpen={isQRModalOpen}
              onClose={() => setIsQRModalOpen(false)}
              publicId={passport.publicId}
              qrDataUrl={qrDataUrl}
              targetUrl={publicUrl}
            />
          </>
        )}
      </div>
    </StudentPortalLayout>
  );
}
