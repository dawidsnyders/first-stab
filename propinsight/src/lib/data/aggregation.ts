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
 * Calculate all statistics in a single pass for efficiency
 * This reduces O(n) operations from multiple passes to a single pass
 */
interface AggregationStats {
  prices: number[];
  pricesPerSqm: number[];
  currentPrices: number[];
  oldPrices: number[];
  salesLast12Months: number;
  typeCounts: {
    house: number;
    apartment: number;
    townhouse: number;
    land: number;
    other: number;
  };
  valuations: number;
  sales: number;
  listings: number;
}

function calculateAllStats(
  properties: NormalizedProperty[]
): AggregationStats {
  const now = new Date();
  const oneYearAgo = new Date(
    now.getFullYear() - 1,
    now.getMonth(),
    now.getDate()
  );
  const twoYearsAgo = new Date(
    now.getFullYear() - 2,
    now.getMonth(),
    now.getDate()
  );

  const stats: AggregationStats = {
    prices: [],
    pricesPerSqm: [],
    currentPrices: [],
    oldPrices: [],
    salesLast12Months: 0,
    typeCounts: {
      house: 0,
      apartment: 0,
      townhouse: 0,
      land: 0,
      other: 0,
    },
    valuations: 0,
    sales: 0,
    listings: 0,
  };

  // Single pass through all properties
  for (const prop of properties) {
    // Price extraction (prefer asking > sale > valuation)
    const price = prop.askingPrice || prop.lastSalePrice || prop.valuation;
    if (price) {
      stats.prices.push(price);
    }

    // Price per sqm
    const size = prop.erfSize || prop.buildingSize;
    if (price && size && size > 0) {
      stats.pricesPerSqm.push(price / size);
    }

    // YoY price change data
    if (price && (prop.lastSalePrice || prop.valuation)) {
      const date = prop.lastSaleDate
        ? new Date(prop.lastSaleDate)
        : prop.valuationDate
        ? new Date(prop.valuationDate)
        : null;

      if (date) {
        if (date >= oneYearAgo) {
          stats.currentPrices.push(price);
        } else if (date < oneYearAgo && date >= twoYearsAgo) {
          stats.oldPrices.push(price);
        }
      }
    }

    // Sales in last 12 months
    if (prop.lastSaleDate) {
      const saleDate = new Date(prop.lastSaleDate);
      if (saleDate >= oneYearAgo) {
        stats.salesLast12Months++;
      }
    }

    // Property type breakdown
    stats.typeCounts[prop.propertyType] =
      (stats.typeCounts[prop.propertyType] || 0) + 1;

    // Coverage counts
    if (prop.valuation) stats.valuations++;
    if (prop.lastSalePrice && prop.lastSaleDate) stats.sales++;
    if (prop.askingPrice) stats.listings++;
  }

  return stats;
}

/**
 * Calculate average from array (optimized)
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate median from array (optimized)
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
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
