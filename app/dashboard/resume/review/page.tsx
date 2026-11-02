"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  User,
  GraduationCap,
  Code,
  Sparkles,
  FolderGit2,
  Briefcase,
  Award,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Save,
  Check,
  ShieldCheck,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { IResume, IResumeParsedData, IResumeMergeOptions } from "@/types/resume";
import { toast } from "sonner";

function SkillCategoryEditor({
  title,
  skills,
  onChange,
}: {
  title: string;
  skills: string[];
  onChange: (skills: string[]) => void;
}) {
  const [inputVal, setInputVal] = React.useState("");

  const addSkill = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
      setInputVal("");
    }
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2 rounded-xl bg-slate-50/70 p-3.5 border border-slate-200">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {title} ({skills.length})
        </label>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Add skill..."
          className="h-8 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-8 px-2.5 text-xs"
          onClick={addSkill}
        >
          <Plus className="h-3 w-3 mr-1" /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {skills.map((s, idx) => (
          <span
            key={`${s}-${idx}`}
            className="inline-flex items-center gap-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 shadow-2xs"
          >
            {s}
            <button
              type="button"
              onClick={() => removeSkill(idx)}
              className="text-slate-400 hover:text-rose-600"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <span className="text-[11px] text-slate-400 italic">No skills listed in this category</span>
        )}
      </div>
    </div>
  );
}

