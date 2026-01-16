"use client";

import { useEffect, useRef } from "react";
import { Area } from "@/types";
import { DEFAULT_MAP_CENTER } from "@/lib/constants";
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

// Generate approximate polygon boundary
function generateAreaBoundary(
  center: [number, number],
  size: number = 0.02
): [number, number][] {
  const [lng, lat] = center;
  const points: [number, number][] = [];
  const sides = 6;
  for (let i = 0; i <= sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    const radius = size * (0.8 + Math.random() * 0.4);
    points.push([
      lng + radius * Math.cos(angle),
      lat + radius * Math.sin(angle),
    ]);
  }
  return points;
}

function getAreaBoundary(area: Area): [number, number][] {
  const coords = getAreaCoordinates(area);
  const size =
    area.level === "province"
      ? 2.0
      : area.level === "city"
      ? 0.3
      : 0.02; // suburb
  return generateAreaBoundary(coords, size);
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

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      const coords = getAreaCoordinates(area);
      const boundary = getAreaBoundary(area);

      // Determine zoom level based on area level
      const zoom =
        area.level === "province"
          ? 7
          : area.level === "city"
          ? 10
          : 12; // suburb

      const map = L.default.map(mapRef.current!, {
        center: [coords[1], coords[0]],
        zoom: zoom,
        zoomControl: true,
        attributionControl: false,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,
      });

      // Add greyed-out OpenStreetMap tile layer
      L.default
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "",
          maxZoom: 19,
        })
        .addTo(map);

      // Apply grey filter to map
      const mapContainer = mapRef.current!;
      mapContainer.style.filter = "grayscale(100%) brightness(0.9) contrast(0.95)";

      // Add area polygon
      L.default
        .polygon(boundary, {
          color: "#5d7350", // sage-600
          weight: 2.5,
          fillColor: "rgba(93, 115, 80, 0.3)", // sage-600 with opacity
          fillOpacity: 0.3,
        })
        .addTo(map);

      // Add marker at center
      const marker = L.default.marker([coords[1], coords[0]], {
        icon: L.default.divIcon({
          className: "area-location-marker",
          html: `<div style="
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #5d7350;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
      }).addTo(map);

      mapInstanceRef.current = map;
    });

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
    <div className="relative w-full h-64 rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
      <div ref={mapRef} className="w-full h-full" />
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
