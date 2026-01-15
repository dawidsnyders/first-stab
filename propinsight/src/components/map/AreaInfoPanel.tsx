'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Area, formatPrice, formatPriceChange, formatNumber } from '@/types';
import { AreaInfoPanelSkeleton } from '@/components/ui/Skeleton';
import { REPORT_PRICE_DISPLAY } from '@/lib/constants';
import { MiniPriceChart } from '@/components/charts/MiniPriceChart';

interface AreaInfoPanelProps {
  area: Area | null;
  isLoading?: boolean;
  onClose: () => void;
}

export function AreaInfoPanel({ area, isLoading, onClose }: AreaInfoPanelProps) {
  return (
    <AnimatePresence mode="wait">
      {(area || isLoading) && (
        <motion.div
          key={area?.id || 'loading'}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
            duration: 0.2,
          }}
          className="absolute top-0 right-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 overflow-y-auto z-20"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-stone-100 rounded-full transition-colors duration-200 z-10"
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
          </button>

          {isLoading ? (
            <AreaInfoPanelSkeleton />
          ) : area ? (
            <AreaInfoContent area={area} />
          ) : null}
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

          {/* Mini price chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.2 }}
            className="bg-stone-50 rounded-xl p-4 border border-stone-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-stone-700">
                Price Trend (5 years)
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isPositive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {formatPriceChange(stats.priceChangeYoY)} YoY
              </span>
            </div>
            <div className="h-32">
              <MiniPriceChart
                areaId={area.id}
                currentPrice={stats.avgPrice}
                priceChangeYoY={stats.priceChangeYoY}
              />
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
