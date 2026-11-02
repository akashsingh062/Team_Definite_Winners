import { NextResponse } from "next/server";
import { connectToDatabase, getDatabaseState } from "@/lib/db/mongodb";
import { isGeminiConfigured } from "@/lib/gemini";

export async function GET() {
  let dbStatus = "disconnected";
  let dbError: string | null = null;

  try {
    await connectToDatabase();
    dbStatus = getDatabaseState().statusText;
  } catch (error) {
    dbStatus = "error";
    dbError = error instanceof Error ? error.message : "Unknown database connection error";
  }

  const responsePayload = {
    service: "CareerBridge AI Platform",
    status: dbStatus === "connected" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: {
      status: dbStatus,
      error: dbError,
    },
    auth: {
      provider: "Better Auth",
      adapter: "MongoDB Adapter",
      status: "configured",
    },
    ai: {
      provider: "Google Gemini API",
      isConfigured: isGeminiConfigured(),
    },
  };

  return NextResponse.json(responsePayload, {
    status: dbStatus === "connected" ? 200 : 503,
  });
}

