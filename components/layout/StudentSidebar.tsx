"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Briefcase,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ShieldAlert,
  FileText,
  Sparkles,
  Target,
  Compass,
  ClipboardList,
  Route,
  Sliders,
  Award,
  CheckCircle2,
  MapPin,
  Users,
  CalendarCheck,
  Bot,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: "Career Development",
    items: [
      {
        name: "Career Explorer",
        href: "/dashboard/career-explorer",
        icon: Route,
      },
      {
        name: "What-If Simulator",
        href: "/dashboard/career-simulator",
        icon: Sliders,
        badge: "AI",
      },
      {
        name: "Smart Matches",
        href: "/dashboard/recommendations",
        icon: Sparkles,
      },
      {
        name: "Opportunities",
        href: "/opportunities",
        icon: Briefcase,
      },
      {
        name: "Local Intelligence",
        href: "/dashboard/local-opportunities",
        icon: MapPin,
        badge: "Nearby",
      },
    ],
  },
  {
    title: "Skills & Learning",
    items: [
      {
        name: "My Profile",
        href: "/profile",
        icon: User,
      },
      {
        name: "AI Resume Analyzer",
        href: "/dashboard/resume",
        icon: FileText,
      },
      {
        name: "Skill Gap Analysis",
        href: "/dashboard/skill-gap",
        icon: Target,
      },
      {
        name: "Learning Roadmap",
        href: "/dashboard/roadmap",
        icon: Compass,
      },
      {
        name: "Skill Assessments",
        href: "/dashboard/assessments",
        icon: CheckCircle2,
        badge: "Tests",
      },
      {
        name: "Digital Skills Passport",
        href: "/dashboard/skills-passport",
        icon: Award,
        badge: "Verified",
      },
    ],
  },
  {
    title: "Career Support",
    items: [
      {
        name: "AI Career Companion",
        href: "/dashboard/companion",
        icon: Bot,
        badge: "AI",
      },
      {
        name: "Mentorship Network",
        href: "/dashboard/mentors",
        icon: Users,
      },
      {
        name: "Mentorship Requests",
        href: "/dashboard/mentorship-requests",
        icon: UserCheck,
      },
      {
        name: "Mentorship Sessions",
        href: "/dashboard/mentorship-sessions",
        icon: CalendarCheck,
      },
      {
        name: "My Applications",
        href: "/dashboard/applications",
        icon: ClipboardList,
      },
    ],
  },
];

export function StudentSidebar({
  onItemClick,
  className,
}: {
  onItemClick?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const userRole = (user as { role?: string })?.role;
  const isAdmin = userRole === "admin";

  return (
    <aside
      className={cn(
        "w-full md:w-68 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between p-4 overflow-y-auto max-h-screen md:sticky md:top-16",
        className
      )}
    >
      <div className="space-y-5">
        {/* User Summary Widget */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <Avatar name={user?.name || "Student"} size="md" />
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {user?.name || "Student User"}
            </h4>
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              {isAdmin && (
                <Badge variant="indigo" className="text-[10px] px-1 py-0">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-4">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : item.href === "/opportunities"
                    ? pathname.startsWith("/opportunities")
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onItemClick}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors group",
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-semibold shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isActive
                              ? "text-indigo-600"
                              : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge ? (
                        <Badge
                          variant={isActive ? "indigo" : "slate"}
                          className="text-[10px] py-0 px-1.5 shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      ) : (
                        <ChevronRight
                          className={cn(
                            "h-3 w-3 text-slate-300 group-hover:text-slate-500 shrink-0",
                            isActive && "text-indigo-600"
                          )}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin shortcut if user is an admin */}
          {isAdmin && (
            <div className="pt-2">
              <p className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Platform Administration
              </p>
              <Link
                href="/admin/dashboard"
                onClick={onItemClick}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Admin Portal</span>
                </div>
                <ChevronRight className="h-3 w-3 text-indigo-600 shrink-0" />
              </Link>
            </div>
          )}
        </nav>

        {/* Fairness & Privacy Assurance Box */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-xs text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Fair Opportunity Guarantee</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Matching algorithms are demographic-neutral and prioritize verified competencies.
          </p>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-3 mt-4 border-t border-slate-200">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
