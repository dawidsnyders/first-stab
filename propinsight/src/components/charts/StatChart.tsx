"use client";

import { useMemo } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  ReferenceLine,
  Legend,
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
  payload?: Array<{
    value?: number;
    name?: string;
    payload?: { previousValue?: number; [key: string]: unknown };
    [key: string]: unknown;
  }>;
  label?: string;
  type: StatChartProps["type"];
}) => {
  if (active && payload && payload.length) {
    // For outperformance, show both area and national values
    if (type === "outperformance" && payload.length >= 2) {
      const areaPayload = payload.find((p) => p.dataKey === "areaValue");
      const nationalPayload = payload.find(
        (p) => p.dataKey === "nationalValue"
      );

      const areaValue = areaPayload?.value;
      const nationalValue = nationalPayload?.value;

      return (
        <motion.div
          initial={{ opacity: 0, y: -5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-white p-4 rounded-xl shadow-xl border border-stone-200 backdrop-blur-sm"
        >
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
            {label}
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sage-600"></div>
                <span className="text-sm font-medium text-stone-600">
                  Area Performance
                </span>
              </div>
              <span className="text-lg font-bold text-sage-600">
                {areaValue !== undefined
                  ? `${areaValue > 0 ? "+" : ""}${areaValue.toFixed(1)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-stone-400"></div>
                <span className="text-sm font-medium text-stone-600">
                  National Average
                </span>
              </div>
              <span className="text-lg font-bold text-stone-700">
                {nationalValue !== undefined
                  ? `${nationalValue > 0 ? "+" : ""}${nationalValue.toFixed(
                      1
                    )}%`
                  : "N/A"}
              </span>
            </div>
            {areaValue !== undefined && nationalValue !== undefined && (
              <div className="pt-2 mt-2 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Outperformance</span>
                  <span
                    className={`text-sm font-semibold ${
                      areaValue - nationalValue >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {areaValue - nationalValue >= 0 ? "+" : ""}
                    {(areaValue - nationalValue).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      );
    }

    // For other chart types, use original tooltip
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
    const payloadData = payload[0]?.payload as
      | { previousValue?: number }
      | undefined;
    if (payloadData?.previousValue !== undefined && value !== undefined) {
      const prevValue = payloadData.previousValue;
      const percentChange = ((value - prevValue) / prevValue) * 100;
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
        {change !== null &&
          payloadData?.previousValue !== undefined &&
          value !== undefined && (
            <p
              className={`text-xs mt-1 font-medium ${
                change ? "text-green-600" : "text-red-600"
              }`}
            >
              {change ? "↑" : "↓"}{" "}
              {Math.abs(
                ((value - payloadData.previousValue) /
                  payloadData.previousValue) *
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
  const showReferenceLine = false; // Removed - we now show two lines instead
  const isBarChart = type === "sales";
  const isDualLineChart = type === "outperformance";

  // Calculate dynamic Y-axis domain to ensure data spans at least 50% of Y-axis
  const calculateYAxisDomain = () => {
    // For outperformance with dual lines, include both areaValue and nationalValue
    if (type === "outperformance") {
      const allValues = [
        ...data
          .map((d) => d.areaValue)
          .filter((v) => typeof v === "number" && !isNaN(v)),
        ...data
          .map((d) => d.nationalValue)
          .filter((v) => typeof v === "number" && !isNaN(v)),
      ];
      if (allValues.length === 0) return [-5, 10];

      const minValue = Math.min(...(allValues as number[]));
      const maxValue = Math.max(...(allValues as number[]));
      const range = maxValue - minValue;

      // Ensure data spans at least 50% of the Y-axis
      const minDomain = minValue - range * 0.25;
      const maxDomain = maxValue + range * 0.25;

      return [minDomain, maxDomain];
    }

    // For other chart types
    const values = data
      .map((d) => d.value)
      .filter((v) => typeof v === "number" && !isNaN(v));
    if (values.length === 0) return [0, 100];

    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue;

    // Ensure data spans at least 50% of the Y-axis
    const minDomain = minValue - range * 0.25; // Extend 25% below
    const maxDomain = maxValue + range * 0.25; // Extend 25% above

    // For other types, ensure minimum is not negative (unless data is negative)
    return [Math.max(0, minDomain), maxDomain];
  };

  const yAxisDomain = calculateYAxisDomain();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={450}>
        {isBarChart ? (
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <defs>
              <linearGradient
                id={`bar-gradient-${type}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={colors.main} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors.main} stopOpacity={0.4} />
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
              domain={yAxisDomain}
            />
            <Tooltip
              content={<CustomTooltip type={type} />}
              cursor={{ fill: colors.main, fillOpacity: 0.1 }}
            />
            <Bar
              dataKey="value"
              fill={`url(#bar-gradient-${type})`}
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationBegin={0}
            />
          </BarChart>
        ) : (
          <AreaChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <defs>
              <linearGradient
                id={`gradient-${type}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
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
              domain={yAxisDomain}
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
            {isDualLineChart ? (
              <>
                {/* Area Performance Line */}
                <Area
                  type="monotone"
                  dataKey="areaValue"
                  name="Area Performance"
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
                {/* National Average Line */}
                <Area
                  type="monotone"
                  dataKey="nationalValue"
                  name="National Average"
                  stroke="#78716c"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  fill="transparent"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "#78716c",
                    strokeWidth: 2,
                    stroke: "#fff",
                    style: { filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" },
                  }}
                  animationDuration={1000}
                  animationBegin={200}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                  formatter={(value) => (
                    <span className="text-xs text-stone-600">{value}</span>
                  )}
                />
              </>
            ) : (
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
            )}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
}
