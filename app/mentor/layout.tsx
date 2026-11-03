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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Student Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                M
              </span>
              <span className="font-bold text-slate-900 text-sm">
                Mentor Advisory Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <InAppNotificationBell />
            <Link href="/dashboard/mentors">
              <Button variant="outline" size="sm" className="text-xs">
                Public Directory
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>
    </div>
  );
}

