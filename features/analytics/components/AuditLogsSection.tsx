"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { IAdminAuditLog, AdminAuditAction } from "@/types/analytics";
import { Button } from "@/components/ui/button";

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  opportunity_created: { label: "Created Opportunity", color: "bg-blue-50 text-blue-700 border-blue-200" },
  opportunity_updated: { label: "Updated Opportunity", color: "bg-slate-100 text-slate-700 border-slate-200" },
  opportunity_verified: { label: "Verified Opportunity", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  opportunity_rejected: { label: "Rejected Opportunity", color: "bg-rose-50 text-rose-700 border-rose-200" },
  opportunity_published: { label: "Published Listing", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  opportunity_expired: { label: "Expired Listing", color: "bg-amber-50 text-amber-700 border-amber-200" },
  opportunity_deleted: { label: "Deleted Opportunity", color: "bg-rose-100 text-rose-800 border-rose-300" },
  data_exported: { label: "Exported CSV Dataset", color: "bg-teal-50 text-teal-700 border-teal-200" },
  configuration_changed: { label: "Config Changed", color: "bg-purple-50 text-purple-700 border-purple-200" },
};

export function AuditLogsSection() {
  const [logs, setLogs] = useState<IAdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadLogs() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "15");
        if (selectedAction !== "all") params.set("action", selectedAction);

        const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
        if (res.ok && !ignore) {
          const json = await res.json();
          if (json.success) {
            setLogs(json.logs || []);
            setTotal(json.total || 0);
            setPage(json.page || 1);
            setTotalPages(json.totalPages || 1);
          }
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch audit logs:", err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      ignore = true;
    };
  }, [page, selectedAction]);

  const handleActionChange = (action: string) => {
    setSelectedAction(action);
    setPage(1);
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-indigo-600" />
            Administrative Action Audit Trail
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of opportunity verifications, status changes, and data exports
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedAction}
            onChange={(e) => handleActionChange(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 shadow-2xs"
          >
            <option value="all">All Actions ({total})</option>
            <option value="opportunity_created">Opportunity Created</option>
            <option value="opportunity_updated">Opportunity Updated</option>
            <option value="opportunity_verified">Opportunity Verified</option>
            <option value="opportunity_published">Opportunity Published</option>
            <option value="opportunity_deleted">Opportunity Deleted</option>
            <option value="data_exported">Data Exported</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-xs text-slate-400 py-12 text-center">
          No audit logs recorded for this selection.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Action</th>
                <th className="py-2.5 px-3 font-semibold">TPO Account</th>
                <th className="py-2.5 px-3 font-semibold">Entity Type</th>
                <th className="py-2.5 px-3 font-semibold">Entity ID</th>
                <th className="py-2.5 px-3 font-semibold">Details / New Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => {
                const conf = ACTION_LABELS[log.action] || {
                  label: log.action.replace("_", " "),
                  color: "bg-slate-100 text-slate-700 border-slate-200",
                };
                return (
                  <tr key={log.id || log._id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-2xs font-semibold border ${conf.color}`}
                      >
                        {conf.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">
                      {log.adminEmail || log.adminUserId}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-medium">
                      {log.entityType}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-2xs">
                      {log.entityId ? `${log.entityId.slice(0, 10)}...` : "—"}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">
                      {log.newValues
                        ? JSON.stringify(log.newValues)
                        : log.metadata
                        ? JSON.stringify(log.metadata)
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <span className="text-slate-500">
          Showing page {page} of {totalPages} ({total} entries)
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="h-7 px-2.5"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="h-7 px-2.5"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
