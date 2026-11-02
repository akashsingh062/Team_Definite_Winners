"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, RegisterFormData } from "../schemas/authSchemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthChecking } = useAuth();

  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // If already authenticated, redirect to /dashboard
  React.useEffect(() => {
    if (!isAuthChecking && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAuthChecking, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await signUp.email({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        name: data.name.trim(),
      });

      if (response.error) {
        const errorMsg =
          response.error.status === 422 ||
          response.error.message?.toLowerCase().includes("exist") ||
          response.error.message?.toLowerCase().includes("duplicate")
            ? "An account with this email address already exists. Please sign in instead."
            : response.error.message || "Registration failed. Please try again.";

        setGeneralError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("Account created successfully! Let's complete your student profile.");
      // Redirect to profile completion as specified in requirements
      router.push("/profile");
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected registration error occurred.";
      setGeneralError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {generalError && (
        <Alert variant="error" title="Registration Error">
          {generalError}
        </Alert>
      )}

      <Input
        label="Full Name"
        type="text"
        placeholder="Alex Rivera"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />

      <Input
        label="Student Email Address"
        type="email"
        placeholder="alex.rivera@university.edu"
        autoComplete="email"
        error={errors.email?.message}
        helperText="Your institutional or primary academic email."
        {...register("email")}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.password?.message}
          helperText="Min 8 characters with at least one uppercase, lowercase, and number."
          {...register("password")}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((prev) => !prev)}
          className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label={showConfirmPassword ? "Hide password" : "Show password"}
        >
          {showConfirmPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="rounded-lg bg-indigo-50/50 p-3 text-xs text-slate-600 border border-indigo-100/80">
        After creating your account, you will be guided to complete your profile with skills, academic records, and projects.
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full h-11 text-base font-semibold"
        isLoading={isLoading}
      >
        Create Student Account
      </Button>
    </form>
  );
}
