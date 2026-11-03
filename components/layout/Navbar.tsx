"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User,
  ShieldAlert,
  ChevronDown,
  Briefcase,
  Award,
  Compass,
  Users,
  MapPin,
  Bot,
  Sliders,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const exploreDropdownRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        exploreDropdownRef.current &&
        !exploreDropdownRef.current.contains(event.target as Node)
      ) {
        setExploreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setExploreDropdownOpen(false);
  }, [pathname]);

  const userRole = (user as { role?: string })?.role;
  const isAdmin = userRole === "admin";

  const exploreItems = [
    {
      title: "Smart Opportunity Matches",
      href: "/dashboard/recommendations",
      icon: Sparkles,
      desc: "AI-matched jobs and internships with explainable logic",
      badge: "AI",
    },
    {
      title: "Digital Skills Passport",
      href: "/dashboard/skills-passport",
      icon: Award,
      desc: "Verified student competencies with cryptographic hashes",
      badge: "Verified",
    },
    {
      title: "Skill Readiness Assessments",
      href: "/dashboard/assessments",
      icon: CheckCircle2,
      desc: "Benchmark technical proficiencies across 12 disciplines",
    },
    {
      title: "Human Mentorship Network",
      href: "/dashboard/mentors",
      icon: Users,
      desc: "1-on-1 advisory sessions with industry engineering leaders",
    },
    {
      title: "Regional Intelligence Radar",
      href: "/dashboard/local-opportunities",
      icon: MapPin,
      desc: "Tier-2/3 local internships, NAPS schemes, and ITIs",
      badge: "Nearby",
    },
    {
      title: "AI Career Companion",
      href: "/dashboard/companion",
      icon: Bot,
      desc: "Conversational guidance for interview prep & resumes",
      badge: "AI",
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200 border-b",
        scrolled
          ? "border-slate-200/90 bg-white/90 backdrop-blur-xl shadow-xs"
          : "border-slate-200/70 bg-white/80 backdrop-blur-md"
      )}
    >
      <Container size="xl">
        <div className="flex h-[68px] items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="shrink-0">
            <Logo size="md" showTagline={true} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-semibold">
            <Link
              href="/"
              className={cn(
                "px-3.5 py-2 rounded-xl transition-all duration-150",
                pathname === "/"
                  ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/80 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              )}
            >
              Home
            </Link>

            <Link
              href="/opportunities"
              className={cn(
                "px-3.5 py-2 rounded-xl transition-all duration-150 inline-flex items-center gap-1.5",
                pathname === "/opportunities"
                  ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/80 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              )}
            >
              <span>Opportunities</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </Link>

            {/* Explore Hubs Mega Dropdown */}
            <div className="relative" ref={exploreDropdownRef}>
              <button
                type="button"
                onClick={() => setExploreDropdownOpen(!exploreDropdownOpen)}
                className={cn(
                  "px-3.5 py-2 rounded-xl transition-all duration-150 inline-flex items-center gap-1.5 cursor-pointer select-none",
                  exploreDropdownOpen || pathname.startsWith("/dashboard/")
                    ? "text-indigo-700 bg-indigo-50/70 font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                )}
              >
                <span>Platform Hubs</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    exploreDropdownOpen && "rotate-180 text-indigo-600"
                  )}
                />
              </button>

              {exploreDropdownOpen && (
                <div className="absolute left-0 mt-2 w-96 rounded-3xl bg-white p-3 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      NexSkill AI Ecosystem
                    </p>
                    <p className="text-xs font-semibold text-slate-700">
                      Integrated student career advancement modules
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-1">
                    {exploreItems.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setExploreDropdownOpen(false)}
                          className={cn(
                            "flex items-start gap-3 p-2.5 rounded-2xl transition-colors",
                            isItemActive
                              ? "bg-indigo-50 text-indigo-900 font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          )}
                        >
                          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0 mt-0.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-700">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-normal leading-snug truncate">
                              {item.desc}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/dashboard/mentors"
              className={cn(
                "px-3.5 py-2 rounded-xl transition-all duration-150",
                pathname.startsWith("/dashboard/mentors")
                  ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/80 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              )}
            >
              Mentorship
            </Link>

            <Link
              href="/#fairness"
              className={cn(
                "px-3.5 py-2 rounded-xl transition-all duration-150",
                pathname === "/#fairness"
                  ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-100/80 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              )}
            >
              Fairness & Ethics
            </Link>
          </nav>

          {/* Right Actions Area */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isLoading ? (
              <div className="h-9 w-28 animate-pulse rounded-2xl bg-slate-100" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                {isAdmin && (
                  <Link href="/admin/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 rounded-xl"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                      <span>TPO Portal</span>
                    </Button>
                  </Link>
                )}

                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border-slate-300 rounded-xl shadow-2xs"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                {/* User Dropdown Pill */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2 pr-3 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-2xs cursor-pointer select-none"
                    aria-label="User Account Menu"
                  >
                    <div className="relative">
                      <Avatar name={user.name || "Student"} size="sm" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-400" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 max-w-[110px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-white p-3 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 z-50">
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
                        <p className="font-bold text-xs text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {user.email}
                        </p>
                        <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold capitalize">
                          {isAdmin ? "TPO Officer" : `${userRole || "Student"} Portal`}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-xs font-medium text-slate-700">
                        <Link
                          href="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <User className="w-4 h-4 text-indigo-600" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/dashboard/skills-passport"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <Award className="w-4 h-4 text-indigo-600" />
                          <span>Skills Passport</span>
                        </Link>
                        <Link
                          href="/dashboard/roadmap"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-indigo-600" />
                          <span>Learning Roadmap</span>
                        </Link>
                        <Link
                          href="/dashboard/applications"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
                        >
                          <ClipboardList className="w-4 h-4 text-indigo-600" />
                          <span>My Applications</span>
                        </Link>
                      </div>

                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            signOut();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs sm:text-sm font-bold text-slate-700 hover:text-indigo-600 hover:bg-slate-100/80 rounded-xl px-3.5"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl px-4 py-2 shadow-xs hover:shadow-md transition-all gap-1.5"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Sheet */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 py-4 space-y-4 animate-in slide-in-from-top-3 duration-200">
            {/* User Info Card if authenticated */}
            {isAuthenticated && user && (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Avatar name={user.name || "Student"} size="md" />
                  <div>
                    <p className="font-bold text-xs text-slate-900">{user.name}</p>
                    <p className="text-[11px] text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 capitalize">
                  {isAdmin ? "TPO Officer" : (userRole || "Student")}
                </span>
              </div>
            )}

            {/* Primary Nav Links */}
            <div className="space-y-1">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors",
                  pathname === "/"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <span>Home</span>
              </Link>
              <Link
                href="/opportunities"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors",
                  pathname === "/opportunities"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <span>Browse Opportunities</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors",
                  pathname === "/dashboard"
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <span>Student Dashboard</span>
              </Link>
              <Link
                href="/dashboard/mentors"
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors",
                  pathname.startsWith("/dashboard/mentors")
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <span>Mentorship Network</span>
              </Link>
              <Link
                href="/#fairness"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <span>Fairness & Algorithmic Ethics</span>
              </Link>
            </div>

            {/* Platform Quick Hubs */}
            <div className="pt-2 border-t border-slate-100 space-y-1">
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Platform Hubs
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/dashboard/assessments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Skill Tests</span>
                </Link>
                <Link
                  href="/dashboard/skills-passport"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                >
                  <Award className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="truncate">Passport</span>
                </Link>
                <Link
                  href="/dashboard/local-opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">Local Hub</span>
                </Link>
                <Link
                  href="/dashboard/companion"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-bold text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2"
                >
                  <Bot className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">AI Mentor</span>
                </Link>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-slate-300">
                        <User className="h-3.5 w-3.5 mr-1.5" />
                        Profile
                      </Button>
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-slate-300">
                        <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                        Dashboard
                      </Button>
                    </Link>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button size="sm" className="w-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl">
                        <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
                        TPO Portal
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl mt-1"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1.5" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-slate-300 text-slate-800">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs">
                      Get Started Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
