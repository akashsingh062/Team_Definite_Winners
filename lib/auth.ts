import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import client from "@/lib/db/mongoClient";
import { env } from "@/config/env";

export const auth = betterAuth({
  database: mongodbAdapter(client.db(), {
    client,
    transaction: false, // Ensures compatibility with standalone local MongoDB servers
  }),
  secret: process.env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false, // Prevents client from granting itself admin privileges during registration
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;

