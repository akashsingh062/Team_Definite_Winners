/**
 * CareerBridge AI - Verified Digital Skills Passport Automated Verification Suite
 * Validates all testing requirements specified for Feature 2.
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
import { SkillsPassport } from "../models/SkillsPassport.ts";
import { PassportEvidence } from "../models/PassportEvidence.ts";
import { StudentProfile } from "../models/StudentProfile.ts";
import { Resume } from "../models/Resume.ts";
import { StudentSkillProgress } from "../models/StudentSkillProgress.ts";
import { User } from "../models/User.ts";

import {
  createOrGetPassport,
  syncPassportFromProfile,
  updatePassport,
  regeneratePassportPublicId,
  revokePassport,
  unrevokePassport,
  computePassportIntegrityHash,
} from "../services/passport/passport-generator.service.ts";

import {
  verifyCertification,
  isCertificationExternallyVerified,
} from "../services/passport/credential-verifier.service.ts";

import {
  classifySkillEvidence,
} from "../services/passport/evidence-classifier.service.ts";

import {
  generatePassportQRCode,
} from "../services/passport/qr-generator.service.ts";

import {
  getPublicPassport,
  getPassportVerificationReport,
} from "../services/passport/passport-public.service.ts";

import { areSkillsEquivalent } from "../services/matching/skill-normalizer.ts";

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
  console.log("  CareerBridge AI - Verified Digital Skills Passport ");
  console.log("=======================================================\n");

  await connectToDatabase();

  const testUser1Id = `test_student_pass_${Date.now()}_1`;
  const testUser2Id = `test_student_pass_${Date.now()}_2`;

  try {
    // -------------------------------------------------------------
    // Setup Mock Test Data
    // -------------------------------------------------------------
    // Create StudentProfile with projects, skills, certifications
    await StudentProfile.create({
      userId: testUser1Id,
      personalInfo: {
        fullName: "Jordan Lee",
        email: "jordan.lee@example.com",
        phoneNumber: "+1-555-0199",
      },
      academicInfo: {
        collegeName: "Stanford University",
        degree: "B.S.",
        branch: "Computer Science",
        graduationYear: 2026,
        cgpa: 9.1,
      },
      skills: [
        { id: "sk_1", name: "JavaScript", category: "Programming languages", proficiency: "Advanced" },
        { id: "sk_2", name: "Python", category: "Programming languages", proficiency: "Intermediate" },
        { id: "sk_3", name: "Solidity", category: "Other technical skills", proficiency: "Beginner" },
      ],
      projects: [
        {
          id: "p_1",
          title: "Distributed Task Queue",
          description: "High-throughput job broker with Redis & Node.js",
          technologies: ["Node.js", "Redis", "TypeScript"],
          githubUrl: "https://github.com/jordanlee/task-queue",
          liveDeploymentUrl: "https://taskqueue-demo.example.com",
        },
      ],
      additionalInfo: {
        certifications: [
          {
            id: "c_1",
            name: "AWS Certified Developer",
            issuer: "Amazon Web Services",
            issueDate: "2025-06-15",
            url: "https://www.credly.com/badges/abc-aws-developer-123",
          },
          {
            id: "c_2",
            name: "Local Hackathon Certificate",
            issuer: "College Tech Club",
            issueDate: "2024-11-10",
            url: "https://mycollege.edu/hackathon/jordan",
          },
        ],
        githubUrl: "https://github.com/jordanlee",
        linkedinUrl: "https://linkedin.com/in/jordanlee",
      },
    });

    // Create approved Resume with extracted skills
    await Resume.create({
      studentId: testUser1Id,
      originalFileName: "Jordan_Lee_Resume.pdf",
      fileStorageKey: "resumes/jordan_resume_123.pdf",
      fileSize: 1048576,
      mimeType: "application/pdf",
      analysisStatus: "approved",
      parsedData: {
        personalInfo: {
          fullName: "Jordan Lee",
          email: "jordan.lee@example.com",
        },
        education: [
          {
            institution: "Stanford University",
            degree: "B.S. in Computer Science",
            graduationYear: 2026,
            cgpa: 9.1,
          },
        ],
        technicalSkills: {
          programmingLanguages: ["JavaScript", "Python", "TypeScript"],
          frontend: ["React", "Next.js"],
          backend: ["Node.js", "Express"],
          databases: ["MongoDB", "PostgreSQL", "Redis"],
        },
        projects: [
          {
            title: "Distributed Task Queue",
            description: "High-throughput job broker with Redis & Node.js",
            technologies: ["Node.js", "Redis", "TypeScript"],
          },
        ],
      },
    });

    // Create completed skill assessment
    await StudentSkillProgress.create({
      studentId: testUser1Id,
      skillName: "Node.js",
      status: "completed",
      completedAt: new Date("2026-01-15"),
      notes: "Passed capstone verification assessment",
    });

    // -------------------------------------------------------------
    // Test 1: Passport Auto-Initialization & Public ID Generation
    // -------------------------------------------------------------
    console.log("[Test 1] Passport Auto-Initialization & Cryptographic Public ID");
    const passport1 = await createOrGetPassport(testUser1Id);
    assert(passport1 !== null, "Passport document initialized successfully");
    assert(typeof passport1.publicId === "string", "Public ID is a valid string");
    assert(passport1.publicId.startsWith("csp_"), `Public ID uses secure 'csp_' prefix: ${passport1.publicId}`);
    assert(passport1.publicId.length >= 28, "Public ID has high cryptographic entropy");
    assert(passport1.displayName === "Jordan Lee", "Display name synced from StudentProfile");
    assert(passport1.visibility === "public", "Default visibility is 'public'");
    assert(passport1.isRevoked === false, "Newly created passport is not revoked");

    // -------------------------------------------------------------
    // Test 2: Public Identifier Security & URL Safety
    // -------------------------------------------------------------
    console.log("\n[Test 2] Public Identifier Security & URL Safety");
    const passport2 = await createOrGetPassport(testUser2Id);
    assert(passport1.publicId !== passport2.publicId, "Public IDs are strictly unique across distinct students");
    assert(!passport1.publicId.includes(testUser1Id), "Public ID does NOT leak internal student userId");
    assert(!passport1.publicId.includes(passport1._id.toString()), "Public ID does NOT leak MongoDB ObjectId");
    assert(/^[a-zA-Z0-9_-]+$/.test(passport1.publicId), "Public ID contains only URL-safe alphanumeric characters");

    // -------------------------------------------------------------
    // Test 3: 5-Tier Skill Evidence Classification
    // -------------------------------------------------------------
    console.log("\n[Test 3] 5-Tier Skill Evidence Classification");
    const skills = passport1.skills;
    assert(skills.length > 0, `Passport contains ${skills.length} classified skills`);

    // Node.js should be assessment_verified (due to completed StudentSkillProgress)
    const nodeSkill = skills.find((s) => areSkillsEquivalent(s.name, "Node.js"));
    assert(nodeSkill !== undefined, "Skill 'Node.js' found in passport");
    assert(nodeSkill.evidenceType === "assessment_verified", `Node.js classified as 'assessment_verified' (Actual: ${nodeSkill.evidenceType})`);
    assert(nodeSkill.verificationStatus === "verified", "Assessment verified skill marked as 'verified'");
    assert(nodeSkill.issuingSource.includes("Assessment Engine"), "Assessment verified issuing source stamped");

    // Redis should be project_demonstrated (used in project, not in completed assessments)
    const redisSkill = skills.find((s) => areSkillsEquivalent(s.name, "Redis"));
    assert(redisSkill !== undefined, "Skill 'Redis' found in passport");
    assert(redisSkill.evidenceType === "project_demonstrated", `Redis classified as 'project_demonstrated' (Actual: ${redisSkill.evidenceType})`);
    assert(redisSkill.evidenceReference.includes("Distributed Task Queue"), "Project evidence references associated project title");

    // React should be resume_extracted (present in approved resume, not in projects or profile)
    const reactSkill = skills.find((s) => areSkillsEquivalent(s.name, "React"));
    assert(reactSkill !== undefined, "Skill 'React' found in passport");
    assert(reactSkill.evidenceType === "resume_extracted", `React classified as 'resume_extracted' (Actual: ${reactSkill.evidenceType})`);

    // Solidity should be self_reported (only in profile, not in resume, projects, or assessments)
    const soliditySkill = skills.find((s) => areSkillsEquivalent(s.name, "Solidity"));
    assert(soliditySkill !== undefined, "Skill 'Solidity' found in passport");
    assert(soliditySkill.evidenceType === "self_reported", `Solidity classified as 'self_reported' (Actual: ${soliditySkill.evidenceType})`);
    assert(soliditySkill.verificationStatus === "unverified", "Self-reported skill marked as 'unverified'");

    // AWS Certified Developer should verify AWS skill or externally verified cert
    const certSkills = passport1.certifications;
    assert(certSkills.length > 0, "Certifications imported into passport");

    // -------------------------------------------------------------
    // Test 4: Certificate Verification & No-Fabrication Invariant
    // -------------------------------------------------------------
    console.log("\n[Test 4] Certificate Verification & Invariants");
    const verifiedCert = certSkills.find((c) => c.name.includes("AWS"));
    assert(verifiedCert !== undefined, "AWS certification found");
    assert(verifiedCert.verificationStatus === "verified", `Authentic Credly URL marked as 'verified' (Actual: ${verifiedCert.verificationStatus})`);
    assert(verifiedCert.verificationMethod === "issuer_url_check", "Verification method stamped 'issuer_url_check'");

    const unverifiedCert = certSkills.find((c) => c.name.includes("Hackathon"));
    assert(unverifiedCert !== undefined, "Local Hackathon certificate found");
    assert(unverifiedCert.verificationStatus === "student_provided", `Unintegrated issuer marked as 'student_provided' without fabrication (Actual: ${unverifiedCert.verificationStatus})`);

    // Test expiration check
    const expiredCertTest = verifyCertification({
      id: "c_exp",
      name: "Expired Security Cert",
      issuingOrganization: "Security Org",
      issueDate: "2020-01-01",
      expirationDate: "2022-01-01", // Past date
      credentialUrl: "https://www.credly.com/badges/expired-badge",
      verificationStatus: "student_provided",
    });
    assert(expiredCertTest.verificationStatus === "expired", "Expired certification detected and marked 'expired'");

    // Test malformed URL resilience
    const malformedCertTest = verifyCertification({
      id: "c_mal",
      name: "Malformed Cert",
      issuingOrganization: "Unknown",
      issueDate: "2025-01-01",
      credentialUrl: "invalid-url-not-http",
      verificationStatus: "student_provided",
    });
    assert(malformedCertTest.verificationStatus === "student_provided", "Malformed credential URL safely handled without throwing");

    // -------------------------------------------------------------
    // Test 5: Project Portfolio & Evidence Integrity
    // -------------------------------------------------------------
    console.log("\n[Test 5] Project Portfolio & Link Validation");
    const passportProjects = passport1.projects;
    assert(passportProjects.length > 0, "Projects imported into passport");
    const queueProj = passportProjects.find((p) => p.title === "Distributed Task Queue");
    assert(queueProj !== undefined, "Distributed Task Queue project found");
    assert(queueProj.githubUrl === "https://github.com/jordanlee/task-queue", "GitHub URL preserved");
    assert(queueProj.evidenceStatus === "project_demonstrated", "Project evidence status is 'project_demonstrated'");
    assert(queueProj.evidenceStatus !== "externally_verified", "Strict Invariant: GitHub link is NEVER claimed as externally verified");

    // -------------------------------------------------------------
    // Test 6: Privacy Protection & Data Allowlisting
    // -------------------------------------------------------------
    console.log("\n[Test 6] Privacy Protection & Data Allowlisting");
    const publicResult = await getPublicPassport(passport1.publicId, false);
    assert(publicResult.passport !== undefined, "Public passport view retrieved successfully");
    const pub = publicResult.passport;

    // Check allowlisting
    assert(pub.publicId === passport1.publicId, "Public ID matches");
    assert(pub.displayName === "Jordan Lee", "Display name present");
    assert(pub["userId"] === undefined, "Strict Invariant: userId is NOT leaked in public payload");
    assert(pub["_id"] === undefined, "Strict Invariant: MongoDB _id is NOT leaked in public payload");
    assert(pub["__v"] === undefined, "Strict Invariant: Internal Mongoose version is NOT leaked");
    assert(pub["phoneNumber"] === undefined, "Strict Invariant: Phone number is quarantined and NOT exposed");
    assert(pub["email"] === undefined, "Strict Invariant: Email is quarantined and NOT exposed");
    assert(pub["fileStorageKey"] === undefined, "Strict Invariant: Resume storage keys are NOT exposed");

    // -------------------------------------------------------------
    // Test 7: Section Visibility Filtering
    // -------------------------------------------------------------
    console.log("\n[Test 7] Section Visibility Filtering");
    // By default, visibleSections.contact is false
    assert(pub.portfolioLinks === undefined, "Default privacy: Portfolio handles are hidden when contact is false");

    // Update passport to hide projects and enable contact
    await updatePassport(testUser1Id, {
      visibleSections: {
        skills: true,
        projects: false, // Hide projects
        certifications: true,
        education: true,
        assessments: true,
        contact: true, // Show contact handles
      },
    });

    const updatedPublic = await getPublicPassport(passport1.publicId, false);
    assert(updatedPublic.passport.projects === undefined, "Projects section omitted from public view when visibleSections.projects is false");
    assert(updatedPublic.passport.portfolioLinks !== undefined, "Portfolio handles included when visibleSections.contact is true");
    assert(updatedPublic.passport.portfolioLinks.github === "https://github.com/jordanlee", "GitHub handle exposed under contact");
    assert(updatedPublic.passport.skills !== undefined, "Skills section preserved when enabled");

    // Restore projects visibility
    await updatePassport(testUser1Id, {
      visibleSections: {
        skills: true,
        projects: true,
        certifications: true,
        education: true,
        assessments: true,
        contact: false,
      },
    });

    // -------------------------------------------------------------
    // Test 8: Public Link Revocation
    // -------------------------------------------------------------
    console.log("\n[Test 8] Public Link Revocation");
    await revokePassport(testUser1Id);

    const revokedPublic = await getPublicPassport(passport1.publicId, false);
    assert(revokedPublic.error === "REVOKED", "Revoked passport returns error: 'REVOKED'");
    assert(revokedPublic.passport === undefined, "Zero profile data returned for revoked passport");
    assert(revokedPublic.revokedAt !== null, "Revocation timestamp recorded");

    const reportRevoked = await getPassportVerificationReport(passport1.publicId);
    assert(reportRevoked.authenticityStatus === "revoked", "Verification report marks status as 'revoked'");
    assert(reportRevoked.evidenceBreakdown.assessmentVerified === 0, "Evidence counts zeroed out when revoked");

    // Unrevoke for subsequent tests
    await unrevokePassport(testUser1Id);
    const unrevokedPublic = await getPublicPassport(passport1.publicId, false);
    assert(unrevokedPublic.passport !== undefined, "Unrevoking passport reactivates public visibility");

    // -------------------------------------------------------------
    // Test 9: Public Link Regeneration
    // -------------------------------------------------------------
    console.log("\n[Test 9] Public Link Regeneration");
    const oldPublicId = passport1.publicId;
    const regenResult = await regeneratePassportPublicId(testUser1Id);

    assert(regenResult.newPublicId !== oldPublicId, "Regenerated public ID is different from old ID");
    assert(regenResult.newPublicId.startsWith("csp_"), "New public ID retains 'csp_' prefix");

    // Old public ID should now return NOT_FOUND
    const oldCheck = await getPublicPassport(oldPublicId, false);
    assert(oldCheck.error === "NOT_FOUND", "Old public link is immediately invalidated and returns NOT_FOUND");

    // New public ID should resolve cleanly
    const newCheck = await getPublicPassport(regenResult.newPublicId, false);
    assert(newCheck.passport !== undefined, "New public link successfully resolves the passport");
    assert(newCheck.passport.publicId === regenResult.newPublicId, "New public link matches generated public ID");

    // -------------------------------------------------------------
    // Test 10: QR Code Generation
    // -------------------------------------------------------------
    console.log("\n[Test 10] QR Code Generation");
    const qrResult = await generatePassportQRCode(regenResult.newPublicId, "https://careerbridge.ai");
    assert(typeof qrResult.dataUrl === "string", "QR DataURL generated");
    assert(qrResult.dataUrl.startsWith("data:image/png;base64,"), "QR DataURL has valid PNG base64 header");
    assert(typeof qrResult.svg === "string", "QR SVG string generated");
    assert(qrResult.svg.includes("<svg"), "QR SVG string contains valid XML SVG tags");
    assert(qrResult.targetUrl === `https://careerbridge.ai/passport/${regenResult.newPublicId}`, "Target URL points to passport public route");

    // -------------------------------------------------------------
    // Test 11: Verification Report & Cryptographic Integrity Hash
    // -------------------------------------------------------------
    console.log("\n[Test 11] Verification Report & Cryptographic Integrity Hash");
    const report = await getPassportVerificationReport(regenResult.newPublicId);
    assert(report.authenticityStatus === "authentic", "Authenticity status is 'authentic'");
    assert(report.studentDisplayName === "Jordan Lee", "Candidate display name in verification report");
    assert(typeof report.integrityHash === "string" && report.integrityHash.length === 64, `Valid SHA-256 integrity hash: ${report.integrityHash.slice(0, 16)}...`);
    assert(report.evidenceBreakdown.assessmentVerified >= 1, `Assessment verified count tracked: ${report.evidenceBreakdown.assessmentVerified}`);
    assert(report.evidenceBreakdown.projectDemonstrated >= 1, `Project demonstrated count tracked: ${report.evidenceBreakdown.projectDemonstrated}`);
    assert(report.evidenceBreakdown.externallyVerifiedCerts >= 1, `Verified certifications count tracked: ${report.evidenceBreakdown.externallyVerifiedCerts}`);
    assert(
      report.platformAttestation.issuingPlatform.includes("NexSkill AI") ||
      report.platformAttestation.issuingPlatform.includes("CareerBridge AI"),
      "Official platform attestation seal present"
    );
    assert(report.verificationDisclaimer.length > 50, "Clear verification scope and limitations disclaimer present");

    // -------------------------------------------------------------
    // Test 12: Student Data Isolation & Privacy Invariants
    // -------------------------------------------------------------
    console.log("\n[Test 12] Student Data Isolation & Privacy Invariants");
    const user2Passport = await createOrGetPassport(testUser2Id);
    assert(user2Passport.userId === testUser2Id, "Student 2 passport belongs to Student 2");
    assert(user2Passport.userId !== passport1.userId, "Student 1 and Student 2 passports have distinct user IDs");

    // Ensure updating user 2 does not affect user 1
    await updatePassport(testUser2Id, { headline: "Cybersecurity Specialist" });
    const user1Fresh = await SkillsPassport.findOne({ userId: testUser1Id });
    assert(user1Fresh.headline !== "Cybersecurity Specialist", "Student 2 updates do NOT mutate Student 1 passport");

    // Cleanup test records
    await SkillsPassport.deleteMany({ userId: { $in: [testUser1Id, testUser2Id] } });
    await PassportEvidence.deleteMany({ userId: { $in: [testUser1Id, testUser2Id] } });
    await StudentProfile.deleteMany({ userId: { $in: [testUser1Id, testUser2Id] } });
    await Resume.deleteMany({ studentId: testUser1Id });
    await StudentSkillProgress.deleteMany({ studentId: testUser1Id });

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

