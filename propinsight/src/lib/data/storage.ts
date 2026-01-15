// Data storage for processed and aggregated property data
// In production, this would use a database (Supabase/Postgres)
// For MVP, using in-memory storage with persistence hooks

import { AggregatedData } from "./aggregation";
import { ValidationResult } from "./validation";
import { AreaStats } from "@/types";

export interface StoredAreaData {
  areaName: string;
  stats: AreaStats;
  aggregated: AggregatedData;
  validation: ValidationResult;
  lastUpdated: string;
  dataQuality: {
    confidence: number;
    sources: string[];
    propertyCount: number;
  };
}

// In-memory storage (will be replaced with database)
const areaDataCache = new Map<string, StoredAreaData>();

// Cache expiration (24 hours)
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Store aggregated area data
 */
export function storeAreaData(data: {
  areaName: string;
  stats: AreaStats;
  aggregated: AggregatedData;
  validation: ValidationResult;
}): void {
  const stored: StoredAreaData = {
    areaName: data.areaName,
    stats: data.stats,
    aggregated: data.aggregated,
    validation: data.validation,
    lastUpdated: new Date().toISOString(),
    dataQuality: {
      confidence: data.validation.confidence,
      sources: data.aggregated.dataQuality.sources,
      propertyCount: data.aggregated.dataQuality.propertyCount,
    },
  };

  areaDataCache.set(data.areaName.toLowerCase(), stored);
}

/**
 * Get stored area data
 */
export function getAreaData(areaName: string): StoredAreaData | undefined {
  const cached = areaDataCache.get(areaName.toLowerCase());

  if (!cached) return undefined;

  // Check if cache is expired
  const lastUpdated = new Date(cached.lastUpdated);
  const now = new Date();
  const age = now.getTime() - lastUpdated.getTime();

  if (age > CACHE_EXPIRY_MS) {
    // Cache expired, remove it
    areaDataCache.delete(areaName.toLowerCase());
    return undefined;
  }

  return cached;
}

/**
 * Check if area data needs refresh
 */
export function needsRefresh(areaName: string): boolean {
  const cached = getAreaData(areaName);
  return !cached; // Needs refresh if not cached or expired
}

/**
 * Get all stored area names
 */
export function getAllStoredAreas(): string[] {
  return Array.from(areaDataCache.keys());
}

/**
 * Clear expired cache entries
 * @returns Number of entries cleared
 */
export function clearExpiredCache(): number {
  const now = new Date();
  const toDelete: string[] = [];

  for (const [areaName, data] of areaDataCache.entries()) {
    const lastUpdated = new Date(data.lastUpdated);
    const age = now.getTime() - lastUpdated.getTime();

    if (age > CACHE_EXPIRY_MS) {
      toDelete.push(areaName);
    }
  }

  for (const areaName of toDelete) {
    areaDataCache.delete(areaName);
  }

  return toDelete.length;
}

/**
 * Clear all cached data
 */
export function clearAllCache(): void {
  areaDataCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  totalAreas: number;
  totalProperties: number;
  averageConfidence: number;
  oldestEntry: string | null;
  newestEntry: string | null;
} {
  const areas = Array.from(areaDataCache.values());

  if (areas.length === 0) {
    return {
      totalAreas: 0,
      totalProperties: 0,
      averageConfidence: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  const totalProperties = areas.reduce(
    (sum, area) => sum + area.dataQuality.propertyCount,
    0
  );
  const averageConfidence =
    areas.reduce((sum, area) => sum + area.dataQuality.confidence, 0) /
    areas.length;

  const dates = areas.map((a) => new Date(a.lastUpdated));
  const oldest = new Date(Math.min(...dates.map((d) => d.getTime())));
  const newest = new Date(Math.max(...dates.map((d) => d.getTime())));

  return {
    totalAreas: areas.length,
    totalProperties,
    averageConfidence: Math.round(averageConfidence * 10) / 10,
    oldestEntry: oldest.toISOString(),
    newestEntry: newest.toISOString(),
  };
}
