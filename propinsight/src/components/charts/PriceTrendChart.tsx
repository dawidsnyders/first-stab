"use client";

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
import { ChartDataPoint } from "@/lib/chartData";
import { formatPrice } from "@/types";
import { NATIONAL_BENCHMARKS } from "@/lib/constants";
import { motion } from "framer-motion";

interface PriceTrendChartProps {
  data: ChartDataPoint[];
  areaName: string;
  currentPrice: number;
  priceChangeYoY: number;
}

const PriceTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const avgPrice = payload[0].payload.avgPrice || value;
    const changeFromAvg =
      avgPrice > 0 ? ((value - avgPrice) / avgPrice) * 100 : 0;

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
          {changeFromAvg !== 0 && (
            <div className="pt-2 border-t border-stone-100">
              <p
                className={`text-xs font-medium ${
                  changeFromAvg > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {changeFromAvg > 0 ? "↑" : "↓"}{" "}
                {Math.abs(changeFromAvg).toFixed(1)}% from 3-year average
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }
  return null;
};

export function PriceTrendChart({
  data,
  areaName,
  currentPrice,
  priceChangeYoY,
}: PriceTrendChartProps) {
  // Calculate 3-year average for reference line
  const avgPrice = data.reduce((sum, point) => sum + point.value, 0) / data.length;

  // Enhance data with average price
  const enhancedData = data.map((point) => ({
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
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
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
          />
          <Tooltip content={<PriceTooltip />} />
          <ReferenceLine
            y={avgPrice}
            stroke={avgColor}
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: "3-Year Average",
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
      <div className="mt-6 grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
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
            3-Year Average
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
