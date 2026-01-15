'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Area } from '@/types';
import { AreaInfoPanel } from './AreaInfoPanel';
import { MapboxMap } from './MapboxMap';
import { getAreasByLevel } from '@/data/areas';

interface MapViewProps {
  initialLevel?: Area['level'];
}

export function MapView({ initialLevel = 'suburb' }: MapViewProps) {
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const areas = getAreasByLevel(initialLevel);

  const handleAreaClick = useCallback((area: Area) => {
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
  }, [selectedArea]);

  const handleClose = useCallback(() => {
    setSelectedArea(null);
  }, []);

  const hasMapboxToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="relative w-full h-[600px] bg-stone-100 rounded-2xl overflow-hidden">
      {hasMapboxToken ? (
        // Real Mapbox map
        <MapboxMap
          areas={areas}
          selectedArea={selectedArea}
          onAreaClick={handleAreaClick}
          onAreaHover={(area) => setHoveredArea(area?.id || null)}
        />
      ) : (
        // Fallback: Simplified grid view when Mapbox token not available
        <div className="absolute inset-0 bg-gradient-to-br from-sage-50 to-moss-50">
          <div className="p-6 h-full overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {areas.map((area) => (
                <MapAreaCard
                  key={area.id}
                  area={area}
                  isSelected={selectedArea?.id === area.id}
                  isHovered={hoveredArea === area.id}
                  onClick={() => handleAreaClick(area)}
                  onMouseEnter={() => setHoveredArea(area.id)}
                  onMouseLeave={() => setHoveredArea(null)}
                />
              ))}
            </div>
          </div>
          <div className="absolute bottom-4 left-4 text-xs text-stone-500 bg-white/80 px-2 py-1 rounded">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to enable interactive map
          </div>
        </div>
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

interface MapAreaCardProps {
  area: Area;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function MapAreaCard({
  area,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MapAreaCardProps) {
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
      animate={{
        boxShadow: isSelected
          ? '0 0 0 3px rgb(93 115 80)'
          : isHovered
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
      className={`relative p-4 bg-white rounded-xl text-left transition-colors duration-200 ${
        isSelected ? 'ring-2 ring-sage-500' : ''
      } ${isHovered && !isSelected ? 'bg-sage-50' : ''}`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          layoutId="selectedIndicator"
          className="absolute -top-1 -right-1 w-4 h-4 bg-sage-500 rounded-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30, duration: 0.2 }}
        />
      )}

      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-stone-900 text-sm">{area.name}</h4>
        {stats && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
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
          R{(stats.avgPrice / 1_000_000).toFixed(1)}M
        </div>
      )}

      {/* Hover hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && !isSelected ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-2 right-2 text-xs text-sage-600"
      >
        Click to view
      </motion.div>
    </motion.button>
  );
}
