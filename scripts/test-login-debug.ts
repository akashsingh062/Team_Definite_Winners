import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import { auth } from "../lib/auth";

async function main() {
  console.log("Testing Better Auth directly...");
  try {
    // Attempt sign in with test user or invalid password
    console.log("Attempting sign in with non-existent user:");
    try {
      const res = await auth.api.signInEmail({
        body: {
          email: "nonexistent@test.com",
          password: "Password123!",
        },
      });
      console.log("Sign in result:", res);
    } catch (err: any) {
      console.log("Expected error for non-existent user:", err.message, err.status, err.body);
    }

    console.log("\nAttempting sign up with a new test student:");
    const testEmail = `test_login_${Date.now()}@university.edu`;
    const upRes = await auth.api.signUpEmail({
      body: {
        email: testEmail,
        password: "Password123!",
        name: "Test Login User",
      },
    });
    console.log("Sign up result:", {
      user: upRes?.user?.email,
      id: upRes?.user?.id,
    });

    console.log("\nNow attempting sign in with that created user:");
    const inRes = await auth.api.signInEmail({
      body: {
        email: testEmail,
        password: "Password123!",
      },
    });
    console.log("Sign in success!", {
      user: inRes?.user?.email,
      token: !!inRes?.token,
    });
  } catch (error: any) {
    console.error("FATAL ERROR:", error);
  }
}

main().catch(console.error);
