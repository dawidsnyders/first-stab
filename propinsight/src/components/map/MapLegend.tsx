'use client';

import { motion } from 'framer-motion';
import { priceLegendItems, growthLegendItems } from '@/data/boundaries';
import type { MapColorMode } from './MapControls';

interface MapLegendProps {
  colorMode: MapColorMode;
  className?: string;
}

export function MapLegend({ colorMode, className = '' }: MapLegendProps) {
  const items = colorMode === 'price' ? priceLegendItems : growthLegendItems;
  const title = colorMode === 'price' ? 'Average Price' : 'YoY Growth';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 p-4 ${className}`}
    >
      <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
        {title}
      </h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, delay: index * 0.03 }}
            className="flex items-center gap-2"
          >
            <div
              className="w-4 h-4 rounded-sm flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-stone-600">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Compact legend for smaller screens
export function MapLegendCompact({ colorMode }: MapLegendProps) {
  const items = colorMode === 'price' ? priceLegendItems : growthLegendItems;
  
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200 px-3 py-2 flex items-center gap-1">
      <span className="text-xs text-stone-500 mr-1">
        {colorMode === 'price' ? 'Price:' : 'Growth:'}
      </span>
      <div className="flex">
        {items.map((item) => (
          <div
            key={item.label}
            className="w-4 h-3 first:rounded-l last:rounded-r"
            style={{ backgroundColor: item.color }}
            title={item.label}
          />
        ))}
      </div>
    </div>
  );
}

// Floating stats summary
interface MapStatsProps {
  totalAreas: number;
  visibleAreas: number;
  avgPrice?: number;
  avgGrowth?: number;
}

export function MapStats({
  totalAreas,
  visibleAreas,
  avgPrice,
  avgGrowth,
}: MapStatsProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-stone-200 p-3 flex items-center gap-4 text-xs">
      <div>
        <span className="text-stone-500">Showing</span>{' '}
        <span className="font-semibold text-stone-900">
          {visibleAreas} / {totalAreas}
        </span>{' '}
        <span className="text-stone-500">areas</span>
      </div>
      {avgPrice && (
        <div className="border-l border-stone-200 pl-4">
          <span className="text-stone-500">Avg Price</span>{' '}
          <span className="font-semibold text-stone-900">
            R{(avgPrice / 1_000_000).toFixed(1)}M
          </span>
        </div>
      )}
      {avgGrowth && (
        <div className="border-l border-stone-200 pl-4">
          <span className="text-stone-500">Avg Growth</span>{' '}
          <span className={`font-semibold ${avgGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {avgGrowth >= 0 ? '+' : ''}
            {avgGrowth.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
