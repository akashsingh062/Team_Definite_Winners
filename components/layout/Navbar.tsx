"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X, LogOut, LayoutDashboard, User, ShieldAlert } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <Container size="xl">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold text-slate-900 hover:text-indigo-600 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg tracking-tight font-semibold">
                {siteConfig.name}
              </span>
              <Badge variant="indigo" className="hidden sm:inline-flex">
                AI Platform
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {siteConfig.mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-600",
                  pathname === item.href
                    ? "text-indigo-600 font-semibold"
                    : "text-slate-600"
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Auth Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-100" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {(user as { role?: string })?.role === "admin" && (
                  <Link href="/admin/dashboard">
                    <Button variant="accent" size="sm" className="gap-1.5">
                      <ShieldAlert className="h-4 w-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar name={user.name || "Student"} size="sm" />
                    <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                      {user.name}
                    </span>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-3">
            <div className="flex flex-col space-y-2">
              {siteConfig.mainNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                    <Avatar name={user.name || "Student"} size="sm" />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  {(user as { role?: string })?.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="accent" size="sm" className="w-full justify-start gap-2">
                        <ShieldAlert className="h-4 w-4" />
                        Admin Portal
                      </Button>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Get Started
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

