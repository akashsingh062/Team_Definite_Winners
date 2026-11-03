import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPassport } from "@/services/passport/passport-public.service";
import { EvidenceBadge } from "@/features/skills-passport/components/EvidenceBadge";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  FolderGit2,
  GraduationCap,
  Github,
  Linkedin,
  Globe,
  ExternalLink,
  Code,
  Calendar,
  AlertTriangle,
  Building2,
  Lock,
} from "lucide-react";

interface PublicPassportPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function PublicPassportPage({
  params,
}: PublicPassportPageProps) {
  const { publicId } = await params;
  const result = await getPublicPassport(publicId, true);

  if (result.error === "NOT_FOUND" || !result.passport) {
    notFound();
  }

  if (result.error === "REVOKED") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Skills Passport Revoked
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            This digital skills passport link was revoked by the owner
            {result.revokedAt ? ` on ${new Date(result.revokedAt).toLocaleDateString()}` : ""}.
            For privacy and security, public profile information is no longer accessible through this link.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium"
          >
            Return to NexSkill AI
          </Link>
        </div>
      </div>
    );
  }

  if (result.error === "PRIVATE") {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Private Skills Passport
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            This skills passport is currently set to private by the student. Access is restricted to the student account.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium"
          >
            Return to NexSkill AI
          </Link>
        </div>
      </div>
    );
  }

  const p = result.passport;
  const sections = p.visibleSections;
  const summary = p.verificationSummary;

  const getInitials = (name?: string) => {
    if (!name) return "CB";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Bar / Issuer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              NX
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              NexSkill AI
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/passport/${publicId}/verification`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold hover:bg-blue-100 transition"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Verify Authenticity
            </Link>
          </div>
        </div>

        {/* Passport Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
              {getInitials(p.displayName)}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {p.displayName}
                </h1>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Digital Passport
                </span>
              </div>

              <p className="text-base font-medium text-blue-600 dark:text-blue-400 mb-3">
                {p.headline}
              </p>

              {p.summary && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 max-w-3xl">
                  {p.summary}
                </p>
              )}

              {/* Portfolio Links (if enabled in privacy settings) */}
              {sections.contact && p.portfolioLinks && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {p.portfolioLinks.github && (
                    <a
                      href={p.portfolioLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
                    >
                      <Github className="w-3.5 h-3.5" />
                      GitHub
                    </a>
                  )}
                  {p.portfolioLinks.linkedin && (
                    <a
                      href={p.portfolioLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  )}
                  {p.portfolioLinks.portfolio && (
                    <a
                      href={p.portfolioLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Verification Metrics Summary Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-center">
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {summary.assessmentVerifiedCount}
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                Assessment Verified
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {summary.projectDemonstratedCount}
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                Project Demonstrated
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-center">
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {summary.externallyVerifiedCertCount}
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                Verified Credentials
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {summary.totalSkills}
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
                Total Competencies
              </p>
            </div>
          </div>
        </div>

        {/* Section: Skills & Evidence */}
        {sections.skills && p.skills && p.skills.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Verified & Demonstrated Skills ({p.skills.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Competencies backed by practical code repositories, assessments, and curriculum capstones
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {p.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {skill.name}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {skill.proficiency}
                      </span>
                    </div>
                    <div className="mb-2">
                      <EvidenceBadge evidenceType={skill.evidenceType} size="sm" />
                    </div>
                    {skill.evidenceReference && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {skill.evidenceReference}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="truncate">{skill.issuingSource}</span>
                    {skill.verificationDate && (
                      <span className="shrink-0 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(skill.verificationDate).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Project Portfolio */}
        {sections.projects && p.projects && p.projects.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-emerald-600" />
              Project Portfolio ({p.projects.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Engineering projects and software systems built by the student
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {proj.title}
                      </h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                        Project Demonstrated
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                      {proj.description}
                    </p>

                    {proj.contribution && (
                      <div className="mb-3 p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Contribution: </span>
                        {proj.contribution}
                      </div>
                    )}

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {proj.technologies.map((t, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            <Code className="w-2.5 h-2.5 text-slate-400" />
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 transition"
                      >
                        <Github className="w-3.5 h-3.5" />
                        Repository
                      </a>
                    )}
                    {proj.liveDemoUrl && (
                      <a
                        href={proj.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Certifications */}
        {sections.certifications && p.certifications && p.certifications.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              Certifications & Credentials ({p.certifications.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Certifications evaluated against authoritative verification mechanisms
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {p.certifications.map((cert) => {
                const isVerified = cert.verificationStatus === "verified";
                return (
                  <div
                    key={cert.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {cert.name}
                          </h3>
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
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 shrink-0">
                            Student-Provided
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-3">
                        {cert.issueDate && <p>Issued: {cert.issueDate}</p>}
                        {cert.credentialId && (
                          <p className="font-mono text-[11px]">ID: {cert.credentialId}</p>
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
                          Verify on Official Issuer Portal
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section: Education & Assessments (Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sections.assessments && p.assessments && p.assessments.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Platform Assessments ({p.assessments.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Validated capstones and milestone achievements
              </p>

              <div className="space-y-3">
                {p.assessments.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-blue-200/60 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {item.assessmentTitle}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 shrink-0">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-0.5">
                        Competency: {item.skillName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sections.education && p.education && p.education.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                Academic Qualifications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Accredited degree studies and foundational coursework
              </p>

              <div className="space-y-3">
                {p.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3"
                  >
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {edu.degree} {edu.branch && `in ${edu.branch}`}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {edu.institution}
                      </p>
                      {edu.graduationYear && (
                        <p className="text-xs text-slate-500 mt-1">Class of {edu.graduationYear}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Seal & Verification Callout */}
        <div className="pt-8 pb-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
          <p className="mb-2">
            Issued by <strong className="text-slate-700 dark:text-slate-300">NexSkill AI Digital Skills Registry</strong>.
          </p>
          <p className="text-[11px] text-slate-400 max-w-xl mx-auto">
            NexSkill AI validates platform assessment milestones and project demonstrations. Third-party credentials are confirmed via authorized issuer portal protocols. Self-reported items represent student claims.
          </p>
        </div>
      </div>
    </div>
  );
}
