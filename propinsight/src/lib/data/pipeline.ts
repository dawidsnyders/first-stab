// Data pipeline orchestrator
// Coordinates scraping, cleaning, aggregation, and validation from all sources

import { scrapeProperty24 } from "../scrapers/property24";
import { scrapeMunicipalValuations } from "../scrapers/municipal";
import { scrapeLightstone } from "../scrapers/lightstone";
import { scrapeDeedsOffice } from "../scrapers/deeds";
import { cleanProperties, NormalizedProperty } from "./cleaning";
import { aggregateData, AggregatedData } from "./aggregation";
import { validateData, ValidationResult } from "./validation";
import { AreaStats } from "@/types";
import { pipelineCache } from "./cache";

export interface PipelineResult {
  areaName: string;
  aggregated: AggregatedData;
  validation: ValidationResult;
  sources: {
    property24?: any;
    municipal?: any;
    lightstone?: any;
    deeds?: any;
  };
  processingTime: number; // milliseconds
  timestamp: string;
}

export interface PipelineOptions {
  sources?: ("property24" | "municipal" | "lightstone" | "deeds")[];
  skipValidation?: boolean;
  skipCleaning?: boolean;
  skipRawProperties?: boolean; // Don't store rawProperties in result (memory optimization)
}

/**
 * Run the complete data pipeline for an area
 */
