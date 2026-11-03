"use client";

import * as React from "react";
import Link from "next/link";
import { AdminPortalLayout } from "@/components/layout/AdminPortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Upload,
  Download,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { IOpportunity, OpportunityCategory, OpportunityStatus } from "@/types/opportunity";
import { toast } from "sonner";

export default function AdminOpportunitiesPage() {
  const [opportunities, setOpportunities] = React.useState<IOpportunity[]>([]);
  const [pagination, setPagination] = React.useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const [page, setPage] = React.useState(1);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Filters
  const [search, setSearch] = React.useState("");
  const [activeSearch, setActiveSearch] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = React.useState<IOpportunity | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Quick Action loading state
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function loadOpportunities() {
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: String(pagination.limit),
        });

        if (activeSearch.trim()) query.set("search", activeSearch.trim());
        if (category !== "all") query.set("category", category);
        if (status !== "all") query.set("status", status);

        const res = await fetch(`/api/admin/opportunities?${query.toString()}`);
        if (!res.ok) throw new Error("Failed to load opportunities");

        const json = await res.json();
        if (isMounted) {
          const list = json.data?.opportunities || json.items || [];
          setOpportunities(list);
          setPagination({
            total: json.data?.pagination?.total ?? json.total ?? list.length,
            page: json.data?.pagination?.page ?? json.page ?? 1,
            limit: json.data?.pagination?.limit ?? json.limit ?? 20,
            totalPages: json.data?.pagination?.totalPages ?? json.totalPages ?? 1,
          });
        }
      } catch (err) {
        console.error("Fetch opportunities error:", err);
        toast.error("Failed to load opportunities");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOpportunities();
    return () => {
      isMounted = false;
    };
  }, [page, category, status, activeSearch, refreshKey, pagination.limit]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPage(1);
    setActiveSearch(search);
  };

  const handleVerify = async (id: string, action: "verify" | "reject") => {
    try {
      setActionLoadingId(id);
      const res = await fetch(`/api/admin/opportunities/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `Failed to ${action} opportunity`);
      toast.success(
        action === "verify" ? "Opportunity verified successfully" : "Opportunity rejected"
      );
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to update verification status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublish = async (id: string, action: "publish" | "unpublish") => {
    try {
      setActionLoadingId(id);
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
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to update publication status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/opportunities/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete opportunity");
      toast.success("Opportunity deleted successfully");
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete opportunity");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Opportunity Catalog
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Review, verify, publish, and govern all {pagination.total} opportunities.
            </p>
          </div>
          <Link href="/admin/opportunities/create">
            <Button variant="primary" size="sm" className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              New Opportunity
            </Button>
          </Link>
        </div>

        {/* Filter Controls Bar */}
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, company, skills, or industry..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </form>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 cursor-pointer focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="internship">Internships</option>
                  <option value="job">Full-Time Jobs</option>
                  <option value="skill-development">Skill Development</option>
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 cursor-pointer focus:border-indigo-500 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="draft">Draft</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10"
                  onClick={() => {
                    setSearch("");
                    setActiveSearch("");
                    setCategory("all");
                    setStatus("all");
                    setPage(1);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunities Table */}
        <Card className="border-slate-200">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Loading opportunities...
              </div>
            ) : opportunities.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm text-slate-500">
                  No opportunities match the selected criteria.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setActiveSearch("");
                    setCategory("all");
                    setStatus("all");
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="px-5 py-3.5">Opportunity</th>
                      <th className="px-3 py-3.5">Category</th>
                      <th className="px-3 py-3.5">Work Mode</th>
                      <th className="px-3 py-3.5">Verification</th>
                      <th className="px-3 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Workflow & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {opportunities.map((opp) => {
                      const oppId = String(opp._id);
                      const isActing = actionLoadingId === oppId;

                      return (
                        <tr key={oppId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-900">
                              <Link
                                href={`/admin/opportunities/${oppId}`}
                                className="hover:text-indigo-600 transition-colors"
                              >
                                {opp.title}
                              </Link>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                              <span>{opp.companyName}</span>
                              <span>•</span>
                              <span>{opp.location}</span>
                              {opp.isDemoData && (
                                <Badge variant="slate" className="text-[10px] py-0 px-1">
                                  Demo
                                </Badge>
                              )}
                            </div>
                          </td>

                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <span className="capitalize text-xs font-medium text-slate-700">
                              {opp.category.replace("-", " ")}
                            </span>
                          </td>

                          <td className="px-3 py-3.5 whitespace-nowrap capitalize text-xs text-slate-600">
                            {opp.workMode}
                          </td>

                          <td className="px-3 py-3.5 whitespace-nowrap">
                            {opp.verificationStatus === "verified" ? (
                              <Badge variant="emerald" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                              </Badge>
                            ) : opp.verificationStatus === "rejected" ? (
                              <Badge variant="danger" className="gap-1">
                                <AlertCircle className="h-3 w-3" /> Rejected
                              </Badge>
                            ) : (
                              <Badge variant="amber" className="gap-1">
                                <Clock className="h-3 w-3" /> Pending
                              </Badge>
                            )}
                          </td>

                          <td className="px-3 py-3.5 whitespace-nowrap">
                            {opp.status === "published" ? (
                              <Badge variant="emerald">Published</Badge>
                            ) : opp.status === "draft" ? (
                              <Badge variant="slate">Draft</Badge>
                            ) : opp.status === "pending" ? (
                              <Badge variant="amber">Pending</Badge>
                            ) : opp.status === "rejected" ? (
                              <Badge variant="danger">Rejected</Badge>
                            ) : (
                              <Badge variant="default">{opp.status}</Badge>
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Verify / Reject if pending or unverified */}
                              {(opp.verificationStatus === "pending" ||
                                opp.verificationStatus === "unverified") && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                    disabled={isActing}
                                    onClick={() => handleVerify(oppId, "verify")}
                                    title="Verify Opportunity"
                                  >
                                    <Check className="h-3 w-3 mr-1" /> Verify
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs text-rose-700 hover:bg-rose-50 border-rose-200"
                                    disabled={isActing}
                                    onClick={() => handleVerify(oppId, "reject")}
                                    title="Reject Opportunity"
                                  >
                                    <X className="h-3 w-3 mr-1" /> Reject
                                  </Button>
                                </>
                              )}

                              {/* Quick Publish / Unpublish if verified */}
                              {opp.verificationStatus === "verified" && (
                                <>
                                  {opp.status === "published" ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 px-2 text-xs text-amber-700 hover:bg-amber-50 border-amber-200"
                                      disabled={isActing}
                                      onClick={() => handlePublish(oppId, "unpublish")}
                                    >
                                      Unpublish
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
                                      disabled={isActing}
                                      onClick={() => handlePublish(oppId, "publish")}
                                    >
                                      Publish
                                    </Button>
                                  )}
                                </>
                              )}

                              {/* View Details */}
                              <Link href={`/admin/opportunities/${oppId}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  title="View audit details"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </Link>

                              {/* Edit */}
                              <Link href={`/admin/opportunities/${oppId}/edit`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-slate-600"
                                  title="Edit details"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                              </Link>

                              {/* Delete */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50"
                                title="Delete opportunity"
                                onClick={() => setDeleteTarget(opp)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 text-xs text-slate-500">
                <div>
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} opportunities
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    disabled={pagination.page <= 1}
                    onClick={() => {
                      setIsLoading(true);
                      setPage(pagination.page - 1);
                    }}
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                  </Button>
                  <span className="px-2 font-medium text-slate-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => {
                      setIsLoading(true);
                      setPage(pagination.page + 1);
                    }}
                  >
                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Opportunity Deletion"
        description="Are you sure you want to permanently delete this opportunity? This operation cannot be undone."
      >
        {deleteTarget && (
          <div className="space-y-4 pt-2">
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-sm">
              <p className="font-semibold text-slate-900">{deleteTarget.title}</p>
              <p className="text-xs text-slate-500">{deleteTarget.companyName}</p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
              >
                Delete Opportunity
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AdminPortalLayout>
  );
}
