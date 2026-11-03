"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IMapMarkerItem, IAvailableRegion } from "@/types/local-opportunity";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import InteractiveOpportunityMap from "@/features/local-opportunities/components/InteractiveOpportunityMap";
import {
  ChevronLeft,
  MapPin,
  List,
  Map as MapIcon,
  Loader2,
  AlertCircle,
  Building,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export default function LocalOpportunitiesMapPage() {
  const [markers, setMarkers] = useState<IMapMarkerItem[]>([]);
  const [regions, setRegions] = useState<IAvailableRegion[]>([]);
  const [unmappedCount, setUnmappedCount] = useState(0);
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMarker, setSelectedMarker] = useState<IMapMarkerItem | null>(null);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [isLoading, setIsLoading] = useState(true);

  // Load Regions
  useEffect(() => {
    async function loadRegions() {
      try {
        const res = await fetch("/api/local-opportunities/regions");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRegions(json.data);
        }
      } catch (err) {
        console.error("Failed to load regions:", err);
      }
    }
    loadRegions();
  }, []);

  // Load Map Markers
  useEffect(() => {
    let ignore = false;
    async function loadMarkers() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (selectedState !== "all") params.set("state", selectedState);
        if (selectedCategory !== "all") params.set("category", selectedCategory);

        const res = await fetch(`/api/local-opportunities/map?${params.toString()}`);
        const json = await res.json();

        if (!ignore && json.success) {
          setMarkers(json.data || []);
          if (json.meta) {
            setUnmappedCount(json.meta.unmappedOpportunitiesCount || 0);
          }
        } else if (!json.success) {
          toast.error(json.error || "Failed to load map points.");
        }
      } catch (err) {
        if (!ignore) {
          console.error("Map markers load error:", err);
          toast.error("Network error loading map data.");
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadMarkers();
    return () => {
      ignore = true;
    };
  }, [selectedState, selectedCategory]);

  return (
    <StudentPortalLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Navigation */}
        <Link
          href="/dashboard/local-opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Local Opportunities Catalog
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
              <span className="p-2 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <MapIcon className="w-6 h-6" />
              </span>
              Interactive Regional Opportunity Map
            </h1>
            <p className="text-sm text-slate-600 mt-1.5 font-medium">
              Explore verified employer locations, NAPS apprenticeships, and government training centres across India
            </p>
          </div>

          {/* Toggle Map / List View */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setViewMode("map")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "map"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              List View
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-3 flex-wrap flex-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-bold">State / UT:</span>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold cursor-pointer focus:bg-white"
              >
                <option value="all">All States</option>
                {regions.map((r) => (
                  <option key={r.state} value={r.state}>
                    {r.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-bold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 font-bold cursor-pointer focus:bg-white"
              >
                <option value="all">All Types</option>
                <option value="opportunity">Employers & Jobs</option>
                <option value="training_centre">Training Centres & ITIs</option>
              </select>
            </div>
          </div>

          <span className="text-slate-700 font-bold">
            Showing <strong className="text-slate-900">{markers.length}</strong> Mapped Locations
          </span>
        </div>

        {/* Unmapped Information Notice */}
        {unmappedCount > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-amber-900 leading-relaxed font-medium">
              <strong>Geospatial Invariant:</strong> {unmappedCount} active opportunities in this region (including 100% remote positions and district-wide programs) do not have verified physical street coordinates. In accordance with platform integrity rules, no false markers are invented on the map. You can browse them directly in the{" "}
              <Link href="/dashboard/local-opportunities" className="font-bold underline text-indigo-700 hover:text-indigo-900">
                Catalog View
              </Link>
              .
            </p>
          </div>
        )}

        {/* View Mode Content */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs text-slate-600 font-bold">Rendering interactive map markers...</p>
          </div>
        ) : viewMode === "map" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Container */}
            <div className="lg:col-span-2">
              <InteractiveOpportunityMap
                markers={markers}
                selectedMarkerId={selectedMarker?.id}
                onSelectMarker={setSelectedMarker}
              />
            </div>

            {/* Selected Marker Detail Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between space-y-4">
              {selectedMarker ? (
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      {selectedMarker.category}
                    </span>
                    {selectedMarker.isGovernmentProgram && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        Govt Initiative
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {selectedMarker.title}
                    </h3>
                    <p className="text-xs font-bold text-slate-700 mt-1">
                      {selectedMarker.organization}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="text-slate-800 font-medium">
                        {selectedMarker.address}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-semibold pl-5">
                      District: {selectedMarker.district} | State: {selectedMarker.state}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 pl-5">
                      Geo: {selectedMarker.coordinates.latitude.toFixed(4)}, {selectedMarker.coordinates.longitude.toFixed(4)}
                    </div>
                  </div>

                  {selectedMarker.stipend && (
                    <div className="text-xs font-extrabold text-emerald-700">
                      Stipend: {selectedMarker.stipend}
                    </div>
                  )}

                  {selectedMarker.sourceUrl && (
                    <a
                      href={selectedMarker.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 w-full justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs text-xs"
                    >
                      Official Portal <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center mb-1">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">Select a Location</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Click any marker on the map to view opportunity specifications and verified source details.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-semibold text-center">
                All coordinates validated against official geographic registries.
              </div>
            </div>
          </div>
        ) : (
          /* List View Alternative */
          <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
            {markers.map((m) => (
              <div
                key={m.id}
                className="p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                      {m.category}
                    </span>
                    {m.isGovernmentProgram && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                        Govt Program
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {m.title}
                  </h4>
                  <p className="text-slate-600 font-semibold">
                    {m.organization} &bull; {m.address}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-slate-500 font-medium">
                    {m.coordinates.latitude.toFixed(3)}, {m.coordinates.longitude.toFixed(3)}
                  </span>
                  {m.sourceUrl && (
                    <a
                      href={m.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 font-bold text-indigo-600 flex items-center gap-1"
                    >
                      Source <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentPortalLayout>
  );
}
