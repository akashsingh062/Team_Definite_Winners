"use client";

import * as React from "react";
import Link from "next/link";
import {
  FolderGit2,
  Briefcase,
  Award,
  ExternalLink,
  Github,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IProjectRelevanceItem,
  IExperienceRelevanceItem,
  ICertificationRelevanceItem,
} from "@/types/explanation";

interface ProjectRelevanceCardProps {
  projectRelevance: IProjectRelevanceItem[];
  experienceRelevance: IExperienceRelevanceItem[];
  certificationsRelevance: ICertificationRelevanceItem[];
}

export function ProjectRelevanceCard({
  projectRelevance,
  experienceRelevance,
  certificationsRelevance,
}: ProjectRelevanceCardProps) {
  const hasProjects = projectRelevance.length > 0;
  const hasExp = experienceRelevance.length > 0;
  const hasCerts = certificationsRelevance.length > 0;

  return (
    <Card className="border border-slate-200/90 shadow-2xs">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-base font-bold text-slate-900">
            Portfolio Proof, Experience & Certifications
          </CardTitle>
        </div>
        <CardDescription className="text-xs text-slate-500 mt-0.5">
          Verified evidence from your approved portfolio projects, employment tenure, and accredited credentials.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-1">
        {/* 1. Projects Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <span>Relevant Projects ({projectRelevance.length})</span>
            </span>
            <Link
              href="/profile"
              className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 font-semibold hover:underline"
            >
              <Plus className="w-3 h-3" />
              <span>Add Projects</span>
            </Link>
          </div>

          {hasProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projectRelevance.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {proj.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-slate-800"
                            title="View GitHub Repository"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {proj.liveDeploymentUrl && (
                          <a
                            href={proj.liveDeploymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                            title="View Live Deployment"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((tech) => {
                        const isMatch = proj.matchingSkills.includes(tech);
                        return (
                          <span
                            key={tech}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              isMatch
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold"
                                : "bg-white text-slate-600 border border-slate-200"
                            }`}
                          >
                            {tech}
                          </span>
                        );
                      })}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      {proj.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-500 text-center">
              No portfolio projects currently demonstrate technologies required for this role.
            </div>
          )}
        </div>

        {/* 2. Experience Section */}
        {hasExp && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Prior Industry Experience ({experienceRelevance.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {experienceRelevance.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">
                      {exp.role}
                    </span>
                    {exp.duration && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {exp.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-blue-700">
                    {exp.company}
                  </p>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {exp.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Certifications Section */}
        {hasCerts && (
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Related Certifications ({certificationsRelevance.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certificationsRelevance.map((cert, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-amber-100 bg-amber-50/30 space-y-1.5"
                >
                  <span className="font-bold text-xs text-amber-950 block">
                    {cert.name}
                  </span>
                  {cert.issuer && (
                    <p className="text-[11px] text-amber-800 font-medium">
                      Issued by {cert.issuer} {cert.issueDate ? `(${cert.issueDate})` : ""}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {cert.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

