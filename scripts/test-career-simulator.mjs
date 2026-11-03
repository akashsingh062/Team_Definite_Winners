/**
 * CareerBridge AI - Career Pathway & What-If Simulator Automated Verification Suite
 * Validates all testing requirements specified for Feature 1.
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
import { CareerPath } from "../models/CareerPath.ts";
import { CareerSimulation } from "../models/CareerSimulation.ts";
import { StudentProfile } from "../models/StudentProfile.ts";

import {
  ensureCareerPathsSeeded,
  getCareerPaths,
  getCareerPathByIdOrSlug,
} from "../services/career/career-path.service.ts";

import {
  calculateCareerReadiness,
  getAggregatedStudentProfile,
} from "../services/career/career-readiness.service.ts";

import {
  runCareerWhatIfSimulation,
} from "../services/career/career-simulator.service.ts";

import {
  compareCareerPaths,
} from "../services/career/career-comparison.service.ts";

import {
  generateCareerPathExplanation,
  generateSimulationExplanation,
  generateCareerComparisonExplanation,
} from "../services/career/career-ai.service.ts";

import {
  saveCareerSimulation,
  getStudentCareerSimulations,
  deleteStudentCareerSimulation,
} from "../services/career/career-simulation-history.service.ts";

import { normalizeSkill, areSkillsEquivalent } from "../services/matching/skill-normalizer.ts";

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
  console.log("  CareerBridge AI - Career Pathway & What-If Simulator ");
  console.log("=======================================================\n");

  await connectToDatabase();

  // -------------------------------------------------------------
  // Test 1: Career Path Seeding & Library Retrieval
  // -------------------------------------------------------------
  console.log("\n[Test 1] Career Path Library Seeding & Retrieval");
  await ensureCareerPathsSeeded();
  const allPaths = await getCareerPaths();
  assert(allPaths.length >= 13, `Retrieved ${allPaths.length} curated career paths (>= 13 expected)`);

  const softwareDevPaths = await getCareerPaths({ category: "Software Engineering" });
  assert(softwareDevPaths.length >= 4, `Found ${softwareDevPaths.length} Software Engineering paths`);

  const beginnerPaths = await getCareerPaths({ difficulty: "beginner" });
  assert(beginnerPaths.length >= 2, `Found ${beginnerPaths.length} beginner-friendly paths`);

  // -------------------------------------------------------------
  // Test 2: Single Career Path Retrieval (by ID and slug)
  // -------------------------------------------------------------
  console.log("\n[Test 2] Single Career Path Retrieval by Slug & ID");
  const frontendPath = await getCareerPathByIdOrSlug("frontend-developer");
  assert(frontendPath !== null, "Successfully retrieved 'frontend-developer' by slug");
  assert(frontendPath.title === "Frontend Developer", "Career title matches 'Frontend Developer'");
  assert(Array.isArray(frontendPath.requiredSkills) && frontendPath.requiredSkills.length > 0, "Required skills list populated");
  assert(Array.isArray(frontendPath.recommendedProjects), "Recommended projects list populated");

  const byId = await getCareerPathByIdOrSlug(frontendPath.id);
  assert(byId !== null && byId.slug === "frontend-developer", "Successfully retrieved career path by MongoDB ObjectId");

  // -------------------------------------------------------------
  // Test 3: Deterministic 4-Pillar Readiness Scoring
  // -------------------------------------------------------------
  console.log("\n[Test 3] Deterministic 4-Pillar Readiness Scoring");
  const mockStudent = {
    allSkillNames: new Set(["HTML", "CSS", "JavaScript", "React"]),
    verifiedSkillNames: new Set(["HTML", "CSS", "React"]),
    selfReportedSkillNames: new Set(["JavaScript"]),
    projects: [
      {
        title: "Portfolio Website",
        description: "Personal portfolio",
        technologies: ["React", "CSS", "HTML"],
      },
    ],
    education: {
      degree: "B.Tech Computer Science",
      fieldOfStudy: "Computer Science",
      gpa: 8.5,
    },
  };

  const readiness = calculateCareerReadiness(frontendPath, mockStudent, []);
  assert(typeof readiness.overallScore === "number", `Readiness score computed: ${readiness.overallScore}%`);
  assert(readiness.overallScore >= 0 && readiness.overallScore <= 100, "Readiness score bounded between 0 and 100");

  const pillarWeights = [
    readiness.pillars.requiredSkills.weight,
    readiness.pillars.preferredSkills.weight,
    readiness.pillars.projects.weight,
    readiness.pillars.educationExperience.weight,
  ];
  const sumWeights = pillarWeights.reduce((a, b) => a + b, 0);
  assert(sumWeights === 100, `Methodology weights sum to exactly 100% (Calculated: ${sumWeights}%)`);
  assert(readiness.methodologyVersion === "v1.0-career-path", "Methodology version stamped 'v1.0-career-path'");

  // -------------------------------------------------------------
  // Test 4: Missing & Matched Skill Detection (Java !== JavaScript)
  // -------------------------------------------------------------
  console.log("\n[Test 4] Skill Detection & Strict Normalization");
  assert(readiness.skills.matchedRequired.includes("React"), "Matched required skill 'React' detected");
  assert(readiness.skills.matchedRequired.includes("JavaScript"), "Matched required skill 'JavaScript' detected");
  assert(readiness.skills.missingRequired.includes("TypeScript"), "Missing required skill 'TypeScript' detected");
  assert(readiness.skills.missingRequired.includes("Git"), "Missing required skill 'Git' detected");

  assert(normalizeSkill("java") !== normalizeSkill("javascript"), "Strict invariant: Java !== JavaScript");
  assert(!areSkillsEquivalent("Java", "JavaScript"), "areSkillsEquivalent('Java', 'JavaScript') is false");

  // -------------------------------------------------------------
  // Test 5: What-If Simulation Score Recalculation
  // -------------------------------------------------------------
  console.log("\n[Test 5] What-If Simulation Dynamic Recalculation");
  const hypotheticalSkills = ["TypeScript", "Git", "Tailwind CSS"];
  const simulatedReadiness = calculateCareerReadiness(frontendPath, mockStudent, hypotheticalSkills);

  assert(
    simulatedReadiness.overallScore > readiness.overallScore,
    `Simulation score improved from baseline ${readiness.overallScore}% to ${simulatedReadiness.overallScore}%`
  );
  assert(
    simulatedReadiness.skills.matchedRequired.includes("TypeScript"),
    "Newly simulated skill 'TypeScript' satisfied required criteria"
  );
  assert(
    simulatedReadiness.skills.matchedRequired.includes("Git"),
    "Newly simulated skill 'Git' satisfied required criteria"
  );
  assert(
    simulatedReadiness.skills.missingRequired.length < readiness.skills.missingRequired.length,
    `Missing required skills reduced from ${readiness.skills.missingRequired.length} to ${simulatedReadiness.skills.missingRequired.length}`
  );

  // -------------------------------------------------------------
  // Test 6: Invariant: Real Student Profile Never Mutated by Simulation
  // -------------------------------------------------------------
  console.log("\n[Test 6] Profile Immutability & Safety Invariant");
  const testUserId = "sim_test_user_" + Date.now();
  await StudentProfile.create({
    userId: testUserId,
    personalInfo: { fullName: "Test Student", email: `${testUserId}@example.com` },
    skills: [{ id: "skill_1", name: "HTML", category: "Frontend technologies", proficiency: "Intermediate" }],
  });

  const profileBefore = await StudentProfile.findOne({ userId: testUserId }).lean();
  const simResult = await runCareerWhatIfSimulation(testUserId, "frontend-developer", ["Docker", "Kubernetes", "AWS"]);
  const profileAfter = await StudentProfile.findOne({ userId: testUserId }).lean();

  assert(profileAfter.skills.length === profileBefore.skills.length, "StudentProfile skills array length unchanged in DB");
  assert(
    !profileAfter.skills.some((s) => s.name === "Docker"),
    "Hypothetical skill 'Docker' was NOT written to actual database profile"
  );
  assert(simResult.isSimulated === true, "Result is explicitly marked 'isSimulated: true'");
  assert(simResult.safetyDisclaimer.includes("HYPOTHETICAL"), "Prominent hypothetical simulation safety disclaimer attached");

  // Cleanup test user
  await StudentProfile.deleteOne({ userId: testUserId });

  // -------------------------------------------------------------
  // Test 7: Multi-Career Path Comparison (1 to 3 Paths)
  // -------------------------------------------------------------
  console.log("\n[Test 7] Multi-Career Path Comparison");
  const comparison = await compareCareerPaths(testUserId, [
    "frontend-developer",
    "backend-developer",
    "full-stack-developer",
  ]);

  assert(comparison.careers.length === 3, "Compared 3 career paths simultaneously");
  assert(Array.isArray(comparison.commonSkills), "Common skills array generated");
  assert(
    comparison.commonSkills.includes("Git"),
    "Shared prerequisite skill 'Git' identified across all 3 roles"
  );
  assert(
    comparison.distinctSkillsByCareer["Frontend Developer"] !== undefined,
    "Distinct skills identified for Frontend Developer"
  );

  let caughtTooMany = false;
  try {
    await compareCareerPaths(testUserId, [
      "frontend-developer",
      "backend-developer",
      "full-stack-developer",
      "ai-ml-engineer", // 4 paths (exceeds max 3)
    ]);
  } catch (err) {
    caughtTooMany = true;
  }
  assert(caughtTooMany, "Attempt to compare > 3 career paths strictly rejected");

  // -------------------------------------------------------------
  // Test 8: AI Strategic Guidance & Deterministic Fallback
  // -------------------------------------------------------------
  console.log("\n[Test 8] AI Career Guidance & Fallback Resilience");
  const pathExplanation = await generateCareerPathExplanation(frontendPath, mockStudent, readiness);
  assert(typeof pathExplanation.summary === "string", "Career path explanation generated");
  assert(typeof pathExplanation.projectIdea === "string", "Practical project concept provided");
  assert(typeof pathExplanation.isAiGenerated === "boolean", "AI generation flag tracked");

  const simExplanation = await generateSimulationExplanation(
    frontendPath,
    readiness,
    simulatedReadiness,
    hypotheticalSkills
  );
  assert(typeof simExplanation.strategicValue === "string", "Strategic value summary generated");
  assert(Array.isArray(simExplanation.recommendedLearningOrder), "Chronological learning sequence generated");

  const compExplanation = await generateCareerComparisonExplanation(comparison.careers);
  assert(typeof compExplanation.recommendation === "string", "Comparative recommendation provided");

  // -------------------------------------------------------------
  // Test 9: Simulation History Persistence & Ownership Protection
  // -------------------------------------------------------------
  console.log("\n[Test 9] Simulation History & Student Data Isolation");
  const student1Id = "student_owner_1";
  const student2Id = "student_unauth_2";

  const savedRecord = await saveCareerSimulation(student1Id, {
    careerPathId: frontendPath.id,
    targetCareerTitle: frontendPath.title,
    hypotheticalSkills: ["TypeScript", "Next.js"],
    baselineScore: 50,
    simulatedScore: 78,
    scoreDelta: 28,
    simulationSnapshot: simResult,
    notes: "Targeting Q3 Frontend Internships",
  });

  assert(savedRecord && savedRecord.targetCareerTitle === "Frontend Developer", "Simulation snapshot saved to database");

  const student1History = await getStudentCareerSimulations(student1Id);
  assert(student1History.length > 0, `Student 1 retrieved ${student1History.length} saved simulation(s)`);

  const student2History = await getStudentCareerSimulations(student2Id);
  assert(student2History.length === 0, "Student 2 cannot see Student 1's saved simulations");

  // Attempt unauthorized deletion
  const unauthorizedDelete = await deleteStudentCareerSimulation(student2Id, savedRecord.id);
  assert(!unauthorizedDelete, "Student 2 blocked from deleting Student 1's simulation record");

  // Authorized deletion
  const authorizedDelete = await deleteStudentCareerSimulation(student1Id, savedRecord.id);
  assert(authorizedDelete, "Student 1 successfully deleted their own simulation record");

  // -------------------------------------------------------------
  // Test 10: Empty Student Profile Stability (No NaN or crashes)
  // -------------------------------------------------------------
  console.log("\n[Test 10] Empty Student Profile Resilience");
  const emptyStudent = {
    allSkillNames: new Set(),
    verifiedSkillNames: new Set(),
    selfReportedSkillNames: new Set(),
    projects: [],
  };

  const emptyReadiness = calculateCareerReadiness(frontendPath, emptyStudent, []);
  assert(!isNaN(emptyReadiness.overallScore), "Empty student profile produces numeric score without NaN");
  assert(emptyReadiness.overallScore >= 0, `Empty profile baseline score: ${emptyReadiness.overallScore}%`);
  assert(emptyReadiness.skills.missingRequired.length === frontendPath.requiredSkills.length, "All required skills flagged as missing");

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
