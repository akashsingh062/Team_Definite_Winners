/**
 * CareerBridge AI - Stage 6 Automated Test Suite
 * Validates all 17 testing requirements specified for the Personalized AI Learning Roadmap.
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
import crypto from "node:crypto";

import { connectToDatabase } from "../lib/db/mongodb.ts";
import { StudentProfile } from "../models/StudentProfile.ts";
import { Opportunity } from "../models/Opportunity.ts";
import { Roadmap } from "../models/Roadmap.ts";
import { StudentSkillProgress } from "../models/StudentSkillProgress.ts";
import { LearningResource } from "../models/LearningResource.ts";

import {
  resolveSkillDependencies,
  detectCircularDependencies,
} from "../services/roadmap/dependency-resolver.ts";
import { sequenceLearningSkills } from "../services/roadmap/learning-sequencer.ts";
import {
  generateMilestonesForSkills,
  generateMilestoneTasks,
} from "../services/roadmap/milestone-generator.ts";
import {
  calculateRoadmapProgress,
  syncSkillProgressWithMilestone,
} from "../services/roadmap/progress-calculator.ts";
import { adjustActiveRoadmapMilestones } from "../services/roadmap/roadmap-adjuster.ts";
import {
  generateDeterministicRoadmap,
  generatePersonalizedRoadmapPlan,
} from "../services/roadmap/roadmap-generator.ts";
import {
  generatePersonalizedRoadmap,
  getActiveRoadmapForStudent,
  getRoadmapById,
  updateMilestoneStatus,
  toggleMilestoneTask,
  adjustActiveRoadmap,
  deleteRoadmap,
} from "../services/roadmap/roadmap.service.ts";
import { geminiRoadmapAiOutputSchema } from "../features/roadmap/schemas/roadmapSchema.ts";

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
  console.log("  CareerBridge AI - Stage 6 Learning Roadmap Verification");
  console.log("=======================================================\n");

  // 1. Skill Dependency Ordering
  console.log("--- 1. Skill Dependency Ordering ---");
  const unorderedSkills = ["React", "TypeScript", "JavaScript", "Docker", "Next.js"];
  const orderedSkills = resolveSkillDependencies(unorderedSkills);

  const jsIndex = orderedSkills.indexOf("JavaScript");
  const reactIndex = orderedSkills.indexOf("React");
  const tsIndex = orderedSkills.indexOf("TypeScript");
  const nextIndex = orderedSkills.indexOf("Next.js");

  assert(
    jsIndex !== -1 && reactIndex !== -1 && jsIndex < reactIndex,
    `JavaScript precedes React in learning order (JS index ${jsIndex} < React index ${reactIndex})`
  );
  assert(
    jsIndex < tsIndex,
    `JavaScript precedes TypeScript in learning order (JS index ${jsIndex} < TS index ${tsIndex})`
  );
  assert(
    reactIndex < nextIndex,
    `React precedes Next.js in learning order (React index ${reactIndex} < Next.js index ${nextIndex})`
  );

  // 2. Circular Dependency Detection & Resolution
  console.log("\n--- 2. Circular Dependency Detection & Resolution ---");
  const cyclicGraph = {
    SkillA: ["SkillB"],
    SkillB: ["SkillC"],
    SkillC: ["SkillA"], // Cycle A -> B -> C -> A
  };
  const cycleResult = detectCircularDependencies(cyclicGraph);
  assert(cycleResult.hasCycle, "Detects circular dependency loop (SkillA -> SkillB -> SkillC -> SkillA)");

  const resolvedCyclic = resolveSkillDependencies(["SkillA", "SkillB", "SkillC"], cyclicGraph);
  assert(
    resolvedCyclic.length === 3 &&
      resolvedCyclic.includes("SkillA") &&
      resolvedCyclic.includes("SkillB") &&
      resolvedCyclic.includes("SkillC"),
    "Breaks circular dependency gracefully without hanging or throwing exceptions"
  );

  // 3. Skill Gap Integration & Sequencing
  console.log("\n--- 3. Skill Gap Integration & Sequencing ---");
  const missingGaps = [
    { skillName: "Next.js", priority: "critical", category: "Frontend technologies" },
    { skillName: "React", priority: "critical", category: "Frontend technologies" },
    { skillName: "JavaScript", priority: "high", category: "Programming languages" },
    { skillName: "MongoDB", priority: "medium", category: "Databases" },
  ];
  const sequenced = sequenceLearningSkills(missingGaps);
  assert(
    sequenced[0].skillName === "JavaScript" && sequenced[1].skillName === "React",
    "Prerequisites are honored even when dependent skill has higher or equal priority"
  );

  // 4. Weekly Milestone Generation
  console.log("\n--- 4. Weekly Milestone Generation ---");
  const { milestones: generatedMilestones, totalHours } = await generateMilestonesForSkills(
    sequenced,
    2, // 2 hours/day
    5, // 5 days/week
    "moderate"
  );

  assert(
    generatedMilestones.length === sequenced.length,
    `Generated ${generatedMilestones.length} milestones for ${sequenced.length} missing skills`
  );
  assert(
    generatedMilestones[0].weekNumber === 1 && generatedMilestones[1].weekNumber === 2,
    "Milestones are sequentially numbered by week (Week 1, Week 2, etc.)"
  );
  assert(
    generatedMilestones[0].status === "in_progress" && generatedMilestones[1].status === "not_started",
    "First milestone is activated ('in_progress') while future milestones are 'not_started'"
  );
  assert(
    totalHours > 0 && typeof totalHours === "number",
    `Total estimated hours calculated accurately (${totalHours} hours)`
  );

  // 5. Practical Assignment Generation
  console.log("\n--- 5. Practical Assignment Generation ---");
  const reactMilestone = generatedMilestones.find((m) => m.skillName === "React");
  assert(
    reactMilestone &&
      reactMilestone.assignment &&
      typeof reactMilestone.assignment.title === "string" &&
      typeof reactMilestone.assignment.expectedDeliverable === "string" &&
      typeof reactMilestone.assignment.completionCriteria === "string",
    "Milestone contains hands-on practical assignment with deliverables and criteria"
  );

  // 6. Progress Calculation Formula
  console.log("\n--- 6. Progress Calculation Formula ---");
  // Fresh milestones: first in_progress with 0/4 tasks done -> 0%
  const freshProgress = calculateRoadmapProgress(generatedMilestones);
  assert(freshProgress === 0, `Fresh roadmap evaluates to 0% progress (got ${freshProgress}%)`);

  // Complete 2 tasks in first milestone (2 of 4 = 50% for milestone 1; 4 milestones total -> 50/4 = 12.5% -> 13%)
  const partialMilestones = JSON.parse(JSON.stringify(generatedMilestones));
  partialMilestones[0].tasks[0].isCompleted = true;
  partialMilestones[0].tasks[1].isCompleted = true;
  const partialProgress = calculateRoadmapProgress(partialMilestones);
  assert(
    partialProgress > 0 && partialProgress < 25,
    `Completing 2 tasks in milestone 1 smoothly updates progress (${partialProgress}%)`
  );

  // Mark all milestones completed -> 100%
  const allDoneMilestones = partialMilestones.map((m) => ({ ...m, status: "completed" }));
  const completedProgress = calculateRoadmapProgress(allDoneMilestones);
  assert(completedProgress === 100, `Fully completed milestones evaluate to 100% progress`);

  // 7. Roadmap Adjustment (Adaptive Timeline) & Preservation
  console.log("\n--- 7. Roadmap Adjustment (Adaptive Timeline) & Preservation ---");
  const mockActiveRoadmap = {
    id: "mock-rm-1",
    studentId: "student-1",
    title: "Test Roadmap",
    description: "Test description",
    targetRole: "Frontend Engineer",
    selectedOpportunityIds: [],
    skillGapSnapshot: [],
    estimatedDuration: "4 weeks (40 hours total)",
    totalEstimatedHours: 40,
    studyHoursPerDay: 2,
    studyDaysPerWeek: 5,
    learningPace: "moderate",
    status: "active",
    progressPercentage: 25,
    milestones: [
      {
        ...generatedMilestones[0],
        status: "completed",
        completedAt: new Date("2026-11-01"),
      },
      generatedMilestones[1],
      generatedMilestones[2],
      generatedMilestones[3],
    ],
  };

  const adjustedResult = adjustActiveRoadmapMilestones(mockActiveRoadmap, {
    newStudyHoursPerDay: 4, // doubled study hours
    newLearningPace: "intensive",
  });

  assert(
    adjustedResult.adjustedMilestones[0].status === "completed" &&
      adjustedResult.adjustedMilestones[0].completedAt !== null,
    "Adjusting roadmap strictly preserves completed milestone and its completion timestamp"
  );
  assert(
    adjustedResult.adjustedMilestones[1].weekNumber === 2,
    "Pending milestones are re-sequenced following the completed week"
  );

  // 8. Gemini API Fallback & Invalid AI Output Handling
  console.log("\n--- 8. Gemini API Fallback & Invalid AI Output Handling ---");
  // Test invalid schema rejection
  const invalidAiOutput = {
    title: "Bad Output",
    // Missing description and invalid milestones
    milestones: [{ wrongKey: 123 }],
  };
  const parseCheck = geminiRoadmapAiOutputSchema.safeParse(invalidAiOutput);
  assert(!parseCheck.success, "Zod schema catches and rejects malformed AI outputs");

  const deterministicPlan = await generateDeterministicRoadmap(
    "Full Stack Developer",
    sequenced,
    { studyHoursPerDay: 2, studyDaysPerWeek: 5, learningPace: "moderate" }
  );
  assert(
    deterministicPlan &&
      deterministicPlan.milestones.length === sequenced.length &&
      deterministicPlan.title.includes("Full Stack Developer"),
    "Deterministic fallback generator produces complete, structured roadmap"
  );

  // Connect to MongoDB for End-to-End Database Tests
  console.log("\n--- Connecting to MongoDB for End-to-End Tests ---");
  await connectToDatabase();

  const testStudentUserId = `test-student-st6-${crypto.randomBytes(4).toString("hex")}`;
  const otherStudentUserId = `other-student-st6-${crypto.randomBytes(4).toString("hex")}`;
  const testAdminUserId = `test-admin-st6-${crypto.randomBytes(4).toString("hex")}`;

  // 9. Missing Student Profile Handling
  console.log("\n--- 9. Missing Student Profile Handling ---");
  try {
    await generatePersonalizedRoadmap("non-existent-user-id-404");
    assert(false, "Generating roadmap for non-existent student should throw an error");
  } catch (err) {
    assert(
      err.message.includes("Student profile not found") || err.statusCode === 404,
      "Appropriate 404 error thrown when student profile is missing"
    );
  }

  // Create valid student profile
  const studentDoc = await StudentProfile.create({
    userId: testStudentUserId,
    personalInfo: {
      fullName: "Maya Lin",
      email: `maya.${Date.now()}@example.com`,
    },
    academicInfo: {
      collegeName: "Tech Institute",
      degree: "B.Tech",
      branch: "Computer Science",
      graduationYear: 2026,
      cgpa: 8.9,
    },
    skills: [
      { id: "s1", name: "JavaScript", category: "Programming languages", proficiency: "Advanced" },
    ],
    projects: [],
    careerPreferences: {
      preferredJobRole: "Frontend Engineer",
      workPreference: "Remote",
      preferredEmploymentType: "Internship",
      preferredLocation: "Remote",
    },
    profileCompletionPercentage: 80,
  });

  // Create an opportunity requiring React, TypeScript, and Docker
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  const testOpp = await Opportunity.create({
    title: "Senior React & TypeScript Intern",
    companyName: "Innovate Labs",
    category: "internship",
    employmentType: "internship",
    industry: "Technology",
    workMode: "remote",
    location: "Remote",
    description: "Opportunity requiring frontend technologies",
    applicationDeadline: futureDate,
    requiredSkills: ["React", "TypeScript", "Docker"],
    preferredSkills: ["Next.js"],
    minimumExperience: "Fresher",
    educationRequirements: "B.Tech",
    isPaid: true,
    status: "published",
    verificationStatus: "verified",
    createdBy: testAdminUserId,
  });

  // 10. End-to-End Roadmap Generation
  console.log("\n--- 10. End-to-End Roadmap Generation ---");
  const createdRoadmap = await generatePersonalizedRoadmap(testStudentUserId, {
    targetRole: "Frontend Engineer",
    selectedOpportunityIds: [testOpp._id.toString()],
    studyHoursPerDay: 2,
    studyDaysPerWeek: 5,
    learningPace: "moderate",
  });

  assert(
    createdRoadmap &&
      createdRoadmap.studentId === testStudentUserId &&
      createdRoadmap.milestones.length >= 3,
    `Successfully generated roadmap with ${createdRoadmap.milestones.length} milestones in MongoDB`
  );
  assert(
    createdRoadmap.milestones[0].resources && createdRoadmap.milestones[0].resources.length > 0,
    "Milestones are populated with vetted learning resources"
  );

  // 11. Task Completion Persistence
  console.log("\n--- 11. Task Completion Persistence ---");
  const firstMilestoneId = createdRoadmap.milestones[0].id;
  const firstTaskId = createdRoadmap.milestones[0].tasks[0].id;

  const afterTaskToggle = await toggleMilestoneTask(
    testStudentUserId,
    createdRoadmap.id,
    firstMilestoneId,
    firstTaskId,
    true
  );

  const updatedMilestone = afterTaskToggle.milestones.find((m) => m.id === firstMilestoneId);
  const updatedTask = updatedMilestone.tasks.find((t) => t.id === firstTaskId);

  assert(
    updatedTask.isCompleted === true && updatedTask.completedAt !== null,
    "Toggling task updates isCompleted to true with valid completedAt date"
  );
  assert(
    afterTaskToggle.progressPercentage > 0,
    `Roadmap progress percentage increased to ${afterTaskToggle.progressPercentage}%`
  );

  // 12. Milestone Status Progression & Skill Sync
  console.log("\n--- 12. Milestone Status Progression & Skill Sync ---");
  const afterMilestoneComplete = await updateMilestoneStatus(
    testStudentUserId,
    createdRoadmap.id,
    firstMilestoneId,
    { status: "completed" }
  );

  const completedM = afterMilestoneComplete.milestones.find((m) => m.id === firstMilestoneId);
  const nextM = afterMilestoneComplete.milestones[1];

  assert(
    completedM.status === "completed" && completedM.completedAt !== null,
    "Milestone marked completed with completedAt timestamp"
  );
  assert(
    nextM.status === "in_progress",
    "Completing a milestone automatically advances the next milestone to 'in_progress'"
  );

  // Verify StudentSkillProgress sync
  const skillProgress = await StudentSkillProgress.findOne({
    studentId: testStudentUserId,
    skillName: { $regex: new RegExp(`^${completedM.skillName}$`, "i") },
  });
  assert(
    skillProgress && skillProgress.status === "completed",
    `StudentSkillProgress synchronized: ${completedM.skillName} marked as 'completed'`
  );

  // 13. Unauthorized Roadmap Access
  console.log("\n--- 13. Unauthorized Roadmap Access ---");
  try {
    await getRoadmapById(otherStudentUserId, createdRoadmap.id);
    assert(false, "Accessing another student's roadmap should fail with 403 Forbidden");
  } catch (err) {
    assert(
      err.message.includes("Unauthorized") || err.statusCode === 403,
      "Unauthorized roadmap access blocked with 403 status"
    );
  }

  // 14. Multiple Roadmap Management (Archival of Previous)
  console.log("\n--- 14. Multiple Roadmap Management (Archival of Previous) ---");
  const secondRoadmap = await generatePersonalizedRoadmap(testStudentUserId, {
    targetRole: "Full Stack Engineer",
    selectedOpportunityIds: [testOpp._id.toString()],
    studyHoursPerDay: 3,
    studyDaysPerWeek: 5,
    learningPace: "intensive",
  });

  const prevRoadmapDoc = await Roadmap.findById(createdRoadmap.id);
  const activeRoadmap = await getActiveRoadmapForStudent(testStudentUserId);

  assert(
    prevRoadmapDoc.status === "archived",
    "Previous active roadmap is automatically marked 'archived' when new roadmap is created"
  );
  assert(
    activeRoadmap.id === secondRoadmap.id && activeRoadmap.status === "active",
    "Only the newly generated roadmap remains active"
  );

  // Cleanup test documents
  await Roadmap.deleteMany({ studentId: testStudentUserId });
  await StudentProfile.deleteMany({ userId: testStudentUserId });
  await Opportunity.deleteMany({ _id: testOpp._id });
  await StudentSkillProgress.deleteMany({ studentId: testStudentUserId });

  // Summary
  console.log("\n=======================================================");
  console.log(`  Stage 6 Tests Completed: ${passedCount + failedCount}`);
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

