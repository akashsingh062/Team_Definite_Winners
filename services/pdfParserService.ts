import path from "node:path";
import { pathToFileURL } from "node:url";
import { existsSync, copyFileSync } from "node:fs";
import { PDFParse } from "pdf-parse";

export class PdfParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfParseError";
  }
}

export class ScannedPdfError extends Error {
  constructor(
    message = "Text extraction is insufficient. This resume appears to be a scanned image-based PDF. OCR support is not available in this stage."
  ) {
    super(message);
    this.name = "ScannedPdfError";
  }
}

export class EmptyPdfError extends Error {
  constructor(message = "The uploaded PDF document contains no readable text.") {
    super(message);
    this.name = "EmptyPdfError";
  }
}

export interface ExtractedPdfData {
  text: string;
  pageCount: number;
  wordCount: number;
}

/**
 * Configure worker path for pdf-parse / pdfjs-dist in Next.js Turbopack and Node environments.
 */
let workerConfigured = false;
function initPdfWorker() {
  if (workerConfigured) return;
  try {
    const workerCandidates = [
      path.resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
      path.resolve(process.cwd(), "node_modules/pdf-parse/dist/worker/pdf.worker.mjs"),
      path.resolve(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs"),
    ];

    let foundWorkerPath: string | null = null;
    for (const c of workerCandidates) {
      if (existsSync(/*turbopackIgnore: true*/ c)) {
        foundWorkerPath = c;
        break;
      }
    }

    if (foundWorkerPath) {
      const workerUrl = pathToFileURL(foundWorkerPath).href;
      if (typeof (PDFParse as any).setWorker === "function") {
        (PDFParse as any).setWorker(workerUrl);
      }

      // Also ensure worker is present in Next.js server chunks directory to satisfy any relative resolution
      const chunkDirs = [
        path.resolve(process.cwd(), ".next/dev/server/chunks"),
        path.resolve(process.cwd(), ".next/server/chunks"),
      ];
      for (const dir of chunkDirs) {
        if (existsSync(/*turbopackIgnore: true*/ dir)) {
          const dest = path.join(dir, "pdf.worker.mjs");
          if (!existsSync(/*turbopackIgnore: true*/ dest)) {
            try {
              copyFileSync(foundWorkerPath, dest);
            } catch {
              // Ignore copy error if read-only
            }
          }
        }
      }
    }
    workerConfigured = true;
  } catch (err) {
    console.warn("[pdfParserService] Note on worker initialization:", err);
  }
}

/**
 * Fallback lightweight text extraction from PDF raw stream tokens
 * in case the worker fails to spawn in sandboxed environments.
 */
function extractTextFromRawPdfBuffer(buffer: Buffer): string {
  try {
    const raw = buffer.toString("latin1");
    let extracted = "";

    // Extract text in parenthesis: (Hello World) Tj
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match: RegExpExecArray | null;
    while ((match = tjRegex.exec(raw)) !== null) {
      if (match[1]) {
        extracted += match[1].replace(/\\([()\\])/g, "$1") + " ";
      }
    }

    // Extract text in brackets: [(Hello) 20 (World)] TJ
    const bracketRegex = /\[(.*?)\]\s*TJ/g;
    while ((match = bracketRegex.exec(raw)) !== null) {
      const inner = match[1];
      const partRegex = /\(([^)]+)\)/g;
      let partMatch: RegExpExecArray | null;
      while ((partMatch = partRegex.exec(inner)) !== null) {
        if (partMatch[1]) {
          extracted += partMatch[1].replace(/\\([()\\])/g, "$1") + " ";
        }
      }
    }

    return extracted.replace(/\s+/g, " ").trim();
  } catch {
    return "";
  }
}

/**
 * Validates and extracts text from a PDF Buffer.
 * Supports multi-page PDFs and detects scanned/image-based documents.
 */
export async function extractTextFromPdfBuffer(
  buffer: Buffer
): Promise<ExtractedPdfData> {
  if (!buffer || buffer.length === 0) {
    throw new EmptyPdfError("Uploaded PDF file is empty (0 bytes).");
  }

  // Validate PDF magic number (%PDF-)
  const magic = buffer.subarray(0, 5).toString("utf-8");
  if (!magic.startsWith("%PDF")) {
    throw new PdfParseError(
      "Invalid file format. The file is not a valid PDF document."
    );
  }

  initPdfWorker();

  let parser: any = null;
  try {
    parser = new PDFParse({ data: buffer, verbosity: 0 });
    const textResult = await parser.getText();
    const totalPages = textResult.total || 1;
    const rawText = textResult.text || "";

    // Clean text by removing page divider markers e.g. "-- 1 of 2 --"
    const cleanedText = rawText
      .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
      .trim();

    // Check for empty text
    if (!cleanedText || cleanedText.length === 0) {
      // Try raw stream extraction before declaring empty
      const rawFallback = extractTextFromRawPdfBuffer(buffer);
      if (rawFallback && rawFallback.length >= 50) {
        const fallbackWords = rawFallback.split(/\s+/).filter((w) => w.length > 0);
        return {
          text: rawFallback,
          pageCount: totalPages,
          wordCount: fallbackWords.length,
        };
      }
      throw new EmptyPdfError();
    }

    // Word count calculation
    const words = cleanedText.split(/\s+/).filter((w: string) => w.length > 0);

    // Scanned PDF detection:
    // If the document has pages but text is fewer than 50 characters or fewer than 10 words,
    // it is virtually certainly a scanned image/rasterized document.
    if (cleanedText.length < 50 || words.length < 10) {
      throw new ScannedPdfError();
    }

    return {
      text: cleanedText,
      pageCount: totalPages,
      wordCount: words.length,
    };
  } catch (err: any) {
    if (
      err instanceof ScannedPdfError ||
      err instanceof EmptyPdfError ||
      err instanceof PdfParseError
    ) {
      throw err;
    }

    // Try raw fallback if parser threw an internal worker error
    const rawFallback = extractTextFromRawPdfBuffer(buffer);
    if (rawFallback && rawFallback.length >= 50) {
      const fallbackWords = rawFallback.split(/\s+/).filter((w) => w.length > 0);
      return {
        text: rawFallback,
        pageCount: 1,
        wordCount: fallbackWords.length,
      };
    }

    // Handle pdf-parse internal exceptions (corrupted, password protected, etc.)
    throw new PdfParseError(
      `Failed to parse PDF document: ${err.message || "Unknown PDF parsing error"}`
    );
  } finally {
    if (parser && typeof parser.destroy === "function") {
      try {
        await parser.destroy();
      } catch {
        // Ignore destroy error
      }
    }
  }
}
