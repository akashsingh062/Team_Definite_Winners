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
  Bot,
  Award,
  Sliders,
  Users,
  MapPin,
  ClipboardList,
  FileText,
  BarChart3,
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
            <div className="inline-flex items-center gap-2 flex-wrap justify-center">
              <Badge variant="indigo" className="px-3 py-1 text-xs">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                NexSkill AI — From Skill to Opportunity
              </Badge>
              <Badge variant="emerald" className="px-3 py-1 text-xs">
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                Demographic Neutrality Guaranteed
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Connecting Students to Opportunities with{" "}
              <span className="text-indigo-600">Explainable AI</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              NexSkill AI empowers students with verified digital credentials, personalized learning roadmaps,
              multilingual career counseling, what-if simulators, and alumni mentorship—connecting talent from skill to opportunity.
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
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Pedigree Bias</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Explainable Match Scores</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Practical Skills</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Feature Grid: Full 15-Module Ecosystem */}
      <section id="features" className="scroll-mt-20">
        <Container size="xl">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Complete End-to-End Career Intelligence
            </h2>
            <p className="text-sm text-slate-500">
              Every tool and module is integrated into a unified student and administrator workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Explainable Recommendations */}
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Compass className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Explainable Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  No black-box algorithms. Every match provides clear percentage breakdowns across required skills, education, and preferences with actionable skill gaps.
                </p>
                <Link href="/dashboard/recommendations" className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1">
                  Explore Smart Matches <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Card 2: Multilingual AI Companion */}
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-2">
                  <Bot className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Multilingual AI Companion</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Conversational career counselor in English and Hindi (Devanagari) with voice input, text-to-speech audio, and direct deep links to platform tools.
                </p>
                <Link href="/dashboard/companion" className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1">
                  Chat in English / हिन्दी <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Card 3: Verified Digital Skills Passport */}
            <Card className="hover:border-emerald-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Digital Skills Passport</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  A tamper-evident credential showcasing assessed skills, project evidence, and certifications with a shareable public URL and QR code.
                </p>
                <Link href="/dashboard/skills-passport" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">
                  View Skills Passport <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Card 4: What-If Career Simulator */}
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Sliders className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">What-If Career Simulator</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Model hypothetical skill gains before investing time. Compare simulated career alignments and generate personalized learning roadmaps.
                </p>
                <Link href="/dashboard/career-simulator" className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1">
                  Launch Simulator <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Card 5: Practical Skill Assessments */}
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                  <Cpu className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Practical Skill Assessments</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Timed, distraction-free technical tests in JavaScript, React, Node.js, SQL, and Python that convert self-reported skills into verified proof.
                </p>
                <Link href="/dashboard/assessments" className="text-xs font-semibold text-amber-600 hover:underline inline-flex items-center gap-1">
                  Take an Assessment <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Card 6: Human Mentor Network */}
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Mentor & Alumni Network</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Connect with verified industry alumni and counselors. Schedule 1-on-1 virtual sessions, request resume critiques, and submit feedback.
                </p>
                <Link href="/dashboard/mentors" className="text-xs font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1">
                  Discover Mentors <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Card 7: Local Opportunity Intelligence */}
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                  <MapPin className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Local Opportunity Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Geographic discovery for regional internships, government skill programs, and training centres for students outside metropolitan hubs.
                </p>
                <Link href="/dashboard/local-opportunities" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">
                  Explore Nearby <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Card 8: Application Tracking System */}
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Application Tracking System</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Kanban and pipeline management to save opportunities, record submission dates, track interview schedules, and monitor recruiter response rates.
                </p>
                <Link href="/dashboard/applications" className="text-xs font-semibold text-slate-700 hover:underline inline-flex items-center gap-1">
                  Track Applications <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>

            {/* Card 9: Admin Analytics & Fairness */}
            <Card className="hover:border-indigo-300 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">Admin Analytics & Fairness</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 leading-relaxed space-y-2">
                <p>
                  Continuous monitoring of demographic parity, recommendation fairness ratios, skill demand metrics, and complete audit trail logging.
                </p>
                <Link href="/admin/dashboard" className="text-xs font-semibold text-rose-600 hover:underline inline-flex items-center gap-1">
                  View Admin Console <ArrowRight className="w-3 h-3" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* Tech Stack Banner */}
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
                { name: "Tailwind CSS v4", desc: "Design System Tokens" },
                { name: "MongoDB + Mongoose", desc: "Pooled Database" },
                { name: "Better Auth", desc: "RBAC Authentication" },
                { name: "Google Gemini", desc: "Career AI Engine" },
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
                <Button variant="secondary" size="lg" className="text-indigo-700 font-semibold shadow-xs">
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
