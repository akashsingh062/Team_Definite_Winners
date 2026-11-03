"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";

export function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-slate-500 font-medium">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 py-12">
        <Container size="sm">
          <Card className="text-center p-8 border-slate-200 shadow-md">
            <CardHeader className="flex flex-col items-center pb-4">
              <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Student Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Please sign in to access your student portal and manage your profile.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/login">
                  <Button variant="primary" className="w-full sm:w-auto gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full sm:w-auto">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-slate-900">Student Portal</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sliding Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 border-b border-slate-200 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-900">Navigation Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
          <StudentSidebar onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <StudentSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl min-w-0">
        {children}
      </main>
    </div>
  );
}
