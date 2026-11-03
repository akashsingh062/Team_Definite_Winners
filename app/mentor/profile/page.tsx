"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { IMentorProfile } from "@/types/mentor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Ban,
  Save,
  Loader2,
  Linkedin,
  Github,
  Globe,
  Award,
} from "lucide-react";

export default function MentorProfileManagementPage() {
  const [profile, setProfile] = useState<Partial<IMentorProfile>>({
    displayName: "",
    headline: "",
    organization: "",
    currentRole: "",
    experienceYears: 3,
    expertise: [],
    skills: [],
    languages: ["English"],
    biography: "",
    professionalLinks: {
      linkedin: "",
      github: "",
      portfolio: "",
    },
  });

  const [expertiseInput, setExpertiseInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [languagesInput, setLanguagesInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadProfile() {
      try {
        const res = await fetch("/api/mentor/profile");
        const data = await res.json();
        if (!ignore && data.success && data.data) {
          setProfile(data.data);
          setExpertiseInput(data.data.expertise?.join(", ") || "");
          setSkillsInput(data.data.skills?.join(", ") || "");
          setLanguagesInput(data.data.languages?.join(", ") || "English");
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...profile,
        expertise: expertiseInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        skills: skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        languages: languagesInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/mentor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data.data);
      setMessage({
        text: "Mentor profile updated successfully! If your profile is pending review, our team will verify your credentials shortly.",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Error saving profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const status = profile.verificationStatus || "pending";

  const renderStatusBadge = () => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Verified Industry Mentor
          </span>
        );
      case "under_review":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-300">
            <Clock className="h-4 w-4 text-blue-600" />
            Under Review
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 border border-rose-300">
            <XCircle className="h-4 w-4 text-rose-600" />
            Verification Declined
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-800 border border-slate-300">
            <Ban className="h-4 w-4 text-slate-600" />
            Account Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Pending Admin Review
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Verification Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Mentor Profile & Verification
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Maintain your professional credentials, experience, and domain expertise.
          </p>
        </div>
        <div>{renderStatusBadge()}</div>
      </div>

      {message && (
        <div
          className={`rounded-2xl p-4 text-xs font-medium border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {profile.verificationNotes && (
        <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-4 text-xs text-indigo-900">
          <span className="font-bold">Administrative Note: </span>
          <span>{profile.verificationNotes}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Professional Identity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Professional Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name <span className="text-rose-500">*</span>
              </label>
              <Input
                value={profile.displayName || ""}
                onChange={(e) =>
                  setProfile({ ...profile, displayName: e.target.value })
                }
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Years of Experience <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                min={0}
                value={profile.experienceYears || 0}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    experienceYears: Number(e.target.value),
                  })
                }
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Role / Title <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Staff Software Engineer, Senior Data Scientist"
                value={profile.currentRole || ""}
                onChange={(e) =>
                  setProfile({ ...profile, currentRole: e.target.value })
                }
                required
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Organization / Company <span className="text-rose-500">*</span>
              </label>
              <Input
                placeholder="e.g. Google, Microsoft, Stripe"
                value={profile.organization || ""}
                onChange={(e) =>
                  setProfile({ ...profile, organization: e.target.value })
                }
                required
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Headline <span className="text-rose-500">*</span>
            </label>
            <Input
              placeholder="e.g. Staff Engineer @ Google | Passionate about System Design & Mentoring"
              value={profile.headline || ""}
              onChange={(e) =>
                setProfile({ ...profile, headline: e.target.value })
              }
              required
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Biography & Mentoring Philosophy <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Share your career journey, what areas you specialize in, and how you prefer to help students..."
              value={profile.biography || ""}
              onChange={(e) =>
                setProfile({ ...profile, biography: e.target.value })
              }
              required
              className="w-full rounded-md border border-slate-200 p-3 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Expertise, Skills & Languages */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Expertise & Skills
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expertise Domains (Comma-separated)
            </label>
            <Input
              placeholder="Software Engineering, System Design, Frontend Development, Resume Reviews"
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technical Stack & Skills (Comma-separated)
            </label>
            <Input
              placeholder="TypeScript, React, Node.js, Go, Kubernetes, AWS, PyTorch"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Languages Spoken (Comma-separated)
            </label>
            <Input
              placeholder="English, Hindi, Bengali"
              value={languagesInput}
              onChange={(e) => setLanguagesInput(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        {/* Professional Verification Links */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Verification Links & Profiles
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                <span>LinkedIn URL</span>
              </label>
              <Input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={profile.professionalLinks?.linkedin || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    professionalLinks: {
                      ...profile.professionalLinks,
                      linkedin: e.target.value,
                    },
                  })
                }
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Github className="h-3.5 w-3.5" />
                <span>GitHub URL</span>
              </label>
              <Input
                type="url"
                placeholder="https://github.com/username"
                value={profile.professionalLinks?.github || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    professionalLinks: {
                      ...profile.professionalLinks,
                      github: e.target.value,
                    },
                  })
                }
                className="text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-emerald-600" />
                <span>Portfolio Website</span>
              </label>
              <Input
                type="url"
                placeholder="https://yourwebsite.dev"
                value={profile.professionalLinks?.portfolio || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    professionalLinks: {
                      ...profile.professionalLinks,
                      portfolio: e.target.value,
                    },
                  })
                }
                className="text-xs"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1.5" />
                Save Mentor Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
