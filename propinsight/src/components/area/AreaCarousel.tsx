"use client";

import { useState, useEffect, useRef } from "react";
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
      const headerOffset = 100;
      const viewportCenter = window.scrollY + window.innerHeight / 2;

      sectionRefs.current.forEach((ref, index) => {
        if (!ref) return;

        const rect = ref.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = rect.bottom + window.scrollY;
        const sectionCenter = (sectionTop + sectionBottom) / 2;

        // Check if section center is closest to viewport center
        const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);
        if (
          index === 0 ||
          distanceFromCenter <
            Math.abs(
              sectionRefs.current[newActiveIndex]?.getBoundingClientRect()
                .top! +
                window.scrollY +
                sectionRefs.current[newActiveIndex]?.getBoundingClientRect()
                  .height! /
                  2 -
                viewportCenter
            )
        ) {
          newActiveIndex = index;
        }

        // Calculate progress for line between this section and next
        if (index < areas.length - 1) {
          const nextRef = sectionRefs.current[index + 1];
          if (nextRef) {
            const nextRect = nextRef.getBoundingClientRect();
            const currentScrollTop = window.scrollY + headerOffset;

            // Section boundaries
            const currentSectionBottom = rect.bottom + window.scrollY;
            const nextSectionTop = nextRect.top + window.scrollY;
            const gap = nextSectionTop - currentSectionBottom;

            // Calculate progress: 0 at current section bottom, 1 at next section top
            if (
              currentScrollTop >= currentSectionBottom &&
              currentScrollTop <= nextSectionTop
            ) {
              const progress = (currentScrollTop - currentSectionBottom) / gap;
              newProgress[index] = Math.min(1, Math.max(0, progress));
            } else if (currentScrollTop > nextSectionTop) {
              newProgress[index] = 1;
            } else {
              newProgress[index] = 0;
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
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

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
            const lineProgress =
              index < areas.length - 1 ? scrollProgress[index] || 0 : 0;
            const showLine = index < areas.length - 1;
            // Next dot is active when line is fully filled
            const isNextActive = index === activeIndex + 1 && lineProgress >= 1;
            // Current dot is active or next dot is becoming active
            const dotActive =
              isActive || (index === activeIndex + 1 && lineProgress > 0);

            return (
              <div key={area.id} className="relative">
                <button
                  onClick={() => scrollToSection(index)}
                  className={`w-full text-left px-3 py-2.5 transition-all duration-200 flex items-center gap-3 group relative z-10 ${
                    dotActive
                      ? "text-stone-900 font-medium"
                      : "text-stone-500 hover:text-stone-700"
                  }`}
                >
                  {/* Dot indicator - Always visible, changes color when active */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        dotActive
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
                    {/* Progress line (sage) - fills from top to bottom */}
                    <div
                      className="absolute top-0 left-0 right-0 bg-sage-600 transition-all duration-100 ease-out"
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
      <div className="flex-1">
        {areas.map((area, index) => {
          const { stats } = area;
          const isPositive = stats && stats.priceChangeYoY >= 0;

          return (
            <section
              key={area.id}
              ref={(el) => {
                sectionRefs.current[index] = el as HTMLDivElement | null;
              }}
              className="mb-3 last:mb-0"
              style={{ height: "450px" }}
            >
              <div className="w-full h-full bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex">
                {/* Left Side - Title and Info */}
                <div className="flex-1 flex flex-col px-6 py-4">
                  {/* Area Name Header */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-stone-900 mb-1">
                      {area.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500 capitalize">
                        {area.level}
                      </span>
                      {stats && (
                        <>
                          <span className="text-stone-300">•</span>
                          <span
                            className={`text-xs font-semibold ${
                              isPositive ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {formatPriceChange(stats.priceChangeYoY)} YoY
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Key Info - Grid Below Title */}
                  {stats && (
                    <div className="flex-1 flex flex-col">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
                            Average Price
                          </div>
                          <div className="text-lg font-bold text-stone-900">
                            {formatPrice(stats.avgPrice)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
                            Sales (12mo)
                          </div>
                          <div className="text-lg font-bold text-stone-900">
                            {formatNumber(stats.salesCount)}
                          </div>
                        </div>
                        {stats.avgPricePerSqm ? (
                          <div>
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
                              Price per m²
                            </div>
                            <div className="text-lg font-bold text-stone-900">
                              {formatPrice(stats.avgPricePerSqm)}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
                              Median Price
                            </div>
                            <div className="text-lg font-bold text-stone-900">
                              {formatPrice(stats.medianPrice)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CTA Link */}
                      <div className="mt-auto pt-4 border-t border-stone-200">
                        <Link
                          href={`/area/${area.slug}`}
                          className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700 font-semibold text-xs transition-colors duration-200 group"
                        >
                          <span>View Full Market Analysis</span>
                          <svg
                            className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1"
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
                </div>

                {/* Right Side - Map (30% width, full height) */}
                <div className="w-[30%] border-l border-stone-200">
                  <div className="w-full h-full">
                    <AreaLocationMap area={area} />
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
