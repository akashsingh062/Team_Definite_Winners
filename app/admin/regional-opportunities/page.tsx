"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IOpportunity } from "@/types/opportunity";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building,
  Loader2,
  X,
  Check,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminRegionalOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<IOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New opportunity form state
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("internship");
  const [workMode, setWorkMode] = useState("onsite");
  const [stateName, setStateName] = useState("Bihar");
  const [district, setDistrict] = useState("Patna");
  const [city, setCity] = useState("Patna");
  const [locationName, setLocationName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [source, setSource] = useState("naps");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceOrg, setSourceOrg] = useState("");
  const [isGovt, setIsGovt] = useState(true);
  const [stipend, setStipend] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedState !== "all") params.set("state", selectedState);
        if (search.trim()) params.set("search", search.trim());
        params.set("limit", "50");

        const res = await fetch(`/api/local-opportunities?${params.toString()}`);
        const json = await res.json();
        if (!ignore && json.success) {
          setOpportunities((json.data || []).map((item: any) => item.opportunity));
        }
      } catch (err) {
        console.error("Admin load error:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      ignore = true;
    };
  }, [selectedState, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !companyName || !description || !requiredSkills) {
      toast.error("Please fill in required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const skillsArr = requiredSkills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      let coords: { latitude: number; longitude: number } | undefined;
      if (latitude && longitude) {
        coords = {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        };
      }

      const payload = {
        title,
        companyName,
        description,
        category,
        employmentType: category === "internship" ? "internship" : "full-time",
        industry: "Information Technology",
        requiredSkills: skillsArr,
        preferredSkills: [],
        workMode,
        location: `${city || district}, ${stateName}`,
        state: stateName,
        district,
        city,
        locationName,
        coordinates: coords,
        stipend,
        isPaid: Boolean(stipend),
        opportunitySource: source,
        sourceUrl,
        sourceOrganization: sourceOrg,
        isGovernmentProgram: isGovt,
        status: "published",
        verificationStatus: "verified",
      };

      const res = await fetch("/api/admin/regional-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Regional opportunity created and verified!");
        setShowAddModal(false);
        setOpportunities((prev) => [json.data, ...prev]);
        // Reset form
        setTitle("");
        setCompanyName("");
        setDescription("");
        setRequiredSkills("");
        setLatitude("");
        setLongitude("");
      } else {
        toast.error(json.error || "Failed to create opportunity.");
      }
    } catch {
      toast.error("Network error while creating opportunity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleOutdated = async (oppId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/regional-opportunities/${oppId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOutdated: !currentStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(
          !currentStatus ? "Opportunity flagged as outdated." : "Opportunity restored."
        );
        setOpportunities((prev) =>
          prev.map((o) => (o._id === oppId ? { ...o, isOutdated: !currentStatus } : o))
        );
      }
    } catch {
      toast.error("Failed to update outdated status.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/admin/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to TPO Opportunity Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <MapPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Regional Opportunity & Scheme Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Verify local apprenticeships, NAPS schemes, government training, and manage regional geographic coordinates
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/training-centres"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Building className="w-4 h-4 text-emerald-600" />
              Manage Training Centres
            </Link>

            <Link
              href="/admin/regional-analytics"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Regional Analytics
            </Link>

            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Regional Listing
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, company, or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All States</option>
              <option value="Bihar">Bihar</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Odisha">Odisha</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Assam">Assam</option>
            </select>
          </div>
        </div>

        {/* Listings Table */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading listings...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No regional listings found.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {opportunities.map((opp) => (
              <div
                key={opp._id || opp.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {opp.category}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 font-semibold">
                      {opp.state || "Regional"} &bull; {opp.district || opp.city}
                    </span>
                    {opp.isGovernmentProgram && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                        Govt Initiative
                      </span>
                    )}
                    {opp.isOutdated && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                        Outdated
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {opp.title}
                  </h3>
                  <p className="text-slate-500 font-medium">
                    {opp.companyName} &bull; {opp.locationName || opp.location}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleToggleOutdated(opp._id || opp.id!, Boolean(opp.isOutdated))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                      opp.isOutdated
                        ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        : "border-amber-300 text-amber-700 hover:bg-amber-50"
                    }`}
                  >
                    {opp.isOutdated ? "Mark Active" : "Flag Outdated"}
                  </button>

                  {opp.sourceUrl && (
                    <a
                      href={opp.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="View Official Source"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Regional Opportunity */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Add Regional Opportunity / Scheme
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Opportunity Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. NAPS Web Developer Apprentice"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Company / Organization *</label>
                    <input
                      type="text"
                      placeholder="e.g. State Electronics Corporation"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">State *</label>
                    <input
                      type="text"
                      placeholder="e.g. Bihar"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">District *</label>
                    <input
                      type="text"
                      placeholder="e.g. Patna"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Patna"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Description *</label>
                  <textarea
                    rows={2}
                    placeholder="Opportunity summary and scope..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Required Skills (Comma separated) *</label>
                    <input
                      type="text"
                      placeholder="JavaScript, HTML, CSS"
                      value={requiredSkills}
                      onChange={(e) => setRequiredSkills(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Stipend / Salary</label>
                    <input
                      type="text"
                      placeholder="INR 12,000/month"
                      value={stipend}
                      onChange={(e) => setStipend(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Latitude (Optional Coordinates)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 25.6093"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Longitude (Optional Coordinates)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 85.1235"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Source Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Ministry of Skill Development"
                      value={sourceOrg}
                      onChange={(e) => setSourceOrg(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Official Source URL</label>
                    <input
                      type="url"
                      placeholder="https://apprenticeshipindia.gov.in"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isGovtCheck"
                    checked={isGovt}
                    onChange={(e) => setIsGovt(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="isGovtCheck" className="font-semibold text-slate-700 dark:text-slate-300">
                    Government / Publicly Supported Initiative
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    {isSubmitting ? "Saving..." : "Publish Opportunity"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

