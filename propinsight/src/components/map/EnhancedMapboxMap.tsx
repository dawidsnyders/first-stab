/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
'use client';

import { useCallback, useState, useRef, useMemo } from 'react';
import { Area } from '@/types';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';
import {
  getAreaBoundariesGeoJSON,
  getPriceColor,
  getGrowthColor,
  getBoundaryCenter,
} from '@/data/boundaries';
import type { MapColorMode, MapFilters } from './MapControls';

// Dynamic imports for react-map-gl (has incomplete type definitions)
let Map: any;
let Source: any;
let Layer: any;
let Popup: any;
let NavigationControl: any;
let FullscreenControl: any;

try {
  const reactMapGl = require('react-map-gl');
  Map = reactMapGl.default || reactMapGl.Map;
  Source = reactMapGl.Source;
  Layer = reactMapGl.Layer;
  Popup = reactMapGl.Popup;
  NavigationControl = reactMapGl.NavigationControl;
  FullscreenControl = reactMapGl.FullscreenControl;
  require('mapbox-gl/dist/mapbox-gl.css');
} catch {
  // Module not available - will render fallback UI
}

interface EnhancedMapboxMapProps {
  areas: Area[];
  selectedArea: Area | null;
  onAreaClick: (area: Area) => void;
  onAreaHover?: (area: Area | null) => void;
  colorMode: MapColorMode;
  filters: MapFilters;
  mapRef?: React.RefObject<any>;
}

// Type for popup info
interface PopupInfo {
  longitude: number;
  latitude: number;
  area: Area;
}

