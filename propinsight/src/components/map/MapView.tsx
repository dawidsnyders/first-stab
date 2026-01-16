"use client";

import { useState, useCallback } from "react";
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

  const areas = getAreasByLevel(initialLevel);

  const handleAreaClick = useCallback(
    (area: Area) => {
      if (selectedArea?.id === area.id) {
        setSelectedArea(null);
        return;
      }

      // Simulate loading for smooth transition
      setIsLoading(true);
      setSelectedArea(null);

      setTimeout(() => {
        setSelectedArea(area);
        setIsLoading(false);
      }, 150);
    },
    [selectedArea]
  );

  const handleClose = useCallback(() => {
    setSelectedArea(null);
  }, []);

  const hasMapboxToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="relative w-full h-full min-h-[600px] bg-stone-100 rounded-2xl overflow-hidden">
      {/* Use LeafletMap as primary (always works), MapboxMap as optional enhancement */}
      {hasMapboxToken ? (
        <MapboxMap
          areas={areas}
          selectedArea={selectedArea}
          onAreaClick={handleAreaClick}
          onAreaHover={(area) => setHoveredArea(area?.id || null)}
        />
      ) : (
        <LeafletMap
          areas={areas}
          selectedArea={selectedArea}
          onAreaClick={handleAreaClick}
          onAreaHover={(area) => setHoveredArea(area?.id || null)}
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
