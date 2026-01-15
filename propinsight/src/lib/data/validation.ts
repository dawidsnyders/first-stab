// Cross-validation service
// Compares data from different sources to identify discrepancies and ensure accuracy

import { NormalizedProperty } from "./cleaning";

export interface ValidationIssue {
  severity: "error" | "warning" | "info";
  type:
    | "price_mismatch"
    | "missing_data"
    | "outlier"
    | "date_inconsistency"
    | "duplicate";
  message: string;
  property?: NormalizedProperty;
  sources?: string[];
  suggestedValue?: number;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  confidence: number; // 0-100, how confident we are in the data quality
  recommendations: string[];
}

/**
 * Validate price consistency across sources
 */
function validatePriceConsistency(
  properties: NormalizedProperty[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Group properties by address/ERF to compare across sources
  const grouped = new Map<string, NormalizedProperty[]>();

  for (const prop of properties) {
    const key = `${prop.address.toLowerCase()}-${
      prop.erfNumber?.toLowerCase() || "no-erf"
    }`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(prop);
  }

  for (const [key, props] of grouped) {
    if (props.length < 2) continue; // Need at least 2 sources to compare

    const prices: Array<{ price: number; source: string; type: string }> = [];

    for (const prop of props) {
      if (prop.valuation) {
        prices.push({
          price: prop.valuation,
          source: prop.source,
          type: "valuation",
        });
      }
      if (prop.askingPrice) {
        prices.push({
          price: prop.askingPrice,
          source: prop.source,
          type: "asking",
        });
      }
      if (prop.lastSalePrice) {
        prices.push({
          price: prop.lastSalePrice,
          source: prop.source,
          type: "sale",
        });
      }
    }

    if (prices.length < 2) continue;

    // Calculate average and check for outliers
    const avgPrice = prices.reduce((a, b) => a + b.price, 0) / prices.length;
    const maxDeviation = avgPrice * 0.3; // 30% deviation threshold

    for (const priceData of prices) {
      const deviation = Math.abs(priceData.price - avgPrice);
      const deviationPercent = (deviation / avgPrice) * 100;

      if (deviation > maxDeviation) {
        issues.push({
          severity: deviationPercent > 50 ? "error" : "warning",
          type: "price_mismatch",
          message: `Price mismatch detected: ${priceData.source} shows ${
            priceData.type
          } of R${priceData.price.toLocaleString()}, but average is R${Math.round(
            avgPrice
          ).toLocaleString()} (${deviationPercent.toFixed(1)}% deviation)`,
          property: props[0],
          sources: props.map((p) => p.source),
          suggestedValue: Math.round(avgPrice),
        });
      }
    }
  }

  return issues;
}

/**
 * Detect outliers using statistical methods
 */
function detectOutliers(properties: NormalizedProperty[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const prices: number[] = [];
  for (const prop of properties) {
    const price = prop.askingPrice || prop.lastSalePrice || prop.valuation;
    if (price) prices.push(price);
  }

  if (prices.length < 5) return issues; // Need enough data for outlier detection

  // Calculate Q1, Q3, and IQR
  const sorted = [...prices].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  for (const prop of properties) {
    const price = prop.askingPrice || prop.lastSalePrice || prop.valuation;
    if (!price) continue;

    if (price < lowerBound || price > upperBound) {
      issues.push({
        severity: "warning",
        type: "outlier",
        message: `Outlier detected: Property at ${
          prop.address
        } has price R${price.toLocaleString()}, which is outside the expected range (R${Math.round(
          lowerBound
        ).toLocaleString()} - R${Math.round(upperBound).toLocaleString()})`,
        property: prop,
      });
    }
  }

  return issues;
}

/**
 * Check for missing critical data
 */
function checkMissingData(properties: NormalizedProperty[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const prop of properties) {
    const hasPrice = !!(
      prop.askingPrice ||
      prop.lastSalePrice ||
      prop.valuation
    );
    const hasLocation = !!(prop.address && prop.suburb);

    if (!hasPrice) {
      issues.push({
        severity: "error",
        type: "missing_data",
        message: `Missing price data for property at ${
          prop.address || "unknown address"
        }`,
        property: prop,
      });
    }

    if (!hasLocation) {
      issues.push({
        severity: "error",
        type: "missing_data",
        message: `Missing location data for property`,
        property: prop,
      });
    }
  }

  return issues;
}

/**
 * Validate date consistency
 */
function validateDateConsistency(
  properties: NormalizedProperty[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const prop of properties) {
    if (prop.lastSaleDate && prop.valuationDate) {
      const saleDate = new Date(prop.lastSaleDate);
      const valuationDate = new Date(prop.valuationDate);

      // Valuation should generally be after or close to sale date
      if (valuationDate < saleDate) {
        const daysDiff = Math.floor(
          (saleDate.getTime() - valuationDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff > 365) {
          // More than a year difference might indicate an issue
          issues.push({
            severity: "warning",
            type: "date_inconsistency",
            message: `Date inconsistency: Sale date (${prop.lastSaleDate}) is ${daysDiff} days after valuation date (${prop.valuationDate})`,
            property: prop,
          });
        }
      }
    }
  }

  return issues;
}

/**
 * Cross-validate data from multiple sources
 */
export function validateData(
  properties: NormalizedProperty[]
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Run all validation checks
  issues.push(...validatePriceConsistency(properties));
  issues.push(...detectOutliers(properties));
  issues.push(...checkMissingData(properties));
  issues.push(...validateDateConsistency(properties));

  // Calculate confidence score
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const totalProperties = properties.length;

  let confidence = 100;
  confidence -= errorCount * 10; // Each error reduces confidence by 10%
  confidence -= warningCount * 3; // Each warning reduces confidence by 3%
  confidence = Math.max(0, Math.min(100, confidence));

  // Generate recommendations
  const recommendations: string[] = [];

  if (errorCount > 0) {
    recommendations.push(
      `Address ${errorCount} data quality error${
        errorCount > 1 ? "s" : ""
      } before using this data`
    );
  }

  if (warningCount > totalProperties * 0.2) {
    recommendations.push(
      "High number of warnings detected. Consider manual review of data quality."
    );
  }

  const priceMismatches = issues.filter(
    (i) => i.type === "price_mismatch"
  ).length;
  if (priceMismatches > 0) {
    recommendations.push(
      `Found ${priceMismatches} price mismatch${
        priceMismatches > 1 ? "es" : ""
      }. Review source data for accuracy.`
    );
  }

  if (properties.length < 10) {
    recommendations.push(
      "Limited data available. Consider gathering more data points for better accuracy."
    );
  }

  return {
    isValid: errorCount === 0,
    issues,
    confidence,
    recommendations,
  };
}
