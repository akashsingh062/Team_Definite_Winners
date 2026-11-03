"use client";

import React from "react";
import { IPassportProject } from "@/types/skills-passport";
import { FolderGit2, Github, ExternalLink, Code } from "lucide-react";

interface PassportProjectsListProps {
  projects: IPassportProject[];
}

export function PassportProjectsList({ projects }: PassportProjectsListProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs text-center">
        <FolderGit2 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          No projects added to skills passport yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Project Portfolio ({projects.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Demonstrated engineering implementations and practical deliverables
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {project.title}
                </h4>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                  Project Demonstrated
                </span>
              </div>

              {project.category && (
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mb-2">
                  {project.category}
                </p>
              )}

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                {project.description}
              </p>

              {project.contribution && (
                <div className="mb-3 p-2 rounded-lg bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Contribution: </span>
                  {project.contribution}
                </div>
              )}

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {project.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      <Code className="w-2.5 h-2.5 text-slate-400" />
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-3">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <Github className="w-3.5 h-3.5" />
                  GitHub Repository
                </a>
              )}
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Live Deployment
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
