"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  const userRole = (user as { role?: string })?.role;
  const isAdmin = userRole === "admin";

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/admin/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <p className="text-sm font-medium">Verifying administrator authorization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
            <p className="text-sm text-slate-600">
              This area requires administrator privileges. Your account ({user?.email}) is registered as a student.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={() => router.push("/dashboard")}
              >
                Go to Student Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/opportunities")}
              >
                Browse Opportunities
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
