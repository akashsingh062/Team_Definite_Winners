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
