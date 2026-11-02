import { connectToDatabase } from "@/lib/db/mongodb";
import { Resume } from "@/models/Resume";
import { StudentProfile } from "@/models/StudentProfile";
import {
  extractTextFromPdfBuffer,
  ScannedPdfError,
  EmptyPdfError,
  PdfParseError,
} from "./pdfParserService";
import {
  saveResumeFile,
  deleteResumeFile,
} from "./resumeStorageService";
import {
  analyzeResumeWithGemini,
  ResumeAnalyzerError,
} from "./resume-analyzer.service";
import {
  resumeParsedDataSchema,
  resumeMergeOptionsSchema,
  ResumeMergeOptionsInput,
} from "@/features/resume/schemas/resumeSchema";
import { IResume, IResumeParsedData } from "@/types/resume";
import { IStudentProfile, ITechnicalSkill, IProjectItem } from "@/types/student";
import { calculateProfileCompleteness } from "./studentProfileService";
import crypto from "node:crypto";

export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export class ResumeServiceError extends Error {
  constructor(message: string, public readonly statusCode = 400) {
    super(message);
    this.name = "ResumeServiceError";
  }
}

/**
 * Maps granular technical skill category from resume parsing to StudentProfile category enum.
 */
function mapToStudentSkillCategory(
  categoryKey: string
): ITechnicalSkill["category"] {
  switch (categoryKey) {
    case "programmingLanguages":
      return "Programming languages";
    case "frontend":
      return "Frontend technologies";
    case "backend":
      return "Backend technologies";
    case "databases":
      return "Databases";
    case "tools":
      return "Development tools";
    default:
      return "Other technical skills";
  }
}

/**
 * Uploads a PDF resume, parses its text, runs Gemini AI analysis, and persists the record.
 */
export async function uploadAndAnalyzeResume(
  studentId: string,
  buffer: Buffer,
  originalFileName: string,
  mimeType: string
): Promise<IResume> {
  await connectToDatabase();

  // 1. File size validation
  if (!buffer || buffer.length === 0) {
    throw new ResumeServiceError("Uploaded file is empty (0 bytes).", 400);
  }
  if (buffer.length > MAX_RESUME_FILE_SIZE) {
    throw new ResumeServiceError(
      `File size exceeds maximum allowed limit of 5 MB (Received ${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`,
      400
    );
  }

  // 2. MIME type validation
  const lowerMime = (mimeType || "").toLowerCase();
  const lowerName = (originalFileName || "").toLowerCase();
  if (
    lowerMime !== "application/pdf" &&
    !lowerName.endsWith(".pdf")
  ) {
    throw new ResumeServiceError(
      "Only PDF files (.pdf) are permitted. Please upload a valid PDF document.",
      400
    );
  }

  // 3. Save to private server storage
  const { storageKey } = await saveResumeFile(
    studentId,
    originalFileName,
    buffer
  );

  // 4. Extract text from PDF
  let extractedText = "";
  let pageCount = 1;
  try {
    const pdfResult = await extractTextFromPdfBuffer(buffer);
    extractedText = pdfResult.text;
    pageCount = pdfResult.pageCount;
  } catch (err: any) {
    // If text extraction fails, still track the failed resume in DB for student feedback
    await Resume.updateMany(
      { studentId, isCurrent: true },
      { $set: { isCurrent: false } }
    );

    const failedResume = await Resume.create({
      studentId,
      originalFileName,
      fileStorageKey: storageKey,
      fileSize: buffer.length,
      mimeType: "application/pdf",
      extractedText: "",
      pageCount: 1,
      analysisStatus: "failed",
      errorMessage: err.message || "Failed to extract text from PDF document.",
      isCurrent: true,
      parsedData: {
        personalInfo: { fullName: "", email: "", phone: "", linkedin: "", github: "", portfolio: "" },
        education: [],
        technicalSkills: { programmingLanguages: [], frontend: [], backend: [], databases: [], frameworks: [], tools: [], cloud: [], other: [] },
        softSkills: [],
        projects: [],
        experience: [],
        certifications: [],
        resumeAnalysis: { strengths: [], missingInformation: [], suggestions: [], formattingObservations: [] },
      },
    });

    if (err instanceof ScannedPdfError) {
      throw new ResumeServiceError(
        "Text extraction is insufficient. This resume appears to be a scanned image-based PDF. OCR support is not available in this stage.",
        422
      );
    }
    if (err instanceof EmptyPdfError) {
      throw new ResumeServiceError(
        "The uploaded PDF document contains no readable text.",
        400
      );
    }
    throw new ResumeServiceError(
      `PDF parsing failed: ${err.message}`,
      400
    );
  }

  // 5. Run Gemini AI analysis
  let parsedData: IResumeParsedData;
  try {
    parsedData = await analyzeResumeWithGemini(extractedText);
  } catch (aiErr: any) {
    // Unmark prior current resumes
    await Resume.updateMany(
      { studentId, isCurrent: true },
      { $set: { isCurrent: false } }
    );

    await Resume.create({
      studentId,
      originalFileName,
      fileStorageKey: storageKey,
      fileSize: buffer.length,
      mimeType: "application/pdf",
      extractedText,
      pageCount,
      analysisStatus: "failed",
      errorMessage: `AI Analysis failed: ${aiErr.message}`,
      isCurrent: true,
      parsedData: {
        personalInfo: { fullName: "", email: "", phone: "", linkedin: "", github: "", portfolio: "" },
        education: [],
        technicalSkills: { programmingLanguages: [], frontend: [], backend: [], databases: [], frameworks: [], tools: [], cloud: [], other: [] },
        softSkills: [],
        projects: [],
        experience: [],
        certifications: [],
        resumeAnalysis: { strengths: [], missingInformation: [], suggestions: [], formattingObservations: [] },
      },
    });

    throw new ResumeServiceError(
      `AI analysis failed: ${aiErr.message}`,
      502
    );
  }

  // 6. Demote any previous current resume and save completed resume
  await Resume.updateMany(
    { studentId, isCurrent: true },
    { $set: { isCurrent: false } }
  );

  const resume = await Resume.create({
    studentId,
    originalFileName,
    fileStorageKey: storageKey,
    fileSize: buffer.length,
    mimeType: "application/pdf",
    extractedText,
    pageCount,
    parsedData,
    analysisStatus: "completed",
    isCurrent: true,
  });

  return resume.toObject();
}

