/**
 * CareerBridge AI - Practical Skill Readiness Assessment Automated Test Suite
 * Validates all 16 scenarios specified for Feature 4.
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
import { Assessment } from "../models/Assessment.ts";
import { AssessmentQuestion } from "../models/AssessmentQuestion.ts";
import { AssessmentAttempt } from "../models/AssessmentAttempt.ts";
import { AssessmentEvidence } from "../models/AssessmentEvidence.ts";
import { SkillsPassport } from "../models/SkillsPassport.ts";
import { StudentProfile } from "../models/StudentProfile.ts";
import { User } from "../models/User.ts";

import {
  ensureAssessmentsSeeded,
  getAssessments,
  getAssessmentById,
  startAssessmentAttempt,
  saveAttemptAnswers,
  submitAssessmentAttempt,
  getAttemptResult,
  getStudentAssessmentsHistory,
} from "../services/assessment/assessment.service.ts";

import { calculateAssessmentScore } from "../services/assessment/assessment-scoring.service.ts";
import { getSkillAssessmentCorrelations } from "../services/assessment/assessment-skill-gap.service.ts";
import {
  createAdminQuestion,
  createAdminAssessment,
} from "../services/assessment/assessment-admin.service.ts";

import { createOrGetPassport } from "../services/passport/passport-generator.service.ts";
import { matchSkills } from "../services/matching/skill-matcher.ts";
import { checkEligibility } from "../services/matching/eligibility-checker.ts";
import { calculateCompatibilityScore } from "../services/matching/score-calculator.ts";

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
  console.log("  CareerBridge AI - Practical Skill Readiness Assessment");
  console.log("  Feature 4 Automated Verification Suite (16 Scenarios)");
  console.log("=======================================================\n");

  await connectToDatabase();

  const timestamp = Date.now();
  const student1Id = `test_assess_std1_${timestamp}`;
  const student2Id = `test_assess_std2_${timestamp}`;
  const adminId = `test_assess_admin_${timestamp}`;

  try {
    // -------------------------------------------------------------
    // Scenario 1: Question Bank Seeding & 11 Subjects Coverage
    // -------------------------------------------------------------
    console.log("[Scenario 1] Question Bank Seeding & 11 Subjects Coverage");
    await ensureAssessmentsSeeded();

    const expectedSubjects = [
      "JavaScript",
      "HTML",
      "CSS",
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "SQL",
      "Python",
      "Java",
      "Data Structures and Algorithms",
    ];

    const questionsCount = await AssessmentQuestion.countDocuments();
    assert(questionsCount >= 22, `Question bank seeded with at least 22 questions (Found: ${questionsCount})`);

    for (const sub of expectedSubjects) {
      const count = await AssessmentQuestion.countDocuments({ subject: sub, status: "published" });
      assert(count >= 1, `Subject "${sub}" has active curriculum questions (${count} available)`);
    }

    const questionTypes = await AssessmentQuestion.distinct("questionType");
    assert(questionTypes.includes("multiple_choice"), "Question bank contains 'multiple_choice' conceptual questions");
    assert(questionTypes.includes("output_prediction"), "Question bank contains 'output_prediction' questions");
    assert(questionTypes.includes("code_debugging"), "Question bank contains 'code_debugging' questions");

    // -------------------------------------------------------------
    // Scenario 2: Assessment Catalog & Filtering
    // -------------------------------------------------------------
    console.log("\n[Scenario 2] Assessment Catalog & Filtering");
    const allAssessments = await getAssessments();
    assert(allAssessments.length >= 11, `Assessment catalog returns at least 11 tests (Found: ${allAssessments.length})`);

    const jsAssessments = await getAssessments({ subject: "JavaScript" });
    assert(jsAssessments.length >= 1, "Subject filter 'JavaScript' returns matching assessment");
    assert(jsAssessments.every((a) => a.subject === "JavaScript"), "All filtered items match JavaScript subject");

    const intermediateAssessments = await getAssessments({ difficulty: "Intermediate" });
    assert(intermediateAssessments.length >= 1, "Difficulty filter returns assessments");
    assert(intermediateAssessments.every((a) => a.difficulty === "Intermediate"), "All items match difficulty Intermediate");

    const searchResults = await getAssessments({ search: "React" });
    assert(searchResults.length >= 1, "Search keyword 'React' returns matching assessment");

    // -------------------------------------------------------------
    // Scenario 3: Start Attempt & Security Invariant (No Key Leaks)
    // -------------------------------------------------------------
    console.log("\n[Scenario 3] Start Attempt & Security Invariant");
    const targetAssessment = jsAssessments[0];
    const attempt1 = await startAssessmentAttempt(student1Id, targetAssessment._id.toString());

    assert(attempt1._id !== undefined, "Assessment attempt created successfully");
    assert(attempt1.status === "in_progress", "Initial attempt status is 'in_progress'");
    assert(attempt1.questions.length > 0, `Attempt initialized with ${attempt1.questions.length} questions`);

    // Verify security invariant: questions array MUST NOT have correctAnswer or explanation
    let leakedKeys = 0;
    for (const q of attempt1.questions) {
      if (q.correctAnswer !== undefined || q.explanation !== undefined) {
        leakedKeys++;
      }
    }
    assert(leakedKeys === 0, "Security Invariant: 0 questions exposed correctAnswer or explanation before submission");

    // -------------------------------------------------------------
    // Scenario 4: Option Shuffling & Integrity
    // -------------------------------------------------------------
    console.log("\n[Scenario 4] Option Shuffling & Integrity");
    const sampleQ = attempt1.questions[0];
    assert(Array.isArray(sampleQ.options) && sampleQ.options.length >= 2, "Question options preserved as structured array");
    assert(typeof sampleQ.options[0].id === "string" && typeof sampleQ.options[0].text === "string", "Each option has valid ID and text");

    // -------------------------------------------------------------
    // Scenario 5: Answer Auto-Saving
    // -------------------------------------------------------------
    console.log("\n[Scenario 5] Answer Auto-Saving");
    const q0Id = sampleQ.id;
    const chosenOptionId = sampleQ.options[0].id;

    const savedAttempt = await saveAttemptAnswers(attempt1._id.toString(), student1Id, {
      [q0Id]: {
        questionId: q0Id,
        selectedOptionId: chosenOptionId,
        isFlaggedForReview: true,
      },
    });

    assert(savedAttempt.answers[q0Id] !== undefined, "Answer saved to attempt in database");
    assert(savedAttempt.answers[q0Id].selectedOptionId === chosenOptionId, "Selected option ID persisted correctly");
    assert(savedAttempt.answers[q0Id].isFlaggedForReview === true, "Flagged for review status persisted");

    // -------------------------------------------------------------
    // Scenario 6: Countdown Timer Expiration & Auto-Submission
    // -------------------------------------------------------------
    console.log("\n[Scenario 6] Countdown Timer Expiration & Auto-Submission");
    // Manually backdate expiresAt to simulate timer expiration
    await AssessmentAttempt.findByIdAndUpdate(attempt1._id, {
      expiresAt: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    });

    const expiredResult = await saveAttemptAnswers(attempt1._id.toString(), student1Id, {
      [q0Id]: { questionId: q0Id, selectedOptionId: chosenOptionId },
    });

    assert(
      expiredResult.status === "timed_out" || expiredResult.status === "submitted",
      `Expired attempt automatically submitted (Status: ${expiredResult.status})`
    );

    // -------------------------------------------------------------
    // Scenario 7: Deterministic Scoring & Proficiency Tiers
    // -------------------------------------------------------------
    console.log("\n[Scenario 7] Deterministic Scoring & Proficiency Tiers");
    const fullQuestions = await AssessmentQuestion.find({
      _id: { $in: attempt1.questions.map((q) => q.id) },
    });

    // Test 100% correct answers
    const allCorrectAnswers = {};
    fullQuestions.forEach((q) => {
      allCorrectAnswers[q._id.toString()] = {
        questionId: q._id.toString(),
        selectedOptionId: q.correctAnswer,
      };
    });

    const perfectScore = calculateAssessmentScore({
      questions: fullQuestions,
      studentAnswers: allCorrectAnswers,
      passingThreshold: 60,
    });

    assert(perfectScore.percentage === 100, "Perfect score calculates to 100%");
    assert(perfectScore.isPassed === true, "Perfect score passes threshold");
    assert(perfectScore.proficiency === "Advanced", "100% score classified as 'Advanced'");
    assert(perfectScore.correctAnswersCount === fullQuestions.length, "Correct count matches total questions");

    // Test partial score (e.g. 50%)
    const partialAnswers = {};
    fullQuestions.forEach((q, idx) => {
      partialAnswers[q._id.toString()] = {
        questionId: q._id.toString(),
        selectedOptionId: idx % 2 === 0 ? q.correctAnswer : "incorrect_opt",
      };
    });

    const partialScore = calculateAssessmentScore({
      questions: fullQuestions,
      studentAnswers: partialAnswers,
      passingThreshold: 60,
    });

    assert(partialScore.percentage < 100 && partialScore.percentage > 0, `Partial score calculated: ${partialScore.percentage}%`);
    assert(partialScore.topicPerformance.length > 0, "Topic performance breakdown computed");
    assert(partialScore.difficultyPerformance.length > 0, "Difficulty performance breakdown computed");

    // -------------------------------------------------------------
    // Scenario 8: Duplicate Submission & Finalized Protection
    // -------------------------------------------------------------
    console.log("\n[Scenario 8] Duplicate Submission & Finalized Protection");
    // Attempt 1 is already finalized
    const resubmit = await submitAssessmentAttempt(attempt1._id.toString(), student1Id);
    assert(resubmit.attempt.status === "timed_out" || resubmit.attempt.status === "submitted", "Resubmitting finalized attempt is idempotent");

    let modifyError = "";
    try {
      // Un-expire temporarily to test finalized guard
      await AssessmentAttempt.findByIdAndUpdate(attempt1._id, {
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });
      await saveAttemptAnswers(attempt1._id.toString(), student1Id, {
        [q0Id]: { questionId: q0Id, selectedOptionId: "opt_x" },
      });
    } catch (err) {
      modifyError = err.message;
    }
    assert(modifyError.includes("already finalized"), "Finalized attempt rejects modifications");

    // -------------------------------------------------------------
    // Scenario 9: Unauthorized Answer-Key Leak Prevention
    // -------------------------------------------------------------
    console.log("\n[Scenario 9] Unauthorized Answer-Key Leak Prevention");
    // Target HTML assessment for student 2 to avoid cooldown on JS
    const htmlAssessment = (await getAssessments({ subject: "HTML" }))[0];
    const attempt2 = await startAssessmentAttempt(student2Id, htmlAssessment._id.toString());

    let leakError = "";
    try {
      await getAttemptResult(attempt2._id.toString(), student2Id);
    } catch (err) {
      leakError = err.message;
    }
    assert(leakError.includes("still in progress"), "Cannot view solution review while attempt is in progress");

    // -------------------------------------------------------------
    // Scenario 10: Attempt Ownership Isolation
    // -------------------------------------------------------------
    console.log("\n[Scenario 10] Attempt Ownership Isolation");
    let accessOtherResultErr = "";
    try {
      await getAttemptResult(attempt2._id.toString(), student1Id);
    } catch (err) {
      accessOtherResultErr = err.message;
    }
    assert(accessOtherResultErr.includes("Unauthorized"), "Student 1 cannot access Student 2's attempt result");

    let saveOtherAnswerErr = "";
    try {
      await saveAttemptAnswers(attempt2._id.toString(), student1Id, {});
    } catch (err) {
      saveOtherAnswerErr = err.message;
    }
    assert(saveOtherAnswerErr.includes("Unauthorized"), "Student 1 cannot modify Student 2's attempt answers");

    let submitOtherErr = "";
    try {
      await submitAssessmentAttempt(attempt2._id.toString(), student1Id);
    } catch (err) {
      submitOtherErr = err.message;
    }
    assert(submitOtherErr.includes("Unauthorized"), "Student 1 cannot submit Student 2's attempt");

    // -------------------------------------------------------------
    // Scenario 11: Skill Evidence Creation in AssessmentEvidence
    // -------------------------------------------------------------
    console.log("\n[Scenario 11] Skill Evidence Creation on Passing");
    // Submit attempt 2 with correct answers
    const htmlQuestions = await AssessmentQuestion.find({
      _id: { $in: attempt2.questions.map((q) => q.id) },
    });
    const htmlCorrectAnswers = {};
    htmlQuestions.forEach((q) => {
      htmlCorrectAnswers[q._id.toString()] = {
        questionId: q._id.toString(),
        selectedOptionId: q.correctAnswer,
      };
    });

    await saveAttemptAnswers(attempt2._id.toString(), student2Id, htmlCorrectAnswers);
    const { result: submitResult } = await submitAssessmentAttempt(attempt2._id.toString(), student2Id);

    assert(submitResult.attempt.isPassed === true, "Student 2 passed the HTML assessment");

    const evidence = await AssessmentEvidence.findOne({
      userId: student2Id,
      skill: "HTML",
      isPassed: true,
    });
    assert(evidence !== null, "AssessmentEvidence record generated in database");
    assert(evidence?.proficiency === "Advanced", `Evidence record contains proficiency: ${evidence?.proficiency}`);
    assert(evidence?.percentage === 100, `Evidence record contains percentage: ${evidence?.percentage}%`);

    // -------------------------------------------------------------
    // Scenario 12: Digital Skills Passport Synchronization
    // -------------------------------------------------------------
    console.log("\n[Scenario 12] Digital Skills Passport Synchronization");
    // Setup Student 2 passport with self-reported CSS skill
    const passport2 = await createOrGetPassport(student2Id);
    passport2.skills.push({
      id: "skill_css_01",
      name: "CSS",
      category: "frontend",
      proficiency: "Intermediate",
      evidenceType: "self_reported",
      verificationStatus: "unverified",
    });
    await passport2.save();

    // Start and pass a CSS assessment for student 2
    const cssAssessment = (await getAssessments({ subject: "CSS" }))[0];
    const attemptCss = await startAssessmentAttempt(student2Id, cssAssessment._id.toString());
    const cssQuestions = await AssessmentQuestion.find({
      _id: { $in: attemptCss.questions.map((q) => q.id) },
    });
    const cssCorrectAnswers = {};
    cssQuestions.forEach((q) => {
      cssCorrectAnswers[q._id.toString()] = {
        questionId: q._id.toString(),
        selectedOptionId: q.correctAnswer,
      };
    });

    await saveAttemptAnswers(attemptCss._id.toString(), student2Id, cssCorrectAnswers);
    await submitAssessmentAttempt(attemptCss._id.toString(), student2Id);

    // Verify CSS sync into passport
    const freshPassport = await SkillsPassport.findOne({ userId: student2Id });
    assert(freshPassport !== null, "Passport retrieved");
    const hasCssAssessment = freshPassport?.assessments.some((a) => a.skillName === "CSS");
    assert(hasCssAssessment === true, "Passport 'assessments' array updated with verified CSS assessment");

    const verifiedCssSkill = freshPassport?.skills.find((s) => s.name === "CSS");
    assert(verifiedCssSkill?.evidenceType === "assessment_verified", "Passport CSS skill upgraded to 'assessment_verified'");
    assert(verifiedCssSkill?.verificationStatus === "verified", "Passport CSS skill verificationStatus is 'verified'");

    // -------------------------------------------------------------
    // Scenario 13: Stage 5 Skill Gap Discrepancy Analysis
    // -------------------------------------------------------------
    console.log("\n[Scenario 13] Stage 5 Skill Gap Discrepancy Analysis");
    // Create StudentProfile with self-reported skills
    await StudentProfile.create({
      userId: student2Id,
      personalInfo: {
        fullName: "Alex Rivera",
        email: `alex_${timestamp}@example.com`,
      },
      skills: [
        { id: "sk_1", name: "CSS", category: "Frontend technologies", proficiency: "Beginner" }, // assessed higher (Advanced)
        { id: "sk_2", name: "SQL", category: "Databases", proficiency: "Advanced" },    // untested
      ],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      careerPreferences: {
        targetRoles: ["Frontend Developer"],
        preferredLocations: ["Remote"],
        jobTypes: ["internship"],
      },
    });

    const correlations = await getSkillAssessmentCorrelations(student2Id);
    assert(correlations.length === 2, `Correlations computed for all 2 profile skills (Found: ${correlations.length})`);

    const cssCorrelation = correlations.find((c) => c.skillName === "CSS");
    assert(cssCorrelation?.hasAssessment === true, "CSS identified as assessment-verified");
    assert(
      cssCorrelation?.status === "verified_higher" || cssCorrelation?.status === "verified_aligned",
      `CSS status marked appropriately (${cssCorrelation?.status})`
    );

    const sqlCorrelation = correlations.find((c) => c.skillName === "SQL");
    assert(sqlCorrelation?.hasAssessment === false, "SQL identified as untested");
    assert(sqlCorrelation?.status === "untested", "SQL status marked as 'untested'");

    // Verify StudentProfile was NOT overwritten
    const profileAfter = await StudentProfile.findOne({ userId: student2Id });
    const cssSkill = profileAfter?.skills.find((s) => s.name === "CSS");
    assert(cssSkill?.proficiency === "Beginner", "StudentProfile self-reported proficiency was preserved without silent mutation");

    // -------------------------------------------------------------
    // Scenario 14: Stage 4 Matching Engine Non-Mandatory Compatibility
    // -------------------------------------------------------------
    console.log("\n[Scenario 14] Stage 4 Matching Engine Non-Mandatory Compatibility");
    // Ensure that students with 0 assessments are not blocked or penalized
    const mockStudent = {
      skills: ["HTML", "CSS", "JavaScript"],
      academicInfo: { degree: "B.Tech", cgpa: 8.5 },
      careerPreferences: { jobTypes: ["internship"], preferredLocations: ["Remote"] },
      projects: [],
    };
    const mockOpp = {
      title: "Junior Web Developer",
      requiredSkills: ["HTML", "CSS"],
      preferredSkills: ["JavaScript"],
      educationRequirements: "B.Tech",
      minimumCGPA: 8.0,
      workMode: "remote",
      category: "internship",
    };

    const skillResult = matchSkills(mockStudent.skills, mockOpp.requiredSkills, mockOpp.preferredSkills);
    const eligibilityResult = checkEligibility(mockStudent, mockOpp);
    const matchScore = calculateCompatibilityScore(mockStudent, mockOpp, skillResult, eligibilityResult);

    assert(matchScore.overallScore >= 60, `Stage 4 compatibility score computed smoothly without assessment requirement: ${matchScore.overallScore}%`);

    // -------------------------------------------------------------
    // Scenario 15: Retake Cooldown Enforcement
    // -------------------------------------------------------------
    console.log("\n[Scenario 15] Retake Cooldown Enforcement");
    // CSS assessment has 24hr cooldown. Attempting to start again should fail.
    let cooldownError = "";
    try {
      await startAssessmentAttempt(student2Id, cssAssessment._id.toString());
    } catch (err) {
      cooldownError = err.message;
    }
    assert(cooldownError.includes("Retake cooldown active"), "Retake cooldown prevented immediate re-attempt");

    // -------------------------------------------------------------
    // Scenario 16: Admin Question Authoring & Validation
    // -------------------------------------------------------------
    console.log("\n[Scenario 16] Admin Question Authoring & Validation");
    let lessOptionsErr = "";
    try {
      await createAdminQuestion(adminId, {
        title: "Invalid Question",
        questionText: "What is 2+2?",
        subject: "JavaScript",
        topic: "Math",
        options: [{ id: "opt_1", text: "4" }], // only 1 option
        correctAnswer: "opt_1",
      });
    } catch (err) {
      lessOptionsErr = err.message;
    }
    assert(lessOptionsErr.includes("at least 2 options"), "Question authoring rejected with < 2 options");

    let invalidCorrectAnsErr = "";
    try {
      await createAdminQuestion(adminId, {
        title: "Invalid Question 2",
        questionText: "What is 2+2?",
        subject: "JavaScript",
        topic: "Math",
        options: [
          { id: "opt_1", text: "4" },
          { id: "opt_2", text: "5" },
        ],
        correctAnswer: "opt_nonexistent",
      });
    } catch (err) {
      invalidCorrectAnsErr = err.message;
    }
    assert(invalidCorrectAnsErr.includes("correctAnswer must match one of the provided option IDs"), "Question authoring rejected with mismatched correctAnswer");

    // Valid admin question creation
    const createdQ = await createAdminQuestion(adminId, {
      title: "Admin Custom JS Question",
      questionText: "What does Array.prototype.map return?",
      subject: "JavaScript",
      topic: "Arrays",
      difficulty: "Beginner",
      questionType: "multiple_choice",
      options: [
        { id: "opt_a", text: "A new array with the transformed elements" },
        { id: "opt_b", text: "The same array modified in place" },
      ],
      correctAnswer: "opt_a",
      explanation: "map returns a new array and does not mutate the original array.",
      marks: 5,
    });

    assert(createdQ._id !== undefined, "Admin custom question created successfully in bank");

    // Valid admin assessment configuration
    const createdAssessment = await createAdminAssessment(adminId, {
      title: "Advanced JavaScript Challenge",
      subject: "JavaScript",
      description: "Comprehensive evaluation of JS closures and async programming.",
      durationMinutes: 45,
      passingThreshold: 75,
      difficulty: "Advanced",
      retakeCooldownHours: 48,
    });

    assert(createdAssessment._id !== undefined, "Admin assessment created successfully");
    assert(createdAssessment.passingThreshold === 75, "Admin assessment passing threshold set to 75%");
    assert(createdAssessment.retakeCooldownHours === 48, "Admin assessment retake cooldown set to 48 hours");

    // -------------------------------------------------------------
    // Cleanup Test Data
    // -------------------------------------------------------------
    await AssessmentAttempt.deleteMany({ userId: { $in: [student1Id, student2Id] } });
    await AssessmentEvidence.deleteMany({ userId: { $in: [student1Id, student2Id] } });
    await SkillsPassport.deleteMany({ userId: { $in: [student1Id, student2Id] } });
    await StudentProfile.deleteMany({ userId: { $in: [student1Id, student2Id] } });
    await AssessmentQuestion.findByIdAndDelete(createdQ._id);
    await Assessment.findByIdAndDelete(createdAssessment._id);

    console.log("\n=======================================================");
    console.log(`  Tests Completed: ${passedCount} Passed, ${failedCount} Failed`);
    console.log("=======================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution failed with unhandled error:", err);
    process.exit(1);
  }
}

runTests();
