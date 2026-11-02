"use client";

import * as React from "react";
import Link from "next/link";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
  RefreshCw,
  Edit,
  Code,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Award,
  Lightbulb,
  Check,
  FileCheck,
} from "lucide-react";
import { IResume } from "@/types/resume";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function ResumeUploadPage() {
  const [resume, setResume] = React.useState<IResume | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadStep, setUploadStep] = React.useState<string>("");
  const [dragActive, setDragActive] = React.useState(false);
  const [showReplaceModal, setShowReplaceModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    let isMounted = true;
    async function loadResume() {
      try {
        const res = await fetch("/api/resume");
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setResume(json.data || null);
          }
        }
      } catch (err) {
        console.error("Failed to load resume:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadResume();
    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleFileProcess = async (file: File) => {
    // 1. Client-side validations
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      toast.error("Invalid file format. Please upload a PDF document.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(2)} MB). Maximum limit is 5 MB.`
      );
      return;
    }
    if (file.size === 0) {
      toast.error("The selected file is empty (0 bytes).");
      return;
    }

    try {
      setIsUploading(true);
      setUploadStep("Uploading PDF document...");

      const formData = new FormData();
      formData.append("file", file);

      // Transition progress messages to give users clear visibility
      const timer1 = setTimeout(() => {
        setUploadStep("Extracting text and document structure...");
      }, 1500);

      const timer2 = setTimeout(() => {
        setUploadStep("AI analyzing skills and credentials with Gemini...");
      }, 3500);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Failed to process resume");
      }

      toast.success("Resume successfully analyzed by Gemini AI!");
      setResume(json.data);
      setShowReplaceModal(false);
    } catch (err: any) {
      toast.error(err.message || "An error occurred while analyzing the resume.");
      // Refresh to see if a failed status record was logged
      setRefreshKey((k) => k + 1);
    } finally {
      setIsUploading(false);
      setUploadStep("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDeleteResume = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch("/api/resume", { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to delete resume");
      toast.success("Resume deleted successfully.");
      setResume(null);
      setShowDeleteModal(false);
    } catch (err: any) {
      toast.error(err.message || "Error deleting resume.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 KB";
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  // Skill counter helper
  const countTechnicalSkills = (skills?: IResume["parsedData"]["technicalSkills"]) => {
    if (!skills) return 0;
    return Object.values(skills).reduce((acc, curr) => acc + (curr?.length || 0), 0);
  };

  return (
    <StudentPortalLayout>
      <div className="space-y-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                AI Resume Analyzer
              </h1>
              <Badge variant="indigo" className="gap-1">
                <Sparkles className="h-3 w-3 text-indigo-600" />
                Gemini Powered
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Extract technical skills, education, projects, and work experience from your PDF resume.
              No information is automatically overwritten without your explicit approval.
            </p>
          </div>

          {resume && (
            <div className="flex items-center gap-2">
              <Link href="/dashboard/resume/review">
                <Button variant="primary" size="sm" className="gap-1.5">
                  <Edit className="h-4 w-4" />
                  Review & Edit Analysis
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setShowReplaceModal(true)}
              >
                <RefreshCw className="h-4 w-4" />
                Replace
              </Button>
            </div>
          )}
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
            <p className="text-sm text-slate-500">Checking resume records...</p>
          </div>
        ) : resume ? (
          /* Active Resume View */
          <div className="space-y-6">
            {/* Main Resume Status Card */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">
                          {resume.originalFileName}
                        </h3>
                        {resume.analysisStatus === "approved" ? (
                          <Badge variant="emerald" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Approved & Synced
                          </Badge>
                        ) : resume.analysisStatus === "completed" ? (
                          <Badge variant="indigo" className="gap-1">
                            <Check className="h-3 w-3" /> Analyzed (Pending Approval)
                          </Badge>
                        ) : resume.analysisStatus === "failed" ? (
                          <Badge variant="danger" className="gap-1">
                            <AlertCircle className="h-3 w-3" /> Analysis Failed
                          </Badge>
                        ) : (
                          <Badge variant="slate" className="gap-1">
                            <Clock className="h-3 w-3" /> {resume.analysisStatus}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Size: {formatFileSize(resume.fileSize)} • Pages: {resume.pageCount || 1} • Uploaded:{" "}
                        {resume.createdAt
                          ? new Date(resume.createdAt).toLocaleDateString()
                          : "Recently"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href="/dashboard/resume/review">
                      <Button variant="primary" size="sm" className="gap-1.5">
                        <Edit className="h-4 w-4" />
                        Review Extracted Data
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Error Banner if failed */}
                {resume.analysisStatus === "failed" && resume.errorMessage && (
                  <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                      Resume Processing Notice
                    </p>
                    <p className="text-rose-700">{resume.errorMessage}</p>
                    <div className="pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs bg-white"
                        onClick={() => setShowReplaceModal(true)}
                      >
                        Upload Another Document
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Extracted Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <Card className="border-slate-200">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                    <Code className="h-4 w-4" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {countTechnicalSkills(resume.parsedData?.technicalSkills)}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Technical Skills</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {resume.parsedData?.softSkills?.length || 0}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Soft Skills</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                    <FolderGit2 className="h-4 w-4" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {resume.parsedData?.projects?.length || 0}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Projects</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {resume.parsedData?.experience?.length || 0}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Experience</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 col-span-2 sm:col-span-1">
                <CardContent className="p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
                    <Award className="h-4 w-4" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {resume.parsedData?.certifications?.length || 0}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">Certificates</p>
                </CardContent>
              </Card>
            </div>

            {/* AI Quality Assessment & Strengths Box */}
            {resume.parsedData?.resumeAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card className="border-emerald-200 bg-emerald-50/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      <CardTitle className="text-base text-emerald-950">
                        Resume Strengths
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resume.parsedData.resumeAnalysis.strengths?.length > 0 ? (
                      <ul className="space-y-2 text-xs text-slate-700">
                        {resume.parsedData.resumeAnalysis.strengths.map((str, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">No specific strengths noted.</p>
                    )}
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <Card className="border-amber-200 bg-amber-50/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-600" />
                      <CardTitle className="text-base text-amber-950">
                        Actionable Suggestions
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {resume.parsedData.resumeAnalysis.suggestions?.length > 0 ? (
                      <ul className="space-y-2 text-xs text-slate-700">
                        {resume.parsedData.resumeAnalysis.suggestions.map((sug, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{sug}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500">No improvement items noted.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Callout action banner */}
            <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 to-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Ready to update your student profile?
                </h4>
                <p className="text-xs text-slate-600">
                  Review the extracted skills, projects, and education. You choose exactly which entries to merge into your CareerBridge profile.
                </p>
              </div>
              <Link href="/dashboard/resume/review">
                <Button variant="primary" size="md" className="gap-2 shrink-0">
                  <FileCheck className="h-4 w-4" />
                  Review & Approve
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Empty State / Upload Dropzone */
          <Card className="border-slate-200">
            <CardContent className="p-8 sm:p-12">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
                  dragActive
                    ? "border-indigo-500 bg-indigo-50/40 scale-[1.01]"
                    : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
                } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />

                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                    {isUploading ? (
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                    ) : (
                      <UploadCloud className="h-8 w-8" />
                    )}
                  </div>

                  {isUploading ? (
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        Analyzing Resume with Gemini AI
                      </h3>
                      <p className="text-xs font-medium text-indigo-600 animate-pulse">
                        {uploadStep || "Processing document..."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Upload your PDF Resume
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Drag and drop your file here, or click to browse from your device
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="md"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select PDF File
                      </Button>

                      <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                        <p>Supported format: PDF only • Maximum file size: 5 MB</p>
                        <p className="text-slate-500">
                          Scanned image PDFs are not supported in this stage. Text-based PDFs ensure optimal parsing accuracy.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Replace Modal */}
        <Modal
          isOpen={showReplaceModal}
          onClose={() => setShowReplaceModal(false)}
          title="Replace Resume"
          description="Upload a new PDF resume. This will replace the current resume and generate a fresh AI analysis."
        >
          <div className="space-y-4 pt-2">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`rounded-xl border-2 border-dashed p-6 text-center ${
                dragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300"
              }`}
            >
              <UploadCloud className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-900">Select new resume PDF</p>
              <p className="text-xs text-slate-500 mb-3">PDF only (max 5 MB)</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Browse Files
              </Button>
            </div>
            {isUploading && (
              <p className="text-xs text-center text-indigo-600 animate-pulse">
                {uploadStep}
              </p>
            )}
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Resume"
          description="Are you sure you want to delete your uploaded resume and its extracted data? Your existing profile will remain untouched."
        >
          <div className="flex justify-end gap-2.5 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteResume}
              isLoading={isDeleting}
            >
              Delete Resume
            </Button>
          </div>
        </Modal>
      </div>
    </StudentPortalLayout>
  );
}
