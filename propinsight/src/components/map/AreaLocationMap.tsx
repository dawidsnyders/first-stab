"use client";

import { useEffect, useRef } from "react";
import { Area } from "@/types";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";
import { getBoundaryForArea } from "@/lib/geojson-boundaries";
import "leaflet/dist/leaflet.css";

// Coordinates for all Western Cape areas [lng, lat] format
const AREA_COORDINATES: Record<string, [number, number]> = {
  // Province
  "western-cape": [22.0, -20.0],
  // Cities
  "cape-town": [18.4241, -33.9249],
  paarl: [18.9752, -33.7342],
  stellenbosch: [18.8602, -33.9322],
  franschhoek: [19.1233, -33.9094],
  // Cape Town Suburbs
  "camps-bay": [18.3756, -33.9508],
  "sea-point": [18.3889, -33.9167],
  "green-point": [18.4056, -33.9092],
  woodstock: [18.4444, -33.9278],
  observatory: [18.4722, -33.9389],
  claremont: [18.4722, -33.9806],
  constantia: [18.4167, -34.0278],
  // Paarl Estates
  "val-de-vie": [18.9667, -33.7333],
  "pearl-valley": [18.9833, -33.75],
  boschendal: [18.945, -33.72],
  boschenmeer: [18.96, -33.74],
  "winelands-estate-paarl": [18.95, -33.73],
  "sante-wine-estate": [18.955, -33.725],
  "kleine-parys": [18.94, -33.735],
  "paarl-valleij": [18.98, -33.745],
  // Paarl Suburbs
  courtrai: [18.97, -33.72],
  lemoenkloof: [18.975, -33.73],
  groenvlei: [18.965, -33.74],
  "charleston-hill": [18.96, -33.725],
  "de-zoete-inval": [18.955, -33.732],
  "klein-nederburg": [18.95, -33.728],
  denneburg: [18.945, -33.735],
  vrykyk: [18.94, -33.738],
  // Stellenbosch Estates
  "de-zalze": [18.8667, -34.0167],
  devonvale: [18.85, -33.98],
  devonbosch: [18.87, -33.96],
  koelenbosch: [18.855, -33.975],
  "devon-valley": [18.845, -33.985],
  // Stellenbosch Suburbs
  "stellenbosch-central": [18.8602, -33.9322],
  dalsig: [18.855, -33.93],
  welgevonden: [18.865, -33.935],
  mostertsdrift: [18.85, -33.928],
  // Franschhoek Estates
  "domaine-des-anges": [19.12, -33.91],
  "fransche-hoek": [19.125, -33.915],
  "winelands-estate-franschhoek": [19.115, -33.905],
  "delta-crest": [19.13, -33.92],
  "la-petite-provence": [19.118, -33.912],
  // Franschhoek Suburbs
  "franschhoek-village": [19.1233, -33.9094],
  "franschhoek-rural": [19.11, -33.9],
  "groendal-franschhoek": [19.128, -33.908],
  langrug: [19.135, -33.91],
  "la-motte": [19.105, -33.902],
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
  // ALWAYS try to get real boundary from official API sources first
  // This ensures pixel-perfect accuracy down to the last coordinate
  const geoJSONBoundary = await getBoundaryForArea(area.slug);
  if (geoJSONBoundary && geoJSONBoundary.length > 0) {
    if (geoJSONBoundary.length >= 50) {
      console.log(
        `Using high-precision API boundary for ${area.slug} with ${geoJSONBoundary.length} points - pixel-perfect accuracy`
      );
    } else {
      console.warn(
        `API boundary for ${area.slug} has only ${geoJSONBoundary.length} points - may lack precision. For pixel-perfect accuracy, boundaries should have 100+ points.`
      );
    }
    return geoJSONBoundary;
  }

  // NO FALLBACK - If API boundary not found, return empty array
  // This ensures we never use inaccurate static boundaries
  console.error(
    `No API boundary found for ${area.slug} - cannot display accurate boundary. Please ensure the area exists in official municipal GIS data.`
  );
  // Return empty array instead of null to satisfy type requirements
  // The map component should handle empty boundaries gracefully
  return [];
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
            padding: [60, 60], // Increased padding to zoom out more - ensures entire area is visible with more context
            maxZoom:
              area.level === "province" ? 9 : area.level === "city" ? 12 : 13,
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
      <div
        ref={mapRef}
        className="w-full h-full pointer-events-none relative z-0"
      />

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
