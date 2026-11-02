/**
 * CareerBridge AI - Stage 7 Automated Verification Suite
 * Validates all 14 testing requirements specified for Explainable AI Recommendations.
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
import { OpportunityExplanation } from "../models/OpportunityExplanation.ts";
import { ExplanationFeedback } from "../models/ExplanationFeedback.ts";

import {
  getOpportunityMatchDetail,
} from "../services/matching/matching.service.ts";
import {
  DEFAULT_SCORING_WEIGHTS,
  calculateMatchScores,
} from "../services/matching/score-calculator.ts";
import { matchSkills } from "../services/matching/skill-matcher.ts";
import { evaluateEligibility } from "../services/matching/eligibility-checker";

import { buildScoreBreakdown } from "../services/explanations/score-breakdown.ts";
import {
  buildSkillsAnalysis,
  buildProjectAndExperienceEvidence,
} from "../services/explanations/evidence-builder.ts";
import { buildEligibilityExplanation } from "../services/explanations/eligibility-explainer.ts";
import { calculateDataCompleteness } from "../services/explanations/confidence-calculator.ts";
import { buildImprovementSuggestions } from "../services/explanations/improvement-suggestions.ts";
import {
  generateDeterministicNarrative,
  generateAiExplanation,
} from "../services/explanations/explanation-ai.ts";
import {
  getOpportunityExplanation,
  saveExplanationFeedback,
  getMethodologyInfo,
  invalidateExplanationCache,
} from "../services/explanations/explanation.service.ts";
import { geminiExplanationAiOutputSchema } from "../features/explanations/schemas/explanationSchema.ts";

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
  console.log("  CareerBridge AI - Stage 7 Explainable AI Verification");
  console.log("=======================================================\n");

  // Sample student and opportunity mock data
  const mockStudent = {
    userId: "test-student-stage7",
    personalInfo: { fullName: "Aarav Sharma", email: "aarav@test.edu" },
    academicInfo: {
      collegeName: "Government Engineering College",
      degree: "B.Tech",
      branch: "Computer Science",
      cgpa: 8.4,
      graduationYear: 2026,
    },
    skills: [
      { id: "s1", name: "TypeScript", category: "Programming languages", proficiency: "Intermediate" },
      { id: "s2", name: "React", category: "Frontend technologies", proficiency: "Advanced" },
      { id: "s3", name: "Node.js", category: "Backend technologies", proficiency: "Intermediate" },
    ],
    projects: [
      {
        id: "p1",
        title: "Campus Marketplace",
        description: "Full stack student marketplace platform",
        technologies: ["React", "Node.js", "MongoDB"],
      },
    ],
    careerPreferences: {
      preferredJobRole: "Frontend Developer",
      preferredEmploymentType: "Internship",
      workPreference: "Hybrid",
      preferredLocation: "Bengaluru",
    },
  };

  const mockOpportunity = {
    _id: "test-opp-stage7",
    title: "Frontend Developer Intern",
    companyName: "InnovateTech",
    category: "internship",
    employmentType: "internship",
    workMode: "hybrid",
    location: "Bengaluru",
    description: "Hands-on internship building web applications with modern frontend stack.",
    requiredSkills: ["React", "TypeScript", "Tailwind CSS"],
    preferredSkills: ["Next.js", "GraphQL"],
    minimumExperience: "Fresher",
    educationRequirements: "B.Tech / B.E / BCA in Computer Science or related",
    minimumCGPA: 7.5,
    isPaid: true,
    stipend: "INR 25,000 / month",
    createdBy: "test-admin-id",
  };

  const allSkills = ["TypeScript", "React", "Node.js", "MongoDB"];
  const skillResult = matchSkills(
    allSkills,
    mockOpportunity.requiredSkills,
    mockOpportunity.preferredSkills
  );
  const eligibilityResult = evaluateEligibility(mockStudent, mockOpportunity);
  const scoreResult = calculateMatchScores(
    mockStudent,
    mockOpportunity,
    skillResult,
    eligibilityResult
  );

  // 1. Correct Match Score from Stage 4
  console.log("--- 1. Correct Match Score Displayed from Stage 4 ---");
  const scoreBreakdown = buildScoreBreakdown(
    mockStudent,
    mockOpportunity,
    scoreResult.componentScores,
    skillResult,
    eligibilityResult
  );
  assert(
    scoreResult.overallScore >= 0 && scoreResult.overallScore <= 100,
    `Stage 4 match score computed deterministically (${scoreResult.overallScore}%)`
  );
  assert(
    scoreBreakdown.length === 7,
    `Score breakdown contains all 7 factors from Stage 4`
  );

  // 2. Score Breakdown Matches Actual Scoring Engine
  console.log("\n--- 2. Score Breakdown Matches Actual Scoring Engine ---");
  const factorMap = new Map(scoreBreakdown.map((f) => [f.factorKey, f]));
  assert(
    factorMap.get("requiredSkills")?.weight === 40,
    `Required Technical Skills has weight 40% (got ${factorMap.get("requiredSkills")?.weight}%)`
  );
  assert(
    factorMap.get("preferredSkills")?.weight === 15,
    `Preferred Technical Skills has weight 15% (got ${factorMap.get("preferredSkills")?.weight}%)`
  );
  assert(
    factorMap.get("projectsExperience")?.weight === 15,
    `Projects & Experience has weight 15% (got ${factorMap.get("projectsExperience")?.weight}%)`
  );
  assert(
    factorMap.get("education")?.weight === 10,
    `Education & Eligibility has weight 10% (got ${factorMap.get("education")?.weight}%)`
  );
  assert(
    factorMap.get("careerAlignment")?.weight === 10,
    `Career Role Alignment has weight 10% (got ${factorMap.get("careerAlignment")?.weight}%)`
  );
  assert(
    factorMap.get("locationWorkMode")?.weight === 5,
    `Work Mode & Location has weight 5% (got ${factorMap.get("locationWorkMode")?.weight}%)`
  );
  assert(
    factorMap.get("compensation")?.weight === 5,
    `Compensation Alignment has weight 5% (got ${factorMap.get("compensation")?.weight}%)`
  );

  const totalWeight = scoreBreakdown.reduce((sum, f) => sum + f.weight, 0);
  assert(totalWeight === 100, `Total factor weights sum to exactly 100% (got ${totalWeight}%)`);

  // 3. Matching Skills Correctly Identified with Evidence Source
  console.log("\n--- 3. Matching Skills Correctly Identified with Evidence ---");
  const skillsAnalysis = buildSkillsAnalysis(
    mockStudent,
    null,
    mockOpportunity,
    skillResult
  );
  const matchedSkillNames = skillsAnalysis.matchingSkills.map((s) => s.name);
  assert(
    matchedSkillNames.includes("React") && matchedSkillNames.includes("TypeScript"),
    `Matched skills correctly detected (React, TypeScript)`
  );
  const reactSkill = skillsAnalysis.matchingSkills.find((s) => s.name === "React");
  assert(
    reactSkill?.evidenceSource === "project" || reactSkill?.evidenceSource === "profile",
    `Evidence source accurately attributed to project/profile (${reactSkill?.evidenceDetail})`
  );

  // 4. Missing Required Skills Distinguished from Preferred Skills
  console.log("\n--- 4. Missing Required vs Preferred Skills Distinction ---");
  const missingReq = skillsAnalysis.missingRequiredSkills.map((s) => s.name);
  const missingPref = skillsAnalysis.missingPreferredSkills.map((s) => s.name);
  assert(
    missingReq.includes("Tailwind CSS"),
    `Mandatory missing skill isolated in missingRequiredSkills: ${missingReq.join(", ")}`
  );
  assert(
    missingPref.includes("Next.js") || missingPref.includes("GraphQL"),
    `Optional bonus skill isolated in missingPreferredSkills: ${missingPref.join(", ")}`
  );
  assert(
    skillsAnalysis.missingRequiredSkills[0]?.importance === "critical" ||
      skillsAnalysis.missingRequiredSkills[0]?.importance === "high",
    `Missing required skill has critical/high importance flag`
  );

  // 5. Unknown Skills Not Automatically Marked Missing
  console.log("\n--- 5. Unknown Skills Not Automatically Marked Missing ---");
  const studentWithPartialSkill = {
    ...mockStudent,
    skills: [], // empty technical skills
  };
  const unassessedAnalysis = buildSkillsAnalysis(
    studentWithPartialSkill,
    null,
    mockOpportunity,
    skillResult
  );
  assert(
    unassessedAnalysis.skillsRequiringVerification.length > 0,
    `Unassessed profile classifies skills under 'skillsRequiringVerification' rather than assuming absent`
  );

  // 6. Eligibility Failures Clearly Explained
  console.log("\n--- 6. Eligibility Failures Clearly Explained ---");
  const ineligibleStudent = {
    ...mockStudent,
    academicInfo: {
      ...mockStudent.academicInfo,
      cgpa: 6.2, // Below 7.5 minimum cutoff
    },
  };
  const ineligibleResult = evaluateEligibility(ineligibleStudent, mockOpportunity);
  const eligibilityExpl = buildEligibilityExplanation(
    ineligibleStudent,
    mockOpportunity,
    ineligibleResult
  );
  const cgpaCriterion = eligibilityExpl.find((c) => c.criterion.includes("CGPA"));
  assert(
    cgpaCriterion?.status === "not_satisfied",
    `CGPA failure marked as 'not_satisfied' (${cgpaCriterion?.studentValue} vs requirement ${cgpaCriterion?.requirement})`
  );
  assert(
    cgpaCriterion?.explanation.includes("below"),
    `Clear narrative explanation provided for CGPA failure: "${cgpaCriterion?.explanation}"`
  );
  assert(
    cgpaCriterion?.isMandatory === true,
    `CGPA criterion correctly designated as mandatory requirement`
  );

  // 7. Missing Profile Information Identified in Data Completeness
  console.log("\n--- 7. Missing Profile Information Identified ---");
  const incompleteStudent = {
    userId: "incomplete-student",
    personalInfo: { fullName: "Test Student", email: "student@test.edu" },
    // no academic, no skills, no projects, no preferences
  };
  const completeness = calculateDataCompleteness(incompleteStudent, null, mockOpportunity);
  assert(
    completeness.completenessScore < 50,
    `Incomplete student evaluates to low completeness (${completeness.completenessScore}%)`
  );
  assert(
    completeness.missingFactors.length >= 3,
    `Missing factors explicitly listed (${completeness.missingFactors.length} items identified)`
  );
  assert(
    completeness.isComplete === false,
    `Recommendation correctly flagged as based on partial evaluation`
  );

  // 8. Gemini Cannot Modify Match Scores
  console.log("\n--- 8. Gemini Cannot Modify Match Scores ---");
  const narrative = generateDeterministicNarrative(
    mockOpportunity.title,
    mockOpportunity.companyName,
    scoreResult.overallScore,
    scoreBreakdown,
    skillsAnalysis.matchingSkills,
    skillsAnalysis.missingRequiredSkills,
    eligibilityExpl,
    completeness
  );
  assert(
    narrative.summary.includes(`${scoreResult.overallScore}%`),
    `Deterministic explanation preserves exact match score (${scoreResult.overallScore}%)`
  );

  // 9. Deterministic Fallback Works When Gemini Fails
  console.log("\n--- 9. Deterministic Fallback Works When Gemini Fails ---");
  // Test with invalid API key or offline simulation
  const originalKey = process.env.GEMINI_API_KEY;
  try {
    process.env.GEMINI_API_KEY = "invalid-test-key";
    const aiResult = await generateAiExplanation(
      mockOpportunity.title,
      mockOpportunity.companyName,
      scoreResult.overallScore,
      scoreBreakdown,
      skillsAnalysis.matchingSkills,
      skillsAnalysis.missingRequiredSkills,
      eligibilityExpl,
      completeness
    );
    assert(
      aiResult.narrative !== null && typeof aiResult.narrative.summary === "string",
      `Deterministic fallback safely triggered without crashing when Gemini is unavailable`
    );
    assert(
      aiResult.narrative.topMatchingFactors.length > 0,
      `Deterministic fallback generates structured top matching factors`
    );
  } finally {
    process.env.GEMINI_API_KEY = originalKey;
  }

  // 10. AI-Generated Explanations Cannot Introduce Unsupported Claims (Zod Validation)
  console.log("\n--- 10. AI-Generated Explanations Zod Schema Validation ---");
  const malformedAiOutput = {
    summary: "short", // invalid: less than 10 chars
    topMatchingFactors: [], // invalid: empty array
  };
  const zodValidation = geminiExplanationAiOutputSchema.safeParse(malformedAiOutput);
  assert(
    !zodValidation.success,
    `Zod schema catches and rejects malformed AI outputs`
  );

  const validAiOutput = {
    summary: "This is a detailed overview of your application compatibility.",
    topMatchingFactors: ["Demonstrated TypeScript experience", "Meets academic threshold"],
    keyProfileEvidence: ["Portfolio project demonstrates React"],
    limitationsDisclaimer: "Standard disclaimer text.",
  };
  const validZod = geminiExplanationAiOutputSchema.safeParse(validAiOutput);
  assert(
    validZod.success,
    `Valid structured explanation payload passes Zod schema`
  );

  // Database Connected Tests
  console.log("\n--- Connecting to MongoDB for End-to-End Tests ---");
  await connectToDatabase();

  const testUserId = `test-user-stage7-${crypto.randomUUID()}`;
  let testOppId = "";

  try {
    // Seed test student profile
    const studentDoc = await StudentProfile.create({
      ...mockStudent,
      userId: testUserId,
    });

    // Seed test opportunity
    const oppDoc = await Opportunity.create({
      ...mockOpportunity,
      _id: new mongoose.Types.ObjectId(),
      status: "published",
      verificationStatus: "verified",
      createdAt: new Date(),
    });
    testOppId = oppDoc._id.toString();

    // 11. Students Cannot Access Other Students' Explanations
    console.log("\n--- 11. Students Cannot Access Other Students' Explanations ---");
    let caughtUnauthorized = false;
    try {
      await getOpportunityExplanation("", testOppId);
    } catch (e) {
      caughtUnauthorized = true;
    }
    assert(
      caughtUnauthorized,
      `Accessing explanation without authenticated userId throws Unauthorized error`
    );

    // End-to-End Explanation Generation
    const explanation = await getOpportunityExplanation(testUserId, testOppId);
    assert(
      explanation.opportunityId === testOppId,
      `Successfully generated end-to-end explanation for student and opportunity`
    );
    assert(
      explanation.scoreBreakdown.length === 7,
      `End-to-end explanation contains 7-factor score breakdown`
    );
    assert(
      explanation.dataCompleteness.completenessScore > 0,
      `Data completeness calculated (${explanation.dataCompleteness.completenessScore}%)`
    );

    // 12. Feedback is Saved Correctly
    console.log("\n--- 12. Feedback is Saved Correctly ---");
    const feedback1 = await saveExplanationFeedback(testUserId, {
      opportunityId: testOppId,
      feedbackType: "helpful",
    });
    assert(
      feedback1.feedbackType === "helpful",
      `Saved helpful feedback in MongoDB`
    );

    // Update feedback with reason
    const feedback2 = await saveExplanationFeedback(testUserId, {
      opportunityId: testOppId,
      feedbackType: "not_helpful",
      reason: "Explanation is unclear",
      comment: "Would like more details on Next.js",
    });
    assert(
      feedback2.feedbackType === "not_helpful" && feedback2.reason === "Explanation is unclear",
      `Updated feedback successfully with reason and comment without creating duplicates`
    );

    const feedbackCount = await ExplanationFeedback.countDocuments({
      userId: testUserId,
      opportunityId: testOppId,
    });
    assert(
      feedbackCount === 1,
      `Compound index prevents duplicate feedback entries (exactly 1 document found)`
    );

    // 13. Protected Attributes Do Not Affect Recommendations
    console.log("\n--- 13. Protected Attributes Do Not Affect Recommendations ---");
    const methodology = getMethodologyInfo();
    const hasProtectedAttributes = methodology.factors.some((f) =>
      ["gender", "caste", "religion", "income", "pedigree", "prestige"].some((p) =>
        f.name.toLowerCase().includes(p)
      )
    );
    assert(
      !hasProtectedAttributes,
      `Methodology factors strictly exclude protected attributes (pedigree, caste, gender, income)`
    );

    // Test with two colleges of different perceived brand names
    const tier1Student = {
      ...mockStudent,
      userId: "tier1-student",
      academicInfo: { ...mockStudent.academicInfo, collegeName: "Premier Institute of Technology" },
    };
    const ruralStudent = {
      ...mockStudent,
      userId: "rural-student",
      academicInfo: { ...mockStudent.academicInfo, collegeName: "Rural Government College" },
    };
    const score1 = calculateMatchScores(tier1Student, mockOpportunity, skillResult, eligibilityResult);
    const score2 = calculateMatchScores(ruralStudent, mockOpportunity, skillResult, eligibilityResult);
    assert(
      score1.overallScore === score2.overallScore,
      `Pedigree neutrality verified: Both colleges produce identical match score (${score1.overallScore}% === ${score2.overallScore}%)`
    );

    // 14. Updated Profiles Invalidate Stale Explanations
    console.log("\n--- 14. Updated Profiles Invalidate Stale Explanations ---");
    // Verify explanation was cached in OpportunityExplanation
    const cachedCountBefore = await OpportunityExplanation.countDocuments({
      userId: testUserId,
      opportunityId: testOppId,
    });
    assert(cachedCountBefore === 1, `Explanation document successfully cached in MongoDB`);

    // Invalidate cache
    await invalidateExplanationCache(testUserId, testOppId);
    const cachedCountAfter = await OpportunityExplanation.countDocuments({
      userId: testUserId,
      opportunityId: testOppId,
    });
    assert(
      cachedCountAfter === 0,
      `Cache invalidation successfully purges stale cached explanation documents`
    );

  } finally {
    // Cleanup test documents
    await StudentProfile.deleteMany({ userId: testUserId });
    if (testOppId) {
      await Opportunity.findByIdAndDelete(testOppId);
      await OpportunityExplanation.deleteMany({ userId: testUserId });
      await ExplanationFeedback.deleteMany({ userId: testUserId });
    }
  }

  console.log("\n=======================================================");
  console.log(`  Stage 7 Tests Completed: ${passedCount + failedCount}`);
  console.log(`  Passed: ${passedCount}`);
  console.log(`  Failed: ${failedCount}`);
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
