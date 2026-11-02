"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const sessionResult = useSession();

  const session = sessionResult.data;
  const isLoading = sessionResult.isPending;
  const user = session?.user;
  const isAuthenticated = Boolean(session?.user);

  const handleSignOut = async (redirectTo: string = "/login") => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
      console.error("Sign out error:", error);
    }
  };

  return {
    session,
    user,
    isLoading,
    isAuthenticated,
    signOut: handleSignOut,
  };
}

