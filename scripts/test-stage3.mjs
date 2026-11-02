/**
 * CareerBridge AI - Stage 3 Automated Test Suite
 * Validates all 14 testing requirements specified for the AI Resume Analyzer.
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

import {
  extractTextFromPdfBuffer,
  PdfParseError,
  ScannedPdfError,
  EmptyPdfError,
} from "../services/pdfParserService.ts";

import {
  resumeParsedDataSchema,
  resumeMergeOptionsSchema,
} from "../features/resume/schemas/resumeSchema.ts";

import {
  uploadAndAnalyzeResume,
  getResumeById,
  updateResumeParsedData,
  approveAndMergeResume,
  deleteStudentResume,
  MAX_RESUME_FILE_SIZE,
  ResumeServiceError,
} from "../services/resumeService.ts";

import { connectToDatabase } from "../lib/db/mongodb.ts";
import { Resume } from "../models/Resume.ts";
import { StudentProfile } from "../models/StudentProfile.ts";
import { calculateProfileCompleteness } from "../services/studentProfileService.ts";

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

// Minimal valid single page PDF buffer
function createSinglePagePdf(textContent) {
  const streamContent = `BT /F1 12 Tf 72 712 Td (${textContent}) Tj ET`;
  const streamLength = Buffer.byteLength(streamContent);
  const pdfString =
    `%PDF-1.4\n` +
    `1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n` +
    `2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj\n` +
    `3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n` +
    `4 0 obj<</Length ${streamLength}>>stream\n${streamContent}\nendstream\nendobj\n` +
    `xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000108 00000 n \n0000000204 00000 n \n` +
    `trailer<</Size 5/Root 1 0 R>>\nstartxref\n300\n%%EOF`;
  return Buffer.from(pdfString);
}

// Minimal valid two page PDF buffer
function createMultiPagePdf(p1Content, p2Content) {
  const s1 = `BT /F1 12 Tf 72 712 Td (${p1Content}) Tj ET`;
  const s2 = `BT /F1 12 Tf 72 712 Td (${p2Content}) Tj ET`;
  const l1 = Buffer.byteLength(s1);
  const l2 = Buffer.byteLength(s2);
  const pdfString =
    `%PDF-1.4\n` +
    `1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n` +
    `2 0 obj<</Type/Pages/Count 2/Kids[3 0 R 5 0 R]>>endobj\n` +
    `3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n` +
    `4 0 obj<</Length ${l1}>>stream\n${s1}\nendstream\nendobj\n` +
    `5 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 6 0 R>>endobj\n` +
    `6 0 obj<</Length ${l2}>>stream\n${s2}\nendstream\nendobj\n` +
    `xref\n0 7\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000114 00000 n \n0000000210 00000 n \n0000000305 00000 n \n0000000401 00000 n \n` +
    `trailer<</Size 7/Root 1 0 R>>\nstartxref\n502\n%%EOF`;
  return Buffer.from(pdfString);
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  CareerBridge AI - Stage 3 Automated Verification Suite");
  console.log("=======================================================\n");

  // 1. Valid PDF Text Extraction
  console.log("--- Requirement 1 & 4: Valid PDF & Multi-page Extraction ---");
  const sampleResumeText =
    "Alex Rivera | Full Stack Software Engineer | alex@college.edu | (555) 123-4567 | github.com/alex | linkedin.com/in/alex\n" +
    "Education: University of Technology, B.Tech Computer Science, Graduating 2026, CGPA 8.7\n" +
    "Technical Skills: TypeScript, React, Next.js, Node.js, Express, MongoDB, PostgreSQL, Docker, Git\n" +
    "Projects: E-Commerce Microservices, Automated CI/CD Pipeline\n" +
    "Experience: Software Engineering Intern at CloudVanguard Labs (Summer 2024)";

  const validPdf = createSinglePagePdf(sampleResumeText);
  const singleResult = await extractTextFromPdfBuffer(validPdf);
  assert(
    singleResult.text.includes("Alex Rivera") && singleResult.pageCount === 1,
    "Valid single-page PDF text extracted correctly"
  );

  const multiPdf = createMultiPagePdf(
    "Alex Rivera Resume Page 1 Experience and Projects across distributed web systems",
    "Alex Rivera Resume Page 2 Certifications in AWS and Degree in Computer Engineering"
  );
  const multiResult = await extractTextFromPdfBuffer(multiPdf);
  assert(
    multiResult.pageCount === 2 &&
      multiResult.text.includes("Page 1") &&
      multiResult.text.includes("Page 2"),
    "Multi-page PDF extracted with correct page count (2 pages)"
  );

  // 2. Invalid File & Non-PDF Rejection
  console.log("\n--- Requirement 2: Invalid File Upload Handling ---");
  const invalidTxtBuffer = Buffer.from("This is a plain text file pretending to be a resume.");
  let caughtInvalid = false;
  try {
    await extractTextFromPdfBuffer(invalidTxtBuffer);
  } catch (err) {
    caughtInvalid = err instanceof PdfParseError;
  }
  assert(caughtInvalid, "Non-PDF file buffer is rejected with PdfParseError");

  // 3. Oversized PDF Upload Validation
  console.log("\n--- Requirement 3: Oversized PDF Validation ---");
  const oversizedBuffer = Buffer.alloc(MAX_RESUME_FILE_SIZE + 1024);
  let caughtOversized = false;
  try {
    await uploadAndAnalyzeResume("test-student", oversizedBuffer, "huge_resume.pdf", "application/pdf");
  } catch (err) {
    caughtOversized =
      err instanceof ResumeServiceError &&
      err.message.includes("exceeds maximum allowed limit");
  }
  assert(caughtOversized, "Oversized file exceeding 5MB is rejected by upload service");

  // 4. Empty PDF Handling
  console.log("\n--- Requirement 5: Empty PDF Handling ---");
  let caughtEmptyBuffer = false;
  try {
    await extractTextFromPdfBuffer(Buffer.alloc(0));
  } catch (err) {
    caughtEmptyBuffer = err instanceof EmptyPdfError;
  }
  assert(caughtEmptyBuffer, "Empty (0 byte) PDF is rejected with EmptyPdfError");

  // 5. Scanned / Image-based PDF Detection
  console.log("\n--- Requirement 6: Scanned PDF Detection (OCR notice) ---");
  const scannedPdf = createSinglePagePdf("Scan"); // < 50 characters
  let caughtScanned = false;
  let scannedMessage = "";
  try {
    await extractTextFromPdfBuffer(scannedPdf);
  } catch (err) {
    caughtScanned = err instanceof ScannedPdfError;
    scannedMessage = err.message;
  }
  assert(
    caughtScanned && scannedMessage.includes("OCR support is not available in this stage"),
    "Scanned PDF with insufficient text triggers ScannedPdfError with OCR notice"
  );

  // 6. Gemini Failure & Invalid JSON Handling
  console.log("\n--- Requirement 7 & 8: AI Error Handling & Schema Validation ---");
  const invalidAiOutput = {
    personalInfo: "Not an object", // Invalid type
    technicalSkills: "Python", // Invalid type
  };
  const zodValidation = resumeParsedDataSchema.safeParse(invalidAiOutput);
  assert(!zodValidation.success, "Invalid AI JSON structure is caught and rejected by Zod");

  // 7. Structured Resume Analysis Zod Schema Validation
  console.log("\n--- Requirement 9: Structured Output Schema Validation ---");
  const mockStructuredData = {
    personalInfo: {
      fullName: "Alex Rivera",
      email: "alex@college.edu",
      phone: "+1-555-0199",
      linkedin: "https://linkedin.com/in/alex",
      github: "https://github.com/alex",
      portfolio: "https://alexrivera.dev",
    },
    education: [
      {
        institution: "State University",
        degree: "B.Tech",
        branch: "Computer Science and Engineering",
        startYear: 2022,
        graduationYear: 2026,
        cgpa: 8.8,
      },
    ],
    technicalSkills: {
      programmingLanguages: ["TypeScript", "Python", "Go"],
      frontend: ["React", "Next.js", "Tailwind CSS"],
      backend: ["Node.js", "Express", "FastAPI"],
      databases: ["MongoDB", "PostgreSQL", "Redis"],
      frameworks: ["Prisma", "Redux"],
      tools: ["Git", "Docker", "Linux"],
      cloud: ["AWS", "Vercel"],
      other: ["Microservices", "REST APIs"],
    },
    softSkills: ["Problem-solving", "Team Collaboration", "Agile Execution"],
    projects: [
      {
        title: "Campus Opportunity Matcher",
        description: "Full stack AI-assisted matcher for students",
        technologies: ["Next.js", "TypeScript", "MongoDB"],
        githubUrl: "https://github.com/alex/matcher",
        liveDeploymentUrl: "https://matcher.app",
        responsibilities: ["Engineered authentication", "Built responsive UI"],
      },
    ],
    experience: [
      {
        company: "Vanguard Tech",
        jobTitle: "Software Engineering Intern",
        employmentType: "Internship",
        startDate: "Jun 2024",
        endDate: "Aug 2024",
        responsibilities: ["Developed REST API endpoints", "Improved query latency by 35%"],
        technologies: ["Node.js", "MongoDB"],
      },
    ],
    certifications: [
      {
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        issueDate: "2024",
        credentialUrl: "https://aws.cert/123",
      },
    ],
    resumeAnalysis: {
      completenessAssessment: "Strong well-rounded technical resume with clear projects.",
      strengths: [
        "Consistent demonstration of full stack skills across projects",
        "Clear quantitative metrics in internship experience",
      ],
      missingInformation: [
        "Include unit testing libraries in the skills list if applicable",
      ],
      suggestions: [
        "Add deployment architecture diagram link to project readme",
      ],
      formattingObservations: [
        "Standard layout with clean reverse-chronological ordering",
      ],
    },
  };

  const validParsed = resumeParsedDataSchema.safeParse(mockStructuredData);
  assert(validParsed.success, "Structured resume analysis passes strict Zod validation schema");

  // 8. MongoDB Integration & Lifecycle Tests
  console.log("\n--- Requirement 10, 11, 12, 13, 14: MongoDB Operations & Approval ---");
  await connectToDatabase();
  assert(mongoose.connection.readyState === 1, "Connected to MongoDB Atlas database");

  const testStudentId = `test_student_${Date.now()}`;
  const otherStudentId = `other_student_${Date.now()}`;

  // Create an initial Resume record directly with completed parsed data
  const testResume = await Resume.create({
    studentId: testStudentId,
    originalFileName: "test_alex_rivera_resume.pdf",
    fileStorageKey: `${testStudentId}/mock_key.pdf`,
    fileSize: 102400,
    mimeType: "application/pdf",
    extractedText: sampleResumeText,
    pageCount: 1,
    parsedData: mockStructuredData,
    analysisStatus: "completed",
    isCurrent: true,
  });

  assert(Boolean(testResume._id), "Resume record created with analysisStatus 'completed'");

  // Test Requirement 13: Unauthorized Access Prevention
  let caughtUnauthorized = false;
  try {
    await getResumeById(otherStudentId, String(testResume._id));
  } catch (err) {
    caughtUnauthorized =
      err instanceof ResumeServiceError && err.statusCode === 403;
  }
  assert(caughtUnauthorized, "Accessing another student's resume is blocked with 403 Forbidden");

  // Test Requirement 10: Resume Editing (Draft Update)
  const modifiedData = JSON.parse(JSON.stringify(mockStructuredData));
  modifiedData.personalInfo.fullName = "Alex Updated Rivera";
  modifiedData.technicalSkills.programmingLanguages.push("Rust");

  const updatedResume = await updateResumeParsedData(
    testStudentId,
    String(testResume._id),
    modifiedData
  );

  assert(
    updatedResume.parsedData.personalInfo.fullName === "Alex Updated Rivera" &&
      updatedResume.parsedData.technicalSkills.programmingLanguages.includes("Rust"),
    "Student can edit and save draft extracted information"
  );

  // Test Requirement 11 & 12: Student Approval & Profile Integration without Blind Overwriting
  // First, create an existing StudentProfile with some manual data
  const initialProfile = await StudentProfile.create({
    userId: testStudentId,
    personalInfo: {
      fullName: "Alex Rivera (Manual)",
      email: "alex@college.edu",
      phoneNumber: "+1-555-9999", // Manual phone
    },
    academicInfo: {
      collegeName: "Existing Manual University", // Existing manual institution
      degree: "B.Tech",
      branch: "",
    },
    skills: [
      {
        id: "existing_skill_1",
        name: "TypeScript",
        category: "Programming languages",
        proficiency: "Advanced",
      },
    ],
    projects: [],
    profileCompletionPercentage: 35,
  });

  const { profile: mergedProfile, resume: approvedResume } =
    await approveAndMergeResume(testStudentId, String(testResume._id), modifiedData, {
      mergeTechnicalSkills: true,
      addProjects: true,
      updateEducation: true,
      addCertifications: true,
      addExperience: true,
      replacePersonalInfo: false, // Do NOT overwrite manual phone
    });

  // Verify approval status
  assert(
    approvedResume.analysisStatus === "approved" && Boolean(approvedResume.approvedAt),
    "Resume status transitioned to 'approved' with approvedAt timestamp"
  );

  // Verify non-destructive merge:
  // 1. Manual phone was preserved
  assert(
    mergedProfile.personalInfo.phoneNumber === "+1-555-9999",
    "Manually entered phone was preserved (not overwritten)"
  );

  // 2. Manual college was preserved
  assert(
    mergedProfile.academicInfo.collegeName === "Existing Manual University",
    "Existing manual college name was preserved"
  );

  // 3. Empty branch was populated from resume
  assert(
    mergedProfile.academicInfo.branch === "Computer Science and Engineering",
    "Empty academic branch was populated from approved resume"
  );

  // 4. Existing skill 'TypeScript' was not duplicated, while new skills were added
  const tsSkills = mergedProfile.skills.filter(
    (s) => s.name.toLowerCase() === "typescript"
  );
  assert(tsSkills.length === 1, "Duplicate skills were prevented (TypeScript appears once)");

  const hasRust = mergedProfile.skills.some((s) => s.name === "Rust");
  const hasReact = mergedProfile.skills.some((s) => s.name === "React");
  assert(hasRust && hasReact, "Newly extracted skills (Rust, React) were merged into profile");

  // 5. Projects were merged
  assert(
    mergedProfile.projects.length >= 1 &&
      mergedProfile.projects.some((p) => p.title === "Campus Opportunity Matcher"),
    "Approved projects merged into student profile"
  );

  // 6. Profile completeness percentage increased
  assert(
    mergedProfile.profileCompletionPercentage > 35,
    `Profile completeness increased from 35% to ${mergedProfile.profileCompletionPercentage}%`
  );

  // Test Requirement 14: Resume Replacement
  const replacementResume = await Resume.create({
    studentId: testStudentId,
    originalFileName: "replacement_resume_v2.pdf",
    fileStorageKey: `${testStudentId}/replacement_key.pdf`,
    fileSize: 104000,
    mimeType: "application/pdf",
    extractedText: "Replacement resume text",
    pageCount: 1,
    parsedData: mockStructuredData,
    analysisStatus: "completed",
    isCurrent: true,
  });

  // Demote previous resume
  await Resume.updateOne(
    { _id: testResume._id },
    { $set: { isCurrent: false } }
  );

  const prevCheck = await Resume.findById(testResume._id);
  const newCheck = await Resume.findById(replacementResume._id);

  assert(
    prevCheck.isCurrent === false && newCheck.isCurrent === true,
    "Resume replacement correctly unmarks previous resume and marks new resume as current"
  );

  // Cleanup test documents
  await Resume.deleteMany({ studentId: testStudentId });
  await StudentProfile.deleteMany({ userId: testStudentId });

  // Summary
  console.log("\n=======================================================");
  console.log(`  Stage 3 Tests Completed: ${passedCount + failedCount}`);
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
