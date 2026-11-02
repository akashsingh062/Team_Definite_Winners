import { AuthCard } from "@/features/auth/components/AuthCard";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Container } from "@/components/layout/Container";

export const metadata = {
  title: "Create Account",
  description: "Join CareerBridge AI for skills-based campus opportunity matching",
};

export default function RegisterPage() {
  return (
    <div className="py-12 md:py-16">
      <Container size="sm">
        <AuthCard
          title="Create Student Account"
          description="Build your profile to unlock explainable opportunity recommendations"
          footerText="Already have an account?"
          footerLinkText="Sign in here"
          footerLinkHref="/login"
        >
          <RegisterForm />
        </AuthCard>
      </Container>
    </div>
  );
}

