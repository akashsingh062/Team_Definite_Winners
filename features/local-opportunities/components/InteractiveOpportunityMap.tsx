"use client";

import React, { useEffect, useRef, useState } from "react";
import { IMapMarkerItem } from "@/types/local-opportunity";
import {
  MapPin,
  Building,
  GraduationCap,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Layers,
} from "lucide-react";

interface InteractiveOpportunityMapProps {
  markers: IMapMarkerItem[];
  selectedMarkerId?: string | null;
  onSelectMarker?: (marker: IMapMarkerItem | null) => void;
  center?: [number, number];
  zoom?: number;
}

export default function InteractiveOpportunityMap({
  markers,
  selectedMarkerId,
  onSelectMarker,
  center = [22.9734, 78.6569], // Default center of India
  zoom = 5,
}: InteractiveOpportunityMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      // Ensure CSS is loaded
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      // Free OpenStreetMap Tile Layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      const markerGroup = L.layerGroup().addTo(map);
      markerGroupRef.current = markerGroup;
      mapInstanceRef.current = map;

      setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update Markers on map
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !markerGroupRef.current) return;

    let isMounted = true;

    async function updateMarkers() {
      const L = (await import("leaflet")).default;
      if (!isMounted || !markerGroupRef.current) return;

      markerGroupRef.current.clearLayers();

      const bounds = L.latLngBounds([]);

      markers.forEach((m) => {
        if (!m.coordinates || typeof m.coordinates.latitude !== "number" || typeof m.coordinates.longitude !== "number") {
          return;
        }

        const isCentre = m.type === "training_centre";
        const isSelected = selectedMarkerId === m.id;

        // Custom HTML Marker using Tailwind
        const markerHtml = `
          <div class="relative cursor-pointer group transform transition-transform hover:scale-125 ${isSelected ? "scale-125 z-50" : ""}">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white ${
              isCentre
                ? "bg-emerald-600 ring-2 ring-emerald-400"
                : m.isGovernmentProgram
                ? "bg-purple-600 ring-2 ring-purple-400"
                : "bg-blue-600 ring-2 ring-blue-400"
            }">
              ${
                isCentre
                  ? '<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>'
                  : '<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
              }
            </div>
            ${
              m.isGovernmentProgram
                ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 border border-white rounded-full"></span>'
                : ""
            }
          </div>
        `;

        const customIcon = L.divIcon({
          html: markerHtml,
          className: "custom-leaflet-marker",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const marker = L.marker([m.coordinates.latitude, m.coordinates.longitude], {
          icon: customIcon,
        });

        // Popup Content
        const popupContent = document.createElement("div");
        popupContent.className = "p-1 text-slate-800 text-xs space-y-1.5 max-w-xs";
        popupContent.innerHTML = `
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
              isCentre ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
            }">
              ${isCentre ? "Training Centre" : m.category}
            </span>
            ${
              m.isGovernmentProgram
                ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Govt Initiative</span>'
                : ""
            }
          </div>
          <h4 class="font-bold text-sm text-slate-900 leading-snug">${m.title}</h4>
          <p class="text-slate-600 font-medium">${m.organization}</p>
          <p class="text-slate-500 text-[11px]">${m.address}</p>
          ${
            m.stipend
              ? `<p class="text-emerald-700 font-semibold text-[11px]">Stipend: ${m.stipend}</p>`
              : ""
          }
          ${
            m.sourceUrl
              ? `<a href="${m.sourceUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold text-[11px] mt-1">
                  View Official Portal &rarr;
                 </a>`
              : ""
          }
        `;

        marker.bindPopup(popupContent);

        marker.on("click", () => {
          if (onSelectMarker) {
            onSelectMarker(m);
          }
        });

        markerGroupRef.current.addLayer(marker);
        bounds.extend([m.coordinates.latitude, m.coordinates.longitude]);
      });

      // Adjust map view to fit markers if markers exist
      if (markers.length > 0 && bounds.isValid() && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    }

    updateMarkers();

    return () => {
      isMounted = false;
    };
  }, [markers, selectedMarkerId, mapLoaded, onSelectMarker]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-xs space-y-1.5">
        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1">
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          Map Legend ({markers.length} Locations)
        </span>
        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="w-3 h-3 rounded-full bg-blue-600 inline-block shrink-0" />
          <span>Employer Opportunities & Jobs</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shrink-0" />
          <span>ITIs & Training Centres</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
          <span className="w-3 h-3 rounded-full bg-purple-600 inline-block shrink-0" />
          <span>Govt Schemes & NAPS Apprenticeships</span>
        </div>
      </div>
    </div>
  );
}

