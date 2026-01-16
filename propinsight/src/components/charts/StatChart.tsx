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
} from "recharts";
import { ChartDataPoint } from "@/lib/chartData";
import { formatPrice, formatNumber } from "@/types";
import { NATIONAL_BENCHMARKS } from "@/lib/constants";
import { motion } from "framer-motion";

interface StatChartProps {
  data: ChartDataPoint[];
  type: "medianPrice" | "sales" | "pricePerSqm" | "outperformance";
  areaName: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  type,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  type: StatChartProps["type"];
}) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    let formattedValue = "N/A";
    let change = null;

    if (value !== undefined && typeof value === "number") {
      if (type === "outperformance") {
        formattedValue = `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
        change = value >= 0;
      } else if (type === "sales") {
        formattedValue = formatNumber(value);
      } else {
        formattedValue = formatPrice(value);
      }
    }

    // Calculate change from previous point if available
    if (payload[0].payload && payload[0].payload.previousValue) {
      const prevValue = payload[0].payload.previousValue;
      const currentValue = payload[0].value;
      const percentChange = ((currentValue - prevValue) / prevValue) * 100;
      change = percentChange >= 0;
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: -5, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white p-4 rounded-xl shadow-xl border border-stone-200 backdrop-blur-sm"
      >
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p
            className={`text-2xl font-bold ${
              change === true
                ? "text-green-600"
                : change === false
                ? "text-red-600"
                : "text-stone-900"
            }`}
          >
            {formattedValue}
          </p>
        </div>
        {change !== null && payload[0].payload.previousValue && (
          <p
            className={`text-xs mt-1 font-medium ${
              change ? "text-green-600" : "text-red-600"
            }`}
          >
            {change ? "↑" : "↓"}{" "}
            {Math.abs(
              ((payload[0].value - payload[0].payload.previousValue) /
                payload[0].payload.previousValue) *
                100
            ).toFixed(1)}
            % from previous
          </p>
        )}
      </motion.div>
    );
  }
  return null;
};

export function StatChart({ data, type, areaName }: StatChartProps) {
  // Add previous values for change calculation
  const dataWithPrev = data.map((point, index) => ({
    ...point,
    previousValue: index > 0 ? data[index - 1].value : null,
  }));

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
        return {
          main: "#5d7350", // sage-600
          light: "#7d8f70", // sage-500
          gradient: ["#5d7350", "#a8b89d"],
        };
      case "sales":
        return {
          main: "#6f7d57", // moss-600
          light: "#8a9873", // moss-500
          gradient: ["#6f7d57", "#a8b59c"],
        };
      case "pricePerSqm":
        return {
          main: "#ed6b4a", // terracotta-600
          light: "#f0886f", // terracotta-500
          gradient: ["#ed6b4a", "#f5b19f"],
        };
      case "outperformance":
        return {
          main: "#a8966f", // sand
          light: "#b8a882", // sand-light
          gradient: ["#a8966f", "#d4c8a8"],
        };
      default:
        return {
          main: "#5d7350",
          light: "#7d8f70",
          gradient: ["#5d7350", "#a8b89d"],
        };
    }
  };

  const colors = getColor();
  const showReferenceLine = type === "outperformance";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={450}>
        <AreaChart
          data={dataWithPrev}
          margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
        >
          <defs>
            <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.main} stopOpacity={0.4} />
              <stop offset="50%" stopColor={colors.main} stopOpacity={0.15} />
              <stop offset="95%" stopColor={colors.main} stopOpacity={0} />
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
            tickFormatter={getYAxisFormatter()}
            width={80}
            tickMargin={8}
          />
          <Tooltip
            content={<CustomTooltip type={type} />}
            cursor={{
              stroke: colors.main,
              strokeWidth: 1,
              strokeDasharray: "5 5",
              opacity: 0.3,
            }}
          />
          {showReferenceLine && (
            <ReferenceLine
              y={0}
              stroke="#78716c"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: "National Avg",
                position: "insideTopRight",
                fill: "#78716c",
                fontSize: 11,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors.main}
            strokeWidth={3}
            fill={`url(#gradient-${type})`}
            dot={false}
            activeDot={{
              r: 6,
              fill: colors.main,
              strokeWidth: 3,
              stroke: "#fff",
              style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" },
            }}
            animationDuration={1000}
            animationBegin={0}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
