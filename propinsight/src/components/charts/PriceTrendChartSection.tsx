"use client";

import { useState } from "react";
import { Area } from "@/types";
import { generateMedianPriceData } from "@/lib/chartData";
import { PriceTrendChart, PriceTrendChartPeriodSelector } from "./PriceTrendChart";

interface PriceTrendChartSectionProps {
  stats: NonNullable<Area["stats"]>;
  areaName: string;
}

export function PriceTrendChartSection({
  stats,
  areaName,
}: PriceTrendChartSectionProps) {
  const [timePeriod, setTimePeriod] = useState<5 | 10 | 15>(5);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">
            Price Trend Analysis
          </h2>
          <p className="text-stone-600">
            Deep dive into price movements, seasonal patterns, and market
            cycles. Hover over the chart to see detailed values at each point in time.
          </p>
        </div>
        <PriceTrendChartPeriodSelector
          timePeriod={timePeriod}
          onPeriodChange={setTimePeriod}
        />
      </div>
      <div className="-mx-8 px-8">
        <PriceTrendChart
          data={generateMedianPriceData(
            stats.medianPrice,
            stats.priceChangeYoY,
            timePeriod
          )}
          areaName={areaName}
          currentPrice={stats.medianPrice}
          priceChangeYoY={stats.priceChangeYoY}
          timePeriod={timePeriod}
          onTimePeriodChange={setTimePeriod}
        />
      </div>
    </div>
  );
}
