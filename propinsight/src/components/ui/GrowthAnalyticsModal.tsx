"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area } from "@/types";
import { NATIONAL_BENCHMARKS } from "@/lib/constants";
import { generateOutperformanceData } from "@/lib/chartData";
import { StatChart } from "@/components/charts/StatChart";
import { getAreasByLevel } from "@/data/areas";

interface GrowthAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GrowthAnalyticsModal({
  isOpen,
  onClose,
}: GrowthAnalyticsModalProps) {
  const [selectedAreaSlug, setSelectedAreaSlug] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<5 | 10 | 15>(5);

  // Get all areas with stats for the dropdown
  const areasWithStats = useMemo(() => {
    const allSuburbs = getAreasByLevel("suburb");
    return allSuburbs.filter((area) => area.stats);
  }, []);

  // Calculate national average data
  const nationalData = useMemo(() => {
    // Use national benchmark as the "outperformance" (0% vs national = national itself)
    return generateOutperformanceData(0, NATIONAL_BENCHMARKS.avgPropertyGrowth, timePeriod);
  }, [timePeriod]);

  // Get selected area data
  const selectedArea = useMemo(() => {
    if (!selectedAreaSlug) return null;
    return areasWithStats.find((area) => area.slug === selectedAreaSlug) || null;
  }, [selectedAreaSlug, areasWithStats]);

  // Calculate area data if selected
  const areaData = useMemo(() => {
    if (!selectedArea?.stats) return null;
    const outperformance =
      selectedArea.stats.priceChangeYoY - NATIONAL_BENCHMARKS.avgPropertyGrowth;
    return generateOutperformanceData(
      outperformance,
      selectedArea.stats.priceChangeYoY,
      timePeriod
    );
  }, [selectedArea, timePeriod]);

  // Use national data if no area selected, otherwise use area data
  const chartData = selectedArea && areaData ? areaData : nationalData;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.2,
              }}
              className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-stone-200">
                <h2 className="text-2xl font-bold text-stone-900">
                  Growth Analytics
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-stone-100 transition-colors duration-200 group"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-5 h-5 text-stone-500 group-hover:text-stone-900 transition-colors duration-200"
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
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-6">
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Select Area (or view National Average)
                      </label>
                      <select
                        value={selectedAreaSlug || "national"}
                        onChange={(e) =>
                          setSelectedAreaSlug(
                            e.target.value === "national" ? null : e.target.value
                          )
                        }
                        className="w-full sm:w-64 px-4 py-2 border border-stone-300 rounded-lg text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                      >
                        <option value="national">National Average</option>
                        {areasWithStats.map((area) => (
                          <option key={area.id} value={area.slug}>
                            {area.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Time Period Selector */}
                    <div className="flex items-center gap-2">
                      {([5, 10, 15] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => setTimePeriod(period)}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                            timePeriod === period
                              ? "bg-sage-600 text-white shadow-sm"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          {period} Years
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm">
                    {selectedArea ? (
                      <>
                        Historical growth trend data for{" "}
                        <span className="font-semibold">{selectedArea.name}</span>{" "}
                        over the past {timePeriod} years, compared against the
                        national average. Hover over the chart to see detailed
                        values.
                      </>
                    ) : (
                      <>
                        Historical national average growth trend over the past{" "}
                        {timePeriod} years. Select an area from the dropdown to
                        compare against the national average.
                      </>
                    )}
                  </p>

                  {/* Chart */}
                  <StatChart
                    data={chartData}
                    type="outperformance"
                    areaName={selectedArea?.name || "National Average"}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
