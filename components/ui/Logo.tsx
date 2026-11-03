"use client";

import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "minimal";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  href?: string;
}

export function LogoIcon({ className, size = 38 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 transition-transform duration-300 group-hover:scale-105", className)}
      aria-label="NexSkill AI Emblem"
    >
      <defs>
        {/* Background rounded badge gradient */}
        <linearGradient id="ns-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#3730a3" />
        </linearGradient>

        {/* Upward Ascending Stroke Gradient */}
        <linearGradient id="ns-arrow-grad" x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Glow filter */}
        <filter id="ns-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1e1b4b" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Rounded squircle emblem container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="13"
        fill="url(#ns-bg-grad)"
        filter="url(#ns-glow)"
      />

      {/* Subtle high-tech inner border ring */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="13"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1.5"
        fill="none"
      />

      {/* Stylized Ascending "N" Pathway: Left Stem */}
      <path
        d="M14 34V15"
        stroke="#c7d2fe"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Ascending Diagonal to Opportunity Apex */}
      <path
        d="M14 17L33 32V14"
        stroke="url(#ns-arrow-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Radiant Spark Diamond (Apex Opportunity Star) */}
      <path
        d="M33 9L34.5 12L37.5 13.5L34.5 15L33 18L31.5 15L28.5 13.5L31.5 12L33 9Z"
        fill="#38bdf8"
      />

      {/* Neural Node Points */}
      <circle cx="14" cy="34" r="2.5" fill="#38bdf8" />
      <circle cx="14" cy="15" r="2.5" fill="#ffffff" />
      <circle cx="33" cy="32" r="2.5" fill="#818cf8" />
      <circle cx="33" cy="14" r="2.5" fill="#ffffff" />
    </svg>
  );
}

export function Logo({
  variant = "full",
  size = "md",
  showTagline = true,
  className,
  href = "/",
}: LogoProps) {
  const iconSizes = {
    sm: 32,
    md: 40,
    lg: 48,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg sm:text-xl",
    lg: "text-2xl",
  };

  const content = (
    <div className={cn("group inline-flex items-center gap-3 select-none", className)}>
      <LogoIcon size={iconSizes[size]} />

      {variant !== "icon" && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors",
                textSizes[size]
              )}
            >
              Nex<span className="text-indigo-600">Skill</span>
            </span>

            {/* AI Pill Badge */}
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-gradient-to-r from-indigo-600 to-violet-600 text-[10px] font-black text-white uppercase tracking-wider shadow-2xs ring-1 ring-indigo-500/20">
              AI
            </span>
          </div>

          {showTagline && variant === "full" && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-tight leading-none mt-0.5">
              From Skill to Opportunity
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
