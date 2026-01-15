"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ChartDataPoint } from "@/lib/chartData";
import { formatPrice, formatNumber } from "@/types";
import { motion } from "framer-motion";

interface StatChartProps {
  data: ChartDataPoint[];
  type: "medianPrice" | "sales" | "pricePerSqm" | "outperformance";
  areaName: string;
}

const CustomTooltip = ({ active, payload, label, type }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    let formattedValue = "N/A";

    if (value !== undefined && typeof value === "number") {
      if (type === "outperformance") {
        formattedValue = `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
      } else if (type === "sales") {
        formattedValue = formatNumber(value);
      } else {
        formattedValue = formatPrice(value);
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-3 rounded-lg shadow-lg border border-gray-200"
      >
        <p className="text-sm font-medium text-gray-900 mb-1">{label}</p>
        <p className="text-lg font-bold text-blue-600">{formattedValue}</p>
      </motion.div>
    );
  }
  return null;
};

export function StatChart({ data, type, areaName }: StatChartProps) {
  const getYAxisFormatter = () => {
    switch (type) {
      case "medianPrice":
      case "pricePerSqm":
        return (value: number) => formatPrice(value);
      case "sales":
        return (value: number) => formatNumber(value);
      case "outperformance":
        return (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
      default:
        return (value: number) => value.toString();
    }
  };

  const getColor = () => {
    switch (type) {
      case "medianPrice":
        return "#3b82f6"; // blue
      case "sales":
        return "#10b981"; // green
      case "pricePerSqm":
        return "#8b5cf6"; // purple
      case "outperformance":
        return "#f59e0b"; // amber
      default:
        return "#3b82f6";
    }
  };

  const color = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
        >
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: "#6b7280" }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: "#6b7280" }}
            tickFormatter={getYAxisFormatter()}
          />
          <Tooltip content={<CustomTooltip type={type} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            fill={`url(#gradient-${type})`}
            dot={{ fill: color, r: 3, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7, fill: color, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
