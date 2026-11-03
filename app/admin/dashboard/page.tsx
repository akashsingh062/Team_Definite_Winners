"use client";

import * as React from "react";
import Link from "next/link";
import { AdminPortalLayout } from "@/components/layout/AdminPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Layers,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { OpportunityStats, IOpportunity } from "@/types/opportunity";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<OpportunityStats | null>(null);
  const [recentOpportunities, setRecentOpportunities] = React.useState<IOpportunity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDashboardData() {
      try {
        setIsLoading(true);
        const [statsRes, oppsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/opportunities?limit=6"),
        ]);

        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStats(statsJson.data);
        }

        if (oppsRes.ok) {
          const oppsJson = await oppsRes.json();
          const opps = oppsJson.data?.opportunities || oppsJson.items || [];
          setRecentOpportunities(opps);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="emerald">Published</Badge>;
      case "pending":
        return <Badge variant="amber">Pending</Badge>;
      case "draft":
        return <Badge variant="slate">Draft</Badge>;
      case "rejected":
        return <Badge variant="danger">Rejected</Badge>;
      case "expired":
        return <Badge variant="default">Expired</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "internship":
        return <Badge variant="indigo">Internship</Badge>;
      case "job":
        return <Badge variant="emerald">Full-Time Job</Badge>;
      case "skill-development":
        return <Badge variant="amber">Skill Development</Badge>;
      default:
        return <Badge variant="default">{category}</Badge>;
    }
  };

  return (
    <AdminPortalLayout>
      <div className="space-y-8">
        {/* Header with Title and Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Admin Governance & Operations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Verify, audit, and publish campus-to-employment opportunities with full algorithmic integrity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/opportunities">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Briefcase className="h-4 w-4" />
                Manage All
              </Button>
            </Link>
            <Link href="/admin/opportunities/create">
              <Button variant="primary" size="sm" className="gap-1.5">
                <PlusCircle className="h-4 w-4" />
                Create Opportunity
              </Button>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Listings
                </p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">
                  {isLoading ? "..." : stats?.total ?? 0}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">In database catalog</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Briefcase className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Published
                </p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                  {isLoading ? "..." : stats?.published ?? 0}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Live to students</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Pending Audit
                </p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">
                  {isLoading ? "..." : stats?.pending ?? 0}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Awaiting approval</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Drafts
                </p>
                <h3 className="text-2xl font-bold text-slate-700 mt-1">
                  {isLoading ? "..." : stats?.draft ?? 0}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Unpublished work</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                <FileText className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Expired / Closed
                </p>
                <h3 className="text-2xl font-bold text-slate-500 mt-1">
                  {isLoading ? "..." : stats?.expired ?? 0}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">Past deadline</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunity Categories Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase text-indigo-700">Category A</span>
                  <h4 className="text-lg font-bold text-slate-900 mt-0.5">Internships</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Hands-on industry projects for college students
                  </p>
                </div>
                <div className="text-3xl font-extrabold text-indigo-600">
                  {isLoading ? "..." : stats?.byCategory.internship ?? 0}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase text-emerald-700">Category B</span>
                  <h4 className="text-lg font-bold text-slate-900 mt-0.5">Full-Time Jobs</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Graduating senior entry-level placement roles
                  </p>
                </div>
                <div className="text-3xl font-extrabold text-emerald-600">
                  {isLoading ? "..." : stats?.byCategory.job ?? 0}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50/50 to-white border-amber-100">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase text-amber-700">Category C</span>
                  <h4 className="text-lg font-bold text-slate-900 mt-0.5">Skill Development</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Bootcamps, verified courses & certifications
                  </p>
                </div>
                <div className="text-3xl font-extrabold text-amber-600">
                  {isLoading ? "..." : stats?.byCategory["skill-development"] ?? 0}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Opportunities List */}
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Recent Opportunities</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest submissions and entries registered in the platform
              </p>
            </div>
            <Link
              href="/admin/opportunities"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Loading recent opportunities...
              </div>
            ) : recentOpportunities.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm text-slate-500">No opportunities found in database.</p>
                <Link href="/admin/opportunities/create">
                  <Button variant="primary" size="sm">
                    Create First Opportunity
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="px-5 py-3">Opportunity & Company</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Verification</th>
                      <th className="px-4 py-3">Mode</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {recentOpportunities.map((opp) => (
                      <tr key={String(opp._id)} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/admin/opportunities/${opp._id}`}
                            className="font-semibold text-slate-900 hover:text-indigo-600 block"
                          >
                            {opp.title}
                          </Link>
                          <span className="text-xs text-slate-500">{opp.companyName}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getCategoryBadge(opp.category)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(opp.status)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {opp.verificationStatus === "verified" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                            </span>
                          ) : opp.verificationStatus === "rejected" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                              <AlertCircle className="h-3.5 w-3.5" /> Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                              <Clock className="h-3.5 w-3.5" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-600 capitalize">
                          {opp.workMode}
                        </td>
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/opportunities/${opp._id}`}>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                Review
                              </Button>
                            </Link>
                            <Link href={`/admin/opportunities/${opp._id}/edit`}>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminPortalLayout>
  );
}