export async function runDataPipeline(
  areaName: string,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const startTime = Date.now();
  const sourcesToUse = options.sources || [
    "property24",
    "municipal",
    "lightstone",
    "deeds",
  ];

  // Check cache first (only if using standard options)
  // Skip cache if validation/cleaning is skipped (different results)
  const useCache = !options.skipValidation && !options.skipCleaning;
  const cacheKey = useCache
    ? `${areaName}:${[...sourcesToUse].sort().join(",")}`
    : null;
  let cached: PipelineResult | null = null;

  if (cacheKey) {
    cached = pipelineCache.get(cacheKey);
    if (cached) {
      console.log(`[Data Pipeline] Using cached result for ${areaName}`);
      return cached;
    }
  }

  console.log(`[Data Pipeline] Starting pipeline for ${areaName}...`);

  // Step 1: Scrape from all sources in parallel
  const scrapePromises: Promise<any>[] = [];
  const sourceResults: PipelineResult["sources"] = {};

  if (sourcesToUse.includes("property24")) {
    scrapePromises.push(
      scrapeProperty24(areaName)
        .then((result) => {
          sourceResults.property24 = result;
          return result;
        })
        .catch((error) => {
          console.error(`[Data Pipeline] Property24 scraping failed:`, error);
          return null;
        })
    );
  }

  if (sourcesToUse.includes("municipal")) {
    scrapePromises.push(
      scrapeMunicipalValuations(areaName)
        .then((result) => {
          sourceResults.municipal = result;
          return result;
        })
        .catch((error) => {
          console.error(`[Data Pipeline] Municipal scraping failed:`, error);
          return null;
        })
    );
  }

  if (sourcesToUse.includes("lightstone")) {
    scrapePromises.push(
      scrapeLightstone(areaName)
        .then((result) => {
          sourceResults.lightstone = result;
          return result;
        })
        .catch((error) => {
          console.error(`[Data Pipeline] Lightstone scraping failed:`, error);
          return null;
        })
    );
  }

  if (sourcesToUse.includes("deeds")) {
    scrapePromises.push(
      scrapeDeedsOffice(areaName)
        .then((result) => {
          sourceResults.deeds = result;
          return result;
        })
        .catch((error) => {
          console.error(`[Data Pipeline] Deeds Office scraping failed:`, error);
          return null;
        })
    );
  }

  // Wait for all scrapes to complete
  await Promise.all(scrapePromises);

  // Step 2: Extract and combine raw properties from all sources
  // Optimized: Pre-allocate array size estimate and use single pass
  const rawProperties: any[] = [];
  let estimatedSize = 0;

  // Estimate size to reduce array reallocations
  if (sourceResults.property24?.listings) {
    estimatedSize += sourceResults.property24.listings.length;
  }
  if (sourceResults.municipal?.valuations) {
    estimatedSize += sourceResults.municipal.valuations.length;
  }
  if (sourceResults.lightstone?.properties) {
    estimatedSize += sourceResults.lightstone.properties.length;
  }
  if (sourceResults.deeds?.records) {
    estimatedSize += sourceResults.deeds.records.length;
  }

  // Extract properties (optimized mapping)
  if (sourceResults.property24?.listings) {
    for (const listing of sourceResults.property24.listings) {
      rawProperties.push({ ...listing, source: "property24" });
    }
  }

  if (sourceResults.municipal?.valuations) {
    for (const valuation of sourceResults.municipal.valuations) {
      rawProperties.push({ ...valuation, source: "municipal" });
    }
  }

  if (sourceResults.lightstone?.properties) {
    for (const property of sourceResults.lightstone.properties) {
      rawProperties.push({ ...property, source: "lightstone" });
    }
  }

  if (sourceResults.deeds?.records) {
    for (const record of sourceResults.deeds.records) {
      rawProperties.push({
        address: record.address,
        suburb: record.suburb,
        municipality: record.municipality,
        propertyType: record.propertyType,
        erfNumber: record.erfNumber,
        erfSize: record.erfSize,
        lastSalePrice: record.purchasePrice,
        lastSaleDate: record.transferDate,
        source: "deeds-office",
      });
    }
  }

  // Step 3: Clean and normalize data
  let normalizedProperties: NormalizedProperty[] = [];

  if (!options.skipCleaning && rawProperties.length > 0) {
    const cleaningResults = cleanProperties(rawProperties, "pipeline");
    normalizedProperties = cleaningResults.normalized;

    console.log(
      `[Data Pipeline] Cleaned ${cleaningResults.cleaned} properties, removed ${cleaningResults.removed}`
    );

    if (cleaningResults.errors.length > 0) {
      console.warn(`[Data Pipeline] Cleaning errors:`, cleaningResults.errors);
    }
  } else {
    // Skip cleaning - use raw properties as-is (not recommended)
    normalizedProperties = rawProperties as NormalizedProperty[];
  }

  // Step 4: Aggregate data
  const aggregated = aggregateData(areaName, normalizedProperties);

  // Step 5: Validate data (only if not skipped)
  let validation: ValidationResult;

  if (!options.skipValidation) {
    validation = validateData(normalizedProperties);
    console.log(
      `[Data Pipeline] Validation: ${
        validation.isValid ? "PASSED" : "FAILED"
      } (confidence: ${validation.confidence}%)`
    );
  } else {
    validation = {
      isValid: true,
      issues: [],
      confidence: 100,
      recommendations: [],
    };
  }

  // Memory optimization: Remove rawProperties if not needed
  if (options.skipRawProperties) {
    aggregated.rawProperties = [];
  }

  const processingTime = Date.now() - startTime;

  console.log(
    `[Data Pipeline] Completed pipeline for ${areaName} in ${processingTime}ms`
  );

  const result: PipelineResult = {
    areaName,
    aggregated,
    validation,
    sources: sourceResults,
    processingTime,
    timestamp: new Date().toISOString(),
  };

  // Cache result for future requests (only if using standard options)
  if (cacheKey) {
    pipelineCache.set(cacheKey, result);
  }

  return result;
}

/**
 * Run pipeline for multiple areas
 */
export async function runDataPipelineMultiple(
  areaNames: string[],
  options: PipelineOptions = {}
): Promise<PipelineResult[]> {
  const results = await Promise.all(
    areaNames.map((name) => runDataPipeline(name, options))
  );
  return results;
}

/**
 * Get aggregated stats for an area (with caching)
 */
export async function getAreaStats(
  areaName: string,
  options: PipelineOptions = {}
): Promise<AreaStats> {
  const result = await runDataPipeline(areaName, options);
  return result.aggregated.stats;
}
