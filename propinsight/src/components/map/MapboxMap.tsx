// @ts-nocheck - react-map-gl v8 has incomplete type definitions
'use client';

import { useCallback, useState } from 'react';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Area } from '@/types';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';

interface MapboxMapProps {
  areas: Area[];
  selectedArea: Area | null;
  onAreaClick: (area: Area) => void;
  onAreaHover?: (area: Area | null) => void;
}

// Approximate coordinates for Western Cape suburbs
// In production, these would come from GeoJSON boundaries
const AREA_COORDINATES: Record<string, [number, number]> = {
  'camps-bay': [18.3756, -33.9508],
  'sea-point': [18.3889, -33.9167],
  'green-point': [18.4056, -33.9092],
  'woodstock': [18.4444, -33.9278],
  'observatory': [18.4722, -33.9389],
  'claremont': [18.4722, -33.9806],
  'constantia': [18.4167, -34.0278],
  'val-de-vie': [18.9667, -33.7333],
  'pearl-valley': [18.9833, -33.7500],
  'de-zalze': [18.8667, -34.0167],
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

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-gray-600 mb-2">Mapbox token not configured</p>
          <p className="text-sm text-gray-500">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables
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
    <div className="w-full h-full rounded-2xl overflow-hidden">
      <Map
        longitude={viewState.longitude}
        latitude={viewState.latitude}
        zoom={viewState.zoom}
        onMove={(evt: any) => {
          setViewState(evt.viewState);
        }}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
      >
        {areas.map((area) => {
          const coords = getAreaCoordinates(area);
          const isSelected = selectedArea?.id === area.id;
          const isHovered = hoveredArea?.id === area.id;
          const { stats } = area;

          return (
            <Marker
              key={area.id}
              longitude={coords[0]}
              latitude={coords[1]}
              anchor="bottom"
            >
              <div
                className={`relative cursor-pointer transition-all ${
                  isSelected
                    ? 'scale-125 z-50'
                    : isHovered
                    ? 'scale-110 z-40'
                    : 'scale-100 z-30'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkerClick(area);
                }}
                onMouseEnter={() => handleMarkerEnter(area)}
                onMouseLeave={handleMarkerLeave}
              >
                {/* Marker pin */}
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600'
                      : isHovered
                      ? 'bg-blue-500'
                      : stats && stats.priceChangeYoY >= 0
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                >
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>

                {/* Price label */}
                {stats && (
                  <div
                    className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shadow-md ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isHovered
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    R{(stats.avgPrice / 1_000_000).toFixed(1)}M
                  </div>
                )}

                {/* Area name tooltip on hover */}
                {isHovered && !isSelected && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-8 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-sm font-medium whitespace-nowrap shadow-lg">
                    {area.name}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-2 h-2 bg-gray-900 transform rotate-45" />
                    </div>
                  </div>
                )}
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