/**
 * Retrieves the current active resume for a student.
 */
export async function getStudentCurrentResume(
  studentId: string
): Promise<IResume | null> {
  await connectToDatabase();
  const resume = await Resume.findOne({ studentId, isCurrent: true }).lean();
  return (resume as unknown as IResume) || null;
}

/**
 * Retrieves a resume by ID, verifying student authorization.
 */
export async function getResumeById(
  studentId: string,
  resumeId: string
): Promise<IResume> {
  await connectToDatabase();
  const resume = await Resume.findById(resumeId).lean();
  if (!resume) {
    throw new ResumeServiceError("Resume record not found.", 404);
  }
  if (resume.studentId !== studentId) {
    throw new ResumeServiceError(
      "Unauthorized: You cannot access another student's resume.",
      403
    );
  }
  return resume as unknown as IResume;
}

/**
 * Updates draft extracted data on a resume after student edits.
 */
export async function updateResumeParsedData(
  studentId: string,
  resumeId: string,
  updatedData: unknown
): Promise<IResume> {
  await connectToDatabase();

  const validated = resumeParsedDataSchema.parse(updatedData);

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new ResumeServiceError("Resume record not found.", 404);
  }
  if (resume.studentId !== studentId) {
    throw new ResumeServiceError("Unauthorized to modify this resume.", 403);
  }

  resume.parsedData = validated as IResumeParsedData;
  if (resume.analysisStatus === "failed") {
    resume.analysisStatus = "completed";
  }
  await resume.save();

  return resume.toObject();
}

/**
 * Approves extracted resume data and safely merges it into the StudentProfile.
 * Does NOT overwrite existing non-empty fields without consent.
 */
