// @ts-nocheck - react-map-gl v8 has incomplete type definitions
"use client";

import { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area, formatPrice, formatPriceChange } from "@/types";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";

// Try to import react-map-gl - if it fails, component will return fallback
let Map: any;
let Marker: any;
let mapboxCssLoaded = false;

try {
  // @ts-ignore
  const reactMapGl = require("react-map-gl");
  Map = reactMapGl.default || reactMapGl.Map;
  Marker = reactMapGl.Marker;
  // @ts-ignore
  require("mapbox-gl/dist/mapbox-gl.css");
  mapboxCssLoaded = true;
} catch (e) {
  // Module not available - component will return fallback UI
}

interface MapboxMapProps {
  areas: Area[];
  selectedArea: Area | null;
  onAreaClick: (area: Area) => void;
  onAreaHover?: (area: Area | null) => void;
}

// Coordinates for all Western Cape areas
// In production, these would come from GeoJSON boundaries
const AREA_COORDINATES: Record<string, [number, number]> = {
  // Province
  "western-cape": [-20.0, 22.0],
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
  return AREA_COORDINATES[area.slug] || DEFAULT_MAP_CENTER;
}

export function MapboxMap({
  areas,
  selectedArea,
  onAreaClick,
  onAreaHover,
}: MapboxMapProps) {
  const [viewState, setViewState] = useState({
    longitude: DEFAULT_MAP_CENTER[0],
    latitude: DEFAULT_MAP_CENTER[1],
    zoom: DEFAULT_MAP_ZOOM,
  });
  const [hoveredArea, setHoveredArea] = useState<Area | null>(null);

  // Auto-focus on selected area
  useEffect(() => {
    if (selectedArea) {
      const coords = getAreaCoordinates(selectedArea);
      setViewState((prev) => ({
        ...prev,
        longitude: coords[0],
        latitude: coords[1],
        zoom: 12,
      }));
    }
  }, [selectedArea]);

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Return fallback if module not loaded or token not configured
  if (!Map || !Marker || !mapboxToken) {
    return (
      <div className="w-full h-full bg-stone-100 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-stone-600 mb-2">
            {!Map || !Marker
              ? "Map component not available"
              : "Mapbox token not configured"}
          </p>
          <p className="text-sm text-stone-500">
            {!Map || !Marker
              ? "react-map-gl module not found"
              : "Add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables"}
          </p>
        </div>
      </div>
    );
  }

  const handleMarkerClick = useCallback(
    (area: Area) => {
      onAreaClick(area);
    },
    [onAreaClick]
  );

  const handleMarkerEnter = useCallback(
    (area: Area) => {
      setHoveredArea(area);
      onAreaHover?.(area);
    },
    [onAreaHover]
  );

  const handleMarkerLeave = useCallback(() => {
    setHoveredArea(null);
    onAreaHover?.(null);
  }, [onAreaHover]);

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative">
      <Map
        {...viewState}
        onMove={(evt: any) => {
          setViewState(evt.viewState);
        }}
        mapboxAccessToken={mapboxToken}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        transitionDuration={200}
        minZoom={8}
        maxZoom={16}
      >
        {areas.map((area) => {
          const coords = getAreaCoordinates(area);
          const isSelected = selectedArea?.id === area.id;
          const isHovered = hoveredArea?.id === area.id;
          const { stats } = area;
          const isPositive = stats && stats.priceChangeYoY >= 0;

          // Determine marker color based on state and stats
          const getMarkerColor = () => {
            if (isSelected) return "bg-sage-600";
            if (isHovered) return "bg-sage-500";
            if (stats) {
              return isPositive ? "bg-green-500" : "bg-red-500";
            }
            return "bg-stone-400";
          };

          return (
            <Marker
              key={area.id}
              longitude={coords[0]}
              latitude={coords[1]}
              anchor="bottom"
            >
              <motion.div
                className="relative cursor-pointer"
                initial={false}
                animate={{
                  scale: isSelected ? 1.3 : isHovered ? 1.15 : 1,
                }}
                transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkerClick(area);
                }}
                onMouseEnter={() => handleMarkerEnter(area)}
                onMouseLeave={handleMarkerLeave}
              >
                {/* Marker pin with shadow */}
                <div className="relative">
                  <div
                    className={`${getMarkerColor()} w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-colors duration-200`}
                  >
                    <div className="w-3.5 h-3.5 bg-white rounded-full" />
                  </div>
                  {/* Pulse animation for selected */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-sage-600"
                      animate={{
                        scale: [1, 1.5, 1.5],
                        opacity: [0.8, 0, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </div>

                {/* Price label - always visible */}
                {stats && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shadow-lg backdrop-blur-sm ${
                        isSelected
                          ? "bg-sage-600 text-white"
                          : isHovered
                          ? "bg-sage-500 text-white"
                          : "bg-white/95 text-stone-900 border border-stone-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{formatPrice(stats.avgPrice)}</span>
                        {stats.priceChangeYoY !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              isPositive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {formatPriceChange(stats.priceChangeYoY)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}

                {/* Area name tooltip on hover */}
                <AnimatePresence>
                  {isHovered && !isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-12 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium whitespace-nowrap shadow-xl"
                    >
                      {area.name}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-stone-900 transform rotate-45" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Marker>
          );
        })}
      </Map>

      {/* Map controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        {/* Zoom controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200 overflow-hidden">
          <button
            onClick={() =>
              setViewState((prev) => ({ ...prev, zoom: prev.zoom + 1 }))
            }
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
            onClick={() =>
              setViewState((prev) => ({ ...prev, zoom: prev.zoom - 1 }))
            }
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

        {/* Reset view button */}
        <button
          onClick={() =>
            setViewState({
              longitude: DEFAULT_MAP_CENTER[0],
              latitude: DEFAULT_MAP_CENTER[1],
              zoom: DEFAULT_MAP_ZOOM,
            })
          }
          className="px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors duration-200"
          aria-label="Reset view"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
