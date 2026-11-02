/**
 * CareerBridge AI - Stage 5 Automated Test Suite
 * Validates all 20 testing requirements specified for the AI-Powered Skill Gap Analyzer.
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
import { Resume } from "../models/Resume.ts";
import { LearningResource } from "../models/LearningResource.ts";
import { StudentSkillProgress } from "../models/StudentSkillProgress.ts";

import {
  extractApprovedStudentSkills,
  hasSkill,
  calculateSkillCoverage,
} from "../services/skill-gap/skill-comparator.ts";
import {
  analyzeMultiOpportunityDemand,
  inferSkillCategory,
} from "../services/skill-gap/demand-analyzer.ts";
import { calculateSkillPriority } from "../services/skill-gap/priority-calculator.ts";
import {
  getLearningResourcesForSkill,
  seedLearningResourcesIfNeeded,
} from "../services/skill-gap/learning-resource.service.ts";
import {
  getDeterministicSkillExplanation,
} from "../services/skill-gap/gap-explanation.service.ts";
import {
  analyzeMultiOpportunityGap,
  getSingleSkillGapDetail,
  getStudentProgressList,
  upsertStudentSkillProgress,
  updateStudentSkillProgress,
  deleteStudentSkillProgress,
} from "../services/skill-gap/skill-gap.service.ts";
import { learningResourceSchema } from "../features/skill-gap/schemas/skillGapSchema.ts";

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
  console.log("  CareerBridge AI - Stage 5 Skill Gap Analyzer Verification");
  console.log("=======================================================\n");

  // 1 & 2. Existing Skill Retrieval & Approved Resume Integration
  console.log("--- 1 & 2. Existing Skill Retrieval & Approved Resume Integration ---");
  const mockProfile = {
    skills: [
      { id: "s1", name: "JavaScript", category: "Programming languages", proficiency: "Advanced" },
      { id: "s2", name: "ReactJS", category: "Frontend technologies", proficiency: "Intermediate" },
    ],
    projects: [
      {
        id: "p1",
        title: "Portfolio",
        description: "Personal site",
        technologies: ["React", "Tailwind CSS"],
      },
    ],
  };

  const mockResume = {
    analysisStatus: "completed",
    isApproved: true,
    parsedData: {
      skills: {
        programmingLanguages: [{ name: "TypeScript", proficiencyLevel: "Intermediate" }],
        databases: [{ name: "MongoDB", proficiencyLevel: "Beginner" }],
      },
    },
  };

  const extracted = extractApprovedStudentSkills(mockProfile, mockResume);
  const skillNames = extracted.map((s) => s.name);

  assert(
    skillNames.includes("JavaScript") && skillNames.includes("React"),
    "Existing skills correctly retrieved from StudentProfile"
  );
  assert(
    skillNames.includes("TypeScript") && skillNames.includes("MongoDB"),
    "Skills from approved resume successfully merged"
  );
  assert(
    skillNames.includes("Tailwind CSS"),
    "Technologies demonstrated in portfolio projects captured as approved skills"
  );

  // 3 & 4. Required & Preferred Skill Comparison
  console.log("\n--- 3 & 4. Required & Preferred Skill Comparison ---");
  const required = ["React", "Node.js", "Docker"];
  const preferred = ["TypeScript", "GraphQL"];

  assert(hasSkill(extracted, "React"), "Skill comparator matches possessed required skill (React)");
  assert(!hasSkill(extracted, "Node.js"), "Skill comparator recognizes missing required skill (Node.js)");
  assert(hasSkill(extracted, "TypeScript"), "Skill comparator matches possessed preferred skill (TypeScript)");
  assert(!hasSkill(extracted, "GraphQL"), "Skill comparator recognizes missing preferred skill (GraphQL)");

  // 5. Duplicate Skill Handling
  console.log("\n--- 5. Duplicate Skill Handling ---");
  const duplicateProfile = {
    skills: [
      { id: "1", name: "React", category: "Frontend" },
      { id: "2", name: "ReactJS", category: "Frontend" }, // Alias for React
      { id: "3", name: "react.js", category: "Frontend" }, // Alias for React
    ],
    projects: [
      { id: "p1", title: "App", technologies: ["React", "react"] },
    ],
  };
  const deduped = extractApprovedStudentSkills(duplicateProfile);
  const reactMatches = deduped.filter((s) => s.name === "React");
  assert(
    reactMatches.length === 1,
    `Duplicate skill entries collapsed to exactly 1 canonical record (found ${reactMatches.length})`
  );

  // 6. Skill Alias Normalization
  console.log("\n--- 6. Skill Alias Normalization ---");
  assert(
    hasSkill(extracted, "ReactJS") && hasSkill(extracted, "react"),
    "Alias 'ReactJS' and lowercase 'react' match canonical 'React'"
  );

  // 7. Skill Coverage Calculation
  console.log("\n--- 7. Skill Coverage Calculation ---");
  // extracted has: JavaScript, React, Tailwind CSS, TypeScript, MongoDB (5 skills)
  // Target: Required = [React, Node.js, Docker] (1 of 3 = 33%)
  // Target: Preferred = [TypeScript, GraphQL] (1 of 2 = 50%)
  const coverage = calculateSkillCoverage(extracted, required, preferred);
  assert(
    coverage.requiredCoverage === 33,
    `Required skill coverage calculated accurately: expected 33%, got ${coverage.requiredCoverage}%`
  );
  assert(
    coverage.preferredCoverage === 50,
    `Preferred skill coverage calculated accurately: expected 50%, got ${coverage.preferredCoverage}%`
  );
  assert(
    coverage.combinedCoverage > 0 && coverage.combinedCoverage <= 100,
    `Combined coverage calculated: ${coverage.combinedCoverage}%`
  );

  // 8 & 9. Multi-Opportunity Demand Percentage Calculation
  console.log("\n--- 8 & 9. Multi-Opportunity Demand Percentage Calculation ---");
  const mockOpportunities = [
    {
      _id: "opp1",
      title: "Full Stack Intern",
      companyName: "Acme Corp",
      requiredSkills: ["React", "Node.js", "Docker"],
      preferredSkills: ["TypeScript"],
    },
    {
      _id: "opp2",
      title: "Backend Developer",
      companyName: "Beta Corp",
      requiredSkills: ["Node.js", "PostgreSQL", "Docker"],
      preferredSkills: ["AWS"],
    },
    {
      _id: "opp3",
      title: "Frontend Intern",
      companyName: "Gamma Corp",
      requiredSkills: ["React", "TypeScript"],
      preferredSkills: ["Tailwind CSS"],
    },
  ];

  const demandResult = analyzeMultiOpportunityDemand(mockOpportunities);
  const nodeDemand = demandResult.skillDemands.find((s) => s.skillName === "Node.js");
  const dockerDemand = demandResult.skillDemands.find((s) => s.skillName === "Docker");

  // Node.js is required by opp1 and opp2 -> 2/3 = 67%
  assert(
    nodeDemand && nodeDemand.demandPercentage === 67 && nodeDemand.requiredByCount === 2,
    `Multi-opportunity demand calculated accurately for Node.js (expected 67%, got ${nodeDemand?.demandPercentage}%)`
  );
  assert(
    dockerDemand && dockerDemand.opportunityCount === 2,
    `Docker correctly identified in 2 of 3 opportunities`
  );

  // 10. Priority Classification
  console.log("\n--- 10. Priority Classification ---");
  // Multi-opportunity priority:
  // Node.js: required by 2 of 3 (67%) -> "high" or "critical"
  const nodePriority = calculateSkillPriority(nodeDemand, 3);
  assert(
    nodePriority === "high" || nodePriority === "critical",
    `Node.js classified with appropriate urgency ('${nodePriority}')`
  );

  // Skill required by only 1 opportunity -> "medium"
  const postgresDemand = demandResult.skillDemands.find((s) => s.skillName === "PostgreSQL");
  const postgresPriority = calculateSkillPriority(postgresDemand, 3);
  assert(
    postgresPriority === "medium",
    `Single-opportunity requirement classified as 'medium' priority`
  );

  // 11. Learning Resource Retrieval
  console.log("\n--- 11. Learning Resource Retrieval ---");
  const reactResources = await getLearningResourcesForSkill("React", 3);
  assert(
    reactResources.length > 0 &&
      reactResources[0].url.startsWith("http") &&
      reactResources.some((r) => r.isFree),
    "Retrieves vetted learning resources with valid URLs and free options"
  );

  // 12. Invalid Resource URL Handling
  console.log("\n--- 12. Invalid Resource URL Handling ---");
  const invalidResource = {
    title: "Bad Course",
    skillName: "React",
    description: "Invalid URL test",
    resourceType: "course",
    provider: "Fake",
    url: "not-a-valid-url",
    difficultyLevel: "beginner",
    isFree: true,
    estimatedDuration: "1 hour",
  };
  const zodCheck = learningResourceSchema.safeParse(invalidResource);
  assert(!zodCheck.success, "Zod validation catches and rejects invalid learning resource URLs");

  // Connect to MongoDB for End-to-End Database Tests
  console.log("\n--- Connecting to MongoDB for End-to-End Tests ---");
  await connectToDatabase();

  const testStudentUserId = `test-student-st5-${crypto.randomBytes(4).toString("hex")}`;
  const otherStudentUserId = `other-student-st5-${crypto.randomBytes(4).toString("hex")}`;
  const testAdminUserId = `test-admin-st5-${crypto.randomBytes(4).toString("hex")}`;

  // Create test student profile
  const studentDoc = await StudentProfile.create({
    userId: testStudentUserId,
    personalInfo: {
      fullName: "Jordan Lee",
      email: `jordan.${Date.now()}@example.com`,
    },
    academicInfo: {
      collegeName: "National University",
      degree: "B.Tech",
      branch: "Computer Science",
      graduationYear: 2026,
      cgpa: 8.5,
    },
    skills: [
      { id: "s1", name: "JavaScript", category: "Programming languages", proficiency: "Advanced" },
    ],
    projects: [],
    careerPreferences: {
      preferredJobRole: "Frontend Developer",
      workPreference: "Remote",
      preferredEmploymentType: "Internship",
      preferredLocation: "Remote",
    },
    profileCompletionPercentage: 75,
  });

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  const testOpp = await Opportunity.create({
    title: "Frontend Engineering Intern",
    companyName: "Hyper Scale Inc",
    category: "internship",
    employmentType: "internship",
    industry: "Technology",
    workMode: "remote",
    location: "Remote",
    description: "Internship with React and TypeScript requirements",
    applicationDeadline: futureDate,
    requiredSkills: ["React", "TypeScript"],
    preferredSkills: ["Docker"],
    minimumExperience: "Fresher",
    educationRequirements: "B.Tech",
    isPaid: true,
    status: "published",
    verificationStatus: "verified",
    createdBy: testAdminUserId,
  });

  // 13. Progress Creation
  console.log("\n--- 13. Progress Creation ---");
  const createdProgress = await upsertStudentSkillProgress(testStudentUserId, {
    skillName: "React",
    status: "learning",
    notes: "Started official docs tutorial",
  });
  assert(
    createdProgress &&
      createdProgress.studentId === testStudentUserId &&
      createdProgress.status === "learning" &&
      createdProgress.startedAt !== null,
    "Student learning progress created and persisted in MongoDB with startedAt timestamp"
  );

  // 14. Progress Updates
  console.log("\n--- 14. Progress Updates ---");
  const updatedProgress = await updateStudentSkillProgress(
    testStudentUserId,
    createdProgress._id,
    {
      status: "practicing",
      notes: "Building kanban board project",
    }
  );
  assert(
    updatedProgress.status === "practicing" &&
      updatedProgress.notes === "Building kanban board project",
    "Student progress successfully updated to 'practicing'"
  );

  // 15. Skill Completion
  console.log("\n--- 15. Skill Completion ---");
  const completedProgress = await updateStudentSkillProgress(
    testStudentUserId,
    createdProgress._id,
    {
      status: "completed",
    }
  );
  assert(
    completedProgress.status === "completed" && completedProgress.completedAt !== null,
    "Skill marked 'completed' with completedAt timestamp recorded"
  );

  // 16. Unauthorized Progress Access
  console.log("\n--- 16. Unauthorized Progress Access ---");
  try {
    await updateStudentSkillProgress(otherStudentUserId, createdProgress._id, {
      status: "completed",
    });
    assert(false, "Modifying another student's progress should throw an error");
  } catch (err) {
    assert(
      err.message.includes("Unauthorized") || err.statusCode === 403,
      "Unauthorized progress modification blocked with 403 status"
    );
  }

  // 17. Missing Profile Data
  console.log("\n--- 17. Missing Profile Data ---");
  try {
    await analyzeMultiOpportunityGap("non-existent-user-id-999", [testOpp._id.toString()]);
    assert(false, "Analyzing gaps for non-existent profile should fail");
  } catch (err) {
    assert(
      err.message.includes("profile not found") || err.statusCode === 404,
      "Missing student profile handled cleanly with 404 status"
    );
  }

  // 18. Empty Opportunity Selection
  console.log("\n--- 18. Empty Opportunity Selection ---");
  const autoSelectedResult = await analyzeMultiOpportunityGap(testStudentUserId, []);
  assert(
    autoSelectedResult &&
      Array.isArray(autoSelectedResult.missingSkills) &&
      autoSelectedResult.selectedOpportunities.length > 0,
    "Empty opportunity selection gracefully falls back to default verified opportunities"
  );

  // 19. Gemini API Fallback
  console.log("\n--- 19. Gemini API Fallback ---");
  const fallbackExplanation = getDeterministicSkillExplanation(
    "Docker",
    "Development tools",
    [{ id: "1", title: "DevOps Role", companyName: "CloudCo", isRequired: true }],
    "Full Stack Developer"
  );
  assert(
    fallbackExplanation &&
      typeof fallbackExplanation.whatIsIt === "string" &&
      typeof fallbackExplanation.suggestedProject === "string" &&
      Array.isArray(fallbackExplanation.keyConcepts),
    "Deterministic fallback produces structured, informative explanation without Gemini"
  );

  // 20. Fairness-Related Invariants
  console.log("\n--- 20. Fairness-Related Invariants ---");
  // Two profiles with identical skills, one from Tier 1 Elite and one from Rural College
  const eliteStudent = {
    ...studentDoc.toObject(),
    academicInfo: { ...studentDoc.academicInfo, collegeName: "Tier 1 Elite University" },
  };
  const ruralStudent = {
    ...studentDoc.toObject(),
    academicInfo: { ...studentDoc.academicInfo, collegeName: "Rural Community College" },
  };

  const skillsElite = extractApprovedStudentSkills(eliteStudent);
  const skillsRural = extractApprovedStudentSkills(ruralStudent);
  const coverageElite = calculateSkillCoverage(skillsElite, ["React", "Node.js"], []);
  const coverageRural = calculateSkillCoverage(skillsRural, ["React", "Node.js"], []);

  assert(
    coverageElite.requiredCoverage === coverageRural.requiredCoverage,
    `Pedigree neutrality verified: Skill coverage is 100% blind to college prestige (${coverageElite.requiredCoverage}% === ${coverageRural.requiredCoverage}%)`
  );

  // Cleanup test documents
  await StudentProfile.deleteMany({ userId: testStudentUserId });
  await Opportunity.deleteMany({ _id: testOpp._id });
  await StudentSkillProgress.deleteMany({ studentId: testStudentUserId });

  // Summary
  console.log("\n=======================================================");
  console.log(`  Stage 5 Tests Completed: ${passedCount + failedCount}`);
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
