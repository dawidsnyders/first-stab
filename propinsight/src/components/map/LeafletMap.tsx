"use client";

import { useEffect, useRef, useState } from "react";
import { Area } from "@/types";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import { getAreaBoundaryPolygon } from "@/data/areaBoundaries";
import "leaflet/dist/leaflet.css";

// Coordinates for all Western Cape areas [lng, lat] format
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

function getAreaBoundary(area: Area): [number, number][] {
  // First try to get real boundary from boundaries data
  const realBoundary = getAreaBoundaryPolygon(area.slug);
  if (realBoundary) {
    return realBoundary;
  }

  // Fallback: Generate approximate polygon if no real boundary exists
  const coords = getAreaCoordinates(area); // Returns [lng, lat]
  const [lng, lat] = coords;
  
  // Adjust size based on area level
  const size =
    area.level === "province" ? 2.0 : area.level === "city" ? 0.4 : 0.05;
  
  // Generate simple polygon as fallback
  const points: [number, number][] = [];
  const sides = 6;
  for (let i = 0; i <= sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    const radius = size;
    const pointLng = lng + radius * Math.cos(angle);
    const pointLat = lat + radius * Math.sin(angle);
    // Leaflet expects [lat, lng] format
    points.push([pointLat, pointLng]);
  }
  return points;
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
  const polygonsRef = useRef<Map<string, any>>(new Map());
  const [hoveredArea, setHoveredArea] = useState<Area | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Store callbacks in refs to ensure latest versions are used
  const onAreaClickRef = useRef(onAreaClick);
  const onAreaHoverRef = useRef(onAreaHover);

  useEffect(() => {
    onAreaClickRef.current = onAreaClick;
    onAreaHoverRef.current = onAreaHover;
  }, [onAreaClick, onAreaHover]);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Check if container already has a map instance
    if ((mapRef.current as any)._leaflet_id) {
      return;
    }

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      const map = L.default.map(mapRef.current!, {
        center: [DEFAULT_MAP_CENTER[1], DEFAULT_MAP_CENTER[0]], // [lat, lng] for Leaflet
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

      // Map is now colored - no grayscale filter
      // Keep slight brightness adjustment for better contrast with overlays

      mapInstanceRef.current = map;
      setIsMapReady(true);
    });

    return () => {
      if (mapInstanceRef.current) {
        try {
          // Clear all polygons
          polygonsRef.current.forEach((polygon) => {
            mapInstanceRef.current.removeLayer(polygon);
          });
          polygonsRef.current.clear();

          mapInstanceRef.current.remove();
          // Clear the leaflet ID from the container
          if (mapRef.current) {
            delete (mapRef.current as any)._leaflet_id;
          }
        } catch (e) {
          console.warn("Error removing map:", e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []); // Only run once for map initialization

  // Add/update polygons when map is ready and areas change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || areas.length === 0) return;

    // Clear existing polygons
    polygonsRef.current.forEach((polygon) => {
      mapInstanceRef.current.removeLayer(polygon);
    });
    polygonsRef.current.clear();

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      // Add area polygons
      areas.forEach((area) => {
        const boundary = getAreaBoundary(area); // Returns [lat, lng] format
        const coords = getAreaCoordinates(area); // Returns [lng, lat]

        const isSelected = selectedArea?.id === area.id;
        const isHovered = hoveredArea?.id === area.id;

        // Determine polygon style - make boundaries clearly visible and prominent
        // Default state - subtle neutral tones
        let fillColor = "#a8b89d"; // sage-300 - subtle green tint
        let borderColor = "#5d7350"; // sage-500 - visible border
        let borderWidth = 2;
        let fillOpacity = 0.2; // Subtle default

        // Selected state - nice green tint with solid green borders (brand colors)
        if (isSelected) {
          fillColor = "#e8ede6"; // sage-100 - light green tint
          borderColor = "#4a5c3f"; // sage-600 - solid green border (brand)
          borderWidth = 3.5;
          fillOpacity = 0.6; // Nice visible green tint when selected
        } else if (isHovered) {
          // Hover state - medium green tint
          fillColor = "#d1d9cc"; // sage-200 - medium green tint
          borderColor = "#5d7350"; // sage-500
          borderWidth = 2.5;
          fillOpacity = 0.3;
        }

        const polygon = L.default
          .polygon(boundary, {
            color: borderColor,
            weight: borderWidth,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            className: `area-polygon area-${area.id}`,
            interactive: true,
            bubblingMouseEvents: false,
          })
          .addTo(mapInstanceRef.current);

        // Add tooltip with area name - nice looking tooltip
        const tooltipContent = `
          <div style="
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #2a2520;
            padding: 6px 12px;
            margin: 0;
            text-align: center;
          ">${area.name}</div>
        `;
        
        polygon.bindTooltip(tooltipContent, {
          permanent: false,
          direction: "auto",
          className: "area-tooltip",
          offset: [0, -10],
          opacity: 0.95,
        });

        // Add click handler - use refs to get latest callbacks
        polygon.on("click", (e) => {
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
          }
          onAreaClickRef.current(area);
        });

        // Add hover handlers
        polygon.on("mouseover", () => {
          setHoveredArea(area);
          onAreaHoverRef.current?.(area);
          // Show tooltip and update style
          polygon.openTooltip();
          if (!isSelected) {
            polygon.setStyle({ fillOpacity: 0.35 });
          }
        });

        polygon.on("mouseout", () => {
          setHoveredArea(null);
          onAreaHoverRef.current?.(null);
          // Hide tooltip and restore original style
          polygon.closeTooltip();
          // Restore original style based on selection state
          if (!isSelected) {
            polygon.setStyle({ fillOpacity: 0.2 });
          } else {
            polygon.setStyle({ fillOpacity: 0.6 });
          }
        });

        polygonsRef.current.set(area.id, polygon);
      });

      // Auto-focus on selected area
      if (selectedArea) {
        const coords = getAreaCoordinates(selectedArea); // [lng, lat]
        mapInstanceRef.current.setView([coords[1], coords[0]], 12, {
          // Convert to [lat, lng] for Leaflet
          animate: true,
          duration: 0.3,
        });
      }
    });
  }, [areas, isMapReady, selectedArea, hoveredArea]); // Re-run when areas change or map becomes ready

  // Update polygon styles when selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    polygonsRef.current.forEach((polygon, areaId) => {
      const area = areas.find((a) => a.id === areaId);
      if (!area) return;

      const isSelected = selectedArea?.id === area.id;
      const isHovered = hoveredArea?.id === area.id;

      // Determine polygon style - match initial creation styles
      // Default state - subtle green tint
      let fillColor = "#a8b89d"; // sage-300
      let borderColor = "#5d7350"; // sage-500
      let borderWidth = 2;
      let fillOpacity = 0.2;

      // Selected state - nice green tint with solid green borders
      if (isSelected) {
        fillColor = "#e8ede6"; // sage-100 - light green tint
        borderColor = "#4a5c3f"; // sage-600 - solid green border (brand)
        borderWidth = 3.5;
        fillOpacity = 0.6; // Nice visible green tint
      } else if (isHovered) {
        // Hover state - medium green tint
        fillColor = "#d1d9cc"; // sage-200
        borderColor = "#5d7350"; // sage-500
        borderWidth = 2.5;
        fillOpacity = 0.3;
      }

      polygon.setStyle({
        color: borderColor,
        weight: borderWidth,
        fillColor: fillColor,
        fillOpacity: fillOpacity,
        cursor: "pointer",
      });

      // Focus on selected area
      if (isSelected) {
        const coords = getAreaCoordinates(area);
        mapInstanceRef.current.setView([coords[1], coords[0]], 12, {
          animate: true,
          duration: 0.3,
        });
      }
    });
  }, [selectedArea, hoveredArea, isMapReady, areas]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl" />

      {/* Custom CSS for map styling */}
      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
          background: #f5f5f4;
        }

        /* Ensure all interactive elements are clickable */
        .leaflet-interactive {
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        .leaflet-interactive:hover {
          cursor: pointer !important;
        }

        .area-polygon {
          cursor: pointer !important;
          pointer-events: auto !important;
        }

        .area-polygon:hover {
          cursor: pointer !important;
        }

        /* Ensure map doesn't block interactions */
        .leaflet-map-pane {
          pointer-events: auto;
        }

        .leaflet-overlay-pane {
          pointer-events: auto !important;
        }

        .leaflet-overlay-pane svg {
          pointer-events: auto !important;
        }

        /* Make sure paths are clickable */
        .leaflet-overlay-pane svg path {
          pointer-events: auto !important;
          cursor: pointer !important;
        }

        /* Custom tooltip styling - nice looking tooltip */
        .area-tooltip {
          background: white !important;
          border: 1px solid #ddd9d0 !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          padding: 0 !important;
          margin: 0 !important;
          font-weight: 600 !important;
        }

        /* Remove the triangle pointer */
        .area-tooltip::before {
          display: none !important;
        }

        .area-tooltip::after {
          display: none !important;
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
