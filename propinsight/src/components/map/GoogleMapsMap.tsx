"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  InfoWindow,
} from "@react-google-maps/api";
import { Area } from "@/types";
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import {
  getBoundaryForArea,
  prefetchBoundaries,
} from "@/lib/geojson-boundaries";

// Coordinates for all Western Cape areas [lng, lat] format
const AREA_COORDINATES: Record<string, [number, number]> = {
  // Province
  "western-cape": [22.0, -20.0],
  // Cities
  "cape-town": [18.4241, -33.9249],
  paarl: [18.9752, -33.7342],
  stellenbosch: [18.8602, -33.9322],
  franschhoek: [19.1233, -33.9094],
  "hout-bay": [18.3667, -34.05],
  "somerset-west": [18.85, -34.0833],
  simonstown: [18.4333, -34.2],
  strand: [18.8333, -34.1167],
  // Cape Town Suburbs
  "camps-bay": [18.3756, -33.9508],
  "sea-point": [18.3889, -33.9167],
  "green-point": [18.4056, -33.9092],
  woodstock: [18.4444, -33.9278],
  observatory: [18.4722, -33.9389],
  claremont: [18.4722, -33.9806],
  constantia: [18.4167, -34.0278],
  // Estates
  "val-de-vie": [18.975, -33.7417],
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

async function getAreaBoundaryAsync(
  area: Area
): Promise<google.maps.LatLngLiteral[]> {
  try {
    console.log(`🔍 Fetching boundary for ${area.name} (${area.slug})...`);
    const geoJSONBoundary = await getBoundaryForArea(area.slug);
    if (geoJSONBoundary && geoJSONBoundary.length > 0) {
      // Convert [lat, lng] to {lat, lng} for Google Maps
      return geoJSONBoundary.map(([lat, lng]) => ({ lat, lng }));
    }
    return [];
  } catch (error) {
    console.error(
      `✗ Error fetching boundary for ${area.name} (${area.slug}):`,
      error
    );
    return [];
  }
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultOptions = {
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
};

interface GoogleMapsMapProps {
  areas: Area[];
  selectedArea: Area | null;
  onAreaClick: (area: Area) => void;
  onAreaHover?: (area: Area | null) => void;
}

export function GoogleMapsMap({
  areas,
  selectedArea,
  onAreaClick,
  onAreaHover,
}: GoogleMapsMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const polygonsRef = useRef<Map<string, google.maps.Polygon>>(new Map());
  const polygonBoundsRef = useRef<Map<string, google.maps.LatLngBounds>>(
    new Map()
  );
  const [isMapReady, setIsMapReady] = useState(false);
  const [hoveredArea, setHoveredArea] = useState<Area | null>(null);
  const [viewportBounds, setViewportBounds] =
    useState<google.maps.LatLngBounds | null>(null);
  const [boundaries, setBoundaries] = useState<
    Map<string, google.maps.LatLngLiteral[]>
  >(new Map());

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleMapsApiKey || "",
    libraries: ["places"],
  });

  // Pre-fetch boundaries when component mounts
  useEffect(() => {
    prefetchBoundaries();
  }, []);

  // Load boundaries for all areas
  useEffect(() => {
    if (!isLoaded) return;

    const loadBoundaries = async () => {
      const boundariesMap = new Map<string, google.maps.LatLngLiteral[]>();

      for (const area of areas) {
        try {
          const boundary = await getAreaBoundaryAsync(area);
          if (boundary.length > 0) {
            boundariesMap.set(area.slug, boundary);
          }
        } catch (error) {
          console.error(`Failed to load boundary for ${area.slug}:`, error);
        }
      }

      setBoundaries(boundariesMap);
    };

    loadBoundaries();
  }, [areas, isLoaded]);

  // Calculate and store polygon bounds when boundaries are loaded
  useEffect(() => {
    if (boundaries.size === 0) return;

    polygonBoundsRef.current.clear();
    boundaries.forEach((boundary, slug) => {
      if (boundary.length === 0) return;
      const bounds = new google.maps.LatLngBounds();
      boundary.forEach((point) => {
        bounds.extend(point);
      });
      polygonBoundsRef.current.set(slug, bounds);
    });
  }, [boundaries]);

  // Update viewport bounds when map moves/zooms
  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    const updateViewportBounds = () => {
      if (mapRef.current) {
        const bounds = mapRef.current.getBounds();
        if (bounds) {
          setViewportBounds(bounds);
        }
      }
    };

    // Update immediately
    updateViewportBounds();

    // Listen to bounds changes
    const listener = mapRef.current.addListener(
      "bounds_changed",
      updateViewportBounds
    );

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [isMapReady]);

  // Check if polygon is visible in viewport
  const isPolygonVisible = useCallback(
    (area: Area): boolean => {
      // Always show selected area
      if (selectedArea?.slug === area.slug) return true;

      // If no viewport bounds yet, show all (initial load)
      if (!viewportBounds) return true;

      const polygonBounds = polygonBoundsRef.current.get(area.slug);
      if (!polygonBounds) return false;

      // Check if polygon bounds intersect with viewport
      return viewportBounds.intersects(polygonBounds);
    },
    [viewportBounds, selectedArea]
  );

  // Update polygons when boundaries are loaded or viewport changes
  useEffect(() => {
    if (!isMapReady || !mapRef.current || boundaries.size === 0) return;

    // Clear existing polygons
    polygonsRef.current.forEach((polygon) => {
      polygon.setMap(null);
    });
    polygonsRef.current.clear();

    // Add polygons for each area (only if visible)
    areas.forEach((area) => {
      const boundary = boundaries.get(area.slug);
      if (!boundary || boundary.length === 0) return;

      // Check if polygon should be visible
      if (!isPolygonVisible(area)) {
        return; // Skip rendering this polygon
      }

      const isSelected = selectedArea?.slug === area.slug;
      const isHovered = hoveredArea?.slug === area.slug;

      const polygon = new google.maps.Polygon({
        paths: boundary,
        strokeColor: isSelected ? "#4a5c3f" : isHovered ? "#6b7d5f" : "#8b9d7f",
        strokeOpacity: 1,
        strokeWeight: isSelected ? 3.5 : isHovered ? 3 : 2.5,
        fillColor: isSelected ? "#e8ede6" : isHovered ? "#f0f4ed" : "#f5f7f3",
        fillOpacity: isSelected ? 0.7 : isHovered ? 0.5 : 0.4,
        clickable: true,
        zIndex: isSelected ? 1000 : isHovered ? 500 : 1,
      });

      polygon.setMap(mapRef.current);

      // Add click handler
      polygon.addListener("click", () => {
        onAreaClick(area);
      });

      // Add hover handlers
      if (onAreaHover) {
        polygon.addListener("mouseover", () => {
          setHoveredArea(area);
          onAreaHover(area);
        });

        polygon.addListener("mouseout", () => {
          setHoveredArea(null);
          onAreaHover(null);
        });
      }

      polygonsRef.current.set(area.slug, polygon);
    });
  }, [
    areas,
    boundaries,
    isMapReady,
    selectedArea,
    hoveredArea,
    onAreaClick,
    onAreaHover,
    isPolygonVisible,
  ]);

  // Auto-focus on selected area
  useEffect(() => {
    if (selectedArea && mapRef.current) {
      const boundary = boundaries.get(selectedArea.slug);
      if (boundary && boundary.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        boundary.forEach((point) => {
          bounds.extend(point);
        });
        mapRef.current.fitBounds(bounds, { padding: 50 });
      } else {
        const coords = getAreaCoordinates(selectedArea);
        mapRef.current.setCenter({ lat: coords[1], lng: coords[0] });
        mapRef.current.setZoom(14);
      }
    }
  }, [selectedArea, boundaries]);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setIsMapReady(true);

    // Set initial center and zoom
    map.setCenter({
      lat: DEFAULT_MAP_CENTER[1],
      lng: DEFAULT_MAP_CENTER[0],
    });
    map.setZoom(DEFAULT_MAP_ZOOM);
  }, []);

  const onUnmount = useCallback(() => {
    polygonsRef.current.forEach((polygon) => {
      polygon.setMap(null);
    });
    polygonsRef.current.clear();
    mapRef.current = null;
  }, []);

  if (loadError) {
    return (
      <div className="w-full h-full bg-stone-100 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-stone-600 mb-2">Error loading Google Maps</p>
          <p className="text-sm text-stone-500">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || !googleMapsApiKey) {
    return (
      <div className="w-full h-full bg-stone-100 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 mx-auto mb-2"></div>
          <p className="text-stone-600 mb-2">
            {!googleMapsApiKey
              ? "Google Maps API key not configured"
              : "Loading Google Maps..."}
          </p>
          <p className="text-sm text-stone-500">
            {!googleMapsApiKey
              ? "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables"
              : "Please wait..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={{
          lat: DEFAULT_MAP_CENTER[1],
          lng: DEFAULT_MAP_CENTER[0],
        }}
        zoom={DEFAULT_MAP_ZOOM}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultOptions}
      />
    </div>
  );
}
