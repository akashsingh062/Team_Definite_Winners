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
  Send,
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
  badgeVariant?: "indigo" | "emerald" | "amber" | "blue" | "slate";
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
    title: "Career Pathways",
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
        badgeVariant: "indigo",
      },
      {
        name: "Smart Matches",
        href: "/dashboard/recommendations",
        icon: Sparkles,
        badge: "AI",
        badgeVariant: "indigo",
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
        badgeVariant: "amber",
      },
    ],
  },
  {
    title: "Skills & Credentials",
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
        badgeVariant: "blue",
      },
      {
        name: "Digital Skills Passport",
        href: "/dashboard/skills-passport",
        icon: Award,
        badge: "Verified",
        badgeVariant: "emerald",
      },
    ],
  },
  {
    title: "Advisory & Outreach",
    items: [
      {
        name: "AI Career Companion",
        href: "/dashboard/companion",
        icon: Bot,
        badge: "AI",
        badgeVariant: "indigo",
      },
      {
        name: "Mentorship Network",
        href: "/dashboard/mentors",
        icon: Users,
      },
      {
        name: "Mentorship Requests",
        href: "/dashboard/mentorship-requests",
        icon: Send,
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

  const getBadgeStyle = (variant?: string, isActive?: boolean) => {
    if (isActive) {
      return "bg-indigo-600 text-white font-extrabold shadow-2xs";
    }
    switch (variant) {
      case "emerald":
        return "bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold";
      case "amber":
        return "bg-amber-50 text-amber-800 border border-amber-200/80 font-bold";
      case "blue":
        return "bg-blue-50 text-blue-800 border border-blue-200/80 font-bold";
      case "indigo":
      default:
        return "bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-extrabold";
    }
  };

  return (
    <aside
      className={cn(
        "w-full md:w-72 shrink-0 border-r border-slate-200/80 bg-white flex flex-col justify-between p-4 overflow-y-auto max-h-screen md:sticky md:top-[68px] scrollbar-thin scrollbar-thumb-slate-200",
        className
      )}
    >
      <div className="space-y-5">
        {/* User Summary Widget */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 shadow-2xs">
          <div className="relative">
            <Avatar name={user?.name || "Student"} size="md" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
              {user?.name || "Student User"}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[11px] font-medium text-slate-500 truncate">{user?.email}</p>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                {isAdmin ? "Admin • Student" : "Active Student"}
              </span>
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav className="space-y-4">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
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
                        "relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 group select-none",
                        isActive
                          ? "bg-indigo-50 text-indigo-900 font-extrabold border border-indigo-100 shadow-2xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {/* Active left bar accent */}
                      {isActive && (
                        <span className="absolute left-1 top-2.5 bottom-2.5 w-1 bg-indigo-600 rounded-full" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0 pl-1">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive
                              ? "text-indigo-600"
                              : "text-slate-400 group-hover:text-slate-700"
                          )}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge ? (
                        <span
                          className={cn(
                            "text-[10px] py-0.5 px-2 rounded-md shrink-0 uppercase tracking-tight",
                            getBadgeStyle(item.badgeVariant, isActive)
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-transform group-hover:translate-x-0.5",
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
              <p className="px-3 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Platform Administration
              </p>
              <Link
                href="/admin/dashboard"
                onClick={onItemClick}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Admin Portal</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              </Link>
            </div>
          )}
        </nav>

        {/* Fairness & Privacy Assurance Box */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-blue-50/40 p-3.5 text-xs text-slate-700 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-indigo-950 font-bold">
            <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Fair Match Guarantee</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
            Demographic-neutral AI algorithms prioritizing verified skill proficiencies over college pedigree.
          </p>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-3 mt-4 border-t border-slate-100">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-slate-400 group-hover:text-rose-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
