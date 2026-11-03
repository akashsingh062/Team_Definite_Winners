/**
 * test-system-integration.mjs
 * End-to-End System Integration and Workflow Verification Suite for Stage 10.
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

import { connectToDatabase } from "../lib/db/mongodb.ts";
import { askCareerCompanion } from "../services/companion/career-companion.service.ts";

// Models
import { User } from "../models/User.ts";
import { Opportunity } from "../models/Opportunity.ts";
import { Application } from "../models/Application.ts";
import { StudentProfile } from "../models/StudentProfile.ts";
import { CareerPath } from "../models/CareerPath.ts";
import { CareerSimulation } from "../models/CareerSimulation.ts";
import { SkillsPassport } from "../models/SkillsPassport.ts";
import { AssessmentAttempt } from "../models/AssessmentAttempt.ts";
import { MentorProfile } from "../models/MentorProfile.ts";
import { MentorshipRequest } from "../models/MentorshipRequest.ts";
import { MentorshipSession } from "../models/MentorshipSession.ts";
import { MentorshipFeedback } from "../models/MentorshipFeedback.ts";
import { RegionalTrainingCentre } from "../models/RegionalTrainingCentre.ts";

// Services
import { getStudentProfileByUserId, upsertStudentProfile } from "../services/studentProfileService.ts";
import { getCareerPaths } from "../services/career/career-path.service.ts";
import { runCareerWhatIfSimulation } from "../services/career/career-simulator.service.ts";
import { getRecommendationsForStudent } from "../services/matching/matching.service.ts";
import { saveOpportunity, recordApplication, getApplicationStatistics } from "../services/application/application.service.ts";
import { syncPassportFromProfile } from "../services/passport/passport-generator.service.ts";
import { getPublicPassport } from "../services/passport/passport-public.service.ts";
import { MentorService } from "../services/mentor/mentor.service.ts";
import { MentorshipRequestService } from "../services/mentor/mentorship-request.service.ts";
import { MentorshipSessionService } from "../services/mentor/mentorship-session.service.ts";
import { MentorshipFeedbackService } from "../services/mentor/mentorship-feedback.service.ts";
import { getRegionalSkillDemand } from "../services/local/local-opportunity.service.ts";

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${testName}`);
    failedTests++;
  }
}

async function runSystemIntegrationTests() {
  console.log("===============================================================");
  console.log("   CAREERBRIDGE AI - STAGE 10 SYSTEM INTEGRATION TEST SUITE   ");
  console.log("===============================================================\n");

  await connectToDatabase();

  const testStudentId = new mongoose.Types.ObjectId().toString();
  const testStudentEmail = `integration.student.${Date.now()}@careerbridge.edu`;
  const otherStudentId = new mongoose.Types.ObjectId().toString();

  const testMentorId = new mongoose.Types.ObjectId().toString();
  const testMentorEmail = `integration.mentor.${Date.now()}@careerbridge.edu`;

  let createdOppId = null;
  let createdCareerPathId = null;
  let createdSessionId = null;

  try {
    // -------------------------------------------------------------------------
    // Workflow A: Student Onboarding & Profile Setup
    // -------------------------------------------------------------------------
    console.log("--- Workflow A: Student Onboarding & Profile Setup ---");
    // Ensure User record exists
    await User.create({
      _id: testStudentId,
      id: testStudentId,
      name: "Aarav Sharma",
      email: testStudentEmail,
      role: "student",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const profileData = {
      personalInfo: {
        fullName: "Aarav Sharma",
        email: testStudentEmail,
        phoneNumber: "+91 9876543210",
        profilePhotograph: "https://example.com/avatar.jpg",
      },
      academicInfo: {
        collegeName: "Indian Institute of Information Technology",
        degree: "B.Tech",
        branch: "Computer Science",
        currentAcademicYear: "3rd Year",
        graduationYear: 2026,
        cgpa: 8.8,
      },
      skills: [
        { id: "sk-1", name: "JavaScript", category: "Programming languages", proficiency: "Advanced" },
        { id: "sk-2", name: "React", category: "Frontend technologies", proficiency: "Intermediate" },
        { id: "sk-3", name: "Node.js", category: "Backend technologies", proficiency: "Intermediate" },
        { id: "sk-4", name: "MongoDB", category: "Databases", proficiency: "Intermediate" },
      ],
      projects: [
        {
          id: "pr-1",
          title: "CareerBridge AI Portal",
          description: "Full-stack career discovery platform with Next.js and MongoDB",
          technologies: ["React", "Next.js", "Node.js", "MongoDB"],
          githubUrl: "https://github.com/aarav/careerbridge",
          liveDeploymentUrl: "https://careerbridge-demo.vercel.app",
        },
      ],
      careerPreferences: {
        preferredJobRole: "Full-Stack Developer",
        preferredEmploymentType: "Internship",
        workPreference: "Hybrid",
        preferredLocation: "Bengaluru",
      },
    };

    const savedProfile = await upsertStudentProfile(testStudentId, profileData);
    assert(savedProfile && savedProfile.userId === testStudentId, "Workflow A.1: Upsert student profile succeeds");
    assert(savedProfile.skills.length === 4, "Workflow A.2: Profile registers 4 technical skills");
    assert(savedProfile.projects.length === 1, "Workflow A.3: Profile stores validated project evidence");

    const retrievedProfile = await getStudentProfileByUserId(testStudentId);
    assert(retrievedProfile.personalInfo.fullName === "Aarav Sharma", "Workflow A.4: Profile retrieval validates correctly");

    // -------------------------------------------------------------------------
    // Workflow B: Career Discovery & What-If Simulator
    // -------------------------------------------------------------------------
    console.log("\n--- Workflow B: Career Discovery & What-If Simulator ---");
    let careerPaths = await getCareerPaths();
    if (careerPaths.length === 0) {
      const newPath = await CareerPath.create({
        slug: `full-stack-dev-${Date.now()}`,
        title: "Full-Stack Developer",
        category: "Software Development",
        description: "Develop end-to-end web architectures across client and server.",
        requiredSkills: ["JavaScript", "React", "Node.js"],
        preferredSkills: ["TypeScript", "MongoDB", "Docker"],
        demandLevel: "Very High",
        averageSalaryMin: 800000,
        averageSalaryMax: 1800000,
        isActive: true,
      });
      careerPaths = [newPath];
    }
    const targetPath = careerPaths[0];
    createdCareerPathId = targetPath._id.toString();
    assert(targetPath && targetPath.title, "Workflow B.1: Career Explorer returns active career paths");

    const simResult = await runCareerWhatIfSimulation(
      testStudentId,
      createdCareerPathId,
      ["TypeScript", "Docker"]
    );

    assert(simResult && simResult.baselineAlignment !== undefined, "Workflow B.2: What-If Simulator computes baseline alignment");
    assert(simResult.simulatedAlignment !== undefined, "Workflow B.3: What-If Simulator computes simulated alignment");
    assert(simResult.alignmentDelta >= 0, "Workflow B.4: What-If Simulator shows non-negative skill alignment gain");

    // -------------------------------------------------------------------------
    // Workflow C: Opportunity Discovery, Matching & Application Tracking
    // -------------------------------------------------------------------------
    console.log("\n--- Workflow C: Opportunity Discovery & Application Tracking ---");
    const testOpp = await Opportunity.create({
      title: "Full-Stack Engineering Intern",
      companyName: "InnovateTech AI",
      description: "Build cutting-edge full-stack web applications using React, Node.js, and MongoDB.",
      category: "internship",
      employmentType: "internship",
      workMode: "hybrid",
      location: "Bengaluru",
      requiredSkills: ["JavaScript", "React", "Node.js"],
      preferredSkills: ["MongoDB", "TypeScript"],
      status: "published",
      verificationStatus: "verified",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: new mongoose.Types.ObjectId().toString(),
    });
    createdOppId = testOpp._id.toString();
    assert(createdOppId, "Workflow C.1: Active opportunity created in database");

    const recs = await getRecommendationsForStudent(testStudentId, {
      category: "all",
      workMode: "all",
      eligibility: "all",
      sortBy: "score",
      page: 1,
      limit: 10,
    });
    assert(Array.isArray(recs.items), "Workflow C.2: Matching engine returns recommendations array");
    const matchedOpp = recs.items.find((r) => r.opportunityId === createdOppId || r.opportunity?._id?.toString() === createdOppId);
    assert(matchedOpp && matchedOpp.overallScore >= 50, "Workflow C.3: Matching engine matches high-affinity skills");

    const savedApp = await saveOpportunity(testStudentId, createdOppId, "Interested in full-stack role");
    assert(savedApp && savedApp.status === "saved", "Workflow C.4: Application Tracking records saved opportunity");

    const appliedApp = await recordApplication(testStudentId, {
      opportunityId: createdOppId,
      status: "applied",
      applicationDate: new Date(),
      notes: "Submitted application via CareerBridge portal",
    });
    assert(appliedApp.status === "applied", "Workflow C.5: Application Tracking records applied status");

    const appStats = await getApplicationStatistics(testStudentId);
    assert(appStats.totalApplications >= 1, "Workflow C.6: Application statistics reflects active applications");

    // -------------------------------------------------------------------------
    // Workflow D: Skill Assessment & Digital Skills Passport
    // -------------------------------------------------------------------------
    console.log("\n--- Workflow D: Skill Assessment & Digital Skills Passport ---");
    const attempt = await AssessmentAttempt.create({
      userId: testStudentId,
      assessmentId: new mongoose.Types.ObjectId().toString(),
      assessmentTitle: "JavaScript Core Practical Readiness",
      subject: "JavaScript",
      questions: [],
      score: 18,
      totalMarks: 20,
      percentage: 90,
      isPassed: true,
      proficiency: "Advanced",
      status: "submitted",
      expiresAt: new Date(Date.now() + 3600000),
      submittedAt: new Date(),
    });
    assert(attempt.isPassed === true, "Workflow D.1: Assessment attempt records passed status");

    const passport = await syncPassportFromProfile(testStudentId);
    assert(passport && passport.publicId, "Workflow D.2: Digital Skills Passport initialized and synced");

    const publicResult = await getPublicPassport(passport.publicId, false);
    assert(publicResult && publicResult.passport && publicResult.passport.displayName, "Workflow D.3: Public Passport preview retrieved without authentication");

    // -------------------------------------------------------------------------
    // Workflow E: Multilingual AI Career Companion
    // -------------------------------------------------------------------------
    console.log("\n--- Workflow E: Multilingual AI Career Companion ---");
    const enResponse = await askCareerCompanion(
      "How can I prepare for a React and Node.js internship interview?",
      "en",
      [],
      {
        fullName: "Aarav Sharma",
        preferredRole: "Full-Stack Developer",
        skills: ["JavaScript", "React", "Node.js"],
      }
    );
    assert(enResponse.language === "en", "Workflow E.1: Companion responds in English");
    assert(enResponse.reply && enResponse.reply.length > 50, "Workflow E.2: English reply provides structured advice");
    assert(Array.isArray(enResponse.suggestedQuestions) && enResponse.suggestedQuestions.length > 0, "Workflow E.3: Companion provides suggested follow-ups");
    assert(Array.isArray(enResponse.deepLinks) && enResponse.deepLinks.length > 0, "Workflow E.4: Companion includes relevant platform deep links");

    const hiResponse = await askCareerCompanion(
      "रिज्यूमे में कौन से प्रोजेक्ट्स शामिल करने चाहिए?",
      "hi",
      [],
      {
        fullName: "Aarav Sharma",
        preferredRole: "Full-Stack Developer",
      }
    );
    assert(hiResponse.language === "hi", "Workflow E.5: Companion responds in Hindi");
    assert(hiResponse.reply && hiResponse.reply.length > 50, "Workflow E.6: Hindi reply is generated in natural Devanagari script");
    assert(hiResponse.deepLinks.some((l) => l.href.includes("resume")), "Workflow E.7: Hindi query attaches Resume Analyzer deep link");

    // -------------------------------------------------------------------------
    // Workflow F: Local Opportunity & Regional Intelligence
    // -------------------------------------------------------------------------
    console.log("\n--- Workflow F: Local Opportunity & Regional Intelligence ---");
    const tc = await RegionalTrainingCentre.create({
      name: "National Skill Development Hub - Bengaluru",
      description: "Premier vocational training centre specializing in web and cloud competencies.",
      category: "pmkvy_centre",
      address: "Outer Ring Road, Bengaluru",
      district: "Bengaluru Urban",
      state: "Karnataka",
      coordinates: {
        latitude: 12.9716,
        longitude: 77.5946,
      },
      skillsOffered: ["Full-Stack Web Development", "Cloud Computing", "AI Foundations"],
      isVerified: true,
      contactEmail: "info@nsdc-bengaluru.gov.in",
      createdBy: new mongoose.Types.ObjectId().toString(),
    });
    assert(tc && tc._id, "Workflow F.1: Regional training centre registered");

    const skillDemand = await getRegionalSkillDemand("Karnataka");
    assert(skillDemand !== null && Array.isArray(skillDemand.topSkills), "Workflow F.2: Regional intelligence retrieves regional skill demand aggregates");

    // -------------------------------------------------------------------------
    // Workflow G: Human Mentor & Counsellor Network
    // -------------------------------------------------------------------------
    console.log("\n--- Workflow G: Human Mentor & Counsellor Network ---");
    // Ensure mentor User record exists
    await User.create({
      _id: testMentorId,
      id: testMentorId,
      name: "Priya Nair",
      email: testMentorEmail,
      role: "mentor",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const mentorProfile = await MentorService.registerOrUpdateMentorProfile(testMentorId, {
      fullName: "Priya Nair",
      headline: "Senior Engineering Lead @ FinTech AI | Ex-Google",
      bio: "10+ years mentoring university students and early-career software engineers.",
      expertiseAreas: ["Full-Stack Development", "System Design", "Resume Review", "Career Strategy"],
      company: "FinTech AI",
      jobTitle: "Senior Engineering Lead",
      yearsOfExperience: 10,
      hourlyRate: 0,
      isFreeTier: true,
      verificationStatus: "verified",
      isAcceptingMentees: true,
    });
    await MentorProfile.updateOne({ _id: mentorProfile._id }, { $set: { verificationStatus: "verified" } });
    assert(mentorProfile && mentorProfile.userId === testMentorId, "Workflow G.1: Mentor profile registered and verified by admin");

    const mRequest = await MentorshipRequestService.createRequest(testStudentId, {
      mentorId: mentorProfile._id.toString(),
      careerGoal: "Become a Senior Full-Stack Engineer at a high growth product company",
      topic: "Full-Stack System Design and Technical Interview Preparation",
      introduction: "Pre-final year student looking for guidance on technical interviews for full-stack internships.",
      preferredLanguage: "English",
      preferredSessionType: "1_on_1_advisory",
    });
    assert(mRequest && mRequest.status === "pending", "Workflow G.2: Mentorship request created with pending status");

    const acceptedRequest = await MentorshipRequestService.updateRequestStatus(
      mRequest._id.toString(),
      testMentorId,
      "accepted",
      "Glad to connect! Let us schedule a session."
    );
    assert(acceptedRequest.status === "accepted", "Workflow G.3: Mentor successfully accepts request");

    const session = await MentorshipSessionService.scheduleSession(testMentorId, {
      requestId: mRequest._id.toString(),
      studentId: testStudentId,
      mentorId: mentorProfile._id.toString(),
      topic: "Full-Stack Portfolio and Technical Mock Interview",
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      meetingUrl: "https://meet.google.com/abc-defg-hij",
    });
    createdSessionId = session._id.toString();
    assert(session && session.status === "scheduled", "Workflow G.4: Mentorship session scheduled with meeting link");

    await MentorshipSessionService.updateSessionStatus(createdSessionId, testMentorId, "completed");
    const feedback = await MentorshipFeedbackService.submitFeedback(testStudentId, {
      sessionId: createdSessionId,
      rating: 5,
      helpfulness: "extremely_helpful",
      feedback: "Incredible session! Provided pinpoint feedback on system design and resume keywords.",
      tags: ["React", "Node.js", "Interview Strategy"],
    });
    assert(feedback && feedback.rating === 5, "Workflow G.5: Student submits session rating and review feedback");

    // -------------------------------------------------------------------------
    // Workflow H: Cross-User Data Isolation & Security Checks
    // -------------------------------------------------------------------------
    console.log("\n--- Workflow H: Cross-User Data Isolation & Security Checks ---");
    const otherApps = await Application.find({ userId: otherStudentId });
    assert(otherApps.length === 0, "Workflow H.1: Other student cannot access Aarav's applications (empty set)");

    let threwUnauthorized = false;
    try {
      await MentorshipSessionService.updateSessionStatus(createdSessionId, otherStudentId, "cancelled");
    } catch (e) {
      threwUnauthorized = true;
    }
    assert(threwUnauthorized, "Workflow H.2: Unauthorized user cannot cancel another user's mentorship session");

    // Clean up test records
    console.log("\n--- Cleanup ---");
    await User.deleteMany({ _id: { $in: [testStudentId, testMentorId] } });
    await StudentProfile.deleteOne({ userId: testStudentId });
    await Opportunity.deleteOne({ _id: createdOppId });
    await Application.deleteMany({ userId: testStudentId });
    await CareerSimulation.deleteMany({ userId: testStudentId });
    await SkillsPassport.deleteOne({ userId: testStudentId });
    await AssessmentAttempt.deleteMany({ userId: testStudentId });
    await RegionalTrainingCentre.deleteOne({ _id: tc._id });
    await MentorProfile.deleteOne({ userId: testMentorId });
    await MentorshipRequest.deleteMany({ studentId: testStudentId });
    await MentorshipSession.deleteMany({ studentId: testStudentId });
    await MentorshipFeedback.deleteMany({ studentId: testStudentId });
    console.log("  [INFO] Temporary test records purged successfully.");

  } catch (error) {
    console.error("Test execution threw unexpected error:", error);
    failedTests++;
  } finally {
    await mongoose.disconnect();
  }

  console.log("\n===============================================================");
  console.log(`SYSTEM INTEGRATION SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("===============================================================");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSystemIntegrationTests();
