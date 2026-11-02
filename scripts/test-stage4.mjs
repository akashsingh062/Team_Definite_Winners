/**
 * CareerBridge AI - Stage 4 Automated Test Suite
 * Validates all 19 testing requirements specified for the Intelligent Opportunity Matching Engine.
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

import {
  normalizeSkill,
  areSkillsEquivalent,
} from "../services/matching/skill-normalizer.ts";
import { matchSkills } from "../services/matching/skill-matcher.ts";
import { checkEligibility } from "../services/matching/eligibility-checker.ts";
import { calculateCompatibilityScore } from "../services/matching/score-calculator.ts";
import { generateMatchExplanation } from "../services/matching/explanation-generator.ts";
import { rankAndFilterOpportunities } from "../services/matching/opportunity-ranker.ts";
import { matchingService } from "../services/matching/matching.service.ts";

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
  console.log("  CareerBridge AI - Stage 4 Matching Engine Verification");
  console.log("=======================================================\n");

  // 1. Exact Skill Matching
  console.log("--- 1. Exact Skill Matching ---");
  const exactNorm1 = normalizeSkill("TypeScript");
  const exactNorm2 = normalizeSkill("TypeScript");
  assert(
    exactNorm1 === exactNorm2 && exactNorm1 === "TypeScript",
    "Exact skill matches properly (TypeScript === TypeScript)"
  );

  // 2. Case-Insensitive Matching
  console.log("\n--- 2. Case-Insensitive Matching ---");
  const caseMatch = areSkillsEquivalent("typescript", "TypeScript");
  const caseMatch2 = areSkillsEquivalent("MONGODB", "mongodb");
  assert(
    caseMatch && caseMatch2,
    "Case-insensitive matching succeeds (typescript === TypeScript, MONGODB === mongodb)"
  );

  // 3. Skill Alias Matching
  console.log("\n--- 3. Skill Alias Matching ---");
  const aliasMatch1 = areSkillsEquivalent("ReactJS", "React");
  const aliasMatch2 = areSkillsEquivalent("Node", "Node.js");
  const aliasMatch3 = areSkillsEquivalent("Postgres", "PostgreSQL");
  const aliasMatch4 = areSkillsEquivalent("JS", "JavaScript");
  const javaDistinct = !areSkillsEquivalent("Java", "JavaScript");
  assert(
    aliasMatch1 && aliasMatch2 && aliasMatch3 && aliasMatch4,
    "Aliases match correctly (ReactJS->React, Node->Node.js, Postgres->PostgreSQL, JS->JavaScript)"
  );
  assert(
    javaDistinct,
    "Strict distinction between Java and JavaScript is preserved"
  );

  // 4. Required Skill Coverage Calculation
  console.log("\n--- 4. Required Skill Coverage Calculation ---");
  const studentSkills1 = ["React", "TypeScript", "Tailwind CSS"];
  const opportunityRequired1 = ["React", "TypeScript", "Node.js", "Docker"];
  const skillResult1 = matchSkills(studentSkills1, opportunityRequired1, []);
  // 2 out of 4 matched = 50%
  assert(
    skillResult1.requiredCoverage === 50,
    `Required coverage is accurately calculated (expected 50%, got ${skillResult1.requiredCoverage}%)`
  );
  assert(
    skillResult1.matchedRequiredSkills.length === 2 &&
      skillResult1.matchedRequiredSkills.includes("React") &&
      skillResult1.matchedRequiredSkills.includes("TypeScript"),
    "Matched required skills array contains expected skills"
  );

  // 5. Preferred Skill Coverage Calculation
  console.log("\n--- 5. Preferred Skill Coverage Calculation ---");
  const opportunityPreferred1 = ["Docker", "GraphQL", "Tailwind CSS"];
  const skillResult2 = matchSkills(studentSkills1, [], opportunityPreferred1);
  // 1 out of 3 matched = 33.3%
  assert(
    Math.abs(skillResult2.preferredCoverage - 33.33) < 0.5,
    `Preferred coverage is accurately calculated (expected ~33.33%, got ${skillResult2.preferredCoverage}%)`
  );

  // 6. Missing Required Skills Identification
  console.log("\n--- 6. Missing Required Skills Identification ---");
  assert(
    skillResult1.missingRequiredSkills.length === 2 &&
      skillResult1.missingRequiredSkills.includes("Node.js") &&
      skillResult1.missingRequiredSkills.includes("Docker"),
    "Missing required skills correctly isolated (Node.js, Docker)"
  );

  // 7. Education Eligibility
  console.log("\n--- 7. Education Eligibility ---");
  const mockStudentProfile = {
    academicInfo: {
      degree: "B.Tech",
      branch: "Computer Science",
      institution: "Delhi Technological University",
      graduationYear: 2026,
      cgpa: 8.5,
    },
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    projects: [
      {
        title: "Campus Portal",
        technologies: ["React", "Node.js", "MongoDB"],
      },
    ],
    experience: [],
    careerPreferences: {
      preferredRoles: ["Frontend Developer", "Full Stack Developer"],
      workPreference: "remote",
      preferredEmploymentType: "internship",
    },
  };

  const eduMatchOpp = {
    educationRequirements: "B.Tech in Computer Science or Information Technology",
    minimumCGPA: 7.5,
    minimumExperience: "Fresher / 0 years",
    category: "internship",
  };

  const eduResult = checkEligibility(mockStudentProfile, eduMatchOpp);
  assert(
    eduResult.status === "eligible" && eduResult.isEducationMet && eduResult.isDegreeMet,
    "Education criteria properly evaluated and recognized as eligible"
  );

  // 8. CGPA Eligibility Threshold
  console.log("\n--- 8. CGPA Eligibility Threshold ---");
  const highCgpaOpp = {
    educationRequirements: "B.Tech",
    minimumCGPA: 9.0, // Student has 8.5
    minimumExperience: "Fresher",
  };
  const cgpaResult = checkEligibility(mockStudentProfile, highCgpaOpp);
  assert(
    cgpaResult.status === "not_eligible" && !cgpaResult.isCgpaMet,
    "Strict CGPA requirement enforced when student CGPA is below cutoff"
  );

  // 9. Experience Eligibility
  console.log("\n--- 9. Experience Eligibility ---");
  const expOpp = {
    minimumExperience: "3+ years professional experience",
  };
  const expResult = checkEligibility(mockStudentProfile, expOpp);
  assert(
    expResult.status === "not_eligible" && !expResult.isExperienceMet,
    "Experience requirements properly evaluated against student tenure"
  );

  // 10. Missing Student Information Policy
  console.log("\n--- 10. Missing Student Information Policy ---");
  const incompleteProfile = {
    academicInfo: {
      degree: "B.Tech",
      // cgpa missing!
    },
    skills: ["React"],
    projects: [],
  };
  const incompleteResult = checkEligibility(incompleteProfile, {
    minimumCGPA: 8.0,
    educationRequirements: "B.Tech",
  });
  assert(
    incompleteResult.status === "potentially_eligible" ||
      incompleteResult.status === "insufficient_information",
    `Missing optional student info sets status to '${incompleteResult.status}' without crashing or 0 penalty`
  );

  // 11. Empty Skill Requirements
  console.log("\n--- 11. Empty Skill Requirements ---");
  const emptySkillMatch = matchSkills(["React", "Python"], [], []);
  assert(
    emptySkillMatch.requiredCoverage === 100 &&
      emptySkillMatch.preferredCoverage === 100,
    "Opportunities with empty skill requirements gracefully evaluate to 100% coverage without division by zero"
  );

  // 12. Weighted Score Calculation
  console.log("\n--- 12. Weighted Score Calculation ---");
  // Component weights: Required: 40%, Preferred: 15%, Projects: 15%, Education: 10%, Role: 10%, Location: 5%, Compensation: 5% = 100%
  const fullMatchOpp = {
    title: "Frontend Developer Intern",
    category: "internship",
    workMode: "remote",
    location: "Anywhere",
    isPaid: true,
    stipend: "$1,500/month",
    requiredSkills: ["React", "TypeScript"],
    preferredSkills: ["Node.js"],
    educationRequirements: "B.Tech",
    minimumCGPA: 8.0,
    minimumExperience: "Fresher",
  };
  const fullSkills = matchSkills(mockStudentProfile.skills, fullMatchOpp.requiredSkills, fullMatchOpp.preferredSkills);
  const fullElig = checkEligibility(mockStudentProfile, fullMatchOpp);
  const scoreResult = calculateCompatibilityScore(mockStudentProfile, fullMatchOpp, fullSkills, fullElig);

  assert(
    scoreResult.overallScore >= 90,
    `High alignment produces compatible score: ${scoreResult.overallScore}%`
  );
  assert(
    scoreResult.componentScores.requiredSkills === 100 &&
      scoreResult.componentScores.preferredSkills === 100,
    "Component scores accurately reflect 100% required and preferred skill coverage"
  );

  // Also verify mandatory failure cap
  const mandatoryFailOpp = {
    ...fullMatchOpp,
    minimumCGPA: 9.8, // Student has 8.5
  };
  const failElig = checkEligibility(mockStudentProfile, mandatoryFailOpp);
  const cappedScore = calculateCompatibilityScore(mockStudentProfile, mandatoryFailOpp, fullSkills, failElig);
  assert(
    cappedScore.overallScore <= 45,
    `Mandatory failure (CGPA fail) caps overall score to ${cappedScore.overallScore} <= 45%`
  );

  // 13. Opportunity Ranking
  console.log("\n--- 13. Opportunity Ranking ---");
  const opp1 = { overallScore: 92, eligibilityStatus: "eligible", opportunity: { title: "Opp High", publishedAt: new Date() } };
  const opp2 = { overallScore: 65, eligibilityStatus: "eligible", opportunity: { title: "Opp Low", publishedAt: new Date() } };
  const opp3 = { overallScore: 84, eligibilityStatus: "eligible", opportunity: { title: "Opp Med", publishedAt: new Date() } };

  const rankedResult = rankAndFilterOpportunities([opp2, opp1, opp3], { sortBy: "score" });
  const ranked = rankedResult.items;
  assert(
    ranked[0].overallScore === 92 &&
      ranked[1].overallScore === 84 &&
      ranked[2].overallScore === 65,
    "Opportunities ranked strictly by overall compatibility score descending"
  );

  // Connect to MongoDB for DB-level checks
  console.log("\n--- Connecting to MongoDB for End-to-End Tests ---");
  await connectToDatabase();

  const testStudentUserId = `test-student-st4-${crypto.randomBytes(4).toString("hex")}`;
  const testAdminUserId = `test-admin-st4-${crypto.randomBytes(4).toString("hex")}`;

  // Create student profile in database conforming to schema
  const studentDoc = await StudentProfile.create({
    userId: testStudentUserId,
    personalInfo: {
      fullName: "Alex Rivera",
      email: `alex.${Date.now()}@example.com`,
    },
    academicInfo: {
      collegeName: "State University",
      degree: "B.Tech",
      branch: "Computer Science",
      currentAcademicYear: "4th Year",
      graduationYear: 2026,
      cgpa: 8.8,
    },
    skills: [
      { id: "s1", name: "React", category: "Frontend technologies", proficiency: "Advanced" },
      { id: "s2", name: "TypeScript", category: "Programming languages", proficiency: "Intermediate" },
      { id: "s3", name: "Node.js", category: "Backend technologies", proficiency: "Intermediate" },
    ],
    projects: [
      {
        id: "p1",
        title: "E-Commerce App",
        description: "Modern shopping platform",
        technologies: ["React", "TypeScript", "Node.js"],
        githubUrl: "https://github.com/alex/shop",
      },
    ],
    careerPreferences: {
      preferredJobRole: "Frontend Engineer",
      workPreference: "Remote",
      preferredEmploymentType: "Internship",
      preferredLocation: "Remote",
    },
    profileCompletionPercentage: 85,
  });

  // 14. Expired Opportunity Exclusion
  console.log("\n--- 14. Expired Opportunity Exclusion ---");
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10); // 10 days ago

  const expiredOpp = await Opportunity.create({
    title: "Expired Web Dev Internship",
    companyName: "Old Corp",
    category: "internship",
    employmentType: "internship",
    industry: "Technology",
    workMode: "remote",
    location: "Remote",
    description: "Expired internship description",
    applicationDeadline: pastDate,
    requiredSkills: ["React"],
    preferredSkills: [],
    minimumExperience: "Fresher",
    educationRequirements: "Any",
    isPaid: true,
    status: "published",
    verificationStatus: "verified",
    createdBy: testAdminUserId,
  });

  // 15. Unverified Opportunity Exclusion
  console.log("\n--- 15. Unverified Opportunity Exclusion ---");
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  const pendingOpp = await Opportunity.create({
    title: "Unverified Frontend Role",
    companyName: "Stealth Startup",
    category: "internship",
    employmentType: "internship",
    industry: "Technology",
    workMode: "remote",
    location: "Remote",
    description: "Unverified internship description",
    applicationDeadline: futureDate,
    requiredSkills: ["React"],
    preferredSkills: [],
    minimumExperience: "Fresher",
    educationRequirements: "Any",
    isPaid: true,
    status: "published",
    verificationStatus: "pending", // Not verified!
    createdBy: testAdminUserId,
  });

  const validOpp = await Opportunity.create({
    title: "Active Verified React Role",
    companyName: "Acme Tech",
    category: "internship",
    employmentType: "internship",
    industry: "Technology",
    workMode: "remote",
    location: "Remote",
    description: "Active internship description",
    applicationDeadline: futureDate,
    requiredSkills: ["React", "TypeScript"],
    preferredSkills: ["Node.js"],
    minimumExperience: "Fresher",
    educationRequirements: "B.Tech",
    isPaid: true,
    status: "published",
    verificationStatus: "verified",
    createdBy: testAdminUserId,
  });

  // Query recommendations via service
  const recsResult = await matchingService.getRecommendationsForStudent(testStudentUserId);
  const studentRecs = recsResult.items;

  const foundExpired = studentRecs.find((r) => r.opportunityId === expiredOpp._id.toString());
  const foundPending = studentRecs.find((r) => r.opportunityId === pendingOpp._id.toString());
  const foundValid = studentRecs.find((r) => r.opportunityId === validOpp._id.toString());

  assert(!foundExpired, "Expired opportunity was properly excluded from student recommendations");
  assert(!foundPending, "Unverified opportunity was properly excluded from student recommendations");
  assert(Boolean(foundValid), "Active verified opportunity is included in recommendations");

  // 16. Explanation Generation
  console.log("\n--- 16. Explanation Generation ---");
  assert(
    foundValid &&
      typeof foundValid.explanation === "string" &&
      foundValid.explanation.length > 20 &&
      Array.isArray(foundValid.strengths) &&
      foundValid.strengths.length > 0,
    "Evidence-based explanation generated with narrative and structured strengths"
  );

  // 17. Unauthorized API Requests
  console.log("\n--- 17. Unauthorized API Requests ---");
  try {
    await matchingService.getRecommendationsForStudent("");
    assert(false, "Calling recommendation service without student ID should fail");
  } catch (err) {
    assert(
      err.message.includes("Student ID") || err.message.includes("Unauthorized"),
      "Unauthorized/empty student ID throws appropriate access error"
    );
  }

  // 18. Student Profile Ownership
  console.log("\n--- 18. Student Profile Ownership ---");
  try {
    await matchingService.getRecommendationsForStudent("non-existent-user-id-999");
    assert(false, "Calling recommendations for non-existent student profile should fail");
  } catch (err) {
    assert(
      err.message.includes("Profile not found") || err.message.includes("incomplete"),
      "Properly handles non-existent or inaccessible student profile"
    );
  }

  // 19. Fairness-Related Invariants (Pedigree Neutrality)
  console.log("\n--- 19. Fairness-Related Invariants (Pedigree Neutrality) ---");
  // Create two student profiles with IDENTICAL skills, grades, and preferences,
  // but student A is from "Tier 1 Elite Institute" and student B is from "Rural Community College".
  const profileElite = {
    ...mockStudentProfile,
    academicInfo: {
      ...mockStudentProfile.academicInfo,
      institution: "Indian Institute of Technology (IIT)",
    },
  };

  const profileRural = {
    ...mockStudentProfile,
    academicInfo: {
      ...mockStudentProfile.academicInfo,
      institution: "Small Rural College of Engineering",
    },
  };

  const scoreElite = calculateCompatibilityScore(
    profileElite,
    fullMatchOpp,
    fullSkills,
    fullElig
  );
  const scoreRural = calculateCompatibilityScore(
    profileRural,
    fullMatchOpp,
    fullSkills,
    fullElig
  );

  assert(
    scoreElite.overallScore === scoreRural.overallScore &&
      scoreElite.componentScores.education === scoreRural.componentScores.education,
    `Pedigree neutrality verified: Both colleges receive identical score (${scoreElite.overallScore}% === ${scoreRural.overallScore}%)`
  );

  // Cleanup test documents
  await StudentProfile.deleteMany({ userId: testStudentUserId });
  await Opportunity.deleteMany({
    _id: { $in: [expiredOpp._id, pendingOpp._id, validOpp._id] },
  });

  // Summary
  console.log("\n=======================================================");
  console.log(`  Stage 4 Tests Completed: ${passedCount + failedCount}`);
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
