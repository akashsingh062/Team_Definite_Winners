import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required").default("mongodb://localhost:27017/careerbridge-ai"),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 chars").default("development_secret_key_careerbridge_ai_at_least_32_chars"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
  GEMINI_API_KEY: z.string().optional().default(""),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse({
  MONGODB_URI: process.env.MONGODB_URI,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

export type Env = z.infer<typeof envSchema>;

