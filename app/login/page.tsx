import { Suspense } from "react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Container } from "@/components/layout/Container";

export const metadata = {
  title: "Sign In",
  description: "Sign in to your CareerBridge AI student account",
};

export default function LoginPage() {
  return (
    <div className="py-12 md:py-16">
      <Container size="sm">
        <AuthCard
          title="Welcome Back"
          description="Sign in to view your matched campus opportunities"
          footerText="Don't have an account yet?"
          footerLinkText="Create a free student profile"
          footerLinkHref="/register"
        >
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center text-sm text-slate-400">
                Loading sign in form...
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </AuthCard>
      </Container>
    </div>
  );
}

