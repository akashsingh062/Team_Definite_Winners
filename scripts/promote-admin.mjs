/**
 * Server-side Admin Provisioning Script
 * Usage:
 *   node scripts/promote-admin.mjs <user-email>
 * Example:
 *   node scripts/promote-admin.mjs admin@careerbridge.ai
 */

import fs from "node:fs";
import dns from "node:dns";
import { MongoClient } from "mongodb";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch {
  // Graceful fallback
}

// Load .env.local
const envContent = fs.readFileSync(".env.local", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx !== -1) {
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

let mongoUri = env.MONGODB_URI || "mongodb://localhost:27017/careerbridge-ai";
if (mongoUri.endsWith("/")) {
  mongoUri = `${mongoUri}careerbridge-ai?retryWrites=true&w=majority`;
}

const targetEmail = process.argv[2]?.toLowerCase()?.trim();

if (!targetEmail) {
  console.error("❌ Please provide a user email address to promote.");
  console.log("Usage: node scripts/promote-admin.mjs <user-email>");
  process.exit(1);
}

console.log(`Connecting to database to promote user: ${targetEmail}...`);

const client = new MongoClient(mongoUri);

try {
  await client.connect();
  const db = client.db();

  // Better Auth stores accounts in collection "user"
  const user = await db.collection("user").findOne({ email: targetEmail });

  if (!user) {
    console.error(`❌ User with email "${targetEmail}" was not found in the database.`);
    console.log("Please register the user first on the registration page (/register) before promoting.");
    await client.close();
    process.exit(1);
  }

  const result = await db.collection("user").updateOne(
    { _id: user._id },
    { $set: { role: "admin", updatedAt: new Date() } }
  );

  if (result.modifiedCount > 0 || user.role === "admin") {
    console.log(`✅ SUCCESS: User "${user.name}" (${targetEmail}) is now an authorized ADMINISTRATOR!`);
    console.log("They can now access /admin/dashboard and manage opportunities.");
  } else {
    console.log(`ℹ️ User "${targetEmail}" is already an administrator.`);
  }

  await client.close();
  process.exit(0);
} catch (error) {
  console.error("❌ Database Error during admin promotion:", error.message);
  await client.close();
  process.exit(1);
}
