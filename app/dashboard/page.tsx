"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  GraduationCap,
  FolderGit2,
  Briefcase,
  Target,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  Clock,
  Compass,
  Layers,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { IStudentProfile, IProfileCompletionBreakdown } from "@/types/student";
import { MetricCard } from "@/features/dashboard/components/MetricCard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";

import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [profile, setProfile] = React.useState<IStudentProfile | null>(null);
  const [breakdown, setBreakdown] = React.useState<IProfileCompletionBreakdown | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push("/login?callbackUrl=/dashboard");
        return;
      }

      try {
        const res = await fetch("/api/student/profile");
        if (res.status === 401) {
          router.push("/login?callbackUrl=/dashboard");
          return;
        }

        const json = await res.json();
        if (json.success && json.data && isMounted) {
          setProfile(json.data);
          if (json.breakdown) {
            setBreakdown(json.breakdown);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!isAuthLoading) {
      fetchDashboardData();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-slate-500 font-medium">Loading your student dashboard...</p>
      </div>
    );
  }

  const studentName = profile?.personalInfo?.fullName || user?.name || "Student";
  const completionPercentage = breakdown?.total || profile?.profileCompletionPercentage || 0;
  const totalSkills = profile?.skills?.length || 0;
  const totalProjects = profile?.projects?.length || 0;
  const preferredRole = profile?.careerPreferences?.preferredJobRole || "Not specified";

  return (
    <StudentPortalLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 md:p-8 text-white shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="indigo" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Stage 1: Profile & Credentials Active
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {studentName}!
              </h1>
              <p className="text-indigo-200 text-sm max-w-xl leading-relaxed">
                Your CareerBridge profile serves as your single source of truth for skills,
                projects, and preferences. Complete each section to ensure maximum visibility.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-indigo-200 font-medium">Profile Completion</span>
                  <span className="font-bold text-white">{completionPercentage}%</span>
                </div>
                <div className="w-40 h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>

              <Link href="/profile">
                <Button variant="accent" size="sm" className="gap-1.5 whitespace-nowrap shadow-sm">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Profile Completion"
            value={`${completionPercentage}%`}
            description={
              completionPercentage >= 80
                ? "Profile is recruitment ready"
                : "Complete more sections"
            }
            icon={Target}
            iconColor={completionPercentage >= 80 ? "emerald" : "indigo"}
          />
          <MetricCard
            title="Technical Skills"
            value={totalSkills}
            description={
              totalSkills > 0
                ? `${totalSkills} competencies registered`
                : "No skills added yet"
            }
            icon={Sparkles}
            iconColor="indigo"
          />
          <MetricCard
            title="Projects & Portfolios"
            value={totalProjects}
            description={
              totalProjects > 0
                ? `${totalProjects} verified code projects`
                : "Add projects to build proof"
            }
            icon={FolderGit2}
            iconColor="amber"
          />
          <MetricCard
            title="Target Career Role"
            value={preferredRole}
            description={
              profile?.careerPreferences?.preferredEmploymentType
                ? `${profile.careerPreferences.preferredEmploymentType} • ${profile.careerPreferences.workPreference}`
                : "Set your target role"
            }
            icon={Briefcase}
            iconColor="slate"
          />
        </div>

        {/* Profile Completion Weighted Breakdown */}
        {breakdown && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Profile Completion Breakdown
                  </CardTitle>
                  <CardDescription>
                    Weighted scores calculated dynamically based on validated information.
                  </CardDescription>
                </div>
                <span className="text-sm font-extrabold text-indigo-600">
                  {breakdown.total} / 100%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: "Personal Information", score: breakdown.personalInfo, max: 20 },
                  { label: "Academic Records", score: breakdown.academicInfo, max: 20 },
                  { label: "Technical Skills", score: breakdown.technicalSkills, max: 25 },
                  { label: "Projects Portfolio", score: breakdown.projects, max: 20 },
                  { label: "Career Preferences", score: breakdown.careerPreferences, max: 15 },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium truncate">{item.label}</span>
                      <span className="font-bold text-slate-900">
                        {item.score}/{item.max}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${(item.score / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Education & Skills & Projects */}
          <div className="lg:col-span-2 space-y-6">
            {/* Education Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <CardTitle className="text-base font-bold">Academic Information</CardTitle>
                </div>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                    Update
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {profile?.academicInfo?.collegeName ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">College / University</p>
                      <p className="font-semibold text-slate-900">
                        {profile.academicInfo.collegeName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Degree & Branch</p>
                      <p className="font-semibold text-slate-900">
                        {profile.academicInfo.degree} in {profile.academicInfo.branch}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Academic Standing</p>
                      <p className="font-semibold text-slate-900">
                        {profile.academicInfo.currentAcademicYear} (Class of{" "}
                        {profile.academicInfo.graduationYear})
                      </p>
                    </div>
                    {profile.academicInfo.cgpa !== undefined && (
                      <div>
                        <p className="text-xs text-slate-500">Cumulative GPA / Score</p>
                        <p className="font-semibold text-slate-900">
                          {profile.academicInfo.cgpa} / 10.0
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                    <GraduationCap className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No academic records entered yet.</p>
                    <p className="text-xs text-slate-500">
                      Add your institution, branch, and graduation year to unlock eligibility checks.
                    </p>
                    <Link href="/profile">
                      <Button variant="outline" size="sm" className="mt-2">
                        Add Education Info
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technical Skills Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <CardTitle className="text-base font-bold">
                    Technical Skills ({totalSkills})
                  </CardTitle>
                </div>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                    Manage Skills
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {totalSkills > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-950 text-xs font-medium"
                      >
                        <span>{skill.name}</span>
                        <Badge variant="indigo" className="text-[10px] py-0 px-1">
                          {skill.proficiency}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                    <Sparkles className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No technical skills added yet.</p>
                    <p className="text-xs text-slate-500">
                      Register programming languages, frontend/backend tools, and databases.
                    </p>
                    <Link href="/profile">
                      <Button variant="outline" size="sm" className="mt-2">
                        Add Skills
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-600" />
                  <CardTitle className="text-base font-bold">
                    Projects & Portfolios ({totalProjects})
                  </CardTitle>
                </div>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                    Add Project
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {totalProjects > 0 ? (
                  <div className="space-y-3">
                    {profile?.projects.map((project) => (
                      <div
                        key={project.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{project.title}</h4>
                          <div className="flex items-center gap-3 text-xs">
                            {project.githubUrl && (
                              <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Code
                              </a>
                            )}
                            {project.liveDeploymentUrl && (
                              <a
                                href={project.liveDeploymentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-600 hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Live Demo
                              </a>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {project.description}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {project.technologies.map((t, idx) => (
                            <Badge key={idx} variant="slate" className="text-[10px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
                    <FolderGit2 className="w-8 h-8 text-slate-300" />
                    <p className="text-sm font-medium text-slate-700">No projects added yet.</p>
                    <p className="text-xs text-slate-500">
                      Add projects demonstrating your abilities with GitHub code and live deployment links.
                    </p>
                    <Link href="/profile">
                      <Button variant="outline" size="sm" className="mt-2">
                        Add First Project
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Career Preferences & Meaningful Empty States */}
          <div className="space-y-6">
            {/* Career Preferences */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <CardTitle className="text-base font-bold">Career Preferences</CardTitle>
                </div>
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-600">
                    Edit
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Target Role</p>
                  <p className="font-semibold text-slate-900">{preferredRole}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Employment</p>
                    <p className="font-semibold text-slate-800">
                      {profile?.careerPreferences?.preferredEmploymentType || "Internship"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Work Mode</p>
                    <p className="font-semibold text-slate-800">
                      {profile?.careerPreferences?.workPreference || "Hybrid"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Preferred Location</p>
                  <p className="font-semibold text-slate-900">
                    {profile?.careerPreferences?.preferredLocation || "Flexible / Not specified"}
                  </p>
                </div>

                {profile?.careerPreferences?.expectedStipend && (
                  <div>
                    <p className="text-xs text-slate-500">Expected Stipend / Compensation</p>
                    <p className="font-semibold text-slate-900">
                      {profile.careerPreferences.expectedStipend}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Feature: AI Opportunity Matching Engine (Stage 4) */}
            <Card className="border-indigo-100 bg-indigo-50/40">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-sm font-bold">
                    Smart Opportunity Matches
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  Explore skill-weighted recommendations computed from your approved profile and portfolio proof.
                </p>
                <div className="p-3 bg-white rounded-lg border border-indigo-100/80 space-y-2">
                  <div className="flex items-center gap-1.5 font-semibold text-indigo-950">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Explainable & Fair Matching Active</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    See exact component weights, missing required skills, and clear reasons for each recommended role.
                  </p>
                  <Link href="/dashboard/recommendations" className="block pt-1">
                    <Button size="sm" className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                      <span>View Smart Matches</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Active Feature: AI Learning Roadmap (Stage 6) */}
            <Card className="border-purple-100 bg-purple-50/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-purple-950">
                  <Compass className="w-4 h-4 text-purple-600" />
                  <CardTitle className="text-sm font-bold">
                    AI Learning Roadmap
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  Convert missing skill gaps into personalized weekly milestones with practical deliverables.
                </p>
                <Link href="/dashboard/roadmap" className="block pt-1">
                  <Button size="sm" variant="outline" className="w-full text-xs font-semibold border-purple-200 text-purple-800 hover:bg-purple-100/50 gap-1.5">
                    <span>Open My Learning Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Active Feature: Application Tracking System (Stage 8) */}
            <Card className="border-blue-100 bg-blue-50/30">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-slate-900">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <CardTitle className="text-sm font-bold">
                    Application History & Tracker
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <p>
                  Organize saved roles, record application submissions, track interview rounds, and set follow-up reminders.
                </p>
                <Link href="/dashboard/applications" className="block pt-1">
                  <Button
                    size="sm"
                    className="w-full text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-2xs"
                  >
                    <span>Open Application Tracker</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentPortalLayout>
  );
}
