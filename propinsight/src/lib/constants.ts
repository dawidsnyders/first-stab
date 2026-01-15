// App constants
export const APP_NAME = 'PropInsight';
export const APP_DESCRIPTION = 'Property market intelligence for South Africa';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Report pricing (in ZAR cents for Stripe)
export const REPORT_PRICE_CENTS = 14900; // R149
export const REPORT_PRICE_DISPLAY = 'R149';

// Map settings
export const DEFAULT_MAP_CENTER: [number, number] = [-33.9249, 18.4241]; // Cape Town
export const DEFAULT_MAP_ZOOM = 10;

// Western Cape bounds for initial MVP
export const WC_BOUNDS = {
  north: -31.5,
  south: -34.8,
  east: 20.5,
  west: 17.8,
};

// Data sources
export const DATA_SOURCES = {
  PROPERTY24: 'Property24',
  LIGHTSTONE: 'Lightstone',
  MUNICIPAL: 'Municipal Valuation Roll',
  STATSSA: 'Statistics South Africa',
  DEEDS: 'Deeds Office',
} as const;

// National benchmarks for comparison
export const NATIONAL_BENCHMARKS = {
  avgPropertyGrowth: 2.5, // % per annum
  cpiInflation: 5.0, // % per annum (10-year avg)
  primeRate: 11.25, // current
} as const;