export async function approveAndMergeResume(
  studentId: string,
  resumeId: string,
  approvedData?: unknown,
  optionsInput?: unknown
): Promise<{ profile: IStudentProfile; resume: IResume }> {
  await connectToDatabase();

  const resume = await Resume.findById(resumeId);
  if (!resume) {
    throw new ResumeServiceError("Resume record not found.", 404);
  }
  if (resume.studentId !== studentId) {
    throw new ResumeServiceError("Unauthorized: You do not own this resume.", 403);
  }

  // Parse options
  const mergeOptions: ResumeMergeOptionsInput = resumeMergeOptionsSchema.parse(
    optionsInput || {}
  );

  // If new approved data was submitted during approval, update it first
  if (approvedData) {
    const validatedData = resumeParsedDataSchema.parse(approvedData);
    resume.parsedData = validatedData as IResumeParsedData;
  }

  const data = resume.parsedData;

  // Retrieve or create StudentProfile
  let profile = await StudentProfile.findOne({ userId: studentId });
  if (!profile) {
    profile = new StudentProfile({
      userId: studentId,
      personalInfo: {
        fullName: data.personalInfo.fullName || "Student",
        email: data.personalInfo.email || "",
        phoneNumber: data.personalInfo.phone || "",
      },
      academicInfo: {},
      skills: [],
      projects: [],
      careerPreferences: {},
      additionalInfo: { certifications: [], experience: [] },
    });
  }

  // 1. Technical Skills Merge (preserve existing, prevent duplicates)
  if (mergeOptions.mergeTechnicalSkills && data.technicalSkills) {
    const existingSkillNames = new Set(
      profile.skills.map((s) => s.name.trim().toLowerCase())
    );

    const categories = Object.keys(data.technicalSkills) as Array<
      keyof typeof data.technicalSkills
    >;

    for (const catKey of categories) {
      const skillsInCat = data.technicalSkills[catKey] || [];
      const studentCat = mapToStudentSkillCategory(catKey);

      for (const rawSkill of skillsInCat) {
        const trimmed = rawSkill.trim();
        if (trimmed && !existingSkillNames.has(trimmed.toLowerCase())) {
          profile.skills.push({
            id: crypto.randomUUID(),
            name: trimmed,
            category: studentCat,
            proficiency: "Intermediate",
          });
          existingSkillNames.add(trimmed.toLowerCase());
        }
      }
    }
  }

  // 2. Projects Merge (add non-duplicate projects)
  if (mergeOptions.addProjects && data.projects && data.projects.length > 0) {
    const existingProjectTitles = new Set(
      profile.projects.map((p) => p.title.trim().toLowerCase())
    );

    for (const proj of data.projects) {
      const titleTrimmed = proj.title?.trim();
      if (titleTrimmed && !existingProjectTitles.has(titleTrimmed.toLowerCase())) {
        profile.projects.push({
          id: crypto.randomUUID(),
          title: titleTrimmed,
          description: proj.description?.trim() || "Project description",
          technologies: proj.technologies || [],
          githubUrl: proj.githubUrl || "",
          liveDeploymentUrl: proj.liveDeploymentUrl || "",
        });
        existingProjectTitles.add(titleTrimmed.toLowerCase());
      }
    }
  }

  // 3. Education Merge (fill empty academic info)
  if (mergeOptions.updateEducation && data.education && data.education.length > 0) {
    const primaryEdu = data.education[0];
    if (primaryEdu) {
      if (!profile.academicInfo.collegeName?.trim() && primaryEdu.institution) {
        profile.academicInfo.collegeName = primaryEdu.institution;
      }
      if (!profile.academicInfo.degree?.trim() && primaryEdu.degree) {
        profile.academicInfo.degree = primaryEdu.degree;
      }
      if (!profile.academicInfo.branch?.trim() && primaryEdu.branch) {
        profile.academicInfo.branch = primaryEdu.branch;
      }
      if (!profile.academicInfo.graduationYear && primaryEdu.graduationYear) {
        const gradYearNum = Number(primaryEdu.graduationYear);
        if (!isNaN(gradYearNum) && gradYearNum > 1900 && gradYearNum < 2100) {
          profile.academicInfo.graduationYear = gradYearNum;
        }
      }
      if (profile.academicInfo.cgpa === undefined && primaryEdu.cgpa) {
        const cgpaNum = Number(primaryEdu.cgpa);
        if (!isNaN(cgpaNum) && cgpaNum >= 0 && cgpaNum <= 10) {
          profile.academicInfo.cgpa = cgpaNum;
        }
      }
    }
  }

  // 4. Certifications Merge
  if (mergeOptions.addCertifications && data.certifications && data.certifications.length > 0) {
    if (!profile.additionalInfo) {
      profile.additionalInfo = { certifications: [], experience: [], linkedinUrl: "", githubUrl: "" };
    }
    const existingCerts = new Set(
      (profile.additionalInfo.certifications || []).map((c) => c.name.trim().toLowerCase())
    );

    for (const cert of data.certifications) {
      const certName = cert.name?.trim();
      if (certName && !existingCerts.has(certName.toLowerCase())) {
        profile.additionalInfo.certifications.push({
          id: crypto.randomUUID(),
          name: certName,
          issuer: cert.issuer || "",
          issueDate: cert.issueDate || "",
          url: cert.credentialUrl || "",
        });
        existingCerts.add(certName.toLowerCase());
      }
    }
  }

  // 5. Experience Merge
  if (mergeOptions.addExperience && data.experience && data.experience.length > 0) {
    if (!profile.additionalInfo) {
      profile.additionalInfo = { certifications: [], experience: [], linkedinUrl: "", githubUrl: "" };
    }
    const existingExpKeys = new Set(
      (profile.additionalInfo.experience || []).map(
        (e) => `${e.role.trim().toLowerCase()}@${e.company.trim().toLowerCase()}`
      )
    );

    for (const exp of data.experience) {
      const role = exp.jobTitle?.trim();
      const company = exp.company?.trim();
      const expKey = `${role.toLowerCase()}@${company.toLowerCase()}`;

      if (role && company && !existingExpKeys.has(expKey)) {
        profile.additionalInfo.experience.push({
          id: crypto.randomUUID(),
          role,
          company,
          duration: `${exp.startDate || ""} - ${exp.endDate || ""}`.trim(),
          description: (exp.responsibilities || []).join(". "),
        });
        existingExpKeys.add(expKey);
      }
    }
  }

  // 6. Personal Info (Only if explicitly requested to replace)
  if (mergeOptions.replacePersonalInfo && data.personalInfo) {
    if (data.personalInfo.phone && !profile.personalInfo.phoneNumber) {
      profile.personalInfo.phoneNumber = data.personalInfo.phone;
    }
    if (data.personalInfo.linkedin && !profile.additionalInfo?.linkedinUrl) {
      profile.additionalInfo.linkedinUrl = data.personalInfo.linkedin;
    }
    if (data.personalInfo.github && !profile.additionalInfo?.githubUrl) {
      profile.additionalInfo.githubUrl = data.personalInfo.github;
    }
  }

  // Recalculate profile completion score
  profile.profileCompletionPercentage = calculateProfileCompleteness(profile);

  await profile.save();

  // Mark resume as approved
  resume.analysisStatus = "approved";
  resume.approvedAt = new Date();
  await resume.save();

  return {
    profile: profile.toObject(),
    resume: resume.toObject(),
  };
}

/**
 * Deletes a student's resume document and private storage file.
 */
export async function deleteStudentResume(
  studentId: string,
  resumeId?: string
): Promise<boolean> {
  await connectToDatabase();

  const query = resumeId
    ? { _id: resumeId, studentId }
    : { studentId, isCurrent: true };

  const resume = await Resume.findOne(query);
  if (!resume) {
    return false;
  }

  // Delete private file from disk
  if (resume.fileStorageKey) {
    await deleteResumeFile(resume.fileStorageKey);
  }

  await Resume.deleteOne({ _id: resume._id });

  // If this was the current resume, promote the most recent remaining completed resume if any
  if (resume.isCurrent) {
    const latestRemaining = await Resume.findOne({ studentId }).sort({ createdAt: -1 });
    if (latestRemaining) {
      latestRemaining.isCurrent = true;
      await latestRemaining.save();
    }
  }

  return true;
}

