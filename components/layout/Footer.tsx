import * as React from "react";
import Link from "next/link";
import { Sparkles, HeartHandshake, ShieldCheck, Accessibility } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600">
      <Container size="xl" className="py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-slate-900"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg tracking-tight">{siteConfig.name}</span>
            </Link>
            <p className="max-w-md text-sm text-slate-500 leading-relaxed">
              An AI-powered Campus-to-Employment Opportunity Matcher engineered
              to democratize career access. Powered by explainable recommendations,
              algorithmic fairness, and prioritized support for underserved student communities.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Fairness First
              </span>
              <span className="flex items-center gap-1">
                <Accessibility className="h-4 w-4 text-indigo-600" />
                Accessible By Design
              </span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="h-4 w-4 text-rose-500" />
                Inclusive Equity
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Student Registration
                </Link>
              </li>
              <li>
                <Link
                  href="/api/health"
                  className="hover:text-indigo-600 transition-colors"
                >
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Commitments & Ethics */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Core Pillars
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-500">
                Explainable Match Scoring
              </li>
              <li className="text-slate-500">
                Underserved Student Priority
              </li>
              <li className="text-slate-500">
                Skills-Over-Pedigree Matching
              </li>
              <li className="text-slate-500">
                Transparent Data Privacy
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NexSkill AI. From Skill to Opportunity. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="text-slate-400">Built for Next-Gen Student Success</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

