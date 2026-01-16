"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { Area } from "@/types";
import { AreaInfoPanel } from "./AreaInfoPanel";
import { getAreasByLevel } from "@/data/areas";

// Dynamically import LeafletMap (primary, always works) and MapboxMap (fallback if token available)
const LeafletMap = dynamic(
  () => import("./LeafletMap").then((mod) => ({ default: mod.LeafletMap })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-stone-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-2"></div>
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    ),
  }
);

const MapboxMap = dynamic(
  () => import("./MapboxMap").then((mod) => ({ default: mod.MapboxMap })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-stone-500">
        Loading map...
      </div>
    ),
  }
);

interface MapViewProps {
  initialLevel?: Area["level"];
}

export function MapView({ initialLevel = "suburb" }: MapViewProps) {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoize areas array to prevent unnecessary re-renders
  const areas = useMemo(() => getAreasByLevel(initialLevel), [initialLevel]);

  const handleAreaClick = useCallback(
    (area: Area) => {
      // Instant selection - no delay for map interaction
      if (selectedArea?.id === area.id) {
        // Deselect if clicking the same area
        setSelectedArea(null);
        setIsLoading(false);
        return;
      }

      // When switching areas, panel stays visible but shows skeleton during transition
      const isSwitchingArea =
        selectedArea !== null && selectedArea.id !== area.id;

      if (isSwitchingArea) {
        // Show skeleton briefly while content updates (for smooth UX)
        setIsLoading(true);
        setSelectedArea(area);
        // Data is available immediately, but brief loading state for visual smoothness
        setTimeout(() => {
          setIsLoading(false);
        }, 100); // Very brief - just for transition effect
      } else {
        // First selection - instant
        setSelectedArea(area);
        setIsLoading(false);
      }
    },
    [selectedArea]
  );

  const handleClose = useCallback(() => {
    setSelectedArea(null);
  }, []);

  const hasMapboxToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Define hover callback outside conditional to satisfy React hooks rules
  const handleAreaHover = useCallback((area: Area | null) => {
    // Hover callback - currently not used but kept for API compatibility
    // State update is isolated and shouldn't cause map re-renders
    setHoveredArea(area?.id || null);
  }, []);

  return (
    <div
      className="relative w-full h-full min-h-[600px] bg-stone-100 rounded-2xl overflow-hidden"
      style={{ isolation: "isolate" }}
    >
      {/* Use LeafletMap as primary (always works), MapboxMap as optional enhancement */}
      {hasMapboxToken ? (
        <MapboxMap
          areas={areas}
          selectedArea={selectedArea}
          onAreaClick={handleAreaClick}
          onAreaHover={handleAreaHover}
        />
      ) : (
        <LeafletMap
          areas={areas}
          selectedArea={selectedArea}
          onAreaClick={handleAreaClick}
          onAreaHover={handleAreaHover}
        />
      )}

      {/* Info panel */}
      <AreaInfoPanel
        area={selectedArea}
        isLoading={isLoading}
        onClose={handleClose}
      />
    </div>
  );
}
