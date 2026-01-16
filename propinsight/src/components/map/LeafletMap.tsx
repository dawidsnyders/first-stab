"use client";

import { useEffect, useRef, useState } from "react";
import { Area } from "@/types";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import {
  getBoundaryForArea,
  prefetchBoundaries,
} from "@/lib/geojson-boundaries";
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
  // Estates
  "val-de-vie": [18.975, -33.7417], // Merged Val de Vie and Pearl Valley center
  boschendal: [18.945, -33.72],
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

// This function will be async - boundaries are loaded dynamically from official APIs
// NO FALLBACKS - only use pixel-perfect boundaries from official sources
async function getAreaBoundaryAsync(area: Area): Promise<[number, number][]> {
  // ALWAYS try to get real boundary from official API sources
  // This ensures pixel-perfect accuracy down to the last coordinate
  try {
    console.log(`🔍 Fetching boundary for ${area.name} (${area.slug})...`);
    const geoJSONBoundary = await getBoundaryForArea(area.slug);
    if (geoJSONBoundary && geoJSONBoundary.length > 0) {
      if (geoJSONBoundary.length >= 50) {
        console.log(
          `✓ Using high-precision API boundary for ${area.name} (${area.slug}) with ${geoJSONBoundary.length} points`
        );
      } else {
        console.warn(
          `⚠ API boundary for ${area.name} (${area.slug}) has only ${geoJSONBoundary.length} points - may lack precision`
        );
      }
      return geoJSONBoundary;
    }

    // NO FALLBACK - If API boundary not found, return empty array
    // This ensures we never use inaccurate approximations
    console.error(
      `✗ No API boundary found for ${area.name} (${area.slug}) - getBoundaryForArea returned null or empty array`
    );
    return [];
  } catch (error) {
    console.error(
      `✗ Error fetching boundary for ${area.name} (${area.slug}):`,
      error
    );
    return [];
  }
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
  const mapInstanceRef = useRef<unknown>(null);
  const polygonsRef = useRef<Map<string, unknown>>(new Map());
  const polygonBoundsRef = useRef<Map<string, unknown>>(new Map());
  const [isMapReady, setIsMapReady] = useState(false);
  const [viewportBounds, setViewportBounds] = useState<unknown>(null);
  // Removed hoveredArea state - hover is handled directly in event handlers to prevent flashing

  // Store callbacks in refs to ensure latest versions are used
  const onAreaClickRef = useRef(onAreaClick);
  const onAreaHoverRef = useRef(onAreaHover);

  useEffect(() => {
    onAreaClickRef.current = onAreaClick;
    onAreaHoverRef.current = onAreaHover;
  }, [onAreaClick, onAreaHover]);

  // Track if we're currently updating styles to prevent recursive updates
  const isUpdatingStylesRef = useRef(false);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Check if container already has a map instance
    if ((mapRef.current as { _leaflet_id?: number })._leaflet_id) {
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

      // Track viewport bounds changes
      const updateViewportBounds = () => {
        if (map) {
          setViewportBounds(map.getBounds());
        }
      };

      // Update immediately
      updateViewportBounds();

      // Listen to map move and zoom events
      map.on("moveend", updateViewportBounds);
      map.on("zoomend", updateViewportBounds);
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

  // Pre-fetch boundaries when component mounts
  useEffect(() => {
    prefetchBoundaries();
  }, []);

  // Track areas to prevent unnecessary recreation
  const areasIdsRef = useRef<string>("");

  // Add/update polygons when map is ready and areas change
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady || areas.length === 0) return;

    // Create stable ID string from area IDs to detect actual changes
    const currentAreasIds = areas
      .map((a) => a.id)
      .sort()
      .join(",");

    // Only recreate polygons if areas actually changed (different IDs)
    if (
      areasIdsRef.current === currentAreasIds &&
      polygonsRef.current.size > 0
    ) {
      // Areas haven't changed, just update styles if needed
      return;
    }

    areasIdsRef.current = currentAreasIds;

    // Clear existing polygons
    polygonsRef.current.forEach((polygon) => {
      mapInstanceRef.current.removeLayer(polygon);
    });
    polygonsRef.current.clear();

    // Dynamically import Leaflet and fetch boundaries
    console.log(
      `Loading boundaries for ${areas.length} areas:`,
      areas.map((a) => a.name)
    );
    Promise.all([
      import("leaflet"),
      Promise.all(areas.map((area) => getAreaBoundaryAsync(area))),
    ]).then(([L, boundaries]) => {
      const validBoundaries = boundaries.filter((b) => b && b.length > 0);
      console.log(
        `Loaded ${boundaries.length} boundaries, ${validBoundaries.length} are valid`
      );
      const areasWithBoundaries = areas.filter(
        (a, i) => boundaries[i] && boundaries[i].length > 0
      );
      const areasWithoutBoundaries = areas.filter(
        (a, i) => !boundaries[i] || boundaries[i].length === 0
      );
      console.log(
        `✓ Areas with valid boundaries (${areasWithBoundaries.length}):`,
        areasWithBoundaries.map((a) => a.name)
      );
      if (areasWithoutBoundaries.length > 0) {
        console.error(
          `✗ Areas with missing boundaries (${areasWithoutBoundaries.length}):`,
          areasWithoutBoundaries.map((a) => a.name)
        );
      }
      // Calculate and store polygon bounds for ALL areas (needed for viewport culling)
      polygonBoundsRef.current.clear();
      areas.forEach((area, index) => {
        const boundary = boundaries[index];
        if (boundary && boundary.length > 0) {
          const bounds = L.default.latLngBounds(boundary);
          polygonBoundsRef.current.set(area.slug, bounds);
        }
      });

      // Helper function to check if polygon is visible
      const isPolygonVisible = (area: Area): boolean => {
        // Always show selected area
        if (selectedArea?.slug === area.slug) return true;

        // If no viewport bounds yet, show all (initial load)
        if (!viewportBounds || !mapInstanceRef.current) return true;

        // Get stored polygon bounds
        const polygonBounds = polygonBoundsRef.current.get(area.slug);
        if (!polygonBounds) return false;

        // Check if polygon bounds intersect with viewport
        return (viewportBounds as any).intersects(polygonBounds);
      };

      // Add area polygons with real boundaries
      areas.forEach((area, index) => {
        const boundary = boundaries[index]; // Returns [lat, lng] format

        // Skip areas with empty or invalid boundaries
        if (!boundary || !Array.isArray(boundary) || boundary.length === 0) {
          console.error(
            `✗ SKIPPING ${area.name} (${area.slug}): boundary is empty or invalid - area will NOT be visible on map`
          );
          return;
        }

        // Skip areas not visible in viewport
        if (!isPolygonVisible(area)) {
          return; // Don't render this polygon
        }

        // Special logging for Stellenbosch to debug
        if (area.slug === "stellenbosch") {
          console.log(
            `🔍 DEBUG Stellenbosch: boundary loaded with ${boundary.length} points`
          );
          console.log(
            `🔍 DEBUG Stellenbosch: first 3 coords:`,
            boundary.slice(0, 3)
          );
          console.log(
            `🔍 DEBUG Stellenbosch: last 3 coords:`,
            boundary.slice(-3)
          );
        }

        const isSelected = selectedArea?.id === area.id;
        // Don't check hoveredArea here - hover is handled only in event handlers
        // This prevents re-renders and flashing when hovering

        // Determine polygon style - make boundaries clearly visible and prominent
        // Default state - subtle neutral tones
        let fillColor = "#a8b89d"; // sage-300 - subtle green tint
        let borderColor = "#5d7350"; // sage-500 - visible border
        let borderWidth = 2;
        let fillOpacity = 0.1; // Very subtle default - 10% opacity for unselected areas

        // Selected state - nice green tint with solid green borders (brand colors)
        if (isSelected) {
          fillColor = "#e8ede6"; // sage-100 - light green tint
          borderColor = "#4a5c3f"; // sage-600 - solid green border (brand)
          borderWidth = 3.5;
          fillOpacity = 0.6; // Nice visible green tint when selected
        }
        // Hover state is NOT set here - it's handled in mouseover/mouseout handlers only

        // Validate boundary coordinates are in correct format [lat, lng]
        // Check first coordinate to ensure it's in Western Cape range
        if (boundary.length > 0) {
          const [firstLat, firstLng] = boundary[0];
          if (
            firstLat < -36 ||
            firstLat > -31 ||
            firstLng < 16 ||
            firstLng > 26
          ) {
            console.error(
              `⚠ WARNING: ${area.name} boundary coordinates seem incorrect. First point: [${firstLat}, ${firstLng}]. Expected Western Cape range: lat -36 to -31, lng 16 to 26`
            );
          }
        }

        console.log(
          `Adding polygon for ${area.name} (${area.slug}) with ${
            boundary.length
          } points. First coord: [${boundary[0]?.[0]}, ${
            boundary[0]?.[1]
          }], Last coord: [${boundary[boundary.length - 1]?.[0]}, ${
            boundary[boundary.length - 1]?.[1]
          }]`
        );
        const polygon = L.default
          .polygon(boundary, {
            color: borderColor,
            weight: borderWidth,
            fillColor: fillColor,
            fillOpacity: fillOpacity,
            className: `area-polygon area-${area.id}`,
            interactive: true,
            bubblingMouseEvents: false,
            // Ensure polygon is clickable and on top layer
            clickable: true,
            pane: "overlayPane", // Ensure polygon is in overlay pane (above tiles)
          })
          .addTo(mapInstanceRef.current);

        // Ensure polygon is in the correct pane and has proper z-index
        const polygonElement = polygon.getElement();
        if (polygonElement) {
          polygonElement.style.pointerEvents = "auto";
          polygonElement.style.cursor = "pointer";
        }

        // Store polygon reference for debugging
        polygonsRef.current.set(area.id, polygon);

        // Special logging for Stellenbosch
        if (area.slug === "stellenbosch") {
          console.log(
            `🔍 DEBUG Stellenbosch: Polygon created and added to map`
          );
          console.log(
            `🔍 DEBUG Stellenbosch: Polygon element:`,
            polygon.getElement()
          );
          console.log(
            `🔍 DEBUG Stellenbosch: Polygon bounds:`,
            polygon.getBounds()
          );
          // Test if polygon is actually on the map
          setTimeout(() => {
            const bounds = polygon.getBounds();
            const center = bounds.getCenter();
            console.log(
              `🔍 DEBUG Stellenbosch: Polygon center: [${center.lat}, ${center.lng}]`
            );
            console.log(
              `🔍 DEBUG Stellenbosch: Polygon visible on map:`,
              mapInstanceRef.current &&
                mapInstanceRef.current.getBounds().intersects(bounds)
            );
          }, 1000);
        }

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
          console.log(
            `✓ Click detected on ${area.name} (${area.slug}) polygon`
          );
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
            // Prevent focus on the element to avoid blue outline
            if (e.originalEvent.target) {
              (e.originalEvent.target as HTMLElement).blur();
            }
          }
          // Prevent polygon from receiving focus
          const polygonElement = polygon.getElement();
          if (polygonElement && polygonElement instanceof HTMLElement) {
            polygonElement.setAttribute("tabindex", "-1");
            polygonElement.style.outline = "none";
          }
          onAreaClickRef.current(area);
        });

        // Also add mouseover to verify polygon is interactive
        polygon.on("mouseover", () => {
          console.log(
            `✓ Mouseover detected on ${area.name} (${area.slug}) polygon`
          );
        });

        // Add hover handlers - only update the specific polygon, not state
        // Completely isolated from React state to prevent any re-renders
        polygon.on("mouseover", (e) => {
          // Stop ALL event propagation to prevent any side effects
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
            e.originalEvent.stopImmediatePropagation();
          }
          // DO NOT call onAreaHover callback - it causes re-renders and flashing
          // Hover is purely visual, no state updates needed

          // Show tooltip and update style for THIS polygon only
          // Use direct style update without any React involvement
          polygon.openTooltip();
          if (!isSelected) {
            // Direct style update - no batching needed, Leaflet handles it efficiently
            polygon.setStyle({
              fillOpacity: 0.35,
              fillColor: "#d1d9cc", // sage-200 for hover
              color: "#5d7350", // sage-500
              weight: 2.5,
            });
          }
        });

        polygon.on("mouseout", (e) => {
          // Stop ALL event propagation
          if (e.originalEvent) {
            e.originalEvent.stopPropagation();
            e.originalEvent.stopImmediatePropagation();
          }
          // DO NOT call onAreaHover callback - it causes re-renders and flashing

          // Hide tooltip and restore original style for THIS polygon only
          polygon.closeTooltip();
          // Direct style update - no React involvement
          if (!isSelected) {
            polygon.setStyle({
              fillOpacity: 0.1,
              fillColor: "#a8b89d", // sage-300 default
              color: "#5d7350", // sage-500
              weight: 2,
            });
          } else {
            polygon.setStyle({
              fillOpacity: 0.6,
              fillColor: "#e8ede6", // sage-100 selected
              color: "#4a5c3f", // sage-600
              weight: 3.5,
            });
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
  }, [areas.length, isMapReady, selectedArea?.id]); // Use stable dependencies - only length and IDs, not full objects/arrays

  // Update visible polygons when viewport changes
  useEffect(() => {
    if (
      !mapInstanceRef.current ||
      !isMapReady ||
      polygonsRef.current.size === 0
    )
      return;

    // Re-check visibility and show/hide polygons based on viewport
    import("leaflet").then((L) => {
      const map = mapInstanceRef.current as any;
      if (!map) return;

      const currentBounds = map.getBounds();
      if (!currentBounds) return;

      polygonsRef.current.forEach((polygon: any, areaId: string) => {
        const area = areas.find((a) => a.id === areaId);
        if (!area) return;

        // Always show selected area
        if (selectedArea?.id === area.id) {
          if (!map.hasLayer(polygon)) {
            polygon.addTo(map);
          }
          return;
        }

        // Check if polygon bounds intersect with viewport
        const polygonBounds = polygonBoundsRef.current.get(area.slug);
        if (polygonBounds && currentBounds.intersects(polygonBounds as any)) {
          // Visible - ensure it's on the map
          if (!map.hasLayer(polygon)) {
            polygon.addTo(map);
          }
        } else {
          // Not visible - remove from map
          if (map.hasLayer(polygon)) {
            map.removeLayer(polygon);
          }
        }
      });
    });
  }, [viewportBounds, areas, selectedArea, isMapReady]);

  // Track previous selected area ID to prevent unnecessary updates
  const prevSelectedAreaIdRef = useRef<string | null>(null);

  // Update polygon styles when selection changes (NOT on hover - hover is handled in event handlers)
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const currentSelectedId = selectedArea?.id || null;

    // Only update if selection actually changed
    if (prevSelectedAreaIdRef.current === currentSelectedId) {
      return; // No change, skip update
    }

    prevSelectedAreaIdRef.current = currentSelectedId;

    // Prevent recursive updates during style changes
    if (isUpdatingStylesRef.current) return;
    isUpdatingStylesRef.current = true;

    polygonsRef.current.forEach((polygon, areaId) => {
      const area = areas.find((a) => a.id === areaId);
      if (!area) return;

      const isSelected = selectedArea?.id === area.id;
      // Don't check hoveredArea here - hover styles are handled in mouseover/mouseout handlers
      // This prevents all polygons from flashing when hovering

      // Determine polygon style - match initial creation styles
      // Default state - subtle green tint
      let fillColor = "#a8b89d"; // sage-300
      let borderColor = "#5d7350"; // sage-500
      let borderWidth = 2;
      let fillOpacity = 0.1; // 10% opacity for unselected areas

      // Selected state - nice green tint with solid green borders
      if (isSelected) {
        fillColor = "#e8ede6"; // sage-100 - light green tint
        borderColor = "#4a5c3f"; // sage-600 - solid green border (brand)
        borderWidth = 3.5;
        fillOpacity = 0.6; // Nice visible green tint
      }
      // Note: Hover state is NOT handled here - it's handled in mouseover/mouseout handlers
      // to prevent all polygons from updating when hovering

      // Only update if style actually changed to avoid unnecessary updates
      const currentStyle = (
        polygon as {
          options?: {
            fillColor?: string;
            color?: string;
            weight?: number;
            fillOpacity?: number;
          };
        }
      ).options;
      if (
        currentStyle.fillColor !== fillColor ||
        currentStyle.color !== borderColor ||
        currentStyle.weight !== borderWidth ||
        currentStyle.fillOpacity !== fillOpacity
      ) {
        polygon.setStyle({
          color: borderColor,
          weight: borderWidth,
          fillColor: fillColor,
          fillOpacity: fillOpacity,
          cursor: "pointer",
        });
      }
    });

    // Reset flag after a brief delay to allow hover handlers to work
    setTimeout(() => {
      isUpdatingStylesRef.current = false;
    }, 50);

    // Focus on selected area
    if (selectedArea) {
      const coords = getAreaCoordinates(selectedArea);
      mapInstanceRef.current.setView([coords[1], coords[0]], 12, {
        animate: true,
        duration: 0.3,
      });
    }
  }, [selectedArea?.id, isMapReady]); // Only depend on selectedArea.id, not the whole object or areas array

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

        /* Remove focus outline from polygons */
        .leaflet-interactive:focus {
          outline: none !important;
          outline-offset: 0 !important;
        }

        .leaflet-interactive:focus-visible {
          outline: none !important;
          outline-offset: 0 !important;
        }

        /* Remove any browser default focus styles on polygon elements */
        .area-polygon:focus,
        .area-polygon:focus-visible {
          outline: none !important;
          outline-offset: 0 !important;
        }

        /* Remove outline from SVG paths when focused */
        .leaflet-overlay-pane svg path:focus,
        .leaflet-overlay-pane svg path:focus-visible {
          outline: none !important;
          outline-offset: 0 !important;
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
