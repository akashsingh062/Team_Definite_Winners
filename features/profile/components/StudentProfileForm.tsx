"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Briefcase,
  Plus,
  Trash2,
  ExternalLink,
  Award,
  Building,
  CheckCircle2,
  Save,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  IStudentProfile,
  ITechnicalSkill,
  IProjectItem,
  SkillCategory,
  SkillProficiency,
  IProfileCompletionBreakdown,
  ICertificationItem,
  IExperienceItem,
} from "@/types/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";

const SKILL_CATEGORIES: SkillCategory[] = [
  "Programming languages",
  "Frontend technologies",
  "Backend technologies",
  "Databases",
  "Development tools",
  "Other technical skills",
];

const PROFICIENCY_LEVELS: SkillProficiency[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

export function StudentProfileForm() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<
    "personal" | "academic" | "skills" | "projects" | "career" | "additional"
  >("personal");

  // Profile Form State
  const [personalInfo, setPersonalInfo] = React.useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profilePhotograph: "",
  });

  const [academicInfo, setAcademicInfo] = React.useState({
    collegeName: "",
    degree: "",
    branch: "",
    currentAcademicYear: "3rd Year",
    graduationYear: new Date().getFullYear() + 1,
    cgpa: "" as string | number,
  });

  const [skills, setSkills] = React.useState<ITechnicalSkill[]>([]);
  const [newSkillName, setNewSkillName] = React.useState("");
  const [newSkillCategory, setNewSkillCategory] =
    React.useState<SkillCategory>("Programming languages");
  const [newSkillProficiency, setNewSkillProficiency] =
    React.useState<SkillProficiency>("Intermediate");

  const [projects, setProjects] = React.useState<IProjectItem[]>([]);
  const [newProject, setNewProject] = React.useState({
    title: "",
    description: "",
    technologies: "",
    githubUrl: "",
    liveDeploymentUrl: "",
  });

  const [careerPreferences, setCareerPreferences] = React.useState({
    preferredJobRole: "",
    preferredEmploymentType: "Internship" as
      | "Internship"
      | "Full-time"
      | "Part-time"
      | "Fellowship",
    workPreference: "Hybrid" as "Remote" | "On-site" | "Hybrid",
    preferredLocation: "",
    expectedStipend: "",
  });

  const [certifications, setCertifications] = React.useState<ICertificationItem[]>([]);
  const [newCert, setNewCert] = React.useState({
    name: "",
    issuer: "",
    issueDate: "",
    url: "",
  });

  const [experiences, setExperiences] = React.useState<IExperienceItem[]>([]);
  const [newExp, setNewExp] = React.useState({
    role: "",
    company: "",
    duration: "",
    description: "",
  });

  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [githubUrl, setGithubUrl] = React.useState("");

  const [breakdown, setBreakdown] = React.useState<IProfileCompletionBreakdown>({
    personalInfo: 0,
    academicInfo: 0,
    technicalSkills: 0,
    projects: 0,
    careerPreferences: 0,
    total: 0,
  });

  const [validationErrors, setValidationErrors] = React.useState<string[]>([]);

  // Fetch initial profile from MongoDB
  React.useEffect(() => {
    let isMounted = true;

    async function fetchProfile() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push("/login?callbackUrl=/profile");
        return;
      }

      try {
        const res = await fetch("/api/student/profile");
        if (res.status === 401) {
          router.push("/login?callbackUrl=/profile");
          return;
        }

        const json = await res.json();
        if (json.success && json.data && isMounted) {
          const profile: IStudentProfile = json.data;
          setPersonalInfo({
            fullName: profile.personalInfo?.fullName || user?.name || "",
            email: profile.personalInfo?.email || user?.email || "",
            phoneNumber: profile.personalInfo?.phoneNumber || "",
            profilePhotograph: profile.personalInfo?.profilePhotograph || "",
          });

          setAcademicInfo({
            collegeName: profile.academicInfo?.collegeName || "",
            degree: profile.academicInfo?.degree || "",
            branch: profile.academicInfo?.branch || "",
            currentAcademicYear: profile.academicInfo?.currentAcademicYear || "3rd Year",
            graduationYear: profile.academicInfo?.graduationYear || new Date().getFullYear() + 1,
            cgpa: profile.academicInfo?.cgpa !== undefined ? profile.academicInfo.cgpa : "",
          });

          setSkills(profile.skills || []);
          setProjects(profile.projects || []);

          setCareerPreferences({
            preferredJobRole: profile.careerPreferences?.preferredJobRole || "",
            preferredEmploymentType:
              profile.careerPreferences?.preferredEmploymentType || "Internship",
            workPreference: profile.careerPreferences?.workPreference || "Hybrid",
            preferredLocation: profile.careerPreferences?.preferredLocation || "",
            expectedStipend: profile.careerPreferences?.expectedStipend || "",
          });

          setCertifications(profile.additionalInfo?.certifications || []);
          setExperiences(profile.additionalInfo?.experience || []);
          setLinkedinUrl(profile.additionalInfo?.linkedinUrl || "");
          setGithubUrl(profile.additionalInfo?.githubUrl || "");

          if (json.breakdown) {
            setBreakdown(json.breakdown);
          }
        }
      } catch (err) {
        console.error("Failed to load student profile:", err);
        toast.error("Failed to load profile data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!isAuthLoading) {
      fetchProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, router, user]);

  // Skill Add / Remove
  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error("Please enter a skill name.");
      return;
    }

    const exists = skills.some(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (exists) {
      toast.error("This skill is already in your profile.");
      return;
    }

    const newSkill: ITechnicalSkill = {
      id: "skill-" + Date.now(),
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
    };

    setSkills((prev) => [...prev, newSkill]);
    setNewSkillName("");
    toast.success(`Added ${newSkill.name}`);
  };

  const handleRemoveSkill = (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
  };

  // Project Add / Remove
  const handleAddProject = () => {
    if (!newProject.title.trim()) {
      toast.error("Project title is required.");
      return;
    }
    if (!newProject.description.trim()) {
      toast.error("Project description is required.");
      return;
    }
    if (!newProject.technologies.trim()) {
      toast.error("Please list technologies used (e.g. Next.js, MongoDB).");
      return;
    }

    const techArray = newProject.technologies
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const createdProject: IProjectItem = {
      id: "proj-" + Date.now(),
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      technologies: techArray,
      githubUrl: newProject.githubUrl.trim(),
      liveDeploymentUrl: newProject.liveDeploymentUrl.trim(),
    };

    setProjects((prev) => [...prev, createdProject]);
    setNewProject({
      title: "",
      description: "",
      technologies: "",
      githubUrl: "",
      liveDeploymentUrl: "",
    });
    toast.success("Project added successfully!");
  };

  const handleRemoveProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  // Certifications Add / Remove
  const handleAddCertification = () => {
    if (!newCert.name.trim()) {
      toast.error("Certification name is required.");
      return;
    }
    setCertifications((prev) => [
      ...prev,
      {
        id: "cert-" + Date.now(),
        name: newCert.name.trim(),
        issuer: newCert.issuer.trim(),
        issueDate: newCert.issueDate.trim(),
        url: newCert.url.trim(),
      },
    ]);
    setNewCert({ name: "", issuer: "", issueDate: "", url: "" });
    toast.success("Certification added!");
  };

  const handleRemoveCertification = (id: string) => {
    setCertifications((prev) => prev.filter((c) => c.id !== id));
  };

  // Experience Add / Remove
  const handleAddExperience = () => {
    if (!newExp.role.trim() || !newExp.company.trim()) {
      toast.error("Role and company are required.");
      return;
    }
    setExperiences((prev) => [
      ...prev,
      {
        id: "exp-" + Date.now(),
        role: newExp.role.trim(),
        company: newExp.company.trim(),
        duration: newExp.duration.trim(),
        description: newExp.description.trim(),
      },
    ]);
    setNewExp({ role: "", company: "", duration: "", description: "" });
    toast.success("Experience added!");
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  };

  // Submit profile to API
  const handleSaveProfile = async () => {
    setIsSaving(true);
    setValidationErrors([]);

    const payload = {
      personalInfo: {
        fullName: personalInfo.fullName.trim(),
        email: personalInfo.email.trim(),
        phoneNumber: personalInfo.phoneNumber.trim(),
        profilePhotograph: personalInfo.profilePhotograph.trim(),
      },
      academicInfo: {
        collegeName: academicInfo.collegeName.trim(),
        degree: academicInfo.degree.trim(),
        branch: academicInfo.branch.trim(),
        currentAcademicYear: academicInfo.currentAcademicYear,
        graduationYear: Number(academicInfo.graduationYear),
        cgpa:
          academicInfo.cgpa !== "" && academicInfo.cgpa !== undefined
            ? Number(academicInfo.cgpa)
            : undefined,
      },
      skills,
      projects,
      careerPreferences: {
        preferredJobRole: careerPreferences.preferredJobRole.trim(),
        preferredEmploymentType: careerPreferences.preferredEmploymentType,
        workPreference: careerPreferences.workPreference,
        preferredLocation: careerPreferences.preferredLocation.trim(),
        expectedStipend: careerPreferences.expectedStipend.trim(),
      },
      additionalInfo: {
        certifications,
        experience: experiences,
        linkedinUrl: linkedinUrl.trim(),
        githubUrl: githubUrl.trim(),
      },
    };

    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (result.details) {
          const errorsList: string[] = [];
          Object.entries(result.details).forEach(([key, val]: [string, any]) => {
            if (val?._errors?.length) {
              errorsList.push(`${key}: ${val._errors.join(", ")}`);
            }
          });
          setValidationErrors(errorsList);
        }
        toast.error(result.error || "Failed to save profile. Please fix errors.");
        return;
      }

      if (result.breakdown) {
        setBreakdown(result.breakdown);
      }

      toast.success("Profile saved successfully to MongoDB!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to connect to the server. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-slate-500 font-medium">Loading your student profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header & Completion Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Student Profile Management
            </h1>
            <Badge variant="indigo">Verified Student</Badge>
          </div>
          <p className="text-sm text-slate-500">
            Complete all sections to boost your visibility and enable explainable opportunity matching.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Profile Completion</div>
            <div className="text-2xl font-extrabold text-indigo-600">{breakdown.total}%</div>
          </div>
          <div className="w-32 bg-slate-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${breakdown.total}%` }}
            />
          </div>
          <Button
            onClick={handleSaveProfile}
            variant="primary"
            size="sm"
            isLoading={isSaving}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </Button>
        </div>
      </div>

      {/* Completion Breakdown Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Personal Info", score: breakdown.personalInfo, max: 20 },
          { label: "Academic Info", score: breakdown.academicInfo, max: 20 },
          { label: "Technical Skills", score: breakdown.technicalSkills, max: 25 },
          { label: "Projects", score: breakdown.projects, max: 20 },
          { label: "Career Preferences", score: breakdown.careerPreferences, max: 15 },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 bg-white rounded-xl border border-slate-200 text-center space-y-1"
          >
            <span className="text-[11px] font-medium text-slate-500 block truncate">
              {item.label}
            </span>
            <span className="text-sm font-bold text-slate-800">
              {item.score} / {item.max}%
            </span>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all"
                style={{ width: `${(item.score / item.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <Alert variant="error" title="Profile Validation Notice">
          <ul className="list-disc pl-4 space-y-1 text-xs">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: "personal", label: "Personal Information", icon: User },
          { id: "academic", label: "Academic Records", icon: GraduationCap },
          { id: "skills", label: "Technical Skills", icon: Sparkles },
          { id: "projects", label: "Projects & Portfolios", icon: FolderGit2 },
          { id: "career", label: "Career Preferences", icon: Briefcase },
          { id: "additional", label: "Additional Info", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB A: Personal Information */}
      {activeTab === "personal" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              A. Personal Information
            </CardTitle>
            <CardDescription>
              Basic contact credentials. Email is verified from your account registration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Alex Rivera"
                value={personalInfo.fullName}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, fullName: e.target.value })
                }
              />
              <Input
                label="Email Address (Read-only)"
                value={personalInfo.email}
                disabled
                helperText="Synced with authentication profile."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number (Optional)"
                placeholder="+1 (555) 234-5678"
                value={personalInfo.phoneNumber}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })
                }
              />
              <Input
                label="Profile Photograph URL (Optional)"
                placeholder="https://images.example.com/avatar.jpg"
                value={personalInfo.profilePhotograph}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, profilePhotograph: e.target.value })
                }
                helperText="Direct image URL for your profile avatar."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB B: Academic Information */}
      {activeTab === "academic" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              B. Academic Information
            </CardTitle>
            <CardDescription>
              College credentials and graduation timeline used for campus eligibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="College / University Name"
                placeholder="e.g. State University of Technology"
                value={academicInfo.collegeName}
                onChange={(e) =>
                  setAcademicInfo({ ...academicInfo, collegeName: e.target.value })
                }
              />
              <Input
                label="Degree"
                placeholder="e.g. B.Tech, B.S., M.S."
                value={academicInfo.degree}
                onChange={(e) =>
                  setAcademicInfo({ ...academicInfo, degree: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Branch / Department"
                placeholder="e.g. Computer Science & Engineering"
                value={academicInfo.branch}
                onChange={(e) =>
                  setAcademicInfo({ ...academicInfo, branch: e.target.value })
                }
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Current Academic Year
                </label>
                <select
                  value={academicInfo.currentAcademicYear}
                  onChange={(e) =>
                    setAcademicInfo({
                      ...academicInfo,
                      currentAcademicYear: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Final Year">Final Year</option>
                  <option value="Graduate / Post-Grad">Graduate / Post-Grad</option>
                </select>
              </div>

              <Input
                label="Graduation Year"
                type="number"
                value={academicInfo.graduationYear}
                onChange={(e) =>
                  setAcademicInfo({
                    ...academicInfo,
                    graduationYear: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="max-w-xs">
              <Input
                label="CGPA / Percentage (Optional)"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="e.g. 8.75"
                value={academicInfo.cgpa}
                onChange={(e) =>
                  setAcademicInfo({ ...academicInfo, cgpa: e.target.value })
                }
                helperText="Scale of 10.0 or equivalent GPA."
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB C: Technical Skills */}
      {activeTab === "skills" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              C. Technical Skills
            </CardTitle>
            <CardDescription>
              Add skills organized across categories. The AI matcher benchmarks these against job requirements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add skill row */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter skill name (e.g. TypeScript, React, PostgreSQL)..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="w-full sm:w-56">
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-36">
                <select
                  value={newSkillProficiency}
                  onChange={(e) =>
                    setNewSkillProficiency(e.target.value as SkillProficiency)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  {PROFICIENCY_LEVELS.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                onClick={handleAddSkill}
                variant="primary"
                className="gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            </div>

            {/* Render grouped skills */}
            {skills.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                No technical skills added yet. Add at least 3 skills to reach 20% completion for this section.
              </div>
            ) : (
              <div className="space-y-4">
                {SKILL_CATEGORIES.map((category) => {
                  const categorySkills = skills.filter((s) => s.category === category);
                  if (categorySkills.length === 0) return null;

                  return (
                    <div key={category} className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {category} ({categorySkills.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {categorySkills.map((skill) => (
                          <div
                            key={skill.id}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-950 text-xs shadow-2xs"
                          >
                            <span className="font-semibold">{skill.name}</span>
                            <Badge variant="indigo" className="text-[10px] py-0 px-1.5">
                              {skill.proficiency}
                            </Badge>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors ml-1"
                              aria-label={`Remove ${skill.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB D: Projects */}
      {activeTab === "projects" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-indigo-600" />
              D. Projects & Portfolios
            </CardTitle>
            <CardDescription>
              Demonstrated code and projects are the #1 factor in our skills-over-pedigree matching engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project List */}
            {projects.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800">
                  Added Projects ({projects.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between">
                          <h5 className="font-bold text-slate-900 text-sm">{proj.title}</h5>
                          <button
                            type="button"
                            onClick={() => handleRemoveProject(proj.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors"
                            aria-label="Remove project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-3">
                          {proj.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1">
                          {proj.technologies.map((t, idx) => (
                            <Badge key={idx} variant="slate" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-indigo-600">
                          {proj.githubUrl && (
                            <a
                              href={proj.githubUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              GitHub Repo
                            </a>
                          )}
                          {proj.liveDeploymentUrl && (
                            <a
                              href={proj.liveDeploymentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 hover:underline text-emerald-600"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Live Demo
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Project Card */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add New Project
              </h4>

              <div className="space-y-3">
                <Input
                  label="Project Title"
                  placeholder="e.g. Distributed Task Queue or Campus Marketplace"
                  value={newProject.title}
                  onChange={(e) =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                />

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Project Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe problem solved, system architecture, and your contributions..."
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <Input
                  label="Technologies Used"
                  placeholder="e.g. React, Next.js, Node.js, MongoDB (comma-separated)"
                  value={newProject.technologies}
                  onChange={(e) =>
                    setNewProject({ ...newProject, technologies: e.target.value })
                  }
                  helperText="Separate multiple technologies with commas."
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="GitHub URL (Optional)"
                    placeholder="https://github.com/username/project"
                    value={newProject.githubUrl}
                    onChange={(e) =>
                      setNewProject({ ...newProject, githubUrl: e.target.value })
                    }
                  />
                  <Input
                    label="Live Deployment URL (Optional)"
                    placeholder="https://myproject.vercel.app"
                    value={newProject.liveDeploymentUrl}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        liveDeploymentUrl: e.target.value,
                      })
                    }
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleAddProject}
                  variant="primary"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Save Project to List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB E: Career Preferences */}
      {activeTab === "career" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              E. Career Preferences
            </CardTitle>
            <CardDescription>
              Specify the types of roles, modalities, and locations you are actively seeking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Preferred Job Role"
                placeholder="e.g. Full-Stack Engineer, Frontend Developer, Data Analyst"
                value={careerPreferences.preferredJobRole}
                onChange={(e) =>
                  setCareerPreferences({
                    ...careerPreferences,
                    preferredJobRole: e.target.value,
                  })
                }
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Employment Type
                </label>
                <select
                  value={careerPreferences.preferredEmploymentType}
                  onChange={(e) =>
                    setCareerPreferences({
                      ...careerPreferences,
                      preferredEmploymentType: e.target.value as any,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Fellowship">Fellowship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Work Preference
                </label>
                <select
                  value={careerPreferences.workPreference}
                  onChange={(e) =>
                    setCareerPreferences({
                      ...careerPreferences,
                      workPreference: e.target.value as any,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>

              <Input
                label="Preferred Location"
                placeholder="e.g. San Francisco, CA or Bengaluru"
                value={careerPreferences.preferredLocation}
                onChange={(e) =>
                  setCareerPreferences({
                    ...careerPreferences,
                    preferredLocation: e.target.value,
                  })
                }
              />

              <Input
                label="Expected Stipend / Compensation (Optional)"
                placeholder="e.g. $4,000/mo or ₹25,000/mo"
                value={careerPreferences.expectedStipend}
                onChange={(e) =>
                  setCareerPreferences({
                    ...careerPreferences,
                    expectedStipend: e.target.value,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB F: Additional Information */}
      {activeTab === "additional" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              F. Additional Information
            </CardTitle>
            <CardDescription>
              Certifications, past internships, and verified public profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="LinkedIn Profile URL (Optional)"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
              <Input
                label="GitHub Profile URL (Optional)"
                placeholder="https://github.com/username"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
              />
            </div>

            {/* Certifications Section */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900">
                Certifications ({certifications.length})
              </h4>

              {certifications.length > 0 && (
                <div className="space-y-2">
                  {certifications.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">{c.name}</p>
                        <p className="text-slate-500">
                          {c.issuer} {c.issueDate && `• ${c.issueDate}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCertification(c.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg">
                <input
                  type="text"
                  placeholder="Cert Name (e.g. AWS Cloud Practitioner)"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  className="rounded-lg border border-slate-300 p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Issuer (e.g. Amazon Web Services)"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                  className="rounded-lg border border-slate-300 p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Issue Date (e.g. Dec 2025)"
                  value={newCert.issueDate}
                  onChange={(e) =>
                    setNewCert({ ...newCert, issueDate: e.target.value })
                  }
                  className="rounded-lg border border-slate-300 p-2 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCertification}
                  className="text-xs"
                >
                  Add Cert
                </Button>
              </div>
            </div>

            {/* Experience Section */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900">
                Previous Internships / Work Experience ({experiences.length})
              </h4>

              {experiences.length > 0 && (
                <div className="space-y-2">
                  {experiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          {exp.role} at {exp.company}
                        </p>
                        <p className="text-slate-500">{exp.duration}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg">
                <input
                  type="text"
                  placeholder="Role (e.g. SDE Intern)"
                  value={newExp.role}
                  onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                  className="rounded-lg border border-slate-300 p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Company (e.g. Acme Corp)"
                  value={newExp.company}
                  onChange={(e) =>
                    setNewExp({ ...newExp, company: e.target.value })
                  }
                  className="rounded-lg border border-slate-300 p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. May - Aug 2025)"
                  value={newExp.duration}
                  onChange={(e) =>
                    setNewExp({ ...newExp, duration: e.target.value })
                  }
                  className="rounded-lg border border-slate-300 p-2 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddExperience}
                  className="text-xs"
                >
                  Add Experience
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom Save & Action Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All updates are validated and secured in MongoDB.</span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            size="md"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={handleSaveProfile}
            variant="primary"
            size="md"
            isLoading={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  );
}

