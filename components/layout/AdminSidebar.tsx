"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  Eye,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Shield,
  BarChart3,
  UserCheck,
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

const adminNavItems: AdminNavItem[] = [
  {
    name: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Analytics & Fairness",
    href: "/admin/analytics",
    icon: BarChart3,
    exact: false,
  },
  {
    name: "All Opportunities",
    href: "/admin/opportunities",
    icon: Briefcase,
    exact: true,
  },
  {
    name: "Create Opportunity",
    href: "/admin/opportunities/create",
    icon: PlusCircle,
    exact: true,
  },
  {
    name: "Mentor Network",
    href: "/admin/mentors",
    icon: UserCheck,
    exact: false,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Admin Identifier Widget */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 text-white shadow-xs">
          <Avatar name={user?.name || "Admin"} size="md" className="bg-indigo-500 text-white" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Administrator
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white truncate">
              {user?.name || "Admin User"}
            </h4>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Management Portal
          </p>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

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

          <div className="pt-4">
            <p className="px-3 pb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Student Experience
            </p>
            <Link
              href="/opportunities"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-slate-400" />
                <span>Public Opportunities</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            </Link>
          </div>
        </nav>

        {/* Audit Guarantee Note */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
            <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Verification Integrity</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Every published opportunity is verified for legitimacy, preventing fraudulent campus recruitment.
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

