'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Area } from '@/types';
import { searchAreas } from '@/data/areas';

export function SearchBar() {
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

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(results.length > 0)}
          onKeyDown={handleKeyDown}
          placeholder="Search suburbs, cities, or estates..."
          className="w-full px-4 py-3 pl-12 text-lg border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-transparent shadow-sm transition-all duration-200 hover:border-stone-400"
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

      {isOpen && (
        <div
          ref={resultsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden"
        >
          {results.map((area, index) => (
            <button
              key={area.id}
              onClick={() => handleSelect(area)}
              className={`w-full px-4 py-3 text-left flex items-center justify-between transition-colors duration-200 ${
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
