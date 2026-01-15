'use client';

import { useState, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Area, formatPrice, formatPriceChange } from '@/types';
import { AreaInfoPanel } from './AreaInfoPanel';
import { MapControls, MapSearchBar, MapFilters, MapColorMode, ViewMode } from './MapControls';
import { MapLegend, MapStats } from './MapLegend';
import { getAreasByLevel, searchAreas } from '@/data/areas';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants';

// Dynamically import EnhancedMapboxMap
const EnhancedMapboxMap = dynamic(
  () =>
    import('./EnhancedMapboxMap').then((mod) => ({
      default: mod.EnhancedMapboxMap,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
          <span className="text-stone-500 text-sm">Loading map...</span>
        </div>
      </div>
    ),
  }
);

interface InteractiveMapViewProps {
  initialLevel?: Area['level'];
}

export function InteractiveMapView({
  initialLevel = 'suburb',
}: InteractiveMapViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorMode, setColorMode] = useState<MapColorMode>('price');
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [filters, setFilters] = useState<MapFilters>({
    minPrice: null,
    maxPrice: null,
    minGrowth: null,
    maxGrowth: null,
  });

  const allAreas = getAreasByLevel(initialLevel);

  // Filter areas based on search and filters
  const filteredAreas = useMemo(() => {
    let result = allAreas;

    // Apply search filter
    if (searchQuery.length >= 2) {
      result = searchAreas(searchQuery).filter((a) => a.level === initialLevel);
    }

    // Apply price and growth filters
    result = result.filter((area) => {
      if (!area.stats) return false;
      const { avgPrice, priceChangeYoY } = area.stats;

      if (filters.minPrice !== null && avgPrice < filters.minPrice) return false;
      if (filters.maxPrice !== null && avgPrice > filters.maxPrice) return false;
      if (filters.minGrowth !== null && priceChangeYoY < filters.minGrowth)
        return false;
      if (filters.maxGrowth !== null && priceChangeYoY > filters.maxGrowth)
        return false;

      return true;
    });

    return result;
  }, [allAreas, searchQuery, filters, initialLevel]);

  // Calculate stats for visible areas
  const stats = useMemo(() => {
    if (filteredAreas.length === 0)
      return { avgPrice: 0, avgGrowth: 0 };

    const totalPrice = filteredAreas.reduce(
      (sum, a) => sum + (a.stats?.avgPrice || 0),
      0
    );
    const totalGrowth = filteredAreas.reduce(
      (sum, a) => sum + (a.stats?.priceChangeYoY || 0),
      0
    );

    return {
      avgPrice: totalPrice / filteredAreas.length,
      avgGrowth: totalGrowth / filteredAreas.length,
    };
  }, [filteredAreas]);

  const handleAreaClick = useCallback(
    (area: Area) => {
      if (selectedArea?.id === area.id) {
        setSelectedArea(null);
        return;
      }

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

  const handleZoomIn = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  }, []);

  const handleResetView = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        duration: 1000,
      });
    }
  }, []);

  const hasMapboxToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="relative w-full h-full min-h-[600px] bg-stone-100 rounded-2xl overflow-hidden">
      {/* Map Controls */}
      <MapControls
        colorMode={colorMode}
        onColorModeChange={setColorMode}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFiltersChange={setFilters}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
      />

      {/* Search Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-64 md:w-80">
        <MapSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search areas..."
        />
      </div>

      {/* Map View */}
      <AnimatePresence mode="wait">
        {viewMode === 'map' ? (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {hasMapboxToken ? (
              <EnhancedMapboxMap
                areas={filteredAreas}
                selectedArea={selectedArea}
                onAreaClick={handleAreaClick}
                onAreaHover={(area) => setHoveredArea(area?.id || null)}
                colorMode={colorMode}
                filters={filters}
                mapRef={mapRef}
              />
            ) : (
              <FallbackGridView
                areas={filteredAreas}
                selectedArea={selectedArea}
                hoveredArea={hoveredArea}
                onAreaClick={handleAreaClick}
                onHover={setHoveredArea}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 overflow-y-auto"
          >
            <AreaListView
              areas={filteredAreas}
              selectedArea={selectedArea}
              onAreaClick={handleAreaClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend (map view only) */}
      {viewMode === 'map' && hasMapboxToken && (
        <div className="absolute bottom-4 right-4 z-10">
          <MapLegend colorMode={colorMode} />
        </div>
      )}

      {/* Stats bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <MapStats
          totalAreas={allAreas.length}
          visibleAreas={filteredAreas.length}
          avgPrice={stats.avgPrice}
          avgGrowth={stats.avgGrowth}
        />
      </div>

      {/* Info panel */}
      <AreaInfoPanel
        area={selectedArea}
        isLoading={isLoading}
        onClose={handleClose}
      />
    </div>
  );
}

// Fallback grid view when Mapbox token not available
interface FallbackGridViewProps {
  areas: Area[];
  selectedArea: Area | null;
  hoveredArea: string | null;
  onAreaClick: (area: Area) => void;
  onHover: (id: string | null) => void;
}

function FallbackGridView({
  areas,
  selectedArea,
  hoveredArea,
  onAreaClick,
  onHover,
}: FallbackGridViewProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-sage-50 to-moss-50">
      <div className="p-6 pt-20 h-full overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {areas.map((area) => (
            <AreaGridCard
              key={area.id}
              area={area}
              isSelected={selectedArea?.id === area.id}
              isHovered={hoveredArea === area.id}
              onClick={() => onAreaClick(area)}
              onMouseEnter={() => onHover(area.id)}
              onMouseLeave={() => onHover(null)}
            />
          ))}
        </div>
        {areas.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <p className="text-stone-500">
              No areas match your current filters
            </p>
          </div>
        )}
      </div>
      <div className="absolute bottom-4 left-4 text-xs text-stone-500 bg-white/80 px-2 py-1 rounded">
        Add NEXT_PUBLIC_MAPBOX_TOKEN to enable interactive map
      </div>
    </div>
  );
}

