"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Area, formatPrice, formatPriceChange, formatNumber } from "@/types";
import { AreaLocationMap } from "@/components/map/AreaLocationMap";

interface AreaCarouselProps {
  areas: Area[];
}

export function AreaCarousel({ areas }: AreaCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedArea = areas[selectedIndex];

  if (!selectedArea) return null;

  const { stats } = selectedArea;
  const isPositive = stats && stats.priceChangeYoY >= 0;

  return (
    <div className="flex gap-6 min-h-[650px]">
      {/* Left Sidebar - Area Names (Narrow, Light Gray) */}
      <div className="w-56 flex-shrink-0 bg-stone-50 rounded-lg p-4">
        <nav className="space-y-0.5">
          {areas.map((area, index) => {
            const isActive = index === selectedIndex;
            return (
              <button
                key={area.id}
                onClick={() => setSelectedIndex(index)}
                className={`w-full text-left px-4 py-2.5 rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-white text-stone-900 font-semibold shadow-sm"
                    : "text-stone-600 hover:text-stone-900 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-sage-600 flex-shrink-0" />
                  )}
                  <span className="text-sm">{area.name}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Side - Large Area Card */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedArea.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden h-full flex flex-col"
          >
            {/* Area Name Header - Large, Dark Gray */}
            <div className="px-8 py-6 border-b border-stone-200">
              <h2 className="text-4xl font-bold text-stone-900 mb-2">
                {selectedArea.name}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-stone-500 capitalize">
                  {selectedArea.level}
                </span>
                {stats && (
                  <>
                    <span className="text-stone-300">•</span>
                    <span
                      className={`text-sm font-semibold ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatPriceChange(stats.priceChangeYoY)} YoY
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Map View - Takes significant space */}
            <div className="px-8 py-6 border-b border-stone-200 flex-1 min-h-0">
              <div className="h-full min-h-[400px] rounded-lg overflow-hidden bg-stone-50">
                <AreaLocationMap area={selectedArea} />
              </div>
            </div>

            {/* Key Info - Clean Grid Below Map */}
            {stats && (
              <div className="px-8 py-6 border-t border-stone-200 bg-stone-50/30">
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-2 font-medium">
                      Average Price
                    </div>
                    <div className="text-2xl font-bold text-stone-900">
                      {formatPrice(stats.avgPrice)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-stone-500 uppercase tracking-wider mb-2 font-medium">
                      Sales (12mo)
                    </div>
                    <div className="text-2xl font-bold text-stone-900">
                      {formatNumber(stats.salesCount)}
                    </div>
                  </div>
                  {stats.avgPricePerSqm ? (
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-wider mb-2 font-medium">
                        Price per m²
                      </div>
                      <div className="text-2xl font-bold text-stone-900">
                        {formatPrice(stats.avgPricePerSqm)}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-wider mb-2 font-medium">
                        Median Price
                      </div>
                      <div className="text-2xl font-bold text-stone-900">
                        {formatPrice(stats.medianPrice)}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Link */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <Link
                    href={`/area/${selectedArea.slug}`}
                    className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700 font-semibold text-sm transition-colors duration-200 group"
                  >
                    <span>View Full Market Analysis</span>
                    <svg
                      className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pagination Controls - Centered at Bottom */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() =>
              setSelectedIndex((prev) =>
                prev > 0 ? prev - 1 : areas.length - 1
              )
            }
            className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100 hover:border-stone-400 transition-all duration-200 text-stone-600 hover:text-stone-900"
            aria-label="Previous"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center gap-1">
            {areas.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={`w-9 h-9 rounded text-sm font-medium transition-all duration-200 ${
                  index === selectedIndex
                    ? "bg-sage-600 text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
                aria-label={`Go to page ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setSelectedIndex((prev) =>
                prev < areas.length - 1 ? prev + 1 : 0
              )
            }
            className="w-9 h-9 rounded-full border border-stone-300 flex items-center justify-center hover:bg-stone-100 hover:border-stone-400 transition-all duration-200 text-stone-600 hover:text-stone-900"
            aria-label="Next"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
