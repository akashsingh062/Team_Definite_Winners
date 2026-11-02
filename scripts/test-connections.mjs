import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";
import fs from "node:fs";

// Load .env.local
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
}

console.log("=== Testing MongoDB Atlas Connection ===");
try {
  let mongoUri = env.MONGODB_URI;
  if (mongoUri && !mongoUri.includes("careerbridge-ai") && mongoUri.endsWith("/")) {
    mongoUri = mongoUri + "careerbridge-ai?retryWrites=true&w=majority";
  }
  const client = new MongoClient(mongoUri);
  await client.connect();
  console.log("✅ MongoDB Atlas: Connected successfully!");
  const dbs = await client.db().admin().listDatabases();
  console.log("   Available databases:", dbs.databases.map((d) => d.name).join(", "));
  await client.close();
} catch (err) {
  console.error("❌ MongoDB Atlas Error:", err.message);
}

console.log("\n=== Testing Google Gemini API Key ===");
try {
  const apiKey = env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });
  
  // Test generating content with gemini-2.0-flash
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Hello! Reply with exactly: 'Gemini API is verified and working.'",
  });

  console.log("✅ Gemini API: Verified and working!");
  console.log("   Model output:", response.text.trim());
} catch (err) {
  console.error("❌ Gemini API Error:", err.message || err);
}

