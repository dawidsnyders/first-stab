"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area, formatPrice, formatPriceChange } from "@/types";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

// Coordinates for all Western Cape areas
const AREA_COORDINATES: Record<string, [number, number]> = {
  // Province
  "western-cape": [22.0, -20.0],
  // Cities
  "cape-town": [18.4241, -33.9249],
  paarl: [18.9752, -33.7342],
  stellenbosch: [18.8602, -33.9322],
  // Cape Town Suburbs
  "camps-bay": [18.3756, -33.9508],
  "sea-point": [18.3889, -33.9167],
  "green-point": [18.4056, -33.9092],
  woodstock: [18.4444, -33.9278],
  observatory: [18.4722, -33.9389],
  claremont: [18.4722, -33.9806],
  constantia: [18.4167, -34.0278],
  // Paarl Suburbs
  "val-de-vie": [18.9667, -33.7333],
  "pearl-valley": [18.9833, -33.75],
  // Stellenbosch Suburbs
  "de-zalze": [18.8667, -34.0167],
};

function getAreaCoordinates(area: Area): [number, number] {
  return (
    AREA_COORDINATES[area.slug] || [
      DEFAULT_MAP_CENTER[0],
      DEFAULT_MAP_CENTER[1],
    ]
  );
}

interface LeafletMapProps {
  areas: Area[];
  selectedArea: Area | null;
  onAreaClick: (area: Area) => void;
  onAreaHover?: (area: Area | null) => void;
}

export function LeafletMap({
  areas,
  selectedArea,
  onAreaClick,
  onAreaHover,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const [hoveredArea, setHoveredArea] = useState<Area | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icon issue
      delete (L.default as any).Icon.Default.prototype._getIconUrl;
      (L.default as any).Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.default.map(mapRef.current!, {
        center: [DEFAULT_MAP_CENTER[1], DEFAULT_MAP_CENTER[0]],
        zoom: DEFAULT_MAP_ZOOM,
        zoomControl: false,
        attributionControl: true,
      });

      // Add OpenStreetMap tile layer
      L.default
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
        .addTo(map);

      mapInstanceRef.current = map;
      setIsMapReady(true);

      // Add markers
      areas.forEach((area) => {
        const coords = getAreaCoordinates(area);
        const { stats } = area;
        const isPositive = stats && stats.priceChangeYoY >= 0;

        // Create custom marker HTML
        const markerDiv = document.createElement("div");
        markerDiv.className = "custom-marker";
        markerDiv.innerHTML = `
          <div class="marker-pin ${
            selectedArea?.id === area.id ? "selected" : ""
          } ${stats ? (isPositive ? "positive" : "negative") : "neutral"}">
            <div class="marker-dot"></div>
          </div>
        `;

        const customIcon = L.default.divIcon({
          html: markerDiv.outerHTML,
          className: "custom-marker-container",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        const marker = L.default
          .marker([coords[1], coords[0]], { icon: customIcon })
          .addTo(map);

        // Create popup with area info
        const popupContent = document.createElement("div");
        popupContent.innerHTML = `
          <div style="padding: 12px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #171717;">${
              area.name
            }</h3>
            ${
              stats
                ? `
              <div style="margin-bottom: 8px;">
                <div style="font-size: 20px; font-weight: 700; color: #171717; margin-bottom: 4px;">
                  ${formatPrice(stats.avgPrice)}
                </div>
                <div style="font-size: 12px; color: #78716c;">
                  ${formatPriceChange(stats.priceChangeYoY)} YoY
                </div>
              </div>
              <button class="view-details-btn" data-area-id="${area.id}" style="
                width: 100%;
                padding: 8px 12px;
                background: #5d7350;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s;
              ">View Details</button>
            `
                : ""
            }
          </div>
        `;

        // Add click handler to button
        const button = popupContent.querySelector(".view-details-btn");
        if (button) {
          button.addEventListener("click", (e) => {
            e.stopPropagation();
            onAreaClick(area);
            marker.closePopup();
          });
        }

        marker.bindPopup(popupContent, {
          className: "custom-popup",
          maxWidth: 250,
          closeButton: true,
        });

        // Add click handler
        marker.on("click", () => {
          onAreaClick(area);
        });

        // Add hover handlers
        marker.on("mouseover", () => {
          setHoveredArea(area);
          onAreaHover?.(area);
        });

        marker.on("mouseout", () => {
          setHoveredArea(null);
          onAreaHover?.(null);
        });

        markersRef.current.set(area.id, marker);
      });

      // Auto-focus on selected area
      if (selectedArea) {
        const coords = getAreaCoordinates(selectedArea);
        map.setView([coords[1], coords[0]], 12, {
          animate: true,
          duration: 0.3,
        });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current.clear();
    };
  }, []);

  // Update markers when selected area changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    import("leaflet").then((L) => {
      markersRef.current.forEach((marker, areaId) => {
        const area = areas.find((a) => a.id === areaId);
        if (!area) return;

        const coords = getAreaCoordinates(area);
        const { stats } = area;
        const isPositive = stats && stats.priceChangeYoY >= 0;
        const isSelected = selectedArea?.id === area.id;

        // Update marker icon
        const markerDiv = document.createElement("div");
        markerDiv.className = "custom-marker";
        markerDiv.innerHTML = `
          <div class="marker-pin ${isSelected ? "selected" : ""} ${
          stats ? (isPositive ? "positive" : "negative") : "neutral"
        }">
            <div class="marker-dot"></div>
          </div>
        `;

        const customIcon = L.default.divIcon({
          html: markerDiv.outerHTML,
          className: "custom-marker-container",
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        marker.setIcon(customIcon);

        // Focus on selected area
        if (isSelected) {
          mapInstanceRef.current.setView([coords[1], coords[0]], 12, {
            animate: true,
            duration: 0.3,
          });
        }
      });
    });
  }, [selectedArea, isMapReady, areas]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl" />

      {/* Custom CSS for markers */}
      <style jsx global>{`
        .custom-marker-container {
          background: transparent !important;
          border: none !important;
        }

        .marker-pin {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .marker-pin.positive {
          background: #10b981;
        }

        .marker-pin.negative {
          background: #ef4444;
        }

        .marker-pin.neutral {
          background: #78716c;
        }

        .marker-pin.selected {
          background: #5d7350;
          transform: scale(1.3);
          z-index: 1000;
        }

        .marker-dot {
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
        }

        .leaflet-container {
          font-family: inherit;
        }

        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .view-details-btn:hover {
          background: #4a5c3f !important;
        }

        .leaflet-popup-close-button {
          color: #78716c !important;
          font-size: 20px !important;
          padding: 8px !important;
        }

        .leaflet-popup-close-button:hover {
          color: #171717 !important;
        }
      `}</style>

      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200 overflow-hidden">
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomIn();
              }
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-stone-100 transition-colors duration-200 border-b border-stone-200"
            aria-label="Zoom in"
          >
            <svg
              className="w-5 h-5 text-stone-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
          <button
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomOut();
              }
            }}
            className="w-10 h-10 flex items-center justify-center hover:bg-stone-100 transition-colors duration-200"
            aria-label="Zoom out"
          >
            <svg
              className="w-5 h-5 text-stone-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
        </div>

        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView(
                [DEFAULT_MAP_CENTER[1], DEFAULT_MAP_CENTER[0]],
                DEFAULT_MAP_ZOOM,
                { animate: true, duration: 0.3 }
              );
            }
          }}
          className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors duration-200"
          aria-label="Reset view"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
