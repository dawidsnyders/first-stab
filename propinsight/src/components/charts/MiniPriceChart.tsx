'use client';

import { useMemo } from 'react';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

interface MiniPriceChartProps {
  areaId: string;
  currentPrice: number;
  priceChangeYoY: number;
}

// Generate mock historical data based on current price and growth rate
function generateHistoricalData(
  currentPrice: number,
  growthRate: number
): { year: string; price: number }[] {
  const data = [];
  const years = ['2020', '2021', '2022', '2023', '2024', '2025'];
  
  // Work backwards from current price using approximate growth rate
  // with some variation to make it look realistic
  let price = currentPrice;
  const baseGrowth = growthRate / 100; // Convert percentage to decimal
  
  // Start from most recent and work backwards
  const prices: number[] = [price];
  for (let i = years.length - 2; i >= 0; i--) {
    // Add some variation to growth rate for each year
    const yearGrowth = baseGrowth + (Math.random() - 0.5) * 0.05;
    price = price / (1 + yearGrowth);
    prices.unshift(price);
  }
  
  for (let i = 0; i < years.length; i++) {
    data.push({
      year: years[i],
      price: Math.round(prices[i]),
    });
  }
  
  return data;
}

export function MiniPriceChart({
  areaId,
  currentPrice,
  priceChangeYoY,
}: MiniPriceChartProps) {
  const data = useMemo(
    () => generateHistoricalData(currentPrice, priceChangeYoY),
    [currentPrice, priceChangeYoY]
  );

  const isPositive = priceChangeYoY >= 0;
  const gradientId = `gradient-${areaId}`;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';
  const gradientColor = isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';

  const formatPrice = (value: number) => {
    if (value >= 1_000_000) {
      return `R${(value / 1_000_000).toFixed(1)}M`;
    }
    return `R${(value / 1_000).toFixed(0)}K`;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            dy={5}
          />
          <YAxis
            hide
            domain={['dataMin - 500000', 'dataMax + 500000']}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-stone-200 text-sm">
                    <p className="text-stone-500 text-xs mb-1">{label}</p>
                    <p className="font-semibold text-stone-900">
                      {formatPrice(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{
              r: 4,
              fill: lineColor,
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Simpler sparkline version for compact views
interface SparklineProps {
  values: number[];
  color?: string;
  height?: number;
}

export function Sparkline({
  values,
  color = '#22c55e',
  height = 24,
}: SparklineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const width = 80;
  const padding = 2;
  const usableHeight = height - padding * 2;
  const usableWidth = width - padding * 2;
  
  const points = values
    .map((v, i) => {
      const x = padding + (i / (values.length - 1)) * usableWidth;
      const y = padding + usableHeight - ((v - min) / range) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={padding + usableWidth}
        cy={
          padding +
          usableHeight -
          ((values[values.length - 1] - min) / range) * usableHeight
        }
        r="2"
        fill={color}
      />
    </svg>
  );
}
