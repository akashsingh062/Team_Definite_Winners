"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Clock,
  Layers,
  Award,
  ArrowRight,
  Send,
} from "lucide-react";
import { IOpportunity } from "@/types/opportunity";
import {
  SaveOpportunityButton,
  RecordApplicationModal,
} from "@/features/applications/components";

export default function OpportunityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [opp, setOpp] = React.useState<IOpportunity | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);

  React.useEffect(() => {
    async function loadOpportunity() {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await fetch(`/api/opportunities/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("This opportunity was not found or is no longer published.");
          }
          throw new Error("Failed to load opportunity details");
        }
        const json = await res.json();
        setOpp(json.data);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    loadOpportunity();
  }, [id]);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "internship":
        return <Badge variant="indigo">Internship</Badge>;
      case "job":
        return <Badge variant="emerald">Full-Time Job</Badge>;
      case "skill-development":
        return <Badge variant="amber">Skill Development</Badge>;
      default:
        return <Badge variant="default">{cat}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 py-8">
        <Container size="lg">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/opportunities"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to All Opportunities
            </Link>
          </div>

          {isLoading ? (
            <div className="p-16 text-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
              <p className="text-sm text-slate-500 font-medium">Loading opportunity details...</p>
            </div>
          ) : error || !opp ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Opportunity Unavailable</h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {error || "The requested opportunity could not be retrieved."}
              </p>
              <Link href="/opportunities">
                <Button variant="primary" size="sm">
                  Browse Active Opportunities
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top Opportunity Header Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getCategoryBadge(opp.category)}
                      <Badge variant="slate" className="capitalize">
                        {opp.employmentType}
                      </Badge>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified Campus Listing
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {opp.title}
                    </h1>

                    <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span>{opp.companyName}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span>{opp.industry}</span>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{opp.location}</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <span className="capitalize font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {opp.workMode}
                      </span>
                    </div>
                  </div>

                  {/* Top Action Box */}
                  <div className="shrink-0 flex flex-col gap-2 min-w-[220px]">
                    {opp.externalApplicationUrl ? (
                      <a
                        href={opp.externalApplicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full gap-2 shadow-sm font-semibold"
                        >
                          Apply on Company Site
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    ) : (
                      <a href="#application-instructions">
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full gap-2 font-semibold"
                        >
                          View How to Apply
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </a>
                    )}

                    <div className="flex items-center gap-2">
                      <SaveOpportunityButton
                        opportunityId={String(opp._id)}
                        size="md"
                        className="flex-1 justify-center"
                      />
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => setIsRecordModalOpen(true)}
                        className="flex-1 justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                        title="Record that you applied to track progress"
                      >
                        <Send className="h-3.5 w-3.5 text-indigo-600" />
                        <span>I Applied</span>
                      </Button>
                    </div>

                    <span className="text-[11px] text-center text-slate-400">
                      Zero fee application guarantee
                    </span>
                  </div>
                </div>

                {/* Key Spec Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Compensation</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {opp.isPaid
                        ? opp.category === "internship"
                          ? opp.stipend || "Stipend Provided"
                          : opp.salaryRange || "Competitive Pay"
                        : "Free / Skill Training"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Duration</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      {opp.duration || "Standard Term"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Application Deadline</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      {opp.applicationDeadline
                        ? new Date(opp.applicationDeadline).toLocaleDateString()
                        : "Rolling Basis"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block font-medium">Experience Level</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      {opp.minimumExperience}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Information Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left 2 Columns: Description, Skills, Instructions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Detailed Description */}
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg">Role Overview & Responsibilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                        {opp.description}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Required & Preferred Skills */}
                  <Card className="border-slate-200">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">Skills & Technologies</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                          Required Competencies
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {opp.requiredSkills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {opp.preferredSkills && opp.preferredSkills.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                            Nice-to-Have Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {opp.preferredSkills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Application Instructions */}
                  <Card id="application-instructions" className="border-indigo-100 bg-indigo-50/20">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">How to Apply</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {opp.applicationInstructions}
                      </p>

                      {opp.externalApplicationUrl && (
                        <div className="pt-2">
                          <a
                            href={opp.externalApplicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="primary" size="md" className="gap-2">
                              Go to Application Form
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column: Eligibility, Benefits, Fairness */}
                <div className="space-y-6">
                  {/* Academic & Eligibility Criteria */}
                  <Card className="border-slate-200">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-base">Eligibility Criteria</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3.5 text-xs">
                      <div>
                        <span className="font-semibold text-slate-500 block">Education</span>
                        <p className="text-slate-800 text-sm font-medium mt-0.5">
                          {opp.educationRequirements}
                        </p>
                      </div>

                      {opp.minimumCGPA !== undefined && opp.minimumCGPA !== null && (
                        <div>
                          <span className="font-semibold text-slate-500 block">Minimum CGPA</span>
                          <p className="text-slate-800 text-sm font-medium mt-0.5">
                            {opp.minimumCGPA} / 10.0
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="font-semibold text-slate-500 block">
                          Eligibility Details
                        </span>
                        <p className="text-slate-700 leading-relaxed mt-0.5">
                          {opp.eligibilityCriteria}
                        </p>
                      </div>

                      {opp.eligibleRegions && opp.eligibleRegions.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-500 block">
                            Eligible Regions
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {opp.eligibleRegions.map((region, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                              >
                                {region}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Benefits & Perks */}
                  {opp.benefits && opp.benefits.length > 0 && (
                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base">Perks & Benefits</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {opp.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Fairness & Trust Guarantee Card */}
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold">
                      <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                      <span>CareerBridge Fairness Guarantee</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      This opportunity has been vetted for recruitment legitimacy. In Stage 3, recommendations are computed with demographic neutrality, highlighting skill matches and actionable learning pathways.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {opp && (
            <RecordApplicationModal
              isOpen={isRecordModalOpen}
              onClose={() => setIsRecordModalOpen(false)}
              opportunityId={String(opp._id)}
              opportunityTitle={opp.title}
              companyName={opp.companyName}
            />
          )}
        </Container>
      </main>
    </div>
  );
}

