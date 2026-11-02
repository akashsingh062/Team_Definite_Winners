import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "@/config/env";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = globalThis.mongooseCache || {
  conn: null,
  promise: null,
};

if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = cached;
}

/**
 * Reusable database connection utility with connection pooling and caching.
 * Prevents multiple connections during Next.js hot module reloading in development.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  let uri = process.env.MONGODB_URI || env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Please configure MONGODB_URI in your environment or .env.local file."
    );
  }

  // Set public DNS fallback for Windows SRV record resolution when connecting to Atlas
  if (typeof window === "undefined" && uri.startsWith("mongodb+srv://")) {
    try {
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
    } catch {
      // Graceful fallback if restricted
    }
  }

  // Ensure default database name is present
  if (uri.endsWith("/")) {
    uri = `${uri}careerbridge-ai?retryWrites=true&w=majority`;
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

/**
 * Check current database connection state.
 * 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export function getDatabaseState(): { state: number; statusText: string } {
  const state = mongoose.connection.readyState;
  const statusMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return {
    state,
    statusText: statusMap[state] || "unknown",
  };
}

export default connectToDatabase;
