import { AreaStats } from '@/types';
import { NATIONAL_BENCHMARKS } from './constants';

export interface ChartDataPoint {
  date: string;
  value: number;
  label: string;
}

/**
 * Generate historical data for median price chart (3 years)
 */
export function generateMedianPriceData(
  currentMedianPrice: number,
  priceChangeYoY: number
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  // Generate 36 months of data (3 years)
  for (let i = 35; i >= 0; i--) {
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
      date: date.toISOString().split('T')[0],
      value: Math.round(finalValue),
      label: date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
    });
  }
  
  return data;
}

/**
 * Generate historical data for sales count chart (3 years)
 */
export function generateSalesData(
  currentSalesCount: number,
  priceChangeYoY: number
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  // Sales volume often correlates inversely with price growth
  // When prices rise fast, sales volume may decrease slightly
  const volumeChangeRate = -priceChangeYoY * 0.3 / 100; // Inverse correlation
  
  for (let i = 35; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    const monthsAgo = i;
    const yearsAgo = monthsAgo / 12;
    const value = currentSalesCount / Math.pow(1 + volumeChangeRate, yearsAgo);
    
    // Add monthly variation (±10%)
    const variation = (Math.random() - 0.5) * 0.2;
    const finalValue = value * (1 + variation);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(0, Math.round(finalValue)),
      label: date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
    });
  }
  
  return data;
}

/**
 * Generate historical data for price per m² chart (3 years)
 */
export function generatePricePerSqmData(
  currentPricePerSqm: number,
  priceChangeYoY: number
): ChartDataPoint[] {
  // Similar to median price but tracks per square meter
  return generateMedianPriceData(currentPricePerSqm, priceChangeYoY).map((point) => ({
    ...point,
    value: Math.round(point.value),
  }));
}

/**
 * Generate historical data for vs National Avg chart (3 years)
 */
export function generateOutperformanceData(
  currentOutperformance: number,
  priceChangeYoY: number
): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  const nationalBenchmark = NATIONAL_BENCHMARKS.avgPropertyGrowth;
  
  for (let i = 35; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    
    const monthsAgo = i;
    const yearsAgo = monthsAgo / 12;
    const annualGrowthRate = priceChangeYoY / 100;
    
    // Calculate area's growth rate at this point in time
    const areaGrowthRate = nationalBenchmark + (currentOutperformance / 100) * Math.pow(1 + annualGrowthRate * 0.1, yearsAgo);
    
    // Calculate outperformance
    const outperformance = (areaGrowthRate - nationalBenchmark) * 100;
    
    // Add variation
    const variation = (Math.random() - 0.5) * 2;
    const finalValue = outperformance + variation;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Number(finalValue.toFixed(1)),
      label: date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
    });
  }
  
  return data;
}
