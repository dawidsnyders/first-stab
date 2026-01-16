'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Area } from '@/types';
import { searchAreas, getAreasByLevel } from '@/data/areas';

interface SearchBarProps {
  onMapClick?: () => void;
}

export function SearchBar({ onMapClick }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Area[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const matches = searchAreas(query).slice(0, 8);
      setResults(matches);
      setIsOpen(matches.length > 0);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (area: Area) => {
    setQuery('');
    setIsOpen(false);
    router.push(`/area/${area.slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const getLevelBadge = (level: Area['level']) => {
    const styles = {
      province: 'bg-moss-100 text-moss-700',
      city: 'bg-sage-100 text-sage-700',
      suburb: 'bg-terracotta-100 text-terracotta-700',
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${styles[level]}`}
      >
        {level}
      </span>
    );
  };

  // Get popular areas for quick select
  const popularAreas = getAreasByLevel("suburb")
    .filter((area) => area.stats)
    .slice(0, 4);

  const handleQuickSelect = (area: Area) => {
    router.push(`/area/${area.slug}`);
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Quick Select Areas */}
      <div className="mb-3">
        <div className="flex flex-wrap gap-2">
          {popularAreas.map((area) => (
            <motion.button
              key={area.id}
              onClick={() => handleQuickSelect(area)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-4 py-2 text-xs font-medium rounded-lg transition-all duration-100 bg-white text-stone-700 hover:text-stone-900 border border-stone-200 hover:border-sage-300 hover:shadow-sm"
            >
              {area.name}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setIsOpen(results.length > 0)}
            onKeyDown={handleKeyDown}
            placeholder="Search suburbs, cities, or estates..."
            className="w-full px-4 py-3 pl-12 pr-4 text-lg border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent shadow-sm transition-all duration-100 hover:border-stone-400"
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
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
        </div>
        {onMapClick && (
          <button
            onClick={onMapClick}
            className="flex items-center justify-center w-12 h-12 border border-stone-300 rounded-xl bg-white hover:bg-stone-50 hover:border-sage-400 transition-all duration-100 shadow-sm hover:shadow-md group"
            aria-label="Open map view"
            title="Open interactive map"
          >
            <svg
              className="w-5 h-5 text-stone-600 group-hover:text-sage-600 transition-colors duration-100"
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
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden"
        >
          {results.map((area, index) => (
            <button
              key={area.id}
              onClick={() => handleSelect(area)}
              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-100 ${
                index === selectedIndex 
                  ? 'bg-sage-50 hover:bg-sage-100' 
                  : 'hover:bg-stone-50'
              }`}
            >
              <span className="font-medium text-stone-900">{area.name}</span>
              {getLevelBadge(area.level)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
