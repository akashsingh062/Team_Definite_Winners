"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, LoginFormData } from "../schemas/authSchemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { isAuthenticated, isLoading: isAuthChecking } = useAuth();

  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  // If already authenticated, redirect to /dashboard
  React.useEffect(() => {
    if (!isAuthChecking && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAuthChecking, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const fillCredentials = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setGeneralError(null);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await signIn.email({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        rememberMe,
      });

      if (response.error) {
        const errorMsg =
          response.error.status === 401 ||
          response.error.message?.toLowerCase().includes("invalid") ||
          response.error.message?.toLowerCase().includes("credential")
            ? "Invalid email or password. Please verify your credentials or use the quick demo accounts below."
            : response.error.message || "Login failed. Please try again.";

        setGeneralError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success("Welcome back! Signing you in...");
      const userRole = (response.data?.user as { role?: string } | undefined)?.role;
      const targetUrl =
        userRole === "admin" && callbackUrl === "/dashboard"
          ? "/admin/dashboard"
          : callbackUrl;

      // Navigate and refresh session state
      router.push(targetUrl);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected authentication error occurred.";
      setGeneralError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {generalError && (
        <Alert variant="error" title="Sign In Error">
          {generalError}
        </Alert>
      )}

      <Input
        label="Email Address"
        type="email"
        placeholder="student@university.edu"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
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

      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Remember my session
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="w-full h-11 text-base font-semibold"
        isLoading={isLoading}
      >
        Sign In to CareerBridge
      </Button>

      <div className="pt-3 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-2">Quick Demo Accounts (1-Click Fill):</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => fillCredentials("akash@gmail.com", "Akash@123")}
            className="px-2 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded text-slate-700 text-left transition-colors"
          >
            <div className="font-semibold truncate">Akash (Student)</div>
            <div className="text-[10px] text-slate-400">Akash@123</div>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("student@careerbridge.ai", "Password123!")}
            className="px-2 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded text-slate-700 text-left transition-colors"
          >
            <div className="font-semibold truncate">Alex (Student)</div>
            <div className="text-[10px] text-slate-400">Password123!</div>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials("admin@careerbridge.ai", "Password123!")}
            className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 hover:text-purple-800 hover:border-purple-300 border border-purple-200 rounded text-purple-700 text-left transition-colors"
          >
            <div className="font-semibold truncate">Admin</div>
            <div className="text-[10px] text-purple-400">Password123!</div>
          </button>
        </div>
      </div>
    </form>
  );
}
