import { AreaStats } from "@/types";
import { NATIONAL_BENCHMARKS } from "./constants";

export interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
  // For outperformance charts, include both area and national average
  areaValue?: number;
  nationalValue?: number;
}

/**
 * Generate historical data for median price chart
 * @param currentMedianPrice - Current median price
 * @param priceChangeYoY - Year-over-year price change percentage
 * @param years - Number of years of data to generate (default: 3)
 */
export function generateMedianPriceData(
  currentMedianPrice: number,
  priceChangeYoY: number,
  years: number = 3
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  const months = years * 12;

  // Generate data for specified number of years
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    // Calculate value based on current price and YoY change
    // Assume linear growth over 3 years
    const monthsAgo = i;
    const yearsAgo = monthsAgo / 12;
    const annualGrowthRate = priceChangeYoY / 100;

    // Reverse calculate: current = past * (1 + rate)^years
    // So: past = current / (1 + rate)^years
    const value = currentMedianPrice / Math.pow(1 + annualGrowthRate, yearsAgo);

    // Add some realistic monthly variation (±2%)
    const variation = (Math.random() - 0.5) * 0.04;
    const finalValue = value * (1 + variation);

    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.round(finalValue),
      label: date.toLocaleDateString("en-ZA", {
        month: "short",
        year: "numeric",
      }),
    });
  }

  return data;
}

/**
 * Generate historical data for sales count chart
 * @param currentSalesCount - Current sales count
 * @param priceChangeYoY - Year-over-year price change percentage
 * @param years - Number of years of data to generate (default: 3)
 */
export function generateSalesData(
  currentSalesCount: number,
  priceChangeYoY: number,
  years: number = 3
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  const months = years * 12;

  // Sales volume often correlates inversely with price growth
  // When prices rise fast, sales volume may decrease slightly
  const volumeChangeRate = (-priceChangeYoY * 0.3) / 100; // Inverse correlation

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    const monthsAgo = i;
    const yearsAgo = monthsAgo / 12;
    const value = currentSalesCount / Math.pow(1 + volumeChangeRate, yearsAgo);

    // Add monthly variation (±10%)
    const variation = (Math.random() - 0.5) * 0.2;
    const finalValue = value * (1 + variation);

    data.push({
      date: date.toISOString().split("T")[0],
      value: Math.max(0, Math.round(finalValue)),
      label: date.toLocaleDateString("en-ZA", {
        month: "short",
        year: "numeric",
      }),
    });
  }

  return data;
}

/**
 * Generate historical data for price per m² chart
 * @param currentPricePerSqm - Current price per square meter
 * @param priceChangeYoY - Year-over-year price change percentage
 * @param years - Number of years of data to generate (default: 3)
 */
export function generatePricePerSqmData(
  currentPricePerSqm: number,
  priceChangeYoY: number,
  years: number = 3
): ChartDataPoint[] {
  // Similar to median price but tracks per square meter
  return generateMedianPriceData(currentPricePerSqm, priceChangeYoY, years).map(
    (point) => ({
      ...point,
      value: Math.round(point.value),
    })
  );
}

/**
 * Generate historical data for vs National Avg chart
 * Shows two lines: area performance and national average performance over time
 * @param currentOutperformance - Current outperformance percentage
 * @param priceChangeYoY - Year-over-year price change percentage
 * @param years - Number of years of data to generate (default: 3)
 */
export function generateOutperformanceData(
  currentOutperformance: number,
  priceChangeYoY: number,
  years: number = 3
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  const months = years * 12;
  const nationalBenchmark = NATIONAL_BENCHMARKS.avgPropertyGrowth;

  // Current area growth rate = national benchmark + outperformance
  // currentOutperformance is already in percentage form (e.g., 5.2 means 5.2%)
  const currentAreaGrowthRate = nationalBenchmark + currentOutperformance;

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);

    const monthsAgo = i;
    const yearsAgo = monthsAgo / 12;

    // Generate historical area growth rate that trends toward current value
    // Use a gradual approach: past values start closer to national average and trend toward current
    // This simulates the area gradually outperforming over time
    const progressToCurrent = Math.min(yearsAgo / years, 1); // 0 = 3 years ago, 1 = now
    const baseAreaGrowthRate = nationalBenchmark + (currentOutperformance * progressToCurrent);

    // Add realistic monthly variation (±0.3% for area, ±0.15% for national)
    const areaVariation = (Math.random() - 0.5) * 0.6; // ±0.3% variation
    const nationalVariation = (Math.random() - 0.5) * 0.3; // ±0.15% variation (less volatile)

    // Ensure values are reasonable (growth rates typically between -10% and +20%)
    const finalAreaValue = Math.max(-10, Math.min(20, baseAreaGrowthRate + areaVariation));
    const finalNationalValue = Math.max(-5, Math.min(10, nationalBenchmark + nationalVariation));

    data.push({
      date: date.toISOString().split("T")[0],
      value: Number(finalAreaValue.toFixed(1)), // Keep value for backward compatibility
      areaValue: Number(finalAreaValue.toFixed(1)), // Area performance %
      nationalValue: Number(finalNationalValue.toFixed(1)), // National average %
      label: date.toLocaleDateString("en-ZA", {
        month: "short",
        year: "numeric",
      }),
    });
  }

  return data;
}
