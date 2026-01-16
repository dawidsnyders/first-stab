"use client";

import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Legend,
} from "recharts";
import { ChartDataPoint, generateMedianPriceData } from "@/lib/chartData";
import { formatPrice } from "@/types";
import { NATIONAL_BENCHMARKS } from "@/lib/constants";
import { motion } from "framer-motion";

interface PriceTrendChartProps {
  data: ChartDataPoint[];
  areaName: string;
  currentPrice: number;
  priceChangeYoY: number;
}

type TimePeriod = 5 | 10 | 15;

const PriceTooltip = ({
  active,
  payload,
  label,
  data,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  data?: ChartDataPoint[];
}) => {
  if (active && payload && payload.length && data) {
    const value = payload[0].value;
    const currentIndex = data.findIndex((d) => d.label === label);

    // Find value from 12 months ago (YoY comparison)
    let yoyChange = 0;
    if (currentIndex >= 12) {
      const valueOneYearAgo = data[currentIndex - 12].value;
      yoyChange =
        valueOneYearAgo > 0
          ? ((value - valueOneYearAgo) / valueOneYearAgo) * 100
          : 0;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white p-4 rounded-xl shadow-xl border border-stone-200 backdrop-blur-sm min-w-[200px]"
      >
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
          {label}
        </p>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-stone-500 mb-0.5">Median Price</p>
            <p className="text-xl font-bold text-sage-600">
              {formatPrice(value)}
            </p>
          </div>
          {currentIndex >= 12 && yoyChange !== 0 && (
            <div className="pt-2 border-t border-stone-100">
              <p
                className={`text-xs font-medium ${
                  yoyChange > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {yoyChange > 0 ? "↑" : "↓"} {Math.abs(yoyChange).toFixed(1)}%
                YoY
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
  return null;
};

interface PriceTrendChartPeriodSelectorProps {
  timePeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

export function PriceTrendChartPeriodSelector({
  timePeriod,
  onPeriodChange,
}: PriceTrendChartPeriodSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-nowrap whitespace-nowrap">
      {([5, 10, 15] as TimePeriod[]).map((period) => (
        <button
          key={period}
          onClick={() => onPeriodChange(period)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 flex-shrink-0 ${
            timePeriod === period
              ? "bg-sage-600 text-white shadow-sm"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          }`}
        >
          {period} Years
        </button>
      ))}
    </div>
  );
}

export function PriceTrendChart({
  data: initialData,
  areaName,
  currentPrice,
  priceChangeYoY,
  timePeriod: externalTimePeriod,
  onTimePeriodChange,
}: PriceTrendChartProps & {
  timePeriod?: TimePeriod;
  onTimePeriodChange?: (period: TimePeriod) => void;
}) {
  const [internalTimePeriod, setInternalTimePeriod] = useState<TimePeriod>(5);
  const timePeriod = externalTimePeriod ?? internalTimePeriod;

  const handleTimePeriodChange = (period: TimePeriod) => {
    if (onTimePeriodChange) {
      onTimePeriodChange(period);
    } else {
      setInternalTimePeriod(period);
    }
  };

  // Generate data based on selected time period
  const chartData = generateMedianPriceData(
    currentPrice,
    priceChangeYoY,
    timePeriod
  );

  // Calculate average for reference line
  const avgPrice =
    chartData.reduce((sum, point) => sum + point.value, 0) / chartData.length;

  // Calculate dynamic Y-axis domain (50% coverage)
  const calculateYAxisDomain = () => {
    const values = chartData
      .map((d) => d.value)
      .filter((v) => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return [0, currentPrice * 2];

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;

    // Ensure data spans at least 50% of the Y-axis
    const minDomain = Math.max(0, minValue - range * 0.25);
    const maxDomain = maxValue + range * 0.25;

    return [minDomain, maxDomain];
  };

  const yAxisDomain = calculateYAxisDomain();

  // Enhance data with average price
  const enhancedData = chartData.map((point) => ({
    ...point,
    avgPrice,
  }));

  // Color scheme
  const primaryColor = "#5d7350"; // sage-600
  const avgColor = "#78716c"; // stone-500

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={enhancedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <defs>
            <linearGradient id="price-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="50%" stopColor={primaryColor} stopOpacity={0.15} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e7e5e4"
            vertical={false}
            opacity={0.5}
          />
          <XAxis
            dataKey="label"
            stroke="#78716c"
            fontSize={11}
            tick={{ fill: "#78716c" }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval="preserveStartEnd"
            tickMargin={10}
          />
          <YAxis
            stroke="#78716c"
            fontSize={11}
            tick={{ fill: "#78716c" }}
            tickFormatter={(value) => formatPrice(value)}
            width={90}
            tickMargin={8}
            domain={yAxisDomain}
          />
          <Tooltip content={<PriceTooltip data={chartData} />} />
          <ReferenceLine
            y={avgPrice}
            stroke={avgColor}
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: `${timePeriod}-Year Average`,
              position: "insideTopRight",
              fill: avgColor,
              fontSize: 11,
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name="Median Price"
            stroke={primaryColor}
            strokeWidth={3}
            fill="url(#price-gradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: primaryColor,
              strokeWidth: 3,
              stroke: "#fff",
              style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" },
            }}
            animationDuration={1200}
            animationBegin={0}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Chart Stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-stone-200">
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">
            Current Price
          </p>
          <p className="text-lg font-bold text-stone-900">
            {formatPrice(currentPrice)}
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">
            {timePeriod}-Year Average
          </p>
          <p className="text-lg font-bold text-stone-900">
            {formatPrice(Math.round(avgPrice))}
          </p>
        </div>
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">
            YoY Change
          </p>
          <p
            className={`text-lg font-bold ${
              priceChangeYoY >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {priceChangeYoY >= 0 ? "+" : ""}
            {priceChangeYoY.toFixed(1)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
}
