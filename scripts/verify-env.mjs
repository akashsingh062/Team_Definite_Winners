import fs from "node:fs";

// Load .env.local into process.env
const envContent = fs.readFileSync(".env.local", "utf8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx !== -1) {
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    process.env[key] = val;
  }
}

import { connectToDatabase, getDatabaseState } from "../lib/db/mongodb.ts";
import { getGeminiClient, DEFAULT_GEMINI_MODEL } from "../lib/gemini.ts";

console.log("\n=======================================================");
console.log("  CareerBridge AI - Live Environment & Services Check");
console.log("=======================================================\n");

let mongoOk = false;
let geminiOk = false;

// 1. MongoDB Atlas Check
console.log("1. Testing MongoDB Atlas (Mongoose)...");
try {
  const mongooseInstance = await connectToDatabase();
  const dbState = getDatabaseState();
  console.log(`   ✅ MongoDB State: ${dbState.statusText} (code ${dbState.state})`);
  console.log(`   Connected Database: "${mongooseInstance.connection.name}"`);
  console.log(`   Cluster Host: ${mongooseInstance.connection.host}`);
  mongoOk = true;
} catch (err) {
  console.error("   ❌ MongoDB Error:", err.message);
}

// 2. Google Gemini API Check
console.log("\n2. Testing Google Gemini API...");
try {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: DEFAULT_GEMINI_MODEL,
    contents: "Respond in 5 words with a welcoming message for a student developer.",
  });
  console.log(`   ✅ Gemini API: Verified and working! (model: ${DEFAULT_GEMINI_MODEL})`);
  console.log(`   AI Response: "${response.text.trim()}"`);
  geminiOk = true;
} catch (err) {
  console.error("   ❌ Gemini API Error:", err.message);
}

console.log("\n=======================================================");
if (mongoOk && geminiOk) {
  console.log("  🎉 RESULT: Both MongoDB Atlas and Gemini API are ACTIVE!");
} else {
  console.log("  ⚠️ RESULT: One or more services encountered an issue.");
}
console.log("=======================================================\n");

process.exit(mongoOk && geminiOk ? 0 : 1);
