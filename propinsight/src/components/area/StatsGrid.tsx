"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AreaStats } from "@/types";
import { formatPrice, formatNumber } from "@/types";
import { NATIONAL_BENCHMARKS } from "@/lib/constants";
import {
  generateMedianPriceData,
  generateSalesData,
  generatePricePerSqmData,
  generateOutperformanceData,
} from "@/lib/chartData";
import { ChartModal } from "@/components/ui/ChartModal";
import { StatChart } from "@/components/charts/StatChart";

interface StatsGridProps {
  stats: AreaStats;
  areaName: string;
}

type StatType =
  | "medianPrice"
  | "sales"
  | "pricePerSqm"
  | "outperformance"
  | null;

export function StatsGrid({ stats, areaName }: StatsGridProps) {
  const [openModal, setOpenModal] = useState<StatType>(null);

  const outperformance =
    stats.priceChangeYoY - NATIONAL_BENCHMARKS.avgPropertyGrowth;

  const handleCardClick = (type: StatType) => {
    setOpenModal(type);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const getChartData = (type: StatType) => {
    if (!type) return [];
    switch (type) {
      case "medianPrice":
        return generateMedianPriceData(stats.medianPrice, stats.priceChangeYoY);
      case "sales":
        return generateSalesData(stats.salesCount, stats.priceChangeYoY);
      case "pricePerSqm":
        return stats.avgPricePerSqm
          ? generatePricePerSqmData(stats.avgPricePerSqm, stats.priceChangeYoY)
          : [];
      case "outperformance":
        return generateOutperformanceData(outperformance, stats.priceChangeYoY);
      default:
        return [];
    }
  };

  const getModalTitle = (type: StatType) => {
    switch (type) {
      case "medianPrice":
        return "Median Price Trend";
      case "sales":
        return "Sales Volume (12 months)";
      case "pricePerSqm":
        return "Price per m² Trend";
      case "outperformance":
        return "Performance vs National Average";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Median Price"
          value={formatPrice(stats.medianPrice)}
          onClick={() => handleCardClick("medianPrice")}
        />
        <StatCard
          label="Sales (12 months)"
          value={formatNumber(stats.salesCount)}
          onClick={() => handleCardClick("sales")}
        />
        {stats.avgPricePerSqm && (
          <StatCard
            label="Price per m²"
            value={formatPrice(stats.avgPricePerSqm)}
            onClick={() => handleCardClick("pricePerSqm")}
          />
        )}
        <StatCard
          label="vs National Avg"
          value={`${outperformance >= 0 ? "+" : ""}${outperformance.toFixed(
            1
          )}%`}
          highlight={outperformance > 0}
          onClick={() => handleCardClick("outperformance")}
        />
      </div>

      {openModal && (
        <ChartModal
          isOpen={true}
          onClose={handleCloseModal}
          title={getModalTitle(openModal)}
        >
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Historical trend data for{" "}
              <span className="font-semibold">{areaName}</span> over the past 3
              years. Hover over the chart to see detailed values.
            </p>
            <StatChart
              data={getChartData(openModal)}
              type={openModal}
              areaName={areaName}
            />
          </div>
        </ChartModal>
      )}
    </>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  onClick: () => void;
}

function StatCard({ label, value, highlight, onClick }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-4 rounded-xl cursor-pointer transition-all duration-100 ${
        highlight
          ? "bg-green-50 border border-green-200 hover:bg-green-100 hover:border-green-300 hover:shadow-md"
          : "bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md"
      }`}
    >
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div
        className={`text-2xl font-bold ${
          highlight ? "text-green-700" : "text-gray-900"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
        <span>Click to view chart</span>
        <svg
          className="w-3 h-3"
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
    </motion.div>
  );
}
