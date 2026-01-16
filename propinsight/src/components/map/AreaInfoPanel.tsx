"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Area, formatPrice, formatPriceChange, formatNumber } from "@/types";
import { AreaInfoPanelSkeleton } from "@/components/ui/Skeleton";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";
import { generateMedianPriceData } from "@/lib/chartData";
import { AreaChart, Area as RechartsArea, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
  const isVisible = area || isLoading;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="info-panel" // Fixed key - panel stays mounted when switching areas
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{
            duration: 0.2, // 200ms animation
            ease: [0.4, 0, 0.2, 1], // Smooth easing
          }}
          className="absolute top-2 bottom-2 right-[4px] w-[420px] max-w-[90vw] bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl border border-stone-200 overflow-y-auto z-[5000] area-info-panel-scrollbar"
          style={{ 
            pointerEvents: 'auto',
            touchAction: 'pan-y',
          }}
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
          <AnimatePresence mode="wait" initial={false}>
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
    <div className="p-6 pb-24 space-y-6">
      {/* Header */}
      <div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-stone-900 mb-3"
        >
          {area.name}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="flex items-center gap-2 flex-wrap"
        >
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-terracotta-50 text-terracotta-700 border border-terracotta-200 capitalize">
            {area.level}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200">
            Western Cape
          </span>
        </motion.div>
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
              label="Sales (12mo)"
              value={formatNumber(stats.salesCount)}
              delay={0.3}
            />
            {stats.avgPricePerSqm && (
              <StatCard
                label="Price / m²"
                value={formatPrice(stats.avgPricePerSqm)}
                delay={0.35}
              />
            )}
          </motion.div>

          {/* Houses vs Apartments Breakdown */}
          {stats.propertyTypeBreakdown && (() => {
            const houses = stats.propertyTypeBreakdown.houses || 0;
            const apartments = stats.propertyTypeBreakdown.apartments || 0;
            const total = houses + apartments;
            // Normalize to 100% if they don't add up
            const housesPercent = total > 0 ? Math.round((houses / total) * 100) : 0;
            const apartmentsPercent = total > 0 ? Math.round((apartments / total) * 100) : 0;
            
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.2 }}
                className="space-y-2 mb-4"
              >
                <div className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                  Market Composition
                </div>
                {/* Single 100% stacked bar */}
                <div className="h-6 bg-stone-200 rounded-full overflow-hidden flex">
                  {housesPercent > 0 && (
                    <div
                      className="h-full bg-sage-500 flex items-center justify-center transition-all duration-500 flex-shrink-0"
                      style={{ width: `${housesPercent}%` }}
                    >
                      {housesPercent > 10 && (
                        <span className="text-[10px] font-semibold text-white">
                          {housesPercent}%
                        </span>
                      )}
                    </div>
                  )}
                  {apartmentsPercent > 0 && (
                    <div
                      className="h-full bg-terracotta-500 flex items-center justify-center transition-all duration-500 flex-shrink-0"
                      style={{ width: `${apartmentsPercent}%` }}
                    >
                      {apartmentsPercent > 10 && (
                        <span className="text-[10px] font-semibold text-white">
                          {apartmentsPercent}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* Labels below bar */}
                <div className="flex justify-between text-[10px] text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-sage-500"></div>
                    <span>Houses: {housesPercent}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded bg-terracotta-500"></div>
                    <span>Apartments: {apartmentsPercent}%</span>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* Mini chart */}
          {(() => {
            const chartData = generateMedianPriceData(stats.medianPrice, stats.priceChangeYoY, 3);
            const values = chartData.map((d) => d.value).filter((v) => typeof v === "number" && !isNaN(v));
            const minValue = values.length > 0 ? Math.min(...values) : 0;
            const maxValue = values.length > 0 ? Math.max(...values) : stats.medianPrice * 2;
            const range = maxValue - minValue;
            const yAxisDomain = [Math.max(0, minValue - range * 0.1), maxValue + range * 0.1];
            
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.2 }}
                className="h-40 bg-stone-50 rounded-lg border border-stone-200 flex flex-col"
              >
                <div className="text-xs text-stone-500 font-medium px-3 pt-3 pb-1 flex-shrink-0">Price trend (3 years)</div>
                <ResponsiveContainer width="100%" height={116}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                    >
                    <defs>
                      <linearGradient id={`miniPriceGradient-${area.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5d7350" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#5d7350" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <RechartsArea
                      type="monotone"
                      dataKey="value"
                      stroke="#5d7350"
                      strokeWidth={2}
                      fill={`url(#miniPriceGradient-${area.id})`}
                      dot={false}
                    />
                    <XAxis 
                      dataKey="label" 
                      tick={{ fontSize: 9, fill: '#78716c' }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      height={30}
                    />
                    <YAxis 
                      domain={yAxisDomain}
                      tick={{ fontSize: 9, fill: '#78716c' }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `R${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `R${(value / 1000).toFixed(0)}K`;
                        return `R${value}`;
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e7e5e4",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => formatPrice(value)}
                      labelStyle={{ fontSize: "11px", color: "#78716c" }}
                    />
                    </AreaChart>
                  </ResponsiveContainer>
              </motion.div>
            );
          })()}
        </>
      )}

      {/* CTA buttons - Sticky at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.2 }}
        className="sticky bottom-0 left-0 right-0 flex gap-2 pt-4 pb-2 bg-white/95 backdrop-blur-sm border-t border-stone-100 -mx-6 px-6 z-10"
      >
        <Link
          href={`/area/${area.slug}`}
          className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-medium rounded-lg text-center transition-colors duration-200 whitespace-nowrap"
        >
          View Full Details
        </Link>
        <Link
          href={`/area/${area.slug}#report`}
          className="flex-1 py-2 px-3 bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium rounded-lg text-center transition-colors duration-200 whitespace-nowrap"
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
