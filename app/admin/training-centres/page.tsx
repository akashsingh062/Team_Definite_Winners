"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IRegionalTrainingCentre } from "@/types/local-opportunity";
import {
  Building,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  MapPin,
  ExternalLink,
  ChevronLeft,
  Loader2,
  AlertCircle,
  X,
  Check,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminTrainingCentresPage() {
  const [centres, setCentres] = useState<IRegionalTrainingCentre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Training Centre form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("iti");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [officialWebsite, setOfficialWebsite] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDuration, setCourseDuration] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadCentres() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedState !== "all") params.set("state", selectedState);
        if (selectedCategory !== "all") params.set("category", selectedCategory);

        const res = await fetch(`/api/admin/training-centres?${params.toString()}`);
        const json = await res.json();
        if (!ignore && json.success) {
          setCentres(json.data || []);
        } else if (!json.success) {
          toast.error(json.error || "Failed to load training centres.");
        }
      } catch (err) {
        console.error("Centres load error:", err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadCentres();
    return () => {
      ignore = true;
    };
  }, [selectedState, selectedCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !district || !stateName || !latitude || !longitude) {
      toast.error("Please provide all required fields, including valid geographic coordinates.");
      return;
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast.error("Invalid latitude or longitude values.");
      return;
    }

    setIsSubmitting(true);
    try {
      const coursesOffered = [];
      if (courseName && courseDuration) {
        coursesOffered.push({
          courseName,
          duration: courseDuration,
          certification: "State/NCVT Certified",
          feeType: "free" as const,
        });
      }

      const payload = {
        name,
        description,
        category,
        address,
        district,
        state: stateName,
        pincode,
        coordinates: { latitude: lat, longitude: lon },
        contactNumber,
        contactEmail,
        officialWebsite,
        sourceUrl,
        sourceOrganization: "Government Skill Department",
        coursesOffered,
        verificationStatus: "verified",
      };

      const res = await fetch("/api/admin/training-centres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Training centre registered and verified!");
        setShowAddModal(false);
        setCentres((prev) => [json.data, ...prev]);
        // Reset form
        setName("");
        setDescription("");
        setAddress("");
        setDistrict("");
        setStateName("");
        setLatitude("");
        setLongitude("");
      } else {
        toast.error(json.error || "Failed to create training centre.");
      }
    } catch {
      toast.error("Network error creating training centre.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation */}
        <Link
          href="/admin/regional-opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Regional Opportunities
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <Building className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Regional Training Centres & ITIs
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage verified public ITIs, PMKVY Pradhan Mantri Kaushal Kendras, and polytechnics
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Training Centre
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">State:</span>
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
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              >
                <option value="all">All Types</option>
                <option value="iti">Government ITIs</option>
                <option value="pmkvy_centre">PMKVY Kaushal Kendras</option>
                <option value="polytechnic">Polytechnics</option>
                <option value="vocational_centre">Vocational Centres</option>
              </select>
            </div>
          </div>

          <span className="text-slate-500 font-semibold">
            {centres.length} Verified Centres
          </span>
        </div>

        {/* Centres List */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading training centres...</p>
          </div>
        ) : centres.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-2">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No training centres found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centres.map((c) => (
              <div
                key={c._id || c.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {c.category.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {c.coordinates.latitude.toFixed(4)}, {c.coordinates.longitude.toFixed(4)}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {c.name}
                  </h4>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    {c.address}
                  </p>
                </div>

                <p className="text-slate-600 dark:text-slate-400 line-clamp-2">
                  {c.description}
                </p>

                {c.coursesOffered.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                      Curriculum Tracks ({c.coursesOffered.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {c.coursesOffered.map((course, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600"
                        >
                          {course.courseName} ({course.duration})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add Centre */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Register Regional Training Centre / ITI
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Centre / Institute Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Government ITI Digha"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      <option value="iti">Government ITI</option>
                      <option value="pmkvy_centre">PMKVY Kaushal Kendra</option>
                      <option value="polytechnic">Polytechnic College</option>
                      <option value="vocational_centre">Vocational Centre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Pincode</label>
                    <input
                      type="text"
                      placeholder="800011"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Full Street Address *</label>
                  <input
                    type="text"
                    placeholder="e.g. Digha Ghat, Patna - 800011"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">District *</label>
                    <input
                      type="text"
                      placeholder="Patna"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">State *</label>
                    <input
                      type="text"
                      placeholder="Bihar"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Latitude (Required) *</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="25.6521"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Longitude (Required) *</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="85.1054"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Primary Course Offered (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="e.g. COPA Web Programming"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 1 Year)"
                      value={courseDuration}
                      onChange={(e) => setCourseDuration(e.target.value)}
                      className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
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
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    {isSubmitting ? "Saving..." : "Verify & Register Centre"}
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

