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
  const [scrollProgress, setScrollProgress] = useState<number[]>(
    new Array(areas.length - 1).fill(0)
  );
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track which section is in view and scroll progress between sections
  useEffect(() => {
    const updateScrollProgress = () => {
      const newProgress: number[] = new Array(areas.length - 1).fill(0);
      let newActiveIndex = 0;

      sectionRefs.current.forEach((ref, index) => {
        if (!ref) return;

        const rect = ref.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const headerOffset = 100;

        // Calculate if section is in view
        const sectionTop = rect.top - headerOffset;
        const sectionBottom = rect.bottom - headerOffset;
        const sectionHeight = rect.height;

        // Check if section is more than 50% visible
        const visibleHeight = Math.min(viewportHeight, sectionBottom) - Math.max(0, sectionTop);
        const visibilityRatio = visibleHeight / sectionHeight;

        if (visibilityRatio > 0.5) {
          newActiveIndex = index;
        }

        // Calculate progress for line between this section and next
        if (index < areas.length - 1) {
          const nextRef = sectionRefs.current[index + 1];
          if (nextRef) {
            const nextRect = nextRef.getBoundingClientRect();
            const gap = nextRect.top - rect.bottom;
            const currentScroll = window.scrollY + headerOffset;
            const sectionEnd = rect.bottom + window.scrollY;
            const nextStart = nextRect.top + window.scrollY;

            // Calculate progress: 0 when current section is in view, 1 when next is fully in view
            if (currentScroll >= sectionEnd && currentScroll <= nextStart) {
              const progress = (currentScroll - sectionEnd) / gap;
              newProgress[index] = Math.min(1, Math.max(0, progress));
            } else if (currentScroll > nextStart) {
              newProgress[index] = 1;
            }
          }
        }
      });

      setActiveIndex(newActiveIndex);
      setScrollProgress(newProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
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
      {/* Left Sidebar - Area Names with Dots and Progress Lines (Canopy Style) */}
      <div className="w-64 flex-shrink-0 sticky top-24 self-start">
        <nav className="relative">
          {areas.map((area, index) => {
            const isActive = index === activeIndex;
            const isNextActive = index === activeIndex + 1;
            const lineProgress = scrollProgress[index] || 0;
            const showLine = index < areas.length - 1;

            return (
              <div key={area.id} className="relative">
                <button
                  onClick={() => scrollToSection(index)}
                  className={`w-full text-left px-3 py-2.5 transition-all duration-200 flex items-center gap-3 group relative z-10 ${
                    isActive || isNextActive
                      ? "text-stone-900 font-medium"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {/* Dot indicator - Always visible, changes color when active or next */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        isActive || (isNextActive && lineProgress > 0.5)
                          ? "bg-sage-600"
                          : "bg-stone-300 group-hover:bg-stone-400"
                      }`}
                    />
                  </div>
                  <span className="text-sm leading-relaxed">{area.name}</span>
                </button>

                {/* Progress line between items */}
                {showLine && (
                  <div className="absolute left-[11px] top-10 w-0.5 h-8 -translate-x-1/2">
                    {/* Background line (grey) */}
                    <div className="absolute inset-0 bg-stone-200" />
                    {/* Progress line (sage) */}
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-sage-600 transition-all duration-100 ease-out"
                      style={{
                        height: `${lineProgress * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Right Side - Scrollable Sections */}
      <div className="flex-1 space-y-3">
        {areas.map((area, index) => {
          const { stats } = area;
          const isPositive = stats && stats.priceChangeYoY >= 0;

          return (
            <section
              key={area.id}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
              className="h-[600px] flex items-center"
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
