import dns from "node:dns";
import { MongoClient } from "mongodb";
import { env } from "@/config/env";

let rawUri = process.env.MONGODB_URI || env.MONGODB_URI;

// Set public DNS fallback for Windows SRV record resolution when connecting to Atlas
if (typeof window === "undefined" && rawUri.startsWith("mongodb+srv://")) {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch {
    // Graceful fallback if restricted
  }
}

// Ensure default database name is present
if (rawUri.endsWith("/")) {
  rawUri = `${rawUri}careerbridge-ai?retryWrites=true&w=majority`;
}

declare global {
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongoClient) {
    globalThis._mongoClient = new MongoClient(rawUri);
  }
  client = globalThis._mongoClient;
} else {
  client = new MongoClient(rawUri);
}

export { client };
export default client;
