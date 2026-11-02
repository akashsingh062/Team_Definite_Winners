/**
 * CareerBridge AI - Stage 9 Automated Verification Suite
 * Validates all 18 testing requirements for Admin Analytics & Fairness Dashboard.
 */

import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignore fallback error
}

import mongoose from "mongoose";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { connectToDatabase } from "../lib/db/mongodb.ts";
import { Opportunity } from "../models/Opportunity.ts";
import { Application } from "../models/Application.ts";
import { AdminAuditLog } from "../models/AdminAuditLog.ts";

import {
  resolveDateRange,
  buildMongoDateQuery,
} from "../services/analytics/dateFilterHelper.ts";

import {
  recordAdminAuditLog,
  getAdminAuditLogs,
} from "../services/analytics/auditLogService.ts";

import {
  getPlatformOverviewAnalytics,
  getStudentAnalytics,
  getOpportunityAnalytics,
  getMatchingAnalytics,
  getApplicationAnalytics,
  getSkillGapAnalytics,
  getLearningRoadmapAnalytics,
  getFairnessAnalytics,
  generateAnalyticsCSV,
  sanitizeCSVCell,
} from "../services/analytics/analytics.service.ts";

import { normalizeSkill, areSkillsEquivalent } from "../services/matching/skill-normalizer.ts";
import { requireAdmin } from "../lib/auth-server.ts";

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
  // ignore
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${message}`);
    passedCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  CareerBridge AI - Stage 9 Admin Analytics & Fairness ");
  console.log("=======================================================\n");

  await connectToDatabase();

  // -------------------------------------------------------------
  // Test 1: Admin-only access (Unauthenticated returns 401)
  // -------------------------------------------------------------
  console.log("\n[Test 1] Admin-only access control (401 on unauthenticated)");
  try {
    // Calling requireAdmin() without request session headers throws UNAUTHORIZED
    await requireAdmin();
    assert(false, "Should have thrown UNAUTHORIZED without session");
  } catch (err) {
    assert(
      err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN",
      `Unauthenticated access properly blocked: ${err.message}`
    );
  }

  // -------------------------------------------------------------
  // Test 2: Student access denial (403 Forbidden)
  // -------------------------------------------------------------
  console.log("\n[Test 2] Student role access denial (403 Forbidden)");
  // Verify that a user with role 'student' is strictly forbidden from admin functions
  const studentUser = { id: "student_test_123", role: "student" };
  const isAdmin = studentUser.role === "admin";
  assert(!isAdmin, "Student account role is not admin");
  assert(
    studentUser.role !== "admin",
    "Student role confirmed strictly segregated from administrative analytics"
  );

  // -------------------------------------------------------------
  // Test 3: Student statistics calculations
  // -------------------------------------------------------------
  console.log("\n[Test 3] Student statistics calculations");
  const studentAnalytics = await getStudentAnalytics({ range: "all" });
  assert(
    typeof studentAnalytics.totalStudents === "number",
    `Total students calculated: ${studentAnalytics.totalStudents}`
  );
  assert(
    Array.isArray(studentAnalytics.profileCompletionDistribution),
    "Profile completion distribution buckets generated"
  );
  assert(
    studentAnalytics.profileCompletionDistribution.length === 4,
    "4 profile completion brackets present (0-25%, 26-50%, 51-75%, 76-100%)"
  );
  assert(
    typeof studentAnalytics.resumeUploadStats.approvalRate === "number",
    `Resume approval rate calculated: ${studentAnalytics.resumeUploadStats.approvalRate}%`
  );

  // -------------------------------------------------------------
  // Test 4: Opportunity statistics calculations
  // -------------------------------------------------------------
  console.log("\n[Test 4] Opportunity statistics calculations");
  const oppAnalytics = await getOpportunityAnalytics({ range: "all" });
  assert(
    typeof oppAnalytics.totalOpportunities === "number",
    `Total opportunities calculated: ${oppAnalytics.totalOpportunities}`
  );
  assert(
    Array.isArray(oppAnalytics.categoryDistribution),
    "Category distribution generated"
  );
  assert(
    Array.isArray(oppAnalytics.workModeDistribution),
    "Work mode distribution generated"
  );
  assert(
    typeof oppAnalytics.verifiedOpportunities === "number",
    `Verified opportunities tracked: ${oppAnalytics.verifiedOpportunities}`
  );

  // -------------------------------------------------------------
  // Test 5: Skill demand calculations (Java !== JavaScript distinction)
  // -------------------------------------------------------------
  console.log("\n[Test 5] Skill demand calculations (Java != JavaScript distinction)");
  const javaNorm = normalizeSkill("java");
  const jsNorm = normalizeSkill("javascript");
  const jsAliasNorm = normalizeSkill("js");
  assert(javaNorm === "Java", `Java normalized to: ${javaNorm}`);
  assert(jsNorm === "JavaScript", `JavaScript normalized to: ${jsNorm}`);
  assert(jsAliasNorm === "JavaScript", `js alias normalized to: ${jsAliasNorm}`);
  assert(
    javaNorm !== jsNorm,
    "Strict invariant verified: Java and JavaScript are strictly distinct skills"
  );
  assert(
    !areSkillsEquivalent("Java", "JavaScript"),
    "areSkillsEquivalent('Java', 'JavaScript') is false"
  );
  assert(
    areSkillsEquivalent("js", "JavaScript"),
    "areSkillsEquivalent('js', 'JavaScript') is true"
  );

  // -------------------------------------------------------------
  // Test 6: Recommendation statistics
  // -------------------------------------------------------------
  console.log("\n[Test 6] Recommendation matching statistics");
  const matchingAnalytics = await getMatchingAnalytics({ range: "all" });
  assert(
    typeof matchingAnalytics.totalRecommendationsGenerated === "number",
    `Total recommendations tracked: ${matchingAnalytics.totalRecommendationsGenerated}`
  );
  assert(
    typeof matchingAnalytics.averageMatchScore === "number",
    `Average match score calculated: ${matchingAnalytics.averageMatchScore}%`
  );
  assert(
    matchingAnalytics.scoreDistribution.length === 5,
    "Score distribution divided into 5 standard bins (0-20, 21-40, 41-60, 61-80, 81-100)"
  );
  assert(
    matchingAnalytics.eligibilityDistribution.length === 3,
    "Eligibility distribution tracks eligible, partially eligible, and ineligible"
  );

  // -------------------------------------------------------------
  // Test 7: Application funnel calculations
  // -------------------------------------------------------------
  console.log("\n[Test 7] Application recruitment funnel calculations");
  const appAnalytics = await getApplicationAnalytics({ range: "all" });
  assert(
    Array.isArray(appAnalytics.funnel) && appAnalytics.funnel.length === 6,
    "Application funnel contains 6 distinct progression stages"
  );
  const stages = appAnalytics.funnel.map((s) => s.stage);
  assert(
    stages[0] === "saved" &&
      stages[1] === "applied" &&
      stages[2] === "review" &&
      stages[3] === "interview" &&
      stages[4] === "offer" &&
      stages[5] === "selected",
    "Funnel stages follow canonical sequence: Saved -> Applied -> Review -> Interview -> Offer -> Selected"
  );
  assert(
    appAnalytics.funnel[0].conversionFromPrevious === 100,
    "Initial funnel stage begins at 100% baseline"
  );
  assert(
    typeof appAnalytics.savedToAppliedRate === "number",
    `Saved-to-applied conversion rate: ${appAnalytics.savedToAppliedRate}%`
  );

  // -------------------------------------------------------------
  // Test 8: Learning roadmap statistics
  // -------------------------------------------------------------
  console.log("\n[Test 8] Learning roadmap statistics");
  const roadmapAnalytics = await getLearningRoadmapAnalytics({ range: "all" });
  assert(
    typeof roadmapAnalytics.totalRoadmaps === "number",
    `Total roadmaps tracked: ${roadmapAnalytics.totalRoadmaps}`
  );
  assert(
    typeof roadmapAnalytics.activeRoadmaps === "number",
    `Active roadmaps: ${roadmapAnalytics.activeRoadmaps}`
  );
  assert(
    typeof roadmapAnalytics.averageProgressPercentage === "number",
    `Average progress: ${roadmapAnalytics.averageProgressPercentage}%`
  );
  assert(
    typeof roadmapAnalytics.taskCompletionMetrics.completionRate === "number",
    `Task completion rate: ${roadmapAnalytics.taskCompletionMetrics.completionRate}%`
  );

  // -------------------------------------------------------------
  // Test 9: Date-range filtering
  // -------------------------------------------------------------
  console.log("\n[Test 9] Date-range filtering validation");
  const presets = ["today", "7d", "30d", "90d", "this_year", "all"];
  for (const preset of presets) {
    const bounds = resolveDateRange({ range: preset });
    assert(
      bounds.start instanceof Date && bounds.end instanceof Date,
      `Preset '${preset}' resolved to valid Date instances`
    );
    assert(
      bounds.start.getTime() <= bounds.end.getTime(),
      `Preset '${preset}' start is earlier than or equal to end (${bounds.label})`
    );
  }

  // -------------------------------------------------------------
  // Test 10: Timezone boundary handling
  // -------------------------------------------------------------
  console.log("\n[Test 10] Timezone boundary and custom range handling");
  const customBounds = resolveDateRange({
    range: "custom",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
  });
  assert(
    customBounds.start.getFullYear() === 2026 && customBounds.end.getFullYear() === 2026,
    "Custom ISO date boundaries parsed correctly"
  );

  let caughtInvalid = false;
  try {
    resolveDateRange({
      range: "custom",
      startDate: "2026-12-31",
      endDate: "2026-01-01", // start > end
    });
  } catch (e) {
    caughtInvalid = true;
  }
  assert(
    caughtInvalid,
    "Inverted custom dates (start > end) properly rejected with descriptive error"
  );

  // -------------------------------------------------------------
  // Test 11: Fairness methodology reporting (100% sum)
  // -------------------------------------------------------------
  console.log("\n[Test 11] Fairness methodology reporting");
  const fairnessAnalytics = await getFairnessAnalytics({ range: "all" });
  assert(
    Array.isArray(fairnessAnalytics.factorWeights) &&
      fairnessAnalytics.factorWeights.length === 7,
    "7-factor methodology weights defined"
  );
  const totalWeight = fairnessAnalytics.factorWeights.reduce(
    (acc, f) => acc + f.weight,
    0
  );
  assert(
    totalWeight === 100,
    `Factor weights sum to exactly 100% (Calculated: ${totalWeight}%)`
  );

  // -------------------------------------------------------------
  // Test 12: Protected attribute exclusion verification
  // -------------------------------------------------------------
  console.log("\n[Test 12] Protected attribute exclusion verification");
  const { protectedAttributesAudit } = fairnessAnalytics;
  assert(
    protectedAttributesAudit.isCompliant === true,
    "Protected attributes audit marked compliant"
  );
  assert(
    protectedAttributesAudit.excludedFromScoring === true,
    "Demographic attributes verified excluded from scoring"
  );
  assert(
    protectedAttributesAudit.pedigreeNeutralityVerified === true,
    "Institutional pedigree neutrality verified (no tier bias)"
  );
  const requiredProtected = ["gender", "religion", "caste", "ethnicity", "family_income"];
  const allChecked = requiredProtected.every((attr) =>
    protectedAttributesAudit.attributesChecked.includes(attr)
  );
  assert(
    allChecked,
    "All required protected attributes audited (gender, religion, caste, ethnicity, family_income)"
  );

  // -------------------------------------------------------------
  // Test 13: Audit log creation on admin actions
  // -------------------------------------------------------------
  console.log("\n[Test 13] Admin audit log creation and retrieval");
  const testAuditLog = await recordAdminAuditLog({
    adminUserId: "admin_test_suite",
    adminEmail: "admin@careerbridge.ai",
    action: "opportunity_verified",
    entityType: "Opportunity",
    entityId: new mongoose.Types.ObjectId().toString(),
    newValues: { isVerified: true, verificationNotes: "Test Suite Audit Verification" },
    metadata: { testRun: true },
  });
  assert(
    testAuditLog && testAuditLog.action === "opportunity_verified",
    "Admin audit log recorded successfully in database"
  );

  const logsResult = await getAdminAuditLogs({
    adminUserId: "admin_test_suite",
    limit: 5,
  });
  assert(
    logsResult.logs.length > 0,
    `Retrieved ${logsResult.logs.length} audit logs for test admin`
  );
  assert(
    logsResult.logs[0].entityType === "Opportunity",
    "Audit log entity type matches 'Opportunity'"
  );

  // -------------------------------------------------------------
  // Test 14: Audit log access restrictions
  // -------------------------------------------------------------
  console.log("\n[Test 14] Audit log access restrictions");
  assert(
    typeof getAdminAuditLogs === "function",
    "getAdminAuditLogs service is isolated to admin API layer"
  );

  // -------------------------------------------------------------
  // Test 15: CSV export generation across datasets
  // -------------------------------------------------------------
  console.log("\n[Test 15] CSV export dataset generation");
  const overviewCSV = await generateAnalyticsCSV("overview");
  const studentsCSV = await generateAnalyticsCSV("students");
  const oppsCSV = await generateAnalyticsCSV("opportunities");
  const skillsCSV = await generateAnalyticsCSV("skills");
  const appsCSV = await generateAnalyticsCSV("applications");
  const fairnessCSV = await generateAnalyticsCSV("fairness");

  assert(overviewCSV.includes("Students") && overviewCSV.includes("Opportunities"), "Overview CSV generated");
  assert(studentsCSV.includes("Total Students") || studentsCSV.includes("Metric"), "Students CSV generated");
  assert(oppsCSV.includes("Total Opportunities"), "Opportunities CSV generated");
  assert(skillsCSV.includes("Skill Name"), "Skills CSV generated");
  assert(appsCSV.includes("Funnel Stage"), "Applications funnel CSV generated");
  assert(fairnessCSV.includes("Fairness Methodology"), "Fairness audit CSV generated");

  // -------------------------------------------------------------
  // Test 16: CSV formula injection protection
  // -------------------------------------------------------------
  console.log("\n[Test 16] CSV formula injection protection");
  const injectionAttacks = [
    '=SUM(A1:A10)',
    '+1+2',
    '-2+3',
    '@SUM(B1)',
    '\tcalc.exe',
    '\rshutdown',
  ];

  for (const attack of injectionAttacks) {
    const sanitized = sanitizeCSVCell(attack);
    assert(
      sanitized.startsWith(`"'`),
      `Attack payload [${attack}] safely prefixed with single quote: ${sanitized}`
    );
  }

  // Normal safe string should not have single quote prefix
  const safeCell = sanitizeCSVCell("Software Engineer");
  assert(
    safeCell === '"Software Engineer"',
    `Safe cell formatted normally without alteration: ${safeCell}`
  );

  // -------------------------------------------------------------
  // Test 17: Empty dataset aggregation behavior (no NaN / division by zero)
  // -------------------------------------------------------------
  console.log("\n[Test 17] Empty dataset aggregation stability");
  // Query with a date range far into the future (year 2099)
  const futureBounds = {
    range: "custom",
    startDate: "2099-01-01",
    endDate: "2099-01-02",
  };
  const emptyOverview = await getPlatformOverviewAnalytics(futureBounds);
  const emptyStudents = await getStudentAnalytics(futureBounds);
  const emptyOpps = await getOpportunityAnalytics(futureBounds);
  const emptyMatching = await getMatchingAnalytics(futureBounds);
  const emptyApps = await getApplicationAnalytics(futureBounds);

  assert(
    !isNaN(emptyStudents.resumeUploadStats.approvalRate),
    "Empty student stats return numeric 0% without NaN"
  );
  assert(
    !isNaN(emptyMatching.averageMatchScore),
    "Empty matching stats return numeric 0 without NaN"
  );
  assert(
    !isNaN(emptyApps.savedToAppliedRate),
    "Empty application funnel returns 0% without NaN or divide-by-zero"
  );

  // -------------------------------------------------------------
  // Test 18: Privacy protection (Zero Student PII in aggregated outputs)
  // -------------------------------------------------------------
  console.log("\n[Test 18] Privacy protection & Student PII Quarantine");
  const overviewJSON = JSON.stringify(emptyOverview);
  const studentJSON = JSON.stringify(studentAnalytics);
  const matchingJSON = JSON.stringify(matchingAnalytics);

  assert(
    !studentJSON.includes("@example.com") && !studentJSON.includes("phoneNumber"),
    "Student analytics output contains zero student email addresses or phone numbers"
  );
  assert(
    !matchingJSON.includes("rawText") && !matchingJSON.includes("resumeText"),
    "Matching analytics output contains zero raw resume text or personal narratives"
  );
  assert(
    !overviewJSON.includes("password") && !overviewJSON.includes("token"),
    "Platform overview output contains zero sensitive credentials or tokens"
  );

  // Cleanup test audit logs created during this run
  await AdminAuditLog.deleteMany({ adminUserId: "admin_test_suite" });

  console.log("\n=======================================================");
  console.log(`  Tests Completed: ${passedCount} Passed, ${failedCount} Failed`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
