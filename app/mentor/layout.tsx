"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Send,
  CalendarCheck,
  Clock,
  UserCheck,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { InAppNotificationBell } from "@/features/mentorship/components/InAppNotificationBell";
import { Button } from "@/components/ui/button";

export default function MentorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/mentor/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Mentorship Requests",
      href: "/mentor/requests",
      icon: Send,
    },
    {
      name: "Sessions & Calendar",
      href: "/mentor/sessions",
      icon: CalendarCheck,
    },
    {
      name: "Availability",
      href: "/mentor/availability",
      icon: Clock,
    },
    {
      name: "Mentor Profile",
      href: "/mentor/profile",
      icon: UserCheck,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col">
      {/* Mentor Advisory Sub-Navigation Bar */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <div className="h-3.5 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-white font-bold text-[11px]">
                M
              </span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                Mentor Advisory Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.name}</span>
                  </button>
                </Link>
              );
            })}
            <div className="h-3.5 w-px bg-slate-200 mx-1 hidden sm:block" />
            <div className="flex items-center gap-2 pl-1">
              <InAppNotificationBell />
              <Link href="/dashboard/mentors">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Public Directory
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}

