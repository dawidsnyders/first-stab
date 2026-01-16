"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Area, formatPrice, formatPriceChange, formatNumber } from "@/types";
import { AreaLocationMap } from "@/components/map/AreaLocationMap";
import {
  generateMedianPriceData,
  generatePricePerSqmData,
} from "@/lib/chartData";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

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
    let rafId: number | null = null;
    
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
          (() => {
            const newRef = sectionRefs.current[newActiveIndex];
            if (!newRef) return false;
            const newRect = newRef.getBoundingClientRect();
            return (
              distanceFromCenter <
              Math.abs(
                newRect.top +
                  window.scrollY +
                  newRect.height / 2 -
                  viewportCenter
              )
            );
          })()
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

    const throttledUpdate = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(updateScrollProgress);
    };

    updateScrollProgress();
    window.addEventListener("scroll", throttledUpdate, { passive: true });
    window.addEventListener("resize", throttledUpdate);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener("scroll", throttledUpdate);
      window.removeEventListener("resize", throttledUpdate);
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

      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      });
    }
  };

  // Calculate overall scroll progress through all sections
  const calculateOverallProgress = () => {
    if (sectionRefs.current.length === 0) return 0;

    const firstSection = sectionRefs.current[0];
    const lastSection = sectionRefs.current[sectionRefs.current.length - 1];

    if (!firstSection || !lastSection) return 0;

    const firstTop =
      firstSection.getBoundingClientRect().top + (window.scrollY || 0);
    const lastBottom =
      lastSection.getBoundingClientRect().bottom + (window.scrollY || 0);
    const totalHeight = lastBottom - firstTop;
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    const scrolled = scrollPosition - firstTop;

    return Math.max(0, Math.min(1, scrolled / totalHeight));
  };

  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      setOverallProgress(calculateOverallProgress());
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [areas]);

  return (
    <div className="flex gap-8">
      {/* Left Sidebar - Clean Visual Progress Indicator */}
      <div className="w-48 flex-shrink-0 sticky top-24 self-start">
        <div className="relative h-full flex flex-col items-start">
          {/* Progress Track */}
          <div className="absolute top-0 left-[11px] w-1 h-full bg-stone-200 rounded-full">
            {/* Progress Fill */}
            <div
              className="absolute top-0 left-0 w-full bg-sage-600 rounded-full transition-all duration-100 ease-out"
              style={{
                height: `${overallProgress * 100}%`,
              }}
            />
          </div>

          {/* Area Indicators */}
          <nav className="relative z-10 flex flex-col gap-6 py-2">
            {areas.map((area, index) => {
              const isActive = index === activeIndex;
              const progress = index / (areas.length - 1);
              const isPast = progress <= overallProgress;

              return (
                <button
                  key={area.id}
                  onClick={() => scrollToSection(index)}
                  className="group relative flex items-center gap-3"
                >
                  {/* Indicator Circle - Centered on line (line at 11px, dot center at 11px, so left edge at 9.5px) */}
                  <div
                    className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all duration-200 absolute left-[9.5px] -translate-x-1/2 ${
                      isActive
                        ? "bg-sage-600 border-sage-600 scale-125"
                        : isPast
                        ? "bg-sage-400 border-sage-400"
                        : "bg-white border-stone-300 group-hover:border-sage-400"
                    }`}
                  />

                  {/* Area Name - Offset to account for absolute positioned dot */}
                  <span
                    className={`text-sm transition-all duration-200 ml-4 ${
                      isActive
                        ? "text-stone-900 font-medium"
                        : "text-stone-500 group-hover:text-stone-700"
                    }`}
                  >
                    {area.name}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
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
              style={{ height: "400px" }}
            >
              <Link
                href={`/area/${area.slug}`}
                className="block w-full h-full group"
              >
                <div className="w-full h-full bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex transition-all duration-200 group-hover:shadow-md group-hover:border-sage-300 group-hover:scale-[1.01] cursor-pointer">
                  {/* Left Side - Title and Info */}
                  <div className="flex-1 flex flex-col px-6 py-4">
                    {/* Area Name Header with Stats */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
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

                      {/* Stats - Right Aligned */}
                      {stats && (
                        <div className="flex items-center gap-6 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
                              Average Price
                            </div>
                            <div className="text-lg font-bold text-stone-900">
                              {formatPrice(stats.avgPrice)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
                              Sales (12mo)
                            </div>
                            <div className="text-lg font-bold text-stone-900">
                              {formatNumber(stats.salesCount)}
                            </div>
                          </div>
                          {stats.avgPricePerSqm ? (
                            <div className="text-right">
                              <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
                                Price per m²
                              </div>
                              <div className="text-lg font-bold text-stone-900">
                                {formatPrice(stats.avgPricePerSqm)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-right">
                              <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-1 font-medium">
                                Median Price
                              </div>
                              <div className="text-lg font-bold text-stone-900">
                                {formatPrice(stats.medianPrice)}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Key Info */}
                    {stats && (
                      <div className="flex-1 flex flex-col">
                        {/* Price History Charts - Side by Side */}
                        <div className="mb-4 grid grid-cols-2 gap-4">
                          {/* Price Trend Chart */}
                          <div className="bg-stone-50 rounded-lg p-3">
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-2 font-medium">
                              5-Year Price Trend
                            </div>
                            <div className="h-20 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={generateMedianPriceData(
                                    stats.medianPrice,
                                    stats.priceChangeYoY,
                                    5
                                  )}
                                  margin={{
                                    top: 5,
                                    right: 5,
                                    left: 5,
                                    bottom: 5,
                                  }}
                                >
                                  <defs>
                                    <linearGradient
                                      id={`priceMini-${area.id}`}
                                      x1="0"
                                      y1="0"
                                      x2="0"
                                      y2="1"
                                    >
                                      <stop
                                        offset="5%"
                                        stopColor="#5d7350"
                                        stopOpacity={0.3}
                                      />
                                      <stop
                                        offset="95%"
                                        stopColor="#5d7350"
                                        stopOpacity={0}
                                      />
                                    </linearGradient>
                                  </defs>
                                  <XAxis
                                    dataKey="label"
                                    hide
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis hide />
                                  <Tooltip
                                    content={({ active, payload }) => {
                                      if (active && payload && payload.length) {
                                        return (
                                          <div className="bg-white p-2 rounded shadow-lg border border-stone-200 text-xs">
                                            <p className="font-semibold text-stone-900">
                                              {formatPrice(
                                                payload[0].value as number
                                              )}
                                            </p>
                                            <p className="text-stone-500 text-[10px]">
                                              {payload[0].payload.label}
                                            </p>
                                          </div>
                                        );
                                      }
                                      return null;
                                    }}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#5d7350"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: "#5d7350" }}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Price per m² Chart */}
                          {stats.avgPricePerSqm && (
                            <div className="bg-stone-50 rounded-lg p-3">
                              <div className="text-[10px] text-stone-500 uppercase tracking-wider mb-2 font-medium">
                                5-Year Price per m²
                              </div>
                              <div className="h-20 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={generatePricePerSqmData(
                                      stats.avgPricePerSqm,
                                      stats.priceChangeYoY,
                                      5
                                    )}
                                    margin={{
                                      top: 5,
                                      right: 5,
                                      left: 5,
                                      bottom: 5,
                                    }}
                                  >
                                    <defs>
                                      <linearGradient
                                        id={`pricePerSqmMini-${area.id}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                      >
                                        <stop
                                          offset="5%"
                                          stopColor="#ed6b4a"
                                          stopOpacity={0.3}
                                        />
                                        <stop
                                          offset="95%"
                                          stopColor="#ed6b4a"
                                          stopOpacity={0}
                                        />
                                      </linearGradient>
                                    </defs>
                                    <XAxis
                                      dataKey="label"
                                      hide
                                      axisLine={false}
                                      tickLine={false}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                      content={({ active, payload }) => {
                                        if (
                                          active &&
                                          payload &&
                                          payload.length
                                        ) {
                                          return (
                                            <div className="bg-white p-2 rounded shadow-lg border border-stone-200 text-xs">
                                              <p className="font-semibold text-stone-900">
                                                {formatPrice(
                                                  payload[0].value as number
                                                )}
                                              </p>
                                              <p className="text-stone-500 text-[10px]">
                                                {payload[0].payload.label}
                                              </p>
                                            </div>
                                          );
                                        }
                                        return null;
                                      }}
                                    />
                                    <Line
                                      type="monotone"
                                      dataKey="value"
                                      stroke="#ed6b4a"
                                      strokeWidth={2}
                                      dot={false}
                                      activeDot={{ r: 4, fill: "#ed6b4a" }}
                                    />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* CTA Link */}
                        <div className="mt-auto pt-4 border-t border-stone-200">
                          <div className="inline-flex items-center gap-2 text-sage-600 group-hover:text-sage-700 font-semibold text-xs transition-colors duration-200">
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
                          </div>
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
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