export default function ResumeReviewPage() {
  const router = useRouter();
  const [resume, setResume] = React.useState<IResume | null>(null);
  const [data, setData] = React.useState<IResumeParsedData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingDraft, setIsSavingDraft] = React.useState(false);
  const [isApproving, setIsApproving] = React.useState(false);

  // Merge Preferences (Defaulting to safe non-destructive merging)
  const [mergeOptions, setMergeOptions] = React.useState<IResumeMergeOptions>({
    mergeTechnicalSkills: true,
    addProjects: true,
    updateEducation: true,
    addCertifications: true,
    addExperience: true,
    replacePersonalInfo: false,
  });

  React.useEffect(() => {
    async function loadResume() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/resume");
        if (!res.ok) throw new Error("Failed to load resume");
        const json = await res.json();
        if (json.data) {
          setResume(json.data);
          setData(json.data.parsedData);
        } else {
          router.push("/dashboard/resume");
        }
      } catch (err) {
        console.error("Resume load error:", err);
        toast.error("Failed to load resume analysis");
      } finally {
        setIsLoading(false);
      }
    }

    loadResume();
  }, [router]);

  if (isLoading) {
    return (
      <StudentPortalLayout>
        <div className="p-16 text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="text-sm text-slate-500">Loading extracted resume data...</p>
        </div>
      </StudentPortalLayout>
    );
  }

  if (!resume || !data) {
    return (
      <StudentPortalLayout>
        <div className="p-12 text-center space-y-3">
          <p className="text-sm text-slate-600">No analyzed resume found.</p>
          <Link href="/dashboard/resume">
            <Button variant="primary" size="sm">
              Upload Resume
            </Button>
          </Link>
        </div>
      </StudentPortalLayout>
    );
  }

  // --- Field Mutators ---
  const updatePersonalInfo = (field: keyof typeof data.personalInfo, val: string) => {
    setData((prev) =>
      prev ? { ...prev, personalInfo: { ...prev.personalInfo, [field]: val } } : prev
    );
  };

  const updateEducationEntry = (
    index: number,
    field: string,
    val: string | number | undefined
  ) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, education: updated };
    });
  };

  const addEducationEntry = () => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            education: [
              ...prev.education,
              { institution: "", degree: "", branch: "", graduationYear: new Date().getFullYear() },
            ],
          }
        : prev
    );
  };

  const removeEducationEntry = (index: number) => {
    setData((prev) =>
      prev ? { ...prev, education: prev.education.filter((_, i) => i !== index) } : prev
    );
  };

  const updateTechnicalSkillsCategory = (
    category: keyof typeof data.technicalSkills,
    skills: string[]
  ) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            technicalSkills: { ...prev.technicalSkills, [category]: skills },
          }
        : prev
    );
  };

  const updateProject = (index: number, field: string, val: any) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, projects: updated };
    });
  };

  const addProject = () => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            projects: [
              ...prev.projects,
              { title: "New Project", description: "", technologies: [] },
            ],
          }
        : prev
    );
  };

  const removeProject = (index: number) => {
    setData((prev) =>
      prev ? { ...prev, projects: prev.projects.filter((_, i) => i !== index) } : prev
    );
  };

  const updateExperience = (index: number, field: string, val: any) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, experience: updated };
    });
  };

  const addExperience = () => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            experience: [
              ...prev.experience,
              { company: "", jobTitle: "", responsibilities: [] },
            ],
          }
        : prev
    );
  };

  const removeExperience = (index: number) => {
    setData((prev) =>
      prev ? { ...prev, experience: prev.experience.filter((_, i) => i !== index) } : prev
    );
  };

  const updateCertification = (index: number, field: string, val: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.certifications];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, certifications: updated };
    });
  };

  const addCertification = () => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            certifications: [
              ...prev.certifications,
              { name: "", issuer: "", issueDate: "" },
            ],
          }
        : prev
    );
  };

  const removeCertification = (index: number) => {
    setData((prev) =>
      prev ? { ...prev, certifications: prev.certifications.filter((_, i) => i !== index) } : prev
    );
  };

  // --- Save as Draft Action ---
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true);
      const res = await fetch("/api/resume", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume._id,
          parsedData: data,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save draft");

      toast.success("Resume edits saved as draft! Your profile remains untouched.");
    } catch (err: any) {
      toast.error(err.message || "Error saving draft");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // --- Approve and Update Profile Action ---
  const handleApproveAndSync = async () => {
    try {
      setIsApproving(true);
      const res = await fetch("/api/resume/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resume._id,
          approvedData: data,
          mergeOptions,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to approve resume");

      toast.success("Resume approved! Your student profile has been updated.");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Error approving resume");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <StudentPortalLayout>
      <div className="space-y-8 max-w-5xl mx-auto pb-16">
        {/* Navigation & Header */}
        <div>
          <Link
            href="/dashboard/resume"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Resume Overview
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Review & Edit Extracted Data
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Correct any information before confirming. Your profile will only be updated when you click &quot;Approve and Update Profile&quot;.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleSaveDraft}
                isLoading={isSavingDraft}
                disabled={isApproving}
              >
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={handleApproveAndSync}
                isLoading={isApproving}
                disabled={isSavingDraft}
              >
                <Check className="h-4 w-4" />
                Approve & Update Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Audit & Transparency Guarantee Box */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-slate-600 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-indigo-950">
              Student Sovereignty & Verification Guarantee
            </p>
            <p className="text-slate-600 leading-normal">
              AI extractions are suggestions, not verified facts. You have complete autonomy to add missing credentials, remove incorrect records, or keep your existing profile information intact.
            </p>
          </div>
        </div>

        {/* Section 1: Personal Information */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Personal Contact Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Full Name"
                value={data.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
              />
              <Input
                label="Email Address"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
              />
              <Input
                label="Phone Number"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="LinkedIn Profile"
                value={data.personalInfo.linkedin}
                onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
              />
              <Input
                label="GitHub Profile"
                value={data.personalInfo.github}
                onChange={(e) => updatePersonalInfo("github", e.target.value)}
              />
              <Input
                label="Portfolio / Website"
                value={data.personalInfo.portfolio}
                onChange={(e) => updatePersonalInfo("portfolio", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Education */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Education History</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={addEducationEntry}
            >
              <Plus className="h-3.5 w-3.5" /> Add Institution
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.education.map((edu, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/40 relative"
              >
                <button
                  type="button"
                  onClick={() => removeEducationEntry(idx)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-rose-600"
                  title="Remove education entry"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-6">
                  <Input
                    label="Institution / University"
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducationEntry(idx, "institution", e.target.value)
                    }
                  />
                  <Input
                    label="Degree"
                    placeholder="e.g. B.Tech / B.S."
                    value={edu.degree}
                    onChange={(e) => updateEducationEntry(idx, "degree", e.target.value)}
                  />
                  <Input
                    label="Branch / Major"
                    placeholder="e.g. Computer Science"
                    value={edu.branch}
                    onChange={(e) => updateEducationEntry(idx, "branch", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    label="Start Year"
                    value={edu.startYear !== undefined ? String(edu.startYear) : ""}
                    onChange={(e) =>
                      updateEducationEntry(idx, "startYear", e.target.value)
                    }
                  />
                  <Input
                    label="Graduation Year"
                    value={edu.graduationYear !== undefined ? String(edu.graduationYear) : ""}
                    onChange={(e) =>
                      updateEducationEntry(idx, "graduationYear", e.target.value)
                    }
                  />
                  <Input
                    label="CGPA / Grade"
                    value={edu.cgpa !== undefined ? String(edu.cgpa) : ""}
                    onChange={(e) => updateEducationEntry(idx, "cgpa", e.target.value)}
                  />
                </div>
              </div>
            ))}
            {data.education.length === 0 && (
              <p className="text-xs text-slate-400 italic">No education entries extracted.</p>
            )}
          </CardContent>
        </Card>

        {/* Section 3: Technical Skills Categorized */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Technical Skills by Category</CardTitle>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Type a skill and press Enter to add. Click &apos;x&apos; to remove incorrect skills.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkillCategoryEditor
                title="Programming Languages"
                skills={data.technicalSkills.programmingLanguages || []}
                onChange={(s) =>
                  updateTechnicalSkillsCategory("programmingLanguages", s)
                }
              />
              <SkillCategoryEditor
                title="Frontend Technologies"
                skills={data.technicalSkills.frontend || []}
                onChange={(s) => updateTechnicalSkillsCategory("frontend", s)}
              />
              <SkillCategoryEditor
                title="Backend Technologies"
                skills={data.technicalSkills.backend || []}
                onChange={(s) => updateTechnicalSkillsCategory("backend", s)}
              />
              <SkillCategoryEditor
                title="Databases"
                skills={data.technicalSkills.databases || []}
                onChange={(s) => updateTechnicalSkillsCategory("databases", s)}
              />
              <SkillCategoryEditor
                title="Frameworks & Libraries"
                skills={data.technicalSkills.frameworks || []}
                onChange={(s) => updateTechnicalSkillsCategory("frameworks", s)}
              />
              <SkillCategoryEditor
                title="Developer Tools"
                skills={data.technicalSkills.tools || []}
                onChange={(s) => updateTechnicalSkillsCategory("tools", s)}
              />
              <SkillCategoryEditor
                title="Cloud Technologies"
                skills={data.technicalSkills.cloud || []}
                onChange={(s) => updateTechnicalSkillsCategory("cloud", s)}
              />
              <SkillCategoryEditor
                title="Other Technical Competencies"
                skills={data.technicalSkills.other || []}
                onChange={(s) => updateTechnicalSkillsCategory("other", s)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Soft Skills */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-base">Soft Skills & Leadership</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SkillCategoryEditor
              title="Verified Soft Skills"
              skills={data.softSkills || []}
              onChange={(s) => setData((prev) => (prev ? { ...prev, softSkills: s } : prev))}
            />
          </CardContent>
        </Card>

        {/* Section 5: Projects */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-base">Projects Portfolio</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={addProject}
            >
              <Plus className="h-3.5 w-3.5" /> Add Project
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.projects.map((proj, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/40 relative"
              >
                <button
                  type="button"
                  onClick={() => removeProject(idx)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-rose-600"
                  title="Remove project"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                  <Input
                    label="Project Title"
                    value={proj.title}
                    onChange={(e) => updateProject(idx, "title", e.target.value)}
                  />
                  <Input
                    label="Technologies (comma separated)"
                    value={(proj.technologies || []).join(", ")}
                    onChange={(e) =>
                      updateProject(
                        idx,
                        "technologies",
                        e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                      )
                    }
                  />
                </div>
                <Textarea
                  label="Description & Responsibilities"
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateProject(idx, "description", e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="GitHub Repository URL"
                    placeholder="https://github.com/..."
                    value={proj.githubUrl || ""}
                    onChange={(e) => updateProject(idx, "githubUrl", e.target.value)}
                  />
                  <Input
                    label="Live Deployment Link"
                    placeholder="https://..."
                    value={proj.liveDeploymentUrl || ""}
                    onChange={(e) =>
                      updateProject(idx, "liveDeploymentUrl", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
            {data.projects.length === 0 && (
              <p className="text-xs text-slate-400 italic">No projects extracted.</p>
            )}
          </CardContent>
        </Card>

        {/* Section 6: Work Experience */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-sky-600" />
              <CardTitle className="text-base">Work & Internship Experience</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={addExperience}
            >
              <Plus className="h-3.5 w-3.5" /> Add Experience
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/40 relative"
              >
                <button
                  type="button"
                  onClick={() => removeExperience(idx)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-rose-600"
                  title="Remove experience entry"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-6">
                  <Input
                    label="Company / Organization"
                    value={exp.company}
                    onChange={(e) => updateExperience(idx, "company", e.target.value)}
                  />
                  <Input
                    label="Job Title / Role"
                    value={exp.jobTitle}
                    onChange={(e) => updateExperience(idx, "jobTitle", e.target.value)}
                  />
                  <Input
                    label="Duration / Dates"
                    placeholder="e.g. Jun 2024 - Aug 2024"
                    value={`${exp.startDate || ""} - ${exp.endDate || ""}`}
                    onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                  />
                </div>
                <Textarea
                  label="Responsibilities / Key Contributions"
                  rows={2}
                  value={(exp.responsibilities || []).join(". ")}
                  onChange={(e) =>
                    updateExperience(
                      idx,
                      "responsibilities",
                      e.target.value.split(". ").filter(Boolean)
                    )
                  }
                />
              </div>
            ))}
            {data.experience.length === 0 && (
              <p className="text-xs text-slate-400 italic">No experience records extracted.</p>
            )}
          </CardContent>
        </Card>

        {/* Section 7: Certifications */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-base">Certifications</CardTitle>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={addCertification}
            >
              <Plus className="h-3.5 w-3.5" /> Add Certification
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.certifications.map((cert, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/40 relative"
              >
                <button
                  type="button"
                  onClick={() => removeCertification(idx)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-rose-600"
                  title="Remove certification"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pr-6">
                  <Input
                    label="Certification Name"
                    value={cert.name}
                    onChange={(e) => updateCertification(idx, "name", e.target.value)}
                  />
                  <Input
                    label="Issuer"
                    value={cert.issuer || ""}
                    onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                  />
                  <Input
                    label="Credential Link / URL"
                    value={cert.credentialUrl || ""}
                    onChange={(e) =>
                      updateCertification(idx, "credentialUrl", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
            {data.certifications.length === 0 && (
              <p className="text-xs text-slate-400 italic">No certifications extracted.</p>
            )}
          </CardContent>
        </Card>

        {/* Section 8: Quality Feedback Preview */}
        {data.resumeAnalysis && (
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-base">
                  AI Quality Observations & Formatting Insights
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {data.resumeAnalysis.completenessAssessment && (
                <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Completeness Summary:
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    {data.resumeAnalysis.completenessAssessment}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.resumeAnalysis.missingInformation?.length > 0 && (
                  <div className="rounded-xl bg-amber-50/50 p-3.5 border border-amber-200">
                    <span className="font-semibold text-amber-900 block mb-1">
                      Recommended Information to Add:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      {data.resumeAnalysis.missingInformation.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.resumeAnalysis.formattingObservations?.length > 0 && (
                  <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                    <span className="font-semibold text-slate-900 block mb-1">
                      Formatting Observations:
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      {data.resumeAnalysis.formattingObservations.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section 9: Profile Merge Preferences */}
        <Card className="border-indigo-200 bg-indigo-50/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-base">Profile Merge Preferences</CardTitle>
            </div>
            <p className="text-xs text-slate-500">
              Control exactly which categories of extracted data will be integrated into your active CareerBridge profile.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={mergeOptions.mergeTechnicalSkills}
                onChange={(e) =>
                  setMergeOptions((prev) => ({
                    ...prev,
                    mergeTechnicalSkills: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Merge technical skills into profile (prevents duplicates automatically)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={mergeOptions.addProjects}
                onChange={(e) =>
                  setMergeOptions((prev) => ({ ...prev, addProjects: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Add newly extracted projects to profile portfolio</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={mergeOptions.updateEducation}
                onChange={(e) =>
                  setMergeOptions((prev) => ({ ...prev, updateEducation: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Fill in empty academic information (college, degree, branch, graduation year)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={mergeOptions.addCertifications}
                onChange={(e) =>
                  setMergeOptions((prev) => ({
                    ...prev,
                    addCertifications: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Add certifications to profile</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 select-none">
              <input
                type="checkbox"
                checked={mergeOptions.addExperience}
                onChange={(e) =>
                  setMergeOptions((prev) => ({ ...prev, addExperience: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Add work and internship experience</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-700 select-none pt-1 border-t border-slate-200">
              <input
                type="checkbox"
                checked={mergeOptions.replacePersonalInfo}
                onChange={(e) =>
                  setMergeOptions((prev) => ({
                    ...prev,
                    replacePersonalInfo: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Update contact details (phone, LinkedIn, GitHub URLs) from resume</span>
            </label>
          </CardContent>
        </Card>

        {/* Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <Link href="/dashboard/resume">
            <Button variant="outline" size="sm">
              Discard Changes & Return
            </Button>
          </Link>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="md"
              className="w-full sm:w-auto gap-2"
              onClick={handleSaveDraft}
              isLoading={isSavingDraft}
              disabled={isApproving}
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              onClick={handleApproveAndSync}
              isLoading={isApproving}
              disabled={isSavingDraft}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve and Update Profile
            </Button>
          </div>
        </div>
      </div>
    </StudentPortalLayout>
  );
}

