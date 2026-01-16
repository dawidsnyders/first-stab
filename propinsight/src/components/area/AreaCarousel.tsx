"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Area, formatPrice, formatPriceChange, formatNumber } from "@/types";
import { AreaLocationMap } from "@/components/map/AreaLocationMap";

interface AreaCarouselProps {
  areas: Area[];
}

export function AreaCarousel({ areas }: AreaCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track which section is in view using Intersection Observer
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
              setActiveIndex(index);
            }
          });
        },
        {
          threshold: [0, 0.5, 1],
          rootMargin: "-20% 0px -20% 0px", // Trigger when section is in middle 60% of viewport
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [areas]);

  // Scroll to section when clicking sidebar item
  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index];
    if (section) {
      const headerOffset = 100; // Account for fixed header
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex gap-8">
      {/* Left Sidebar - Area Names with Dots (Canopy Style) */}
      <div className="w-64 flex-shrink-0 sticky top-24 self-start">
        <nav className="space-y-1">
          {areas.map((area, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={area.id}
                onClick={() => scrollToSection(index)}
                className={`w-full text-left px-3 py-2.5 transition-all duration-200 flex items-center gap-3 group ${
                  isActive
                    ? "text-stone-900 font-medium"
                    : "text-stone-500 hover:text-stone-700"
                }`}
              >
                {/* Dot indicator - Always visible, changes color when active */}
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600"
                      : "bg-stone-300 group-hover:bg-stone-400"
                  }`}
                />
                <span className="text-sm leading-relaxed">{area.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Side - Scrollable Sections */}
      <div className="flex-1">
        {areas.map((area, index) => {
          const { stats } = area;
          const isPositive = stats && stats.priceChangeYoY >= 0;

          return (
            <section
              key={area.id}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
              className="min-h-screen flex items-center py-16 mb-0"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden"
              >
                {/* Area Name Header - Large, Dark Gray */}
                <div className="px-8 py-6 border-b border-stone-200">
                  <h2 className="text-4xl font-bold text-stone-900 mb-2">
                    {area.name}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-stone-500 capitalize">
                      {area.level}
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
                <div className="px-8 py-6 border-b border-stone-200">
                  <div className="h-[500px] rounded-lg overflow-hidden bg-stone-50">
                    <AreaLocationMap area={area} />
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
                        href={`/area/${area.slug}`}
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
