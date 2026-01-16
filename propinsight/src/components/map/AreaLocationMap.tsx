"use client";

import { useEffect, useRef } from "react";
import { Area } from "@/types";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";
import { getAreaBoundaryPolygon } from "@/data/areaBoundaries";
import { getBoundaryForArea } from "@/lib/geojson-boundaries";
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

// Get area boundary - uses real GeoJSON boundaries when available
async function getAreaBoundaryAsync(area: Area): Promise<[number, number][]> {
  // First try to get real boundary from City of Cape Town GeoJSON API
  if (area.level === "suburb") {
    const geoJSONBoundary = await getBoundaryForArea(area.slug);
    if (geoJSONBoundary) {
      return geoJSONBoundary;
    }
  }

  // Fallback: Try static boundary data
  const staticBoundary = getAreaBoundaryPolygon(area.slug);
  if (staticBoundary) {
    return staticBoundary;
  }

  // Last resort: Generate approximate polygon
  const coords = getAreaCoordinates(area);
  const [lng, lat] = coords;
  const size =
    area.level === "province" ? 2.0 : area.level === "city" ? 0.3 : 0.02;

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

interface AreaLocationMapProps {
  area: Area;
}

export function AreaLocationMap({ area }: AreaLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Check if container already has a map instance
    if ((mapRef.current as any)._leaflet_id) {
      console.warn("Map container already initialized, skipping...");
      return;
    }

    // Dynamically import Leaflet and fetch boundaries
    Promise.all([import("leaflet"), getAreaBoundaryAsync(area)]).then(
      ([L, boundary]) => {
        const coords = getAreaCoordinates(area);

        // Determine zoom level based on area level
        const zoom =
          area.level === "province" ? 9 : area.level === "city" ? 12 : 14; // suburb

        const map = L.default.map(mapRef.current!, {
          center: [coords[1], coords[0]], // [lat, lng] for Leaflet
          zoom: zoom,
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          touchZoom: false,
          doubleClickZoom: false,
          scrollWheelZoom: false,
          boxZoom: false,
          keyboard: false,
        });

        // Add OpenStreetMap tile layer (full color, no grayscale)
        L.default
          .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "",
            maxZoom: 19,
          })
          .addTo(map);

        // Map is now colored - no grayscale filter

        // Add area polygon with new styling (matching main map)
        const polygon = L.default
          .polygon(boundary, {
            color: "#4a5c3f", // sage-600 - solid green border (brand)
            weight: 3.5,
            fillColor: "#e8ede6", // sage-100 - light green tint
            fillOpacity: 0.6, // Nice visible green tint
            className: "area-location-polygon",
            interactive: false, // Non-interactive for preview
          })
          .addTo(map);

        // Fit map bounds to polygon with padding
        if (boundary && boundary.length > 0) {
          const bounds = polygon.getBounds();
          map.fitBounds(bounds, {
            padding: [40, 40], // Increased padding to zoom out more - ensures entire area is visible
            maxZoom: area.level === "province" ? 9 : area.level === "city" ? 12 : 14,
          });
        }

        mapInstanceRef.current = map;
      }
    );

    return () => {
      if (mapInstanceRef.current) {
        try {
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
  }, [area]);

  return (
    <div className="relative w-full h-[400px] rounded-2xl overflow-hidden border border-stone-200 bg-stone-50 pointer-events-none z-0">
      <div ref={mapRef} className="w-full h-full pointer-events-none relative z-0" />

      {/* Custom CSS for map styling - matching main map */}
      <style jsx global>{`
        .leaflet-container {
          font-family: inherit;
          background: #f5f5f4;
          z-index: 1 !important;
        }

        /* Constrain all Leaflet panes to low z-index */
        .leaflet-pane {
          z-index: 1 !important;
        }

        .leaflet-map-pane {
          z-index: 1 !important;
        }

        .leaflet-tile-pane {
          z-index: 1 !important;
        }

        .leaflet-overlay-pane {
          z-index: 2 !important;
        }

        .leaflet-shadow-pane {
          z-index: 3 !important;
        }

        .leaflet-marker-pane {
          z-index: 4 !important;
        }

        .leaflet-tooltip-pane {
          z-index: 5 !important;
        }

        .leaflet-popup-pane {
          z-index: 6 !important;
        }

        .leaflet-control-container {
          z-index: 7 !important;
        }

        /* Remove focus outline from polygons */
        .leaflet-interactive:focus,
        .leaflet-interactive:focus-visible {
          outline: none !important;
          outline-offset: 0 !important;
        }

        .area-location-polygon:focus,
        .area-location-polygon:focus-visible {
          outline: none !important;
          outline-offset: 0 !important;
        }
      `}</style>

      <div className="absolute bottom-2 right-2 text-xs text-stone-500 bg-white/90 px-2 py-1 rounded backdrop-blur-sm">
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-stone-700 transition-colors"
        >
          © OpenStreetMap
        </a>
      </div>
    </div>
  );
}
