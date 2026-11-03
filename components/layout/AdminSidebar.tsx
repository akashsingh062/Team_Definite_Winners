"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Eye,
  LogOut,
  ChevronRight,
  Shield,
  BarChart3,
  UserCheck,
  CheckCircle2,
  MapPin,
  Building2,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  exact?: boolean;
}

interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

const adminNavGroups: AdminNavGroup[] = [
  {
    title: "Platform Management",
    items: [
      {
        name: "Dashboard Overview",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        name: "Opportunities",
        href: "/admin/opportunities",
        icon: Briefcase,
      },
      {
        name: "Regional Opportunities",
        href: "/admin/regional-opportunities",
        icon: MapPin,
      },
      {
        name: "Training Centres",
        href: "/admin/training-centres",
        icon: Building2,
      },
    ],
  },
  {
    title: "Analytics & Responsible AI",
    items: [
      {
        name: "Platform & Fairness",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        name: "Regional Analytics",
        href: "/admin/regional-analytics",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Quality & Moderation",
    items: [
      {
        name: "Skill Assessments",
        href: "/admin/assessments",
        icon: CheckCircle2,
      },
      {
        name: "Mentors & Verification",
        href: "/admin/mentors",
        icon: UserCheck,
      },
      {
        name: "View Student Portal",
        href: "/dashboard",
        icon: Eye,
      },
    ],
  },
];

export function AdminSidebar({
  onItemClick,
  className,
}: {
  onItemClick?: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside
      className={cn(
        "w-full md:w-72 shrink-0 border-r border-slate-200/80 bg-white min-h-[calc(100vh-68px)] flex flex-col justify-between p-4 md:sticky md:top-[68px] overflow-y-auto",
        className
      )}
    >
      <div className="space-y-5">
        {/* Admin Identifier Widget */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900 text-white shadow-xs">
          <Avatar
            name={user?.name || "Admin"}
            size="md"
            className="bg-indigo-600 text-white font-bold"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                Administrator
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
              {user?.name || "Admin User"}
            </h4>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="space-y-4">
          {adminNavGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
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

                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-transform group-hover:translate-x-0.5",
                          isActive && "text-indigo-600"
                        )}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
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
