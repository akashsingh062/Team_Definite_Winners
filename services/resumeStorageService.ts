import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "resumes");

/**
 * Ensures the base storage directory exists.
 */
async function ensureDir(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err: any) {
    if (err.code !== "EEXIST") throw err;
  }
}

/**
 * Saves an uploaded PDF resume to private server storage.
 * Storage path: storage/resumes/<studentId>/<timestamp>-<hash>.pdf
 */
export async function saveResumeFile(
  studentId: string,
  originalFileName: string,
  buffer: Buffer
): Promise<{ storageKey: string; absolutePath: string }> {
  // Sanitize studentId for filesystem path safety
  const safeStudentDir = studentId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const studentDirPath = path.join(STORAGE_ROOT, safeStudentDir);
  await ensureDir(studentDirPath);

  // Generate unique randomized file key
  const randomHash = crypto.randomBytes(8).toString("hex");
  const timestamp = Date.now();
  const fileKey = `${safeStudentDir}/${timestamp}-${randomHash}.pdf`;
  const absolutePath = path.join(STORAGE_ROOT, fileKey);

  await fs.writeFile(absolutePath, buffer);

  return {
    storageKey: fileKey,
    absolutePath,
  };
}

/**
 * Retrieves a resume buffer from private server storage.
 */
export async function getResumeFile(storageKey: string): Promise<Buffer | null> {
  try {
    const absolutePath = path.join(STORAGE_ROOT, storageKey);
    // Security check: prevent directory traversal attacks
    if (!absolutePath.startsWith(STORAGE_ROOT)) {
      throw new Error("Invalid storage key: directory traversal prohibited");
    }
    return await fs.readFile(absolutePath);
  } catch (err: any) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

/**
 * Deletes a resume file from private storage.
 */
export async function deleteResumeFile(storageKey: string): Promise<boolean> {
  try {
    const absolutePath = path.join(STORAGE_ROOT, storageKey);
    if (!absolutePath.startsWith(STORAGE_ROOT)) {
      return false;
    }
    await fs.unlink(absolutePath);
    return true;
  } catch (err: any) {
    if (err.code === "ENOENT") return true;
    return false;
  }
}

