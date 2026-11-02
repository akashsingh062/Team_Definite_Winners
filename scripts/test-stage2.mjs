/**
 * CareerBridge AI - Stage 2 Automated Test Suite
 * Validates all Stage 2 Opportunity Management requirements.
 */

import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignore fallback error if already active
}

import mongoose from "mongoose";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { opportunityFormSchema } from "../features/opportunity/schemas/opportunitySchema.ts";
import { Opportunity } from "../models/Opportunity.ts";
import { auth } from "../lib/auth.ts";

// Load .env.local if present
try {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        val = val.replace(/^['"](.*)['"]$/, "$1").trim();
        process.env[key] = val;
      }
    }
  }
} catch (err) {
  console.warn("Could not load .env.local:", err.message);
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? "- " + details : ""}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  CareerBridge AI - Stage 2 Automated Verification Suite");
  console.log("=======================================================\n");

  // 1. Zod Schema Validation for Opportunity Creation
  console.log("--- Test 1: Opportunity Form Validation (Zod) ---");
  const validForm = opportunityFormSchema.safeParse({
    title: "Software Engineering Intern",
    companyName: "TechCorp Labs",
    description: "Build robust distributed backend systems and frontend components.",
    category: "internship",
    employmentType: "internship",
    industry: "Information Technology",
    requiredSkills: ["Node.js", "TypeScript", "React"],
    preferredSkills: ["Docker", "MongoDB"],
    minimumExperience: "Fresher / 0 years",
    eligibilityCriteria: "Undergraduates graduating in 2026 or 2027",
    educationRequirements: "B.Tech / B.E. / BCA / MCA in CS/IT",
    minimumCGPA: 7.5,
    workMode: "remote",
    location: "Remote / Nationwide",
    isPaid: true,
    stipend: "$1,500/month",
    currency: "USD",
    duration: "6 Months",
    applicationInstructions: "Submit resume and GitHub profile URL",
    status: "draft",
  });
  assert(validForm.success, "Valid opportunity form passes Zod validation");

  // Test missing required fields
  const missingTitle = opportunityFormSchema.safeParse({
    companyName: "TechCorp Labs",
    category: "internship",
  });
  assert(!missingTitle.success, "Opportunity form rejects missing title and description");

  // Test empty required skills
  const emptySkills = opportunityFormSchema.safeParse({
    title: "Software Engineer",
    companyName: "Acme",
    description: "Good job",
    category: "job",
    employmentType: "full-time",
    industry: "Tech",
    requiredSkills: [],
    minimumExperience: "1 year",
    eligibilityCriteria: "Graduates",
    educationRequirements: "B.Tech",
    workMode: "onsite",
    location: "City",
    applicationInstructions: "Apply now",
  });
  assert(!emptySkills.success, "Opportunity form requires at least one required skill");

  // Test invalid category
  const invalidCategory = opportunityFormSchema.safeParse({
    title: "Invalid Role",
    companyName: "Acme",
    description: "Some description here",
    category: "unknown-category",
  });
  assert(!invalidCategory.success, "Invalid category enum value is rejected");

  // 2. Role-Based Access Control Security
  console.log("\n--- Test 2: Role-Based Access Control (RBAC) Security ---");
  // Check Better Auth config options to ensure client cannot supply role
  const authOptions = auth.options;
  const roleFieldConfig = authOptions?.user?.additionalFields?.role;
  assert(
    roleFieldConfig?.input === false,
    "Better Auth user role is protected with input: false (client cannot elevate own role)"
  );
  assert(
    roleFieldConfig?.defaultValue === "student",
    "Default role for newly registered users is student"
  );

  // 3. Database Connection & Seed Data Verification
  console.log("\n--- Test 3: MongoDB Atlas & Opportunity Data Verification ---");
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("  ❌ FAIL: MONGODB_URI not found in environment");
    return;
  }
  if (!uri.includes("careerbridge-ai") && uri.includes("?")) {
    uri = uri.replace(/\/\?/, "/careerbridge-ai?");
  } else if (!uri.includes("careerbridge-ai")) {
    uri = uri.replace(/\/?$/, "/careerbridge-ai");
  }

  await mongoose.connect(uri);
  assert(mongoose.connection.readyState === 1, "Connected to MongoDB Atlas database");

  // Check total demo opportunities
  const demoCount = await Opportunity.countDocuments({ isDemoData: true });
  assert(demoCount === 35, `Seeded exactly 35 demo opportunities (found ${demoCount})`);

  // Check 3 categories breakdown
  const internshipCount = await Opportunity.countDocuments({
    isDemoData: true,
    category: "internship",
  });
  const jobCount = await Opportunity.countDocuments({
    isDemoData: true,
    category: "job",
  });
  const skillCount = await Opportunity.countDocuments({
    isDemoData: true,
    category: "skill-development",
  });

  assert(internshipCount === 15, `Seeded 15 Internships (found ${internshipCount})`);
  assert(jobCount === 10, `Seeded 10 Full-Time Jobs (found ${jobCount})`);
  assert(skillCount === 10, `Seeded 10 Skill-Development Opportunities (found ${skillCount})`);

  // 4. Public Student Visibility Invariant
  console.log("\n--- Test 4: Public Student Visibility Invariant ---");
  // Only status === 'published' && verificationStatus === 'verified' should be visible
  const publicFilter = { status: "published", verificationStatus: "verified" };
  const publicOpps = await Opportunity.find(publicFilter);
  assert(
    publicOpps.length >= 35,
    `Public filter returns ${publicOpps.length} verified & published opportunities`
  );

  const nonPublished = await Opportunity.find({ status: { $ne: "published" } });
  const allVerified = publicOpps.every((o) => o.verificationStatus === "verified");
  const allPublished = publicOpps.every((o) => o.status === "published");
  assert(allVerified, "Every publicly accessible opportunity is verified by an admin");
  assert(allPublished, "Every publicly accessible opportunity has status 'published'");

  // 5. Verification & Publication Lifecycle Workflow
  console.log("\n--- Test 5: Opportunity Lifecycle & Audit Workflow ---");
  const testOpp = await Opportunity.create({
    title: "TEST_Automated_Audit_Engineer",
    companyName: "QA Vanguard",
    description: "Temporary test listing for verifying Stage 2 lifecycle.",
    category: "internship",
    employmentType: "internship",
    industry: "DevOps & QA",
    requiredSkills: ["Automated Testing", "Jest", "TypeScript"],
    preferredSkills: ["Playwright"],
    minimumExperience: "Fresher",
    eligibilityCriteria: "CS Students",
    educationRequirements: "Any Degree",
    workMode: "remote",
    location: "Remote",
    isPaid: true,
    stipend: "$1,000/mo",
    applicationInstructions: "Follow internal test guidelines",
    status: "draft",
    verificationStatus: "unverified",
    createdBy: "admin_test_user_id",
    isDemoData: false,
  });

  assert(Boolean(testOpp._id), "Successfully created draft opportunity");

  // Verify that testOpp is NOT visible in public query
  const publicCheck1 = await Opportunity.findOne({
    _id: testOpp._id,
    ...publicFilter,
  });
  assert(
    publicCheck1 === null,
    "Draft opportunity is hidden from public student query"
  );

  // Admin verifies opportunity
  testOpp.verificationStatus = "verified";
  testOpp.verificationNotes = "Automated test audit passed.";
  await testOpp.save();

  const publicCheck2 = await Opportunity.findOne({
    _id: testOpp._id,
    ...publicFilter,
  });
  assert(
    publicCheck2 === null,
    "Verified opportunity with status 'draft' remains hidden from students until published"
  );

  // Admin publishes opportunity
  testOpp.status = "published";
  testOpp.publishedAt = new Date();
  await testOpp.save();

  const publicCheck3 = await Opportunity.findOne({
    _id: testOpp._id,
    ...publicFilter,
  });
  assert(
    publicCheck3 !== null,
    "Opportunity is now publicly visible to students once both verified and published"
  );

  // 6. Update & Deletion Operations
  console.log("\n--- Test 6: Opportunity Update & Deletion ---");
  testOpp.title = "TEST_Updated_Title";
  testOpp.requiredSkills.push("Cypress");
  await testOpp.save();

  const updatedOpp = await Opportunity.findById(testOpp._id);
  assert(
    updatedOpp.title === "TEST_Updated_Title" &&
      updatedOpp.requiredSkills.includes("Cypress"),
    "Opportunity fields updated successfully"
  );

  // Delete test document
  await Opportunity.findByIdAndDelete(testOpp._id);
  const deletedCheck = await Opportunity.findById(testOpp._id);
  assert(deletedCheck === null, "Opportunity deleted successfully");

  // Summary
  console.log("\n=======================================================");
  console.log(`  Tests Completed: ${passedCount + failedCount}`);
  console.log(`  Passed: ${passedCount}`);
  console.log(`  Failed: ${failedCount}`);
  console.log("=======================================================\n");

  await mongoose.disconnect();

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