export function EnhancedMapboxMap({
  areas,
  selectedArea,
  onAreaClick,
  onAreaHover,
  colorMode,
  filters,
  mapRef: externalMapRef,
}: EnhancedMapboxMapProps) {
  const internalMapRef = useRef<any>(null);
  const mapRef = externalMapRef || internalMapRef;

  const [viewState, setViewState] = useState({
    longitude: DEFAULT_MAP_CENTER[0],
    latitude: DEFAULT_MAP_CENTER[1],
    zoom: DEFAULT_MAP_ZOOM,
  });
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const [cursor, setCursor] = useState<string>('grab');

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Filter areas based on current filters
  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      if (!area.stats) return false;

      const { avgPrice, priceChangeYoY } = area.stats;

      // Price filter
      if (filters.minPrice !== null && avgPrice < filters.minPrice) return false;
      if (filters.maxPrice !== null && avgPrice > filters.maxPrice) return false;

      // Growth filter
      if (filters.minGrowth !== null && priceChangeYoY < filters.minGrowth)
        return false;
      if (filters.maxGrowth !== null && priceChangeYoY > filters.maxGrowth)
        return false;

      return true;
    });
  }, [areas, filters]);

  // Get filtered area IDs
  const filteredAreaIds = useMemo(
    () => new Set(filteredAreas.map((a) => a.id)),
    [filteredAreas]
  );

  // Get GeoJSON with filtered boundaries
  const boundariesGeoJSON = useMemo(() => {
    const allBoundaries = getAreaBoundariesGeoJSON();
    return {
      ...allBoundaries,
      features: allBoundaries.features.filter((f) =>
        f.properties && filteredAreaIds.has(f.properties.id)
      ),
    };
  }, [filteredAreaIds]);

  // Generate fill colors for choropleth
  const fillColorExpression = useMemo(() => {
    const getColor = colorMode === 'price' ? getPriceColor : getGrowthColor;

    // Build a match expression for Mapbox
    const matchExpr: any[] = ['match', ['get', 'id']];

    filteredAreas.forEach((area) => {
      if (area.stats) {
        const value =
          colorMode === 'price' ? area.stats.avgPrice : area.stats.priceChangeYoY;
        matchExpr.push(area.id, getColor(value));
      }
    });

    matchExpr.push('#cccccc'); // Default color

    return matchExpr;
  }, [colorMode, filteredAreas]);

  // Handle map click
  const handleClick = useCallback(
    (event: any) => {
      const features = event.features;
      if (features && features.length > 0) {
        const feature = features[0];
        const areaId = feature.properties.id;
        const area = areas.find((a) => a.id === areaId);
        if (area) {
          onAreaClick(area);
        }
      }
    },
    [areas, onAreaClick]
  );

  // Handle hover
  const handleMouseMove = useCallback(
    (event: any) => {
      const features = event.features;
      if (features && features.length > 0) {
        const feature = features[0];
        const areaId = feature.properties.id;
        const area = areas.find((a) => a.id === areaId);

        if (area) {
          setCursor('pointer');
          onAreaHover?.(area);

          // Find center of the area for popup
          const boundary = boundariesGeoJSON.features.find(
            (f) => f.properties && f.properties.id === areaId
          );
          if (boundary) {
            const center = getBoundaryCenter(boundary as any);
            setPopupInfo({
              longitude: center[0],
              latitude: center[1],
              area,
            });
          }
        }
      } else {
        setCursor('grab');
        onAreaHover?.(null);
        setPopupInfo(null);
      }
    },
    [areas, boundariesGeoJSON, onAreaHover]
  );

  const handleMouseLeave = useCallback(() => {
    setCursor('grab');
    onAreaHover?.(null);
    setPopupInfo(null);
  }, [onAreaHover]);

  // Return fallback if module not loaded or token not configured
  if (!Map || !mapboxToken) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 rounded-xl shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-stone-200 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-stone-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <p className="text-stone-600 mb-2 font-medium">
            {!Map ? 'Map component not available' : 'Mapbox token not configured'}
          </p>
          <p className="text-sm text-stone-500">
            {!Map
              ? 'react-map-gl module not found'
              : 'Add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: any) => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        cursor={cursor}
        interactiveLayerIds={['area-fills']}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Navigation controls */}
        <NavigationControl position="bottom-right" showCompass={true} />
        <FullscreenControl position="bottom-right" />

        {/* Area polygon layers */}
        <Source id="areas" type="geojson" data={boundariesGeoJSON}>
          {/* Fill layer */}
          <Layer
            id="area-fills"
            type="fill"
            paint={{
              'fill-color': fillColorExpression,
              'fill-opacity': [
                'case',
                ['==', ['get', 'id'], selectedArea?.id || ''],
                0.85,
                0.6,
              ],
            }}
          />
          {/* Border layer */}
          <Layer
            id="area-borders"
            type="line"
            paint={{
              'line-color': [
                'case',
                ['==', ['get', 'id'], selectedArea?.id || ''],
                '#1e3a5f',
                '#ffffff',
              ],
              'line-width': [
                'case',
                ['==', ['get', 'id'], selectedArea?.id || ''],
                3,
                1.5,
              ],
              'line-opacity': 0.9,
            }}
          />
          {/* Labels layer */}
          <Layer
            id="area-labels"
            type="symbol"
            layout={{
              'text-field': ['get', 'name'],
              'text-size': 11,
              'text-anchor': 'center',
              'text-allow-overlap': false,
              'text-ignore-placement': false,
            }}
            paint={{
              'text-color': '#1f2937',
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
            }}
          />
        </Source>

        {/* Popup on hover */}
        {popupInfo && Popup && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={10}
          >
            <div className="p-2 min-w-[160px]">
              <h4 className="font-semibold text-stone-900 mb-1">
                {popupInfo.area.name}
              </h4>
              {popupInfo.area.stats && (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Avg Price</span>
                    <span className="font-medium text-stone-900">
                      R{(popupInfo.area.stats.avgPrice / 1_000_000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Growth</span>
                    <span
                      className={`font-medium ${
                        popupInfo.area.stats.priceChangeYoY >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {popupInfo.area.stats.priceChangeYoY >= 0 ? '+' : ''}
                      {popupInfo.area.stats.priceChangeYoY.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Sales (12m)</span>
                    <span className="font-medium text-stone-900">
                      {popupInfo.area.stats.salesCount}
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-stone-100 text-xs text-stone-400 text-center">
                Click to view details
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
