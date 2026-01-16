"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Area, formatPrice, formatPriceChange } from "@/types";
import { AreaLocationMap } from "@/components/map/AreaLocationMap";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface AreaPreviewCardProps {
  area: Area;
  delay?: number;
}

export function AreaPreviewCard({ area, delay = 0 }: AreaPreviewCardProps) {
  const { stats } = area;
  const isPositive = stats && stats.priceChangeYoY >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white rounded-2xl border border-stone-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Map Preview */}
      <div className="relative h-48 bg-stone-100 overflow-hidden">
        <AreaLocationMap area={area} />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h4 className="text-xl font-bold text-stone-900 mb-1">{area.name}</h4>
          <span className="text-sm text-stone-500 capitalize">
            {area.level}
          </span>
        </div>

        {/* Key Stats */}
        {stats && (
          <div className="space-y-3">
            {/* Average Price */}
            <div>
              <div className="text-xs text-stone-500 mb-1">Average Price</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-stone-900">
                  {formatPrice(stats.avgPrice)}
                </span>
                <span
                  className={`text-sm font-medium px-2 py-0.5 rounded-md mb-1 ${
                    isPositive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {formatPriceChange(stats.priceChangeYoY)}
                </span>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
              <div>
                <div className="text-xs text-stone-500 mb-0.5">Median</div>
                <div className="text-sm font-semibold text-stone-900">
                  {formatPrice(stats.medianPrice)}
                </div>
              </div>
              <div>
                <div className="text-xs text-stone-500 mb-0.5">
                  Sales (12mo)
                </div>
                <div className="text-sm font-semibold text-stone-900">
                  {stats.salesCount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/area/${area.slug}`}
          className="flex items-center justify-between w-full px-4 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-all duration-200 group/button"
        >
          <span>View Insights</span>
          <ArrowRightIcon className="w-5 h-5 transition-transform duration-200 group-hover/button:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}
