"use client";

import React from "react";
import { IPassportCertification } from "@/types/skills-passport";
import { Award, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface PassportCertificationsListProps {
  certifications: IPassportCertification[];
}

export function PassportCertificationsList({
  certifications,
}: PassportCertificationsListProps) {
  if (!certifications || certifications.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs text-center">
        <Award className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No certifications recorded on skills passport yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Certifications & Credentials ({certifications.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Professional certifications with authoritative verification status
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert) => {
          const isVerified = cert.verificationStatus === "verified";
          return (
            <div
              key={cert.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {cert.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      {cert.issuingOrganization}
                    </p>
                  </div>

                  {isVerified ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-purple-600" />
                      Verified Issuer
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                      <AlertCircle className="w-3 h-3 text-slate-400" />
                      Student-Provided
                    </span>
                  )}
                </div>

                <div className="space-y-1 mb-3 text-xs text-slate-500 dark:text-slate-400">
                  {cert.issueDate && (
                    <p>
                      <span className="font-medium text-slate-700 dark:text-slate-300">Issued: </span>
                      {cert.issueDate}
                      {cert.expirationDate && ` (Expires: ${cert.expirationDate})`}
                    </p>
                  )}
                  {cert.credentialId && (
                    <p className="font-mono text-[11px]">
                      <span className="font-medium text-slate-700 dark:text-slate-300">ID: </span>
                      {cert.credentialId}
                    </p>
                  )}
                  {cert.verificationNotes && (
                    <p className="text-[11px] text-slate-400 italic">
                      {cert.verificationNotes}
                    </p>
                  )}
                </div>
              </div>

              {cert.credentialUrl && (
                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800">
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Verify on Issuer Portal
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
