"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, ShieldAlert, Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const userRole = (user as { role?: string })?.role;
  const isAdmin = userRole === "admin";

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login?redirect=/admin/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center p-6">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 flex flex-col md:flex-row">
      {/* Admin Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white sticky top-16 z-30 shadow-xs w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white">Admin Management</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800"
          aria-label="Toggle admin navigation"
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

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-200 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <span className="font-bold text-sm">Admin Navigation</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="h-[calc(100vh-3.5rem)] overflow-y-auto">
          <AdminSidebar onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      </div>

      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl min-w-0">
        {children}
      </main>
    </div>
  );
}
