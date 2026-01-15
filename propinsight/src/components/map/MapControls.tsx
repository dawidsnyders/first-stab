'use client';

import { motion } from 'framer-motion';
import {
  MapIcon,
  ListBulletIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export type MapColorMode = 'price' | 'growth';
export type ViewMode = 'map' | 'list';

export interface MapFilters {
  minPrice: number | null;
  maxPrice: number | null;
  minGrowth: number | null;
  maxGrowth: number | null;
}

interface MapControlsProps {
  colorMode: MapColorMode;
  onColorModeChange: (mode: MapColorMode) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetView?: () => void;
}

export function MapControls({
  colorMode,
  onColorModeChange,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  onZoomIn,
  onZoomOut,
  onResetView,
}: MapControlsProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const pricePresets = [
    { label: 'All', min: null, max: null },
    { label: 'Under R3M', min: null, max: 3_000_000 },
    { label: 'R3M - R7M', min: 3_000_000, max: 7_000_000 },
    { label: 'R7M - R12M', min: 7_000_000, max: 12_000_000 },
    { label: 'R12M+', min: 12_000_000, max: null },
  ];

  const growthPresets = [
    { label: 'All', min: null, max: null },
    { label: 'Strong (10%+)', min: 10, max: null },
    { label: 'Good (5-10%)', min: 5, max: 10 },
    { label: 'Moderate (0-5%)', min: 0, max: 5 },
    { label: 'Negative', min: null, max: 0 },
  ];

  const hasActiveFilters =
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.minGrowth !== null ||
    filters.maxGrowth !== null;

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      {/* View Toggle */}
      <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-1 flex">
        <button
          onClick={() => onViewModeChange('map')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            viewMode === 'map'
              ? 'bg-sage-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <MapIcon className="w-4 h-4" />
          Map
        </button>
        <button
          onClick={() => onViewModeChange('list')}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            viewMode === 'list'
              ? 'bg-sage-600 text-white'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ListBulletIcon className="w-4 h-4" />
          List
        </button>
      </div>

      {/* Color Mode Toggle */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-1 flex">
          <button
            onClick={() => onColorModeChange('price')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              colorMode === 'price'
                ? 'bg-blue-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            By Price
          </button>
          <button
            onClick={() => onColorModeChange('growth')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              colorMode === 'growth'
                ? 'bg-green-600 text-white'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            By Growth
          </button>
        </div>
      )}

      {/* Filter Button */}
      <button
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className={`bg-white rounded-xl shadow-lg border border-stone-200 p-3 flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:bg-stone-50 ${
          hasActiveFilters ? 'border-sage-500 text-sage-700' : 'text-stone-600'
        }`}
      >
        <FunnelIcon className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="bg-sage-600 text-white text-xs px-1.5 py-0.5 rounded-full">
            Active
          </span>
        )}
      </button>

      {/* Filters Dropdown */}
      {isFiltersOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-xl shadow-xl border border-stone-200 p-4 min-w-[280px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={() =>
                  onFiltersChange({
                    minPrice: null,
                    maxPrice: null,
                    minGrowth: null,
                    maxGrowth: null,
                  })
                }
                className="text-xs text-sage-600 hover:text-sage-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Price Filter */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">
              Price Range
            </label>
            <div className="flex flex-wrap gap-1.5">
              {pricePresets.map((preset) => {
                const isActive =
                  filters.minPrice === preset.min &&
                  filters.maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        minPrice: preset.min,
                        maxPrice: preset.max,
                      })
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Growth Filter */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">
              Growth Rate
            </label>
            <div className="flex flex-wrap gap-1.5">
              {growthPresets.map((preset) => {
                const isActive =
                  filters.minGrowth === preset.min &&
                  filters.maxGrowth === preset.max;
                return (
                  <button
                    key={preset.label}
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        minGrowth: preset.min,
                        maxGrowth: preset.max,
                      })
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Zoom Controls */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 flex flex-col overflow-hidden">
          <button
            onClick={onZoomIn}
            className="p-3 hover:bg-stone-100 transition-colors duration-200 border-b border-stone-100"
            aria-label="Zoom in"
          >
            <svg
              className="w-4 h-4 text-stone-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v12m6-6H6"
              />
            </svg>
          </button>
          <button
            onClick={onZoomOut}
            className="p-3 hover:bg-stone-100 transition-colors duration-200 border-b border-stone-100"
            aria-label="Zoom out"
          >
            <svg
              className="w-4 h-4 text-stone-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 12H6"
              />
            </svg>
          </button>
          <button
            onClick={onResetView}
            className="p-3 hover:bg-stone-100 transition-colors duration-200"
            aria-label="Reset view"
          >
            <svg
              className="w-4 h-4 text-stone-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// Compact search bar for map overlay
interface MapSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export function MapSearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search areas...',
}: MapSearchBarProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-200 rounded-xl shadow-lg text-sm focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent transition-all duration-200"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {value && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-stone-100 rounded-full transition-colors duration-200"
        >
          <svg
            className="w-4 h-4 text-stone-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
