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
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Smart Matches",
    href: "/dashboard/recommendations",
    icon: Sparkles,
  },
  {
    name: "My Applications",
    href: "/dashboard/applications",
    icon: ClipboardList,
  },
  {
    name: "Skill Gap Analyzer",
    href: "/dashboard/skill-gap",
    icon: Target,
  },
  {
    name: "AI Learning Roadmap",
    href: "/dashboard/roadmap",
    icon: Compass,
  },
  {
    name: "Browse Opportunities",
    href: "/opportunities",
    icon: Briefcase,
  },
  {
    name: "AI Resume Analyzer",
    href: "/dashboard/resume",
    icon: FileText,
  },
  {
    name: "Profile Management",
    href: "/profile",
    icon: User,
  },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  // Safe cast for role
  const userRole = (user as { role?: string })?.role;
  const isAdmin = userRole === "admin";

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
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

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Student Portal
          </p>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/opportunities"
                ? pathname.startsWith("/opportunities")
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <Badge variant="indigo" className="text-[10px] py-0 px-1.5">
                    {item.badge}
                  </Badge>
                ) : (
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500",
                      isActive && "text-indigo-600"
                    )}
                  />
                )}
              </Link>
            );
          })}

          {/* Admin shortcut if user is an admin */}
          {isAdmin && (
            <div className="pt-3">
              <p className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Administration
              </p>
              <Link
                href="/admin/dashboard"
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-4 w-4 text-indigo-600" />
                  <span>Admin Portal</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-indigo-600" />
              </Link>
            </div>
          )}
        </nav>

        {/* Fairness & Privacy Assurance Box */}
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Fair Opportunity Guarantee</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Matching algorithms are audited for demographic neutrality and prioritize demonstrated skills.
          </p>
        </div>
      </div>

      {/* Logout Action */}
      <div className="pt-4 border-t border-slate-200">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