// Grid card for fallback view
interface AreaGridCardProps {
  area: Area;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function AreaGridCard({
  area,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: AreaGridCardProps) {
  const { stats } = area;
  const isPositive = stats && stats.priceChangeYoY >= 0;

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={`relative p-4 bg-white rounded-xl text-left transition-all duration-200 shadow-sm hover:shadow-lg ${
        isSelected ? 'ring-2 ring-sage-500' : ''
      } ${isHovered && !isSelected ? 'bg-sage-50' : ''}`}
    >
      {isSelected && (
        <motion.div
          layoutId="selectedIndicator"
          className="absolute -top-1 -right-1 w-4 h-4 bg-sage-500 rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-stone-900 text-sm truncate pr-2">
          {area.name}
        </h4>
        {stats && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
              isPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {isPositive ? '+' : ''}
            {stats.priceChangeYoY.toFixed(1)}%
          </span>
        )}
      </div>

      {stats && (
        <div className="text-lg font-bold text-stone-900">
          {formatPrice(stats.avgPrice)}
        </div>
      )}
    </motion.button>
  );
}

// List view for areas
interface AreaListViewProps {
  areas: Area[];
  selectedArea: Area | null;
  onAreaClick: (area: Area) => void;
}

function AreaListView({
  areas,
  selectedArea,
  onAreaClick,
}: AreaListViewProps) {
  // Sort by price (highest first)
  const sortedAreas = useMemo(
    () =>
      [...areas].sort(
        (a, b) => (b.stats?.avgPrice || 0) - (a.stats?.avgPrice || 0)
      ),
    [areas]
  );

  return (
    <div className="p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-stone-50 border-b border-stone-200 text-xs font-medium text-stone-500 uppercase tracking-wide">
            <div className="col-span-4">Area</div>
            <div className="col-span-2 text-right">Avg Price</div>
            <div className="col-span-2 text-right">Median</div>
            <div className="col-span-2 text-right">Growth YoY</div>
            <div className="col-span-2 text-right">Sales (12m)</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-stone-100">
            {sortedAreas.map((area, index) => (
              <motion.button
                key={area.id}
                onClick={() => onAreaClick(area)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                className={`w-full grid grid-cols-12 gap-4 px-4 py-3 text-left hover:bg-stone-50 transition-colors duration-150 ${
                  selectedArea?.id === area.id ? 'bg-sage-50' : ''
                }`}
              >
                <div className="col-span-4">
                  <div className="font-medium text-stone-900">{area.name}</div>
                  <div className="text-xs text-stone-500 capitalize">
                    {area.level}
                  </div>
                </div>
                <div className="col-span-2 text-right font-semibold text-stone-900">
                  {area.stats ? formatPrice(area.stats.avgPrice) : '-'}
                </div>
                <div className="col-span-2 text-right text-stone-600">
                  {area.stats ? formatPrice(area.stats.medianPrice) : '-'}
                </div>
                <div className="col-span-2 text-right">
                  {area.stats && (
                    <span
                      className={`font-medium ${
                        area.stats.priceChangeYoY >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {formatPriceChange(area.stats.priceChangeYoY)}
                    </span>
                  )}
                </div>
                <div className="col-span-2 text-right text-stone-600">
                  {area.stats?.salesCount || '-'}
                </div>
              </motion.button>
            ))}
          </div>

          {sortedAreas.length === 0 && (
            <div className="px-4 py-12 text-center text-stone-500">
              No areas match your current filters
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractiveMapView;
