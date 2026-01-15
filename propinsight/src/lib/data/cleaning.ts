// Data cleaning and normalization utilities
// Ensures data from different sources is standardized and consistent

export interface NormalizedProperty {
  // Core identifiers
  erfNumber?: string;
  address: string;
  suburb: string;
  municipality: string;

  // Property details
  propertyType: "house" | "apartment" | "townhouse" | "land" | "other";
  erfSize?: number; // m²
  buildingSize?: number; // m²

  // Valuation data
  valuation?: number;
  valuationDate?: string;
  valuationSource?: "municipal" | "lightstone" | "other";

  // Sales data
  askingPrice?: number;
  askingPriceSource?: "property24" | "other";
  lastSalePrice?: number;
  lastSaleDate?: string;
  previousSalePrice?: number;
  previousSaleDate?: string;

  // Additional metadata
  bedrooms?: number;
  bathrooms?: number;
  source: string; // Original source identifier
  scrapedAt: string;
}

export interface CleaningResult {
  normalized: NormalizedProperty[];
  cleaned: number;
  removed: number;
  errors: string[];
}

/**
 * Normalize property type from various sources
 */
export function normalizePropertyType(
  type: string,
  source: string
): NormalizedProperty["propertyType"] {
  const lower = type.toLowerCase().trim();

  // Property24 types
  if (lower.includes("house") || lower.includes("home")) return "house";
  if (
    lower.includes("apartment") ||
    lower.includes("flat") ||
    lower.includes("unit")
  )
    return "apartment";
  if (lower.includes("townhouse") || lower.includes("town house"))
    return "townhouse";
  if (lower.includes("land") || lower.includes("plot") || lower.includes("erf"))
    return "land";

  // Municipal types
  if (lower.includes("residential")) return "house"; // Default for residential

  return "other";
}

/**
 * Normalize address format
 */
export function normalizeAddress(address: string): string {
  return address
    .trim()
    .replace(/\s+/g, " ") // Multiple spaces to single
    .replace(/\bSt\b/gi, "Street")
    .replace(/\bAve\b/gi, "Avenue")
    .replace(/\bRd\b/gi, "Road")
    .replace(/\bDr\b/gi, "Drive")
    .replace(/\bCres\b/gi, "Crescent")
    .replace(/\bCl\b/gi, "Close");
}

/**
 * Normalize suburb name
 */
export function normalizeSuburb(suburb: string): string {
  return suburb
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Clean and validate price
 */
export function cleanPrice(
  price: number | string | undefined
): number | undefined {
  if (price === undefined || price === null) return undefined;

  const num =
    typeof price === "string"
      ? parseFloat(price.replace(/[^\d.]/g, ""))
      : price;

  if (isNaN(num) || num <= 0) return undefined;
  if (num < 1000) return undefined; // Likely invalid (too low)
  if (num > 1_000_000_000) return undefined; // Likely invalid (too high)

  return Math.round(num);
}

/**
 * Clean and validate area (m²)
 */
export function cleanArea(
  area: number | string | undefined
): number | undefined {
  if (area === undefined || area === null) return undefined;

  const num =
    typeof area === "string" ? parseFloat(area.replace(/[^\d.]/g, "")) : area;

  if (isNaN(num) || num <= 0) return undefined;
  if (num > 100_000) return undefined; // Likely invalid (too large)

  return Math.round(num);
}

/**
 * Clean and validate date
 */
export function cleanDate(date: string | undefined): string | undefined {
  if (!date) return undefined;

  try {
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return undefined;
    return parsed.toISOString().split("T")[0]; // Return YYYY-MM-DD
  } catch {
    return undefined;
  }
}

/**
 * Remove duplicates based on address and ERF number
 */
export function removeDuplicates(
  properties: NormalizedProperty[]
): NormalizedProperty[] {
  const seen = new Set<string>();
  const unique: NormalizedProperty[] = [];

  for (const prop of properties) {
    // Create a unique key from address and ERF
    const key = `${normalizeAddress(prop.address).toLowerCase()}-${
      prop.erfNumber?.toLowerCase() || "no-erf"
    }`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(prop);
    }
  }

  return unique;
}

/**
 * Clean and normalize properties from a single source
 */
export function cleanProperties(
  rawProperties: any[],
  source: string
): CleaningResult {
  const normalized: NormalizedProperty[] = [];
  const errors: string[] = [];
  let removed = 0;

  for (const raw of rawProperties) {
    try {
      // Normalize address
      const address = normalizeAddress(raw.address || "");
      if (!address) {
        removed++;
        continue;
      }

      // Normalize suburb
      const suburb = normalizeSuburb(raw.suburb || "");

      // Clean prices
      const valuation = cleanPrice(raw.valuation);
      const askingPrice = cleanPrice(raw.price || raw.askingPrice);
      const lastSalePrice = cleanPrice(raw.lastSalePrice || raw.purchasePrice);

      // Clean dates
      const valuationDate = cleanDate(raw.valuationDate);
      const lastSaleDate = cleanDate(raw.lastSaleDate || raw.transferDate);

      // Clean areas
      const erfSize = cleanArea(raw.erfSize || raw.area);
      const buildingSize = cleanArea(raw.buildingSize);

      // Normalize property type
      const propertyType = normalizePropertyType(
        raw.propertyType || "residential",
        source
      );

      // Only include if we have at least one price or valuation
      if (!valuation && !askingPrice && !lastSalePrice) {
        removed++;
        continue;
      }

      normalized.push({
        erfNumber: raw.erfNumber?.toString().trim(),
        address,
        suburb,
        municipality: raw.municipality || "Cape Town",
        propertyType,
        erfSize,
        buildingSize,
        valuation,
        valuationDate,
        valuationSource: source.includes("municipal")
          ? "municipal"
          : source.includes("lightstone")
          ? "lightstone"
          : undefined,
        askingPrice,
        askingPriceSource: source.includes("property24")
          ? "property24"
          : undefined,
        lastSalePrice,
        lastSaleDate,
        previousSalePrice: cleanPrice(raw.previousSalePrice),
        previousSaleDate: cleanDate(raw.previousSaleDate),
        bedrooms: raw.bedrooms ? parseInt(raw.bedrooms.toString()) : undefined,
        bathrooms: raw.bathrooms
          ? parseInt(raw.bathrooms.toString())
          : undefined,
        source,
        scrapedAt: new Date().toISOString(),
      });
    } catch (error) {
      errors.push(
        `Error cleaning property: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      removed++;
    }
  }

  // Remove duplicates
  const unique = removeDuplicates(normalized);

  return {
    normalized: unique,
    cleaned: unique.length,
    removed: removed + (normalized.length - unique.length),
    errors,
  };
}
