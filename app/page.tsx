import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  Cpu,
  Layers,
  HeartHandshake,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden bg-gradient-to-b from-slate-50/70 to-white">
        <Container size="xl">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2">
              <Badge variant="indigo" className="px-3 py-1 text-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Next-Gen Campus-to-Employment Matcher
              </Badge>
              <Badge variant="emerald" className="hidden sm:inline-flex px-3 py-1 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                Demographic Neutrality Guaranteed
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Connecting Students to Opportunities with{" "}
              <span className="text-indigo-600">Explainable AI</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              CareerBridge AI matches students to internships, entry-level jobs,
              and tailored skill pathways based on actual skills and verified projects—prioritizing
              accessibility, algorithmic transparency, and opportunities for underserved students.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto justify-center">
              <Link href="/register">
                <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2">
                  Create Student Account
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Explore Student Dashboard
                </Button>
              </Link>
            </div>

            {/* Value checklist */}
            <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 border-t border-slate-200/80 w-full mt-8">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Pedigree Bias</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>Clear &quot;Why You Matched&quot; Insights</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Underserved Community Support</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Core Pillars Section */}
      <section id="features" className="scroll-mt-20">
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Engineered for Fairness, Transparency, and Impact
            </h2>
            <p className="text-sm text-slate-500">
              Designed from the ground up to solve systemic campus hiring challenges
              through ethical, explainable artificial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:border-indigo-200 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Compass className="w-5 h-5" />
                </div>
                <CardTitle>Explainable Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed">
                No black-box algorithms. Every match highlights exact matching criteria,
                skill compatibility percentages, and actionable gap insights so students
                understand how to qualify.
              </CardContent>
            </Card>

            <Card className="hover:border-emerald-200 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <CardTitle>Equity for Underserved Students</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed">
                Dedicated pipelines and priority filtering for first-generation students,
                tier-2/tier-3 college scholars, and underrepresented talent who lack traditional
                alumni networks.
              </CardContent>
            </Card>

            <Card className="hover:border-indigo-200 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Cpu className="w-5 h-5" />
                </div>
                <CardTitle>Skills-Based Matching</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed">
                Positions are recommended based on verified projects, coding samples, and
                demonstrated competencies—ensuring merit and real ability take center stage.
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Architecture & Tech Stack Banner */}
      <section className="bg-slate-50 border-y border-slate-200 py-12">
        <Container size="xl">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Hackathon Foundation
                </span>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  Enterprise-Grade Modular Architecture
                </h3>
              </div>
              <Link href="/api/health">
                <Button variant="outline" size="sm" className="gap-2">
                  <Layers className="w-4 h-4" />
                  View System Health API
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { name: "Next.js 16", desc: "App Router & React 19" },
                { name: "TypeScript", desc: "Strict Type Safety" },
                { name: "Tailwind CSS v4", desc: "Design System" },
                { name: "MongoDB + Mongoose", desc: "Pooled Database" },
                { name: "Better Auth", desc: "Secure Authentication" },
                { name: "Google Gemini", desc: "AI Matching Ready" },
              ].map((tech) => (
                <div
                  key={tech.name}
                  className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-2xs"
                >
                  <p className="text-xs font-bold text-slate-900">{tech.name}</p>
                  <p className="text-[11px] text-slate-500">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section>
        <Container size="xl">
          <div className="rounded-2xl bg-indigo-600 text-white p-8 md:p-12 text-center space-y-6 shadow-md">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to find your ideal campus opportunity?
            </h2>
            <p className="text-indigo-100 max-w-xl mx-auto text-sm leading-relaxed">
              Create your profile in under 2 minutes, get personalized opportunity matches,
              and unlock explainable career pathways.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/register">
                <Button variant="secondary" size="lg" className="text-indigo-700 font-semibold">
                  Get Started for Free
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
