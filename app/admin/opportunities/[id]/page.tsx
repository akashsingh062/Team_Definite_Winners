"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AdminPortalLayout } from "@/components/layout/AdminPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  ChevronLeft,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  MapPin,
  Building2,
  DollarSign,
  GraduationCap,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Send,
} from "lucide-react";
import { IOpportunity } from "@/types/opportunity";
import { toast } from "sonner";

export default function AdminOpportunityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [opp, setOpp] = React.useState<IOpportunity | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isActing, setIsActing] = React.useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const fetchOpportunity = React.useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/opportunities/${id}`);
      if (!res.ok) throw new Error("Failed to load opportunity");
      const json = await res.json();
      setOpp(json.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load opportunity details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchOpportunity();
  }, [fetchOpportunity]);

  const handleVerify = async (action: "verify" | "reject") => {
    try {
      setIsActing(true);
      const res = await fetch(`/api/admin/opportunities/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${action} opportunity`);
      toast.success(
        action === "verify" ? "Opportunity verified successfully" : "Opportunity marked as rejected"
      );
      fetchOpportunity();
    } catch (err: any) {
      toast.error(err.message || "Error updating verification");
    } finally {
      setIsActing(false);
    }
  };

  const handlePublish = async (action: "publish" | "unpublish") => {
    try {
      setIsActing(true);
      const res = await fetch(`/api/admin/opportunities/${id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${action} opportunity`);
      toast.success(
        action === "publish" ? "Opportunity is now live to students" : "Opportunity unpublished"
      );
      fetchOpportunity();
    } catch (err: any) {
      toast.error(err.message || "Error updating publication status");
    } finally {
      setIsActing(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsActing(true);
      const res = await fetch(`/api/admin/opportunities/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete opportunity");
      toast.success("Opportunity deleted successfully");
      router.push("/admin/opportunities");
    } catch (err: any) {
      toast.error(err.message || "Error deleting opportunity");
      setIsActing(false);
    }
  };

  if (isLoading) {
    return (
      <AdminPortalLayout>
        <div className="p-12 text-center text-sm text-slate-500">
          Loading opportunity details...
        </div>
      </AdminPortalLayout>
    );
  }

  if (!opp) {
    return (
      <AdminPortalLayout>
        <div className="p-12 text-center space-y-3">
          <p className="text-slate-600">Opportunity not found.</p>
          <Link href="/admin/opportunities">
            <Button variant="outline" size="sm">
              Return to Catalog
            </Button>
          </Link>
        </div>
      </AdminPortalLayout>
    );
  }

  return (
    <AdminPortalLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/opportunities"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Catalog
          </Link>

          <div className="flex items-center gap-2">
            <Link href={`/admin/opportunities/${id}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit className="h-4 w-4" /> Edit
              </Button>
            </Link>
            <Button
              variant="danger"
              size="sm"
              className="gap-1.5"
              onClick={() => setDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Audit & Workflow Control Header Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="indigo" className="capitalize">
                  {opp.category.replace("-", " ")}
                </Badge>
                <Badge variant="slate" className="capitalize">
                  {opp.employmentType}
                </Badge>
                {opp.verificationStatus === "verified" && (
                  <Badge variant="emerald" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                )}
                {opp.verificationStatus === "rejected" && (
                  <Badge variant="danger" className="gap-1">
                    <AlertCircle className="h-3 w-3" /> Rejected
                  </Badge>
                )}
                {opp.verificationStatus === "pending" && (
                  <Badge variant="amber" className="gap-1">
                    <Clock className="h-3 w-3" /> Pending Review
                  </Badge>
                )}
                {opp.status === "published" && (
                  <Badge variant="emerald">Live / Published</Badge>
                )}
                {opp.status === "draft" && <Badge variant="slate">Draft</Badge>}
              </div>

              <h1 className="text-2xl font-bold text-slate-900 mt-2">{opp.title}</h1>
              <p className="text-sm font-medium text-slate-600 flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4 text-slate-400" />
                {opp.companyName}
                <span className="text-slate-300">•</span>
                <MapPin className="h-4 w-4 text-slate-400" />
                {opp.location} ({opp.workMode})
              </p>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {opp.verificationStatus === "pending" && (
                <>
                  <Button
                    variant="accent"
                    size="sm"
                    className="gap-1.5"
                    disabled={isActing}
                    onClick={() => handleVerify("verify")}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Verify Listing
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    className="gap-1.5"
                    disabled={isActing}
                    onClick={() => handleVerify("reject")}
                  >
                    <AlertCircle className="h-4 w-4" /> Reject Listing
                  </Button>
                </>
              )}

              {opp.verificationStatus === "verified" && (
                <>
                  {opp.status === "published" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isActing}
                      onClick={() => handlePublish("unpublish")}
                    >
                      Unpublish from Students
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
                      disabled={isActing}
                      onClick={() => handlePublish("publish")}
                    >
                      <Send className="h-4 w-4" /> Publish to Students
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Audit Trail Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-500 pt-1">
            <div>
              <span className="block font-semibold text-slate-700">Audit Status</span>
              <span className="capitalize">{opp.verificationStatus}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-700">Created On</span>
              <span>{new Date(opp.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="block font-semibold text-slate-700">Published On</span>
              <span>
                {opp.publishedAt
                  ? new Date(opp.publishedAt).toLocaleDateString()
                  : "Not yet published"}
              </span>
            </div>
            <div>
              <span className="block font-semibold text-slate-700">Demo Data</span>
              <span>{opp.isDemoData ? "Yes (Synthetic)" : "No (Production)"}</span>
            </div>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Role Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {opp.description}
                </div>
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Required & Preferred Skills</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Required Core Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.requiredSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {opp.preferredSkills && opp.preferredSkills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Preferred / Bonus Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {opp.preferredSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="rounded-md bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700"
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
            <Card>
              <CardHeader>
                <CardTitle>Application Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {opp.applicationInstructions}
                </p>
                {opp.externalApplicationUrl && (
                  <div className="pt-2">
                    <a
                      href={opp.externalApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 gap-1"
                    >
                      External Link: {opp.externalApplicationUrl}{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info Columns */}
          <div className="space-y-6">
            {/* Criteria & Eligibility */}
            <Card>
              <CardHeader>
                <CardTitle>Eligibility & Specs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-600 block">Experience Level</span>
                  <span className="text-slate-800 text-sm">{opp.minimumExperience}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600 block">Education</span>
                  <span className="text-slate-800 text-sm">{opp.educationRequirements}</span>
                </div>
                {opp.minimumCGPA !== undefined && opp.minimumCGPA !== null && (
                  <div>
                    <span className="font-semibold text-slate-600 block">Minimum CGPA</span>
                    <span className="text-slate-800 text-sm">{opp.minimumCGPA} / 10.0</span>
                  </div>
                )}
                <div>
                  <span className="font-semibold text-slate-600 block">Eligibility</span>
                  <span className="text-slate-700 leading-relaxed block mt-0.5">
                    {opp.eligibilityCriteria}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600 block">Duration</span>
                  <span className="text-slate-800">{opp.duration || "N/A"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-600 block">Application Deadline</span>
                  <span className="text-slate-800">
                    {opp.applicationDeadline
                      ? new Date(opp.applicationDeadline).toLocaleDateString()
                      : "Open rolling"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Compensation & Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Compensation & Perks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-600 block">Pay Structure</span>
                  <span className="text-slate-900 font-medium text-sm">
                    {opp.isPaid
                      ? opp.category === "internship"
                        ? opp.stipend || "Stipend Provided"
                        : opp.salaryRange || "Competitive Salary"
                      : "Unpaid / Free Program"}
                  </span>
                </div>

                {opp.benefits && opp.benefits.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-600 block mb-1">
                      Benefits & Offerings
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700">
                      {opp.benefits.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        description="Are you sure you want to permanently delete this opportunity? This cannot be undone."
      >
        <div className="flex justify-end gap-2.5 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteModalOpen(false)}
            disabled={isActing}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={isActing}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </AdminPortalLayout>
  );
}
