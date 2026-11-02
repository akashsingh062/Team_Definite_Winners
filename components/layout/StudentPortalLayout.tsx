"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
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
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50/50">
      <StudentSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}

