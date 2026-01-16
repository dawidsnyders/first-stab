"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Area, formatPrice, formatPriceChange, formatNumber } from "@/types";
import { AreaInfoPanelSkeleton } from "@/components/ui/Skeleton";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";

interface AreaInfoPanelProps {
  area: Area | null;
  isLoading?: boolean;
  onClose: () => void;
}

export function AreaInfoPanel({
  area,
  isLoading,
  onClose,
}: AreaInfoPanelProps) {
  // Track if panel was previously visible to handle smooth transitions
  const [wasVisible, setWasVisible] = useState(false);

  useEffect(() => {
    if (area || isLoading) {
      setWasVisible(true);
    }
  }, [area, isLoading]);

  const isVisible = area || isLoading;

  // Debug: log visibility state
  if (typeof window !== 'undefined' && (area || isLoading)) {
    console.log('AreaInfoPanel visibility:', { area: area?.name, isLoading, isVisible });
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="info-panel" // Use fixed key so panel doesn't unmount when switching areas
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{
            duration: 0.2, // 200ms animation
            ease: [0.4, 0, 0.2, 1], // Smooth easing
          }}
          className="absolute top-0 right-0 h-full w-96 max-w-[90vw] bg-white shadow-2xl border-l border-stone-200 overflow-y-auto z-20"
        >
          {/* Close button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors duration-200 z-10"
            aria-label="Close panel"
          >
            <svg
              className="w-5 h-5 text-stone-500"
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
          </motion.button>

          {/* Content area - shows skeleton when loading, content when ready */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <AreaInfoPanelSkeleton />
              </motion.div>
            ) : area ? (
              <motion.div
                key={`content-${area.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AreaInfoContent area={area} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function AreaInfoContent({ area }: { area: Area }) {
  const { stats } = area;
  const isPositive = stats && stats.priceChangeYoY >= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-stone-900"
        >
          {area.name}
        </motion.h2>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="text-sm text-stone-500 capitalize"
        >
          {area.level}
        </motion.span>
      </div>

      {stats && (
        <>
          {/* Price hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
            className="bg-gradient-to-br from-sage-50 to-moss-50 p-4 rounded-xl"
          >
            <div className="text-sm text-stone-600 mb-1">Average Price</div>
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold text-stone-900">
                {formatPrice(stats.avgPrice)}
              </span>
              <span
                className={`text-sm font-medium px-2 py-1 rounded-lg mb-1 ${
                  isPositive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {formatPriceChange(stats.priceChangeYoY)} YoY
              </span>
            </div>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <StatCard
              label="Median Price"
              value={formatPrice(stats.medianPrice)}
              delay={0.3}
            />
            <StatCard
              label="Sales (12mo)"
              value={formatNumber(stats.salesCount)}
              delay={0.35}
            />
            {stats.avgPricePerSqm && (
              <StatCard
                label="Price / m²"
                value={formatPrice(stats.avgPricePerSqm)}
                delay={0.4}
              />
            )}
            {stats.propertyTypeBreakdown && (
              <StatCard
                label="Houses"
                value={`${stats.propertyTypeBreakdown.houses}%`}
                delay={0.45}
              />
            )}
          </motion.div>

          {/* Mini chart placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.2 }}
            className="h-40 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-200"
          >
            <div className="text-center text-stone-500">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              <span className="text-sm">Price trend (3 years)</span>
            </div>
          </motion.div>
        </>
      )}

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.2 }}
        className="space-y-3"
      >
        <Link
          href={`/area/${area.slug}`}
          className="block w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-900 font-medium rounded-xl text-center transition-colors duration-200"
        >
          View Full Details
        </Link>
        <Link
          href={`/area/${area.slug}#report`}
          className="block w-full py-3 px-4 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl text-center transition-colors duration-200"
        >
          Get Full Report - {REPORT_PRICE_DISPLAY}
        </Link>
      </motion.div>

      {/* Last updated */}
      {stats && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.2 }}
          className="text-xs text-stone-400 text-center"
        >
          Data last updated: {stats.lastUpdated}
        </motion.p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  delay,
}: {
  label: string;
  value: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      className="bg-stone-50 p-3 rounded-lg"
    >
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-stone-900">{value}</div>
    </motion.div>
  );
}
