"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Briefcase,
  Target,
  Edit3,
  ExternalLink,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Users,
  Compass,
  FileText,
  Award,
  Video,
  Clock,
  MapPin,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Sliders,
  Bot,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { IStudentProfile, IProfileCompletionBreakdown } from "@/types/student";
import { IApplicationStatistics, IApplication } from "@/types/application";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RecommendedItem {
  opportunityId?: string;
  opportunity: {
    _id?: string;
    id?: string;
    title: string;
    company?: string;
    companyName?: string;
    location?: string;
    workMode?: string;
    employmentType?: string;
    deadline?: string;
  };
  overallScore?: number;
  matchScore?: {
    overall: number;
    skillsScore?: number;
  };
}

interface MentorshipSessionItem {
  _id: string;
  topic: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  meetUrl?: string;
  mentorName: string;
  mentorHeadline?: string;
}

interface AssessmentHistoryItem {
  attempts: any[];
  evidences: Array<{
    skill: string;
    assessmentTitle: string;
    percentage: number;
    proficiency: string;
    verifiedAt: string;
  }>;
}

interface RoadmapData {
  _id: string;
  title: string;
  targetRole: string;
  progress: number;
  milestones: Array<{
    title: string;
    isCompleted: boolean;
  }>;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [profile, setProfile] = React.useState<IStudentProfile | null>(null);
  const [breakdown, setBreakdown] = React.useState<IProfileCompletionBreakdown | null>(null);
  const [appStats, setAppStats] = React.useState<IApplicationStatistics | null>(null);
  const [recentApplications, setRecentApplications] = React.useState<IApplication[]>([]);
  const [recommendations, setRecommendations] = React.useState<RecommendedItem[]>([]);
  const [assessmentHistory, setAssessmentHistory] = React.useState<AssessmentHistoryItem | null>(null);
  const [roadmap, setRoadmap] = React.useState<RoadmapData | null>(null);
  const [upcomingSessions, setUpcomingSessions] = React.useState<MentorshipSessionItem[]>([]);
  const [hasResume, setHasResume] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    async function loadAllDashboardData() {
      if (!isAuthenticated && !isAuthLoading) {
        router.push("/login?callbackUrl=/dashboard");
        return;
      }

      try {
        const [
          profileRes,
          appStatsRes,
          recentAppsRes,
          recsRes,
          assessmentsRes,
          roadmapRes,
          sessionsRes,
          resumeRes,
        ] = await Promise.allSettled([
          fetch("/api/student/profile").then((r) => r.json()),
          fetch("/api/applications/statistics").then((r) => r.json()),
          fetch("/api/applications?limit=4").then((r) => r.json()),
          fetch("/api/matching/recommendations?limit=3").then((r) => r.json()),
          fetch("/api/assessments/history").then((r) => r.json()),
          fetch("/api/roadmap").then((r) => r.json()),
          fetch("/api/mentorship/sessions").then((r) => r.json()),
          fetch("/api/resume").then((r) => r.json()),
        ]);

        if (!isMounted) return;

        if (profileRes.status === "fulfilled" && profileRes.value?.success) {
          setProfile(profileRes.value.data);
          if (profileRes.value.breakdown) {
            setBreakdown(profileRes.value.breakdown);
          }
        }

        if (resumeRes.status === "fulfilled" && resumeRes.value?.success && resumeRes.value?.data) {
          setHasResume(true);
        }

        if (appStatsRes.status === "fulfilled" && appStatsRes.value?.success) {
          setAppStats(appStatsRes.value.data);
        }

        if (recentAppsRes.status === "fulfilled" && recentAppsRes.value?.success) {
          setRecentApplications(recentAppsRes.value.data?.applications || []);
        }

        if (recsRes.status === "fulfilled" && recsRes.value?.success) {
          const recsData = recsRes.value;
          const recsList = Array.isArray(recsData.data)
            ? recsData.data
            : (recsData.data?.recommendations || recsData.recommendations || []);
          setRecommendations(Array.isArray(recsList) ? recsList : []);
        }

        if (assessmentsRes.status === "fulfilled" && assessmentsRes.value?.success) {
          setAssessmentHistory(assessmentsRes.value.data);
        }

        if (roadmapRes.status === "fulfilled" && roadmapRes.value?.success) {
          setRoadmap(roadmapRes.value.data);
        }

        if (sessionsRes.status === "fulfilled" && sessionsRes.value?.success) {
          const sessions: MentorshipSessionItem[] = sessionsRes.value.data || [];
          const now = new Date();
          const upcoming = sessions
            .filter((s) => s.status === "scheduled" && new Date(s.scheduledAt) >= now)
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
          setUpcomingSessions(upcoming);
        }
      } catch (err) {
        console.error("Error loading student dashboard:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (!isAuthLoading) {
      loadAllDashboardData();
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAuthLoading, router]);

  if (isAuthLoading || isLoading) {
    return (
      <StudentPortalLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-slate-500 font-medium">Aggregating your NexSkill command center...</p>
        </div>
      </StudentPortalLayout>
    );
  }

  const studentName = profile?.personalInfo?.fullName || user?.name || "Student";
  const completionPercentage = breakdown?.total ?? profile?.profileCompletionPercentage ?? 0;
  const targetRole = profile?.careerPreferences?.preferredJobRole || "Software Developer";
  const verifiedEvidenceCount = assessmentHistory?.evidences?.length || 0;
  const activeApplicationsCount = appStats?.activeApplications ?? (appStats?.appliedCount || 0);
  const savedCount = appStats?.savedOpportunities ?? (appStats?.savedCount || 0);

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Dynamic Next Best Action calculation
  const getNextAction = () => {
    if (completionPercentage < 70) {
      return {
        title: "Complete Your Profile Information",
        description: `Your profile is at ${completionPercentage}%. Completing academic records, project links, and skills ensures higher matching accuracy with employers.`,
        cta: "Complete Profile",
        href: "/profile",
        icon: Edit3,
      };
    }
    if (!hasResume) {
      return {
        title: "Upload & Verify Your Resume",
        description: "Upload your resume to our AI Resume Analyzer to obtain ATS compatibility feedback and unlock personalized recommendation explanations.",
        cta: "Upload Resume",
        href: "/dashboard/resume",
        icon: FileText,
      };
    }
    if (verifiedEvidenceCount === 0) {
      return {
        title: "Demonstrate Practical Skills",
        description: "Take practical skill assessments in JavaScript, React, Python, or SQL to add verified credential badges to your Digital Skills Passport.",
        cta: "Take Skill Assessment",
        href: "/dashboard/assessments",
        icon: Award,
      };
    }
    if (!roadmap) {
      return {
        title: "Generate Personalized AI Learning Roadmap",
        description: `Map out milestones and recommended learning resources for your goal: ${targetRole}.`,
        cta: "Create Roadmap",
        href: "/dashboard/roadmap",
        icon: Compass,
      };
    }
    if (recommendations.length > 0) {
      return {
        title: "Review Your Top Recommended Opportunities",
        description: `You have ${recommendations.length} high-affinity opportunities matching your verified skills and preferences.`,
        cta: "Explore Recommendations",
        href: "/dashboard/recommendations",
        icon: Sparkles,
      };
    }
    return {
      title: "Explore What-If Career Pathways",
      description: "Simulate acquiring new technical skills to see immediate improvements in your opportunity matching score.",
      cta: "Run What-If Simulation",
      href: "/dashboard/career-simulator",
      icon: Sliders,
    };
  };

  const nextAction = getNextAction();
  const NextActionIcon = nextAction.icon;

  return (
    <StudentPortalLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 sm:p-8 text-white shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="indigo" className="bg-indigo-500/20 text-indigo-200 border-indigo-400/30">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Career Command Center Active
                </Badge>
                {targetRole && (
                  <Badge variant="outline" className="text-white border-white/20 bg-white/5">
                    Target: {targetRole}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {greeting}, {studentName}!
              </h1>
              <p className="text-indigo-200 text-sm leading-relaxed">
                Track your real-time recruitment pipeline, explore AI career roadmaps, and monitor verified skill credentials all in one unified portal.
              </p>
            </div>

            {/* Profile Completion Dial / Quick Edit */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <span className="text-indigo-200 font-medium">Profile Readiness</span>
                  <span className="font-bold text-white">{completionPercentage}%</span>
                </div>
                <div className="w-36 h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <Link href="/profile">
                <Button variant="accent" size="sm" className="gap-1.5 whitespace-nowrap shadow-xs">
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Core Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Profile Readiness"
            value={`${completionPercentage}%`}
            description={completionPercentage >= 80 ? "Recruitment ready" : "Complete profile sections"}
            icon={Target}
            iconColor={completionPercentage >= 80 ? "emerald" : "indigo"}
            onClick={() => router.push("/profile")}
          />
          <StatCard
            title="Active Applications"
            value={activeApplicationsCount}
            description={`${savedCount} saved opportunities`}
            icon={ClipboardList}
            iconColor="indigo"
            onClick={() => router.push("/dashboard/applications")}
          />
          <StatCard
            title="Smart Matches"
            value={recommendations.length}
            description="Algorithmic recommendations"
            icon={Sparkles}
            iconColor="amber"
            onClick={() => router.push("/dashboard/recommendations")}
          />
          <StatCard
            title="Verified Skills"
            value={verifiedEvidenceCount}
            description="Demonstrated through tests"
            icon={Award}
            iconColor="emerald"
            onClick={() => router.push("/dashboard/skills-passport")}
          />
        </div>

        {/* Personalized Next Best Action Banner */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/40 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <NextActionIcon className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                    Recommended Next Action
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{nextAction.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-normal">
                  {nextAction.description}
                </p>
              </div>
            </div>
            <Link href={nextAction.href} className="shrink-0 w-full sm:w-auto">
              <Button variant="primary" className="gap-2 w-full sm:w-auto shadow-xs">
                <span>{nextAction.cta}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Main 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3 width): Top Recommendations + Applications Tracker + Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Recommended Opportunities */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Top Recommended Opportunities
                  </CardTitle>
                  <CardDescription>
                    Tailored using the Stage 4 matching engine based on verified skills and preferences.
                  </CardDescription>
                </div>
                <Link href="/dashboard/recommendations">
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    View All
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((rec, idx) => {
                      const oppId = rec.opportunityId || rec.opportunity?._id || rec.opportunity?.id || `rec-${idx}`;
                      const oppScore = rec.overallScore ?? rec.matchScore?.overall ?? 0;
                      const oppCompany = rec.opportunity?.companyName || rec.opportunity?.company || "Company";
                      const oppTitle = rec.opportunity?.title || "Opportunity";

                      return (
                        <div
                          key={oppId}
                          className="p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {oppTitle}
                              </h4>
                              <Badge variant="indigo" className="text-[11px] font-semibold py-0">
                                {oppScore}% Match
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-slate-700">{oppCompany}</span>
                              {rec.opportunity?.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {rec.opportunity.location}
                                </span>
                              )}
                              {rec.opportunity?.workMode && (
                                <span className="capitalize">• {rec.opportunity.workMode}</span>
                              )}
                            </p>
                          </div>
                          {oppId && (
                            <Link href={`/dashboard/recommendations/${oppId}`}>
                              <Button variant="outline" size="sm" className="gap-1 text-xs whitespace-nowrap">
                                View Explanation
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="No Match Recommendations Yet"
                    description="Update your skills and upload your resume to generate high-affinity matching opportunities."
                    action={{
                      label: "Browse Opportunities",
                      href: "/opportunities",
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Recent Recruitment Applications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                    Application Pipeline
                  </CardTitle>
                  <CardDescription>
                    Recent internships and job opportunities you are actively tracking.
                  </CardDescription>
                </div>
                <Link href="/dashboard/applications">
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    Manage Pipeline
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentApplications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                          <th className="pb-2.5">Opportunity</th>
                          <th className="pb-2.5">Company</th>
                          <th className="pb-2.5">Status</th>
                          <th className="pb-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {recentApplications.map((app) => (
                          <tr key={app._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 font-semibold text-slate-900 truncate max-w-[200px]">
                              {app.opportunity?.title || "Opportunity"}
                            </td>
                            <td className="py-3 text-slate-600 truncate max-w-[150px]">
                              {app.opportunity?.companyName || "Company"}
                            </td>
                            <td className="py-3">
                              <StatusBadge status={app.status} />
                            </td>
                            <td className="py-3 text-right">
                              <Link
                                href={`/dashboard/applications/${app._id}`}
                                className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                              >
                                <span>Details</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={ClipboardList}
                    title="No Applications Recorded"
                    description="You have not saved or applied to any opportunities yet. Explore live postings to start tracking."
                    action={{
                      label: "Find Opportunities",
                      href: "/opportunities",
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Quick Career Tools Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/dashboard/companion"
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>AI Career Companion</span>
                    <Badge variant="indigo" className="text-[10px] py-0 px-1.5">EN / HI</Badge>
                  </h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Chat with your multilingual career counselor in English or Hindi.
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/career-simulator"
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">What-If Simulator</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Simulate learning new technologies and see match improvements.
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/skills-passport"
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">Digital Skills Passport</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Share your verified credentials, test badges, and projects via QR code.
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/local-opportunities"
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex items-start gap-3.5 group"
              >
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">Local Opportunities</h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    Discover regional internships, training centres, and local programs.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column (1/3 width): Mentorship Sessions + Learning Roadmap + Completion Breakdown */}
          <div className="space-y-6">
            {/* Upcoming Mentorship Sessions Widget */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <CardTitle className="text-base font-bold text-slate-900">Mentorship Sessions</CardTitle>
                </div>
                <Link href="/dashboard/mentors">
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    Find Mentor
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingSessions.map((s) => (
                      <div
                        key={s._id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{s.topic}</h5>
                            <p className="text-[11px] text-slate-500">with {s.mentorName}</p>
                          </div>
                          <Badge variant="indigo" className="text-[10px] py-0 px-1.5 shrink-0">
                            {new Date(s.scheduledAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(s.scheduledAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })} ({s.durationMinutes}m)
                          </span>
                          {s.meetUrl && (
                            <a
                              href={s.meetUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                            >
                              <Video className="w-3 h-3" />
                              Join
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 space-y-2">
                    <p className="text-xs text-slate-500">No upcoming mentorship sessions scheduled.</p>
                    <Link href="/dashboard/mentors">
                      <Button variant="outline" size="sm" className="text-xs">
                        Connect with Alumni Mentors
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Learning Roadmap Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-base font-bold text-slate-900">Learning Roadmap</CardTitle>
                </div>
                <Link href="/dashboard/roadmap">
                  <Button variant="outline" size="sm" className="gap-1 text-xs">
                    View
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {roadmap ? (
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{roadmap.title}</h4>
                      <p className="text-[11px] text-slate-500">Target Role: {roadmap.targetRole}</p>
                    </div>
                    <ProgressBar
                      value={roadmap.progress || 0}
                      showLabel
                      label="Roadmap Milestones"
                      variant="emerald"
                    />
                    <div className="pt-2 text-xs text-slate-600">
                      <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-1.5">
                        Key Milestones
                      </p>
                      <div className="space-y-1">
                        {roadmap.milestones?.slice(0, 3).map((m, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                m.isCompleted ? "text-emerald-600" : "text-slate-300"
                              }`}
                            />
                            <span className={m.isCompleted ? "line-through text-slate-400" : "text-slate-700"}>
                              {m.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 space-y-2">
                    <p className="text-xs text-slate-500">No active learning roadmap generated.</p>
                    <Link href="/dashboard/roadmap">
                      <Button variant="outline" size="sm" className="text-xs">
                        Generate AI Roadmap
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Completion Weighted Breakdown */}
            {breakdown && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-slate-900">
                      Profile Weighting
                    </CardTitle>
                    <span className="text-xs font-bold text-indigo-600">
                      {breakdown.total} / 100%
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    Scored dynamically across 5 dimensions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {[
                    { label: "Personal Info", score: breakdown.personalInfo, max: 20 },
                    { label: "Academic Records", score: breakdown.academicInfo, max: 20 },
                    { label: "Technical Skills", score: breakdown.technicalSkills, max: 25 },
                    { label: "Project Portfolio", score: breakdown.projects, max: 20 },
                    { label: "Preferences", score: breakdown.careerPreferences, max: 15 },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 truncate">{item.label}</span>
                        <span className="font-semibold text-slate-800">
                          {item.score}/{item.max}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all"
                          style={{ width: `${(item.score / item.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </StudentPortalLayout>
  );
}
