"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Users,
  Send,
  CalendarCheck,
  Lock,
  FileText,
  Github,
  Globe,
  Ban,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

export default function StudentResourcesPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadShares() {
      try {
        const res = await fetch("/api/mentorship/resources/share");
        const data = await res.json();
        if (!ignore && data.success) {
          setShares(data.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadShares();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRevoke = async (shareId: string) => {
    if (!confirm("Are you sure you want to revoke this mentor's access to this resource?")) {
      return;
    }
    setRevokingId(shareId);
    try {
      const res = await fetch(`/api/mentorship/resources/share/${shareId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setShares(
          shares.map((s) =>
            s._id === shareId || s.id === shareId
              ? { ...s, permissionStatus: "revoked", revokedAt: new Date().toISOString() }
              : s
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRevokingId(null);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "resume":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "github":
        return <Github className="h-4 w-4 text-slate-800" />;
      default:
        return <Globe className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Shared Resources & Access Controls
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review, audit, or instantly revoke materials you have granted mentors permission to inspect.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <Link href="/dashboard/mentors">
          <Button variant="outline" size="sm" className="h-8 text-xs text-slate-600">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Discover Mentors
          </Button>
        </Link>
        <Link href="/dashboard/mentorship-requests">
          <Button variant="outline" size="sm" className="h-8 text-xs text-slate-600">
            <Send className="h-3.5 w-3.5 mr-1.5" />
            My Requests
          </Button>
        </Link>
        <Link href="/dashboard/mentorship-sessions">
          <Button variant="outline" size="sm" className="h-8 text-xs text-slate-600">
            <CalendarCheck className="h-3.5 w-3.5 mr-1.5" />
            My Sessions
          </Button>
        </Link>
        <Link href="/dashboard/mentorship-resources">
          <Button
            size="sm"
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Shared Resources
          </Button>
        </Link>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 p-4 text-xs text-emerald-900">
        <Lock className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-emerald-950">
            Explicit Consent & Privacy Control Invariant
          </h4>
          <p className="text-emerald-800 mt-0.5 leading-relaxed">
            CareerBridge AI guarantees that your resume, project repos, and personal profiles are never shared automatically. You maintain full ownership and can revoke any mentor&apos;s access immediately below.
          </p>
        </div>
      </div>

      {/* Shared Resources List */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : shares.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Share2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">
            No resources shared yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            When you request feedback from a mentor, you can explicitly grant them access to your resume or projects.
          </p>
          <Link href="/dashboard/mentors">
            <Button size="sm" className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              Discover Mentors
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {shares.map((share) => {
            const isActive = share.permissionStatus === "active";
            const ref = share.resourceReference || {};

            return (
              <div
                key={share._id || share.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-200"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle className="h-3 w-3" />
                          Access Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          <Ban className="h-3 w-3" />
                          Access Revoked
                        </span>
                      )}

                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        Granted {new Date(share.grantedAt).toLocaleDateString()}
                      </span>
                      {share.revokedAt && (
                        <span className="text-xs text-slate-400">
                          (Revoked {new Date(share.revokedAt).toLocaleDateString()})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {getResourceIcon(share.resourceType)}
                      <h3 className="font-bold text-slate-900 text-base">
                        {ref.title || `${share.resourceType} Review`}
                      </h3>
                    </div>

                    {share.mentor ? (
                      <p className="text-xs text-slate-600 mt-1">
                        Mentor: <strong className="text-slate-800">{share.mentor.displayName}</strong> ({share.mentor.currentRole} at {share.mentor.organization})
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">Assigned Mentor</p>
                    )}

                    {ref.url && (
                      <div className="mt-2">
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                        >
                          <span>{ref.url}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {ref.description && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-700">Review Focus: </span>
                        {ref.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0">
                    {isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevoke(share._id || share.id)}
                        disabled={revokingId === (share._id || share.id)}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                      >
                        {revokingId === (share._id || share.id) ? "Revoking..." : "Revoke Access"}
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Access Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
