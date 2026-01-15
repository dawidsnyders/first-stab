'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Area } from '@/types';
import { AreaInfoPanel } from './AreaInfoPanel';
import { getAreasByLevel } from '@/data/areas';

// For MVP, we'll use a simplified map with clickable area cards
// In production, this would be replaced with react-map-gl + GeoJSON boundaries
// MAPBOX_TOKEN would be needed for the full implementation

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

  return (
    <div className="relative w-full h-[600px] bg-gray-100 rounded-2xl overflow-hidden">
      {/* Map placeholder - in production this would be Mapbox */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Simplified grid view of areas for MVP */}
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

        {/* Map attribution placeholder */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
          Interactive map coming soon
        </div>
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
      animate={{
        boxShadow: isSelected
          ? '0 0 0 3px rgb(59 130 246)'
          : isHovered
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
      className={`relative p-4 bg-white rounded-xl text-left transition-colors ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isHovered && !isSelected ? 'bg-blue-50' : ''}`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          layoutId="selectedIndicator"
          className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}

      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{area.name}</h4>
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
        <div className="text-lg font-bold text-gray-900">
          R{(stats.avgPrice / 1_000_000).toFixed(1)}M
        </div>
      )}

      {/* Hover hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered && !isSelected ? 1 : 0 }}
        className="absolute bottom-2 right-2 text-xs text-blue-600"
      >
        Click to view
      </motion.div>
    </motion.button>
  );
}
