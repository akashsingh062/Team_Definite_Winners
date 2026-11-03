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
        "w-full md:w-68 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4",
        className
      )}
    >
      <div className="space-y-5">
        {/* Admin Identifier Widget */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 text-white shadow-xs">
          <Avatar
            name={user?.name || "Admin"}
            size="md"
            className="bg-indigo-500 text-white"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Administrator
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white truncate">
              {user?.name || "Admin User"}
            </h4>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="space-y-4">
          {adminNavGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <p className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
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
        </nav>
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
