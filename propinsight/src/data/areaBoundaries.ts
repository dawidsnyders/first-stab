// Area boundary definitions for Western Cape
// These are approximations of real suburb boundaries based on actual geographic extents
// In production, this would come from official GeoJSON data sources (StatsSA Census 2011, City of Cape Town GIS)
// Each boundary is defined as an array of [lat, lng] coordinates (for Leaflet)

export type Boundary = [number, number][];

export const areaBoundaries: Record<string, Boundary> = {
  // Camps Bay - coastal suburb, narrow strip along the Atlantic coast
  // Extends from the beach up the slopes of Table Mountain
  "camps-bay": [
    [-33.948, 18.370], // Beachfront NW corner
    [-33.952, 18.375],
    [-33.955, 18.378],
    [-33.957, 18.380],
    [-33.958, 18.378], // South point
    [-33.956, 18.373],
    [-33.954, 18.370],
    [-33.951, 18.368],
    [-33.948, 18.368],
    [-33.947, 18.370],
    [-33.948, 18.370], // Close polygon
  ],

  // Sea Point - long narrow coastal strip between beach and hills
  // Runs along the Atlantic Seaboard from Three Anchor Bay to Mouille Point
  "sea-point": [
    [-33.908, 18.380], // Northern boundary near Three Anchor Bay
    [-33.912, 18.388],
    [-33.916, 18.394],
    [-33.920, 18.397],
    [-33.923, 18.396], // Southern end
    [-33.925, 18.393],
    [-33.924, 18.388],
    [-33.921, 18.383],
    [-33.917, 18.381],
    [-33.912, 18.380],
    [-33.908, 18.380], // Close polygon
  ],

  // Green Point - compact coastal area near V&A Waterfront
  "green-point": [
    [-33.903, 18.400],
    [-33.907, 18.408],
    [-33.910, 18.411],
    [-33.913, 18.410],
    [-33.916, 18.407],
    [-33.917, 18.403],
    [-33.915, 18.400],
    [-33.911, 18.399],
    [-33.906, 18.400],
    [-33.903, 18.400], // Close polygon
  ],

  // Woodstock - inner city area, more rectangular/irregular shape
  // Located between the city center and Table Mountain
  "woodstock": [
    [-33.920, 18.438],
    [-33.923, 18.445],
    [-33.927, 18.449],
    [-33.931, 18.451],
    [-33.934, 18.449], // Southern boundary
    [-33.936, 18.445],
    [-33.935, 18.440],
    [-33.932, 18.437],
    [-33.928, 18.436],
    [-33.924, 18.437],
    [-33.920, 18.438], // Close polygon
  ],

  // Observatory - small inner city suburb, irregular shape
  // Located near UCT and Groote Schuur
  "observatory": [
    [-33.931, 18.468],
    [-33.934, 18.474],
    [-33.937, 18.477],
    [-33.941, 18.477],
    [-33.943, 18.475], // Southern boundary
    [-33.944, 18.471],
    [-33.942, 18.467],
    [-33.938, 18.466],
    [-33.934, 18.467],
    [-33.931, 18.468], // Close polygon
  ],

  // Claremont - larger Southern Suburbs area, spread out
  // Major commercial and residential area
  "claremont": [
    [-33.973, 18.465], // Northern boundary
    [-33.977, 18.475],
    [-33.981, 18.480],
    [-33.986, 18.481],
    [-33.990, 18.479], // Southern boundary
    [-33.992, 18.474],
    [-33.990, 18.468],
    [-33.985, 18.464],
    [-33.979, 18.463],
    [-33.974, 18.464],
    [-33.973, 18.465], // Close polygon
  ],

  // Constantia - large wine valley area, irregular shape
  // Extends along Constantia Valley between mountains
  "constantia": [
    [-34.018, 18.405], // Northern boundary
    [-34.022, 18.420],
    [-34.027, 18.428],
    [-34.032, 18.430],
    [-34.036, 18.428], // Southern valley
    [-34.037, 18.422],
    [-34.034, 18.415],
    [-34.029, 18.409],
    [-34.023, 18.404],
    [-34.019, 18.403],
    [-34.018, 18.405], // Close polygon
  ],

  // Val de Vie Estate - Paarl, gated estate
  "val-de-vie": [
    [-33.726, 18.962],
    [-33.729, 18.969],
    [-33.734, 18.973],
    [-33.739, 18.974],
    [-33.743, 18.971],
    [-33.743, 18.966],
    [-33.740, 18.961],
    [-33.734, 18.959],
    [-33.729, 18.960],
    [-33.726, 18.962], // Close polygon
  ],

  // Pearl Valley - Paarl, wine estate
  "pearl-valley": [
    [-33.743, 18.978],
    [-33.746, 18.986],
    [-33.751, 18.991],
    [-33.757, 18.991],
    [-33.762, 18.987],
    [-33.762, 18.981],
    [-33.758, 18.976],
    [-33.752, 18.974],
    [-33.747, 18.975],
    [-33.743, 18.978], // Close polygon
  ],

  // De Zalze - Stellenbosch, wine estate
  "de-zalze": [
    [-34.008, 18.862],
    [-34.012, 18.869],
    [-34.017, 18.874],
    [-34.023, 18.875],
    [-34.028, 18.872],
    [-34.028, 18.866],
    [-34.024, 18.860],
    [-34.018, 18.858],
    [-34.012, 18.859],
    [-34.008, 18.862], // Close polygon
  ],
};

/**
 * Get boundary for an area by its slug
 * Returns boundary as [lat, lng][] for Leaflet
 */
export function getAreaBoundary(slug: string): Boundary | null {
  return areaBoundaries[slug] || null;
}

/**
 * Check if an area has a defined boundary
 */
export function hasBoundary(slug: string): boolean {
  return slug in areaBoundaries;
}
