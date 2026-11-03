import dns from "node:dns";
import { MongoClient } from "mongodb";
import { env } from "@/config/env";

let rawUri = process.env.MONGODB_URI || env.MONGODB_URI;

// Set public DNS fallback for Windows SRV record resolution when connecting to Atlas
if (typeof window === "undefined") {
  try {
    dns.setDefaultResultOrder("ipv4first");
    if (rawUri.startsWith("mongodb+srv://")) {
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
    }
  } catch {
    // Graceful fallback if restricted
  }
}

// Ensure default database name is present
if (rawUri.endsWith("/")) {
  rawUri = `${rawUri}careerbridge-ai?retryWrites=true&w=majority`;
} else if (!rawUri.includes("careerbridge-ai") && rawUri.includes(".mongodb.net")) {
  const [base, query] = rawUri.split("?");
  const separator = base.endsWith("/") ? "" : "/";
  rawUri = `${base}${separator}careerbridge-ai${query ? `?${query}` : "?retryWrites=true&w=majority"}`;
}

declare global {
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;

const clientOptions = {
  serverSelectionTimeoutMS: 8000,
  socketTimeoutMS: 45000,
};

if (process.env.NODE_ENV === "development") {
  if (!globalThis._mongoClient) {
    globalThis._mongoClient = new MongoClient(rawUri, clientOptions);
  }
  client = globalThis._mongoClient;
} else {
  client = new MongoClient(rawUri, clientOptions);
}

export { client };
export default client;
