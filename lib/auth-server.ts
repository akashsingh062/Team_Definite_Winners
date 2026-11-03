import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";

/**
 * Retrieves the current authenticated session from request headers.
 */
export async function getCurrentSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch (err) {
    console.error("Error retrieving session in getCurrentSession:", err);
    return null;
  }
}

/**
 * Requires an authenticated user session. Throws Error("UNAUTHORIZED") if not authenticated.
 */
export async function requireAuth() {
  const session = await getCurrentSession();
  if (!session || !session.user) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

/**
 * Requires an authorized administrator. Verifies against the database directly.
 * Throws Error("UNAUTHORIZED") or Error("FORBIDDEN").
 */
export async function requireAdmin() {
  const session = await requireAuth();

  await connectToDatabase();
  const dbUser = await User.findById(session.user.id).select("role").lean();

  const role = dbUser?.role || (session.user as { role?: string })?.role;
  if (role !== "admin") {
    throw new Error("FORBIDDEN");
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: "admin" as const,
    },
  };
}

/**
 * Requires an authorized mentor or user with mentor onboarding access.
 * Throws Error("UNAUTHORIZED") or Error("FORBIDDEN").
 */
export async function requireMentor() {
  const session = await requireAuth();

  await connectToDatabase();
  const dbUser = await User.findById(session.user.id).select("role").lean();
  const role = dbUser?.role || (session.user as { role?: string })?.role;

  // If user is already role mentor or admin, allowed
  if (role === "mentor" || role === "admin") {
    return session;
  }

  // Also check if user has an existing mentor profile
  const { MentorProfile } = await import("@/models/MentorProfile");
  const profile = await MentorProfile.findOne({ userId: session.user.id }).lean();
  if (!profile) {
    throw new Error("FORBIDDEN");
  }

  return session;
}

