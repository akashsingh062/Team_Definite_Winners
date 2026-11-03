import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPassportVerificationReport } from "@/services/passport/passport-public.service";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Lock,
} from "lucide-react";

interface VerificationPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function PassportVerificationPage({
  params,
}: VerificationPageProps) {
  const { publicId } = await params;
  const report = await getPassportVerificationReport(publicId);

  if (report.authenticityStatus === "not_found") {
    notFound();
  }

  const isAuthentic = report.authenticityStatus === "authentic";
  const isRevoked = report.authenticityStatus === "revoked";
  const isPrivate = report.authenticityStatus === "private";

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              CB
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              CareerBridge AI
            </span>
          </Link>

          <Link
            href={`/passport/${publicId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Back to Public Passport
          </Link>
        </div>

        {/* Verification Certificate Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          {/* Status Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Official Credential Verification
              </span>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                Digital Skills Passport Attestation
              </h1>
            </div>

            {isAuthentic && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Authentic & Active
              </span>
            )}

            {isRevoked && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Revoked by Owner
              </span>
            )}

            {isPrivate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <Lock className="w-4 h-4 text-slate-500" />
                Private Record
              </span>
            )}
          </div>

          {/* Student & Passport Metadata */}
          {isAuthentic && (
            <div className="py-6 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 mb-0.5 font-medium">Candidate Display Name</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {report.studentDisplayName}
                </p>
                <p className="text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  {report.headline}
                </p>
              </div>

              <div>
                <p className="text-slate-400 mb-0.5 font-medium">Passport Identifier</p>
                <p className="font-mono text-xs text-slate-800 dark:text-slate-200">
                  {report.publicId}
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Issued: {new Date(report.issuedAt).toLocaleDateString()} | Updated: {new Date(report.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Evidence Breakdown Matrix */}
          {isAuthentic && (
            <div className="py-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Verified Evidence Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Quantitative audit of evidence tiers supporting this candidate&apos;s competencies
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40">
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-200">
                    Assessment Verified
                  </p>
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                    {report.evidenceBreakdown.assessmentVerified}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Platform milestones
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                    Project Demonstrated
                  </p>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                    {report.evidenceBreakdown.projectDemonstrated}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Practical code repos
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40">
                  <p className="text-xs font-semibold text-purple-800 dark:text-purple-200">
                    Verified Credentials
                  </p>
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-0.5">
                    {report.evidenceBreakdown.externallyVerifiedCerts}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Official issuer portals
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                  <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                    Resume Extracted
                  </p>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">
                    {report.evidenceBreakdown.resumeExtracted}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Approved resume claim
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Self-Reported
                  </p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {report.evidenceBreakdown.selfReported}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Direct student input
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Student-Provided Certs
                  </p>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {report.evidenceBreakdown.studentProvidedCerts}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    Unintegrated issuer
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cryptographic Hash Seal */}
          {isAuthentic && report.integrityHash && (
            <div className="py-6 border-b border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Cryptographic Integrity Hash (SHA-256)
              </p>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 break-all select-all">
                {report.integrityHash}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                This digital fingerprint seals the verified competencies and deliverables against unauthorized modification.
              </p>
            </div>
          )}

          {/* Verification Disclaimer & Limitations */}
          <div className="py-6 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">
              Verification Scope & Limitations
            </h3>
            <p>{report.verificationDisclaimer}</p>
            <p className="text-[11px] text-slate-400">
              CareerBridge AI does not claim or fabricate external accreditation beyond validated issuer API/URL protocols. Employers are advised to conduct standard interviews to confirm depth of mastery.
            </p>
          </div>

          {/* Platform Attestation Footer */}
          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                {report.platformAttestation.issuingPlatform}
              </p>
              <p>Domain: {report.platformAttestation.verifiedDomain} | Protocol: {report.platformAttestation.protocolVersion}</p>
            </div>
            <p className="sm:text-right">
              Attestation Timestamp: {new Date(report.platformAttestation.timestamp).toUTCString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
