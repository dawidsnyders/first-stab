// Data aggregation service
// Combines cleaned data from multiple sources into unified statistics

import { NormalizedProperty } from "./cleaning";
import { AreaStats } from "@/types";

export interface AggregatedData {
  areaName: string;
  stats: AreaStats;
  dataQuality: {
    sources: string[];
    propertyCount: number;
    coverage: {
      valuations: number;
      sales: number;
      listings: number;
    };
    lastUpdated: string;
  };
  rawProperties: NormalizedProperty[];
}

/**
 * Calculate average price from multiple sources
 */
function calculateAveragePrice(properties: NormalizedProperty[]): number {
  const prices: number[] = [];

  for (const prop of properties) {
    // Prefer asking price (current market), then sale price, then valuation
    const price = prop.askingPrice || prop.lastSalePrice || prop.valuation;
    if (price) prices.push(price);
  }

  if (prices.length === 0) return 0;
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}

/**
 * Calculate median price
 */
function calculateMedianPrice(properties: NormalizedProperty[]): number {
  const prices: number[] = [];

  for (const prop of properties) {
    const price = prop.askingPrice || prop.lastSalePrice || prop.valuation;
    if (price) prices.push(price);
  }

  if (prices.length === 0) return 0;

  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * Calculate average price per square meter
 */
function calculateAveragePricePerSqm(
  properties: NormalizedProperty[]
): number | undefined {
  const validPrices: number[] = [];

  for (const prop of properties) {
    const price = prop.askingPrice || prop.lastSalePrice || prop.valuation;
    const size = prop.erfSize || prop.buildingSize;

    if (price && size && size > 0) {
      validPrices.push(price / size);
    }
  }

  if (validPrices.length === 0) return undefined;

  return validPrices.reduce((a, b) => a + b, 0) / validPrices.length;
}

/**
 * Calculate year-over-year price change
 */
function calculatePriceChangeYoY(properties: NormalizedProperty[]): number {
  const now = new Date();
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );

  const currentPrices: number[] = [];
  const oldPrices: number[] = [];

  for (const prop of properties) {
    const price = prop.lastSalePrice || prop.valuation;
    if (!price) continue;

    const date = prop.lastSaleDate
      ? new Date(prop.lastSaleDate)
      : prop.valuationDate
      ? new Date(prop.valuationDate)
      : null;

    if (!date) continue;

    if (date >= oneYearAgo) {
      currentPrices.push(price);
    } else if (
      date < oneYearAgo &&
      date >= new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
    ) {
      oldPrices.push(price);
    }
  }

  if (currentPrices.length === 0 || oldPrices.length === 0) {
    // Fallback: estimate based on available data
    return 0; // Will be calculated from historical data if available
  }

  const currentAvg =
    currentPrices.reduce((a, b) => a + b, 0) / currentPrices.length;
  const oldAvg = oldPrices.reduce((a, b) => a + b, 0) / oldPrices.length;

  return ((currentAvg - oldAvg) / oldAvg) * 100;
}

/**
 * Count sales in last 12 months
 */
function countSalesLast12Months(properties: NormalizedProperty[]): number {
  const now = new Date();
  const twelveMonthsAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );

  return properties.filter((prop) => {
    if (!prop.lastSaleDate) return false;
    const saleDate = new Date(prop.lastSaleDate);
    return saleDate >= twelveMonthsAgo;
  }).length;
}

/**
 * Calculate property type breakdown
 */
function calculatePropertyTypeBreakdown(
  properties: NormalizedProperty[]
): { houses: number; apartments: number; land: number } | undefined {
  if (properties.length === 0) return undefined;

  const typeCounts = {
    house: 0,
    apartment: 0,
    townhouse: 0,
    land: 0,
    other: 0,
  };

  for (const prop of properties) {
    typeCounts[prop.propertyType] = (typeCounts[prop.propertyType] || 0) + 1;
  }

  const total = properties.length;

  return {
    houses: Math.round(
      ((typeCounts.house + typeCounts.townhouse) / total) * 100
    ),
    apartments: Math.round((typeCounts.apartment / total) * 100),
    land: Math.round((typeCounts.land / total) * 100),
  };
}

/**
 * Aggregate properties from multiple sources into unified statistics
 */
export function aggregateData(
  areaName: string,
  properties: NormalizedProperty[]
): AggregatedData {
  // Get unique sources
  const sources = Array.from(new Set(properties.map((p) => p.source)));

  // Calculate statistics
  const avgPrice = calculateAveragePrice(properties);
  const medianPrice = calculateMedianPrice(properties);
  const avgPricePerSqm = calculateAveragePricePerSqm(properties);
  const priceChangeYoY = calculatePriceChangeYoY(properties);
  const salesCount = countSalesLast12Months(properties);
  const propertyTypeBreakdown = calculatePropertyTypeBreakdown(properties);

  // Calculate coverage
  const valuations = properties.filter((p) => p.valuation).length;
  const sales = properties.filter(
    (p) => p.lastSalePrice && p.lastSaleDate
  ).length;
  const listings = properties.filter((p) => p.askingPrice).length;

  const stats: AreaStats = {
    avgPrice: Math.round(avgPrice),
    medianPrice: Math.round(medianPrice),
    priceChangeYoY: Math.round(priceChangeYoY * 10) / 10, // Round to 1 decimal
    salesCount,
    avgPricePerSqm: avgPricePerSqm ? Math.round(avgPricePerSqm) : undefined,
    propertyTypeBreakdown,
    lastUpdated: new Date().toISOString(),
  };

  return {
    areaName,
    stats,
    dataQuality: {
      sources,
      propertyCount: properties.length,
      coverage: {
        valuations,
        sales,
        listings,
      },
      lastUpdated: new Date().toISOString(),
    },
    rawProperties: properties,
  };
}
