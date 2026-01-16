/**
 * Realistic polygon boundaries for Cape Town suburbs
 * These approximate the actual geographic boundaries of each suburb
 * In production, these would come from City of Cape Town GeoJSON data
 * Format: [lat, lng] arrays for Leaflet compatibility
 */

export const AREA_BOUNDARIES: Record<
  string,
  [number, number][] // [lat, lng] format for Leaflet
> = {
  // Cape Town City (larger bounding area)
  "cape-town": [
    [-34.1, 18.2], // Northwest
    [-34.1, 18.7], // Northeast
    [-33.7, 18.7], // Southeast
    [-33.7, 18.2], // Southwest
    [-34.1, 18.2], // Close polygon
  ],

  // Camps Bay - Coastal suburb along the Atlantic seaboard
  "camps-bay": [
    [-33.9508, 18.37], // Northwest (coastal, near Clifton)
    [-33.9508, 18.38], // North central
    [-33.948, 18.385], // Northeast (inland boundary)
    [-33.945, 18.385], // East
    [-33.942, 18.378], // Southeast
    [-33.94, 18.37], // South (coastal road)
    [-33.945, 18.365], // Southwest
    [-33.9508, 18.37], // Close polygon
  ],

  // Sea Point - Elongated coastal suburb between Clifton and Green Point
  "sea-point": [
    [-33.9167, 18.38], // Northwest (Lion's Head/Clifton side)
    [-33.9167, 18.398], // North (coastal stretch)
    [-33.912, 18.4], // Northeast
    [-33.908, 18.4], // East (Beach Road)
    [-33.904, 18.395], // Southeast
    [-33.908, 18.388], // South (Main Road area)
    [-33.91, 18.385], // Southwest
    [-33.9167, 18.38], // Close polygon
  ],

  // Green Point - Compact area between Sea Point and V&A Waterfront
  "green-point": [
    [-33.9092, 18.4], // Northwest (border with Sea Point)
    [-33.9092, 18.413], // North (near Waterfront)
    [-33.907, 18.415], // Northeast (Waterfront boundary)
    [-33.904, 18.413], // East
    [-33.903, 18.408], // Southeast (near stadium)
    [-33.904, 18.405], // South
    [-33.907, 18.402], // Southwest
    [-33.9092, 18.4], // Close polygon
  ],

  // Woodstock - Inner city industrial/residential area near the mountain
  woodstock: [
    [-33.9278, 18.438], // Northwest (mountain side)
    [-33.9278, 18.452], // North
    [-33.922, 18.456], // Northeast
    [-33.918, 18.454], // East (towards Observatory)
    [-33.917, 18.448], // Southeast
    [-33.92, 18.442], // South (lower Woodstock)
    [-33.924, 18.438], // Southwest
    [-33.9278, 18.438], // Close polygon
  ],

  // Observatory - Compact inner city area
  observatory: [
    [-33.9389, 18.468], // Northwest
    [-33.9389, 18.477], // North
    [-33.936, 18.48], // Northeast
    [-33.933, 18.478], // East
    [-33.932, 18.473], // Southeast (Lower Main Road)
    [-33.934, 18.47], // South
    [-33.936, 18.468], // Southwest
    [-33.9389, 18.468], // Close polygon
  ],

  // Claremont - Larger southern suburbs area, quite extensive
  claremont: [
    [-33.9806, 18.465], // Northwest (Newlands border)
    [-33.9806, 18.485], // North
    [-33.975, 18.49], // Northeast (Wynberg side)
    [-33.97, 18.488], // East
    [-33.968, 18.482], // Southeast (Lower Claremont)
    [-33.97, 18.478], // South
    [-33.975, 18.472], // Southwest
    [-33.9806, 18.465], // Close polygon
  ],

  // Constantia - Large wine estate area, southern suburbs
  constantia: [
    [-34.0278, 18.395], // Northwest (Newlands/Plumstead border)
    [-34.0278, 18.44], // North (stretches east)
    [-34.018, 18.445], // Northeast
    [-34.01, 18.44], // East
    [-34.008, 18.43], // Southeast (lower Constantia)
    [-34.01, 18.415], // South
    [-34.015, 18.405], // Southwest
    [-34.0278, 18.395], // Close polygon
  ],

  // Paarl - Wine region city (centered around -33.7342, 18.9752, ~64km² area)
  paarl: [
    [-33.72, 18.96], // Northwest (mountain boundary)
    [-33.72, 18.99], // North central
    [-33.73, 19.0], // Northeast (river boundary)
    [-33.74, 19.005], // East (river curves)
    [-33.75, 19.0], // Southeast
    [-33.75, 18.97], // South (mountain base)
    [-33.74, 18.95], // Southwest
    [-33.73, 18.95], // West (mountain slope)
    [-33.72, 18.96], // Close polygon
  ],

  // Stellenbosch - Wine region city (centered around -33.9322, 18.8602, ~10km² area)
  stellenbosch: [
    [-33.92, 18.85], // Northwest (mountain boundary)
    [-33.92, 18.87], // North central
    [-33.93, 18.875], // Northeast (river valley)
    [-33.94, 18.87], // East (river curves)
    [-33.945, 18.86], // Southeast
    [-33.945, 18.845], // South (mountain base)
    [-33.94, 18.845], // Southwest
    [-33.93, 18.85], // West (mountain slope)
    [-33.92, 18.85], // Close polygon
  ],

  // Franschhoek - Wine region town (centered around -33.9094, 19.1233, ~1.8km² area)
  franschhoek: [
    [-33.905, 19.115], // Northwest (mountain pass)
    [-33.905, 19.13], // North central
    [-33.91, 19.135], // Northeast (valley)
    [-33.915, 19.13], // East (valley curves)
    [-33.915, 19.115], // Southeast
    [-33.91, 19.11], // South (valley floor)
    [-33.905, 19.11], // Southwest
    [-33.905, 19.115], // West (mountain slope)
    [-33.905, 19.115], // Close polygon
  ],

  // Paarl Estates - Detailed irregular boundaries (centered around Paarl -33.7342, 18.9752)
  "val-de-vie": [
    [-33.73, 18.97], // Northwest (mountain boundary)
    [-33.73, 18.98], // North central
    [-33.735, 18.985], // Northeast (river boundary)
    [-33.74, 18.985], // East (estate boundary)
    [-33.74, 18.98], // Southeast
    [-33.738, 18.975], // South (road boundary)
    [-33.735, 18.97], // Southwest
    [-33.73, 18.97], // West (mountain slope)
    [-33.73, 18.97], // Close polygon
  ],

  "pearl-valley": [
    [-33.748, 18.975], // Northwest (golf course boundary)
    [-33.748, 18.985], // North central
    [-33.75, 18.99], // Northeast (river curves)
    [-33.752, 18.99], // East
    [-33.752, 18.985], // Southeast
    [-33.75, 18.98], // South (estate boundary)
    [-33.748, 18.975], // Southwest
    [-33.745, 18.975], // West
    [-33.748, 18.975], // Close polygon
  ],

  boschendal: [
    [-33.72, 18.945], // Northwest (mountain base)
    [-33.72, 18.955], // North central
    [-33.722, 18.96], // Northeast (vineyard boundary)
    [-33.725, 18.96], // East
    [-33.728, 18.955], // Southeast
    [-33.728, 18.95], // South (road boundary)
    [-33.725, 18.945], // Southwest
    [-33.722, 18.945], // West
    [-33.72, 18.945], // Close polygon
  ],

  boschenmeer: [
    [-33.738, 18.97], // Northwest (golf course)
    [-33.738, 18.98], // North central
    [-33.74, 18.983], // Northeast
    [-33.742, 18.983], // East (estate boundary)
    [-33.742, 18.98], // Southeast
    [-33.74, 18.977], // South
    [-33.738, 18.975], // Southwest
    [-33.736, 18.97], // West
    [-33.738, 18.97], // Close polygon
  ],

  "winelands-estate-paarl": [
    [-33.732, 18.97], // Northwest
    [-33.732, 18.98], // North central
    [-33.735, 18.983], // Northeast
    [-33.738, 18.983], // East
    [-33.738, 18.98], // Southeast
    [-33.736, 18.977], // South
    [-33.733, 18.97], // Southwest
    [-33.73, 18.97], // West
    [-33.732, 18.97], // Close polygon
  ],

  "sante-wine-estate": [
    [-33.728, 18.97], // Northwest
    [-33.728, 18.98], // North central
    [-33.73, 18.983], // Northeast
    [-33.732, 18.983], // East
    [-33.732, 18.98], // Southeast
    [-33.73, 18.977], // South
    [-33.728, 18.975], // Southwest
    [-33.726, 18.97], // West
    [-33.728, 18.97], // Close polygon
  ],

  "kleine-parys": [
    [-33.73, 18.965], // Northwest
    [-33.73, 18.975], // North central
    [-33.732, 18.978], // Northeast
    [-33.735, 18.978], // East
    [-33.735, 18.975], // Southeast
    [-33.733, 18.972], // South
    [-33.73, 18.97], // Southwest
    [-33.728, 18.965], // West
    [-33.73, 18.965], // Close polygon
  ],

  "paarl-valleij": [
    [-33.742, 18.975], // Northwest
    [-33.742, 18.985], // North central
    [-33.745, 18.988], // Northeast
    [-33.748, 18.988], // East
    [-33.748, 18.985], // Southeast
    [-33.745, 18.982], // South
    [-33.742, 18.98], // Southwest
    [-33.74, 18.975], // West
    [-33.742, 18.975], // Close polygon
  ],

  // Paarl Suburbs - Detailed irregular boundaries (centered around Paarl -33.7342, 18.9752)
  courtrai: [
    [-33.72, 18.97], // Northwest
    [-33.72, 18.98], // North central
    [-33.722, 18.983], // Northeast
    [-33.725, 18.983], // East
    [-33.728, 18.98], // Southeast
    [-33.728, 18.975], // South
    [-33.725, 18.972], // Southwest
    [-33.722, 18.97], // West
    [-33.72, 18.97], // Close polygon
  ],

  lemoenkloof: [
    [-33.728, 18.975], // Northwest
    [-33.728, 18.985], // North central
    [-33.73, 18.988], // Northeast
    [-33.733, 18.988], // East
    [-33.735, 18.985], // Southeast
    [-33.735, 18.98], // South
    [-33.733, 18.977], // Southwest
    [-33.73, 18.975], // West
    [-33.728, 18.975], // Close polygon
  ],

  groenvlei: [
    [-33.738, 18.97], // Northwest
    [-33.738, 18.98], // North central
    [-33.74, 18.983], // Northeast
    [-33.742, 18.983], // East
    [-33.744, 18.98], // Southeast
    [-33.744, 18.975], // South
    [-33.742, 18.972], // Southwest
    [-33.74, 18.97], // West
    [-33.738, 18.97], // Close polygon
  ],

  "charleston-hill": [
    [-33.728, 18.97], // Northwest
    [-33.728, 18.98], // North central
    [-33.73, 18.983], // Northeast
    [-33.732, 18.983], // East
    [-33.734, 18.98], // Southeast
    [-33.734, 18.975], // South
    [-33.732, 18.972], // Southwest
    [-33.73, 18.97], // West
    [-33.728, 18.97], // Close polygon
  ],

  "de-zoete-inval": [
    [-33.732, 18.97], // Northwest
    [-33.732, 18.98], // North central
    [-33.734, 18.983], // Northeast
    [-33.736, 18.983], // East
    [-33.738, 18.98], // Southeast
    [-33.738, 18.975], // South
    [-33.736, 18.972], // Southwest
    [-33.734, 18.97], // West
    [-33.732, 18.97], // Close polygon
  ],

  "klein-nederburg": [
    [-33.73, 18.965], // Northwest
    [-33.73, 18.975], // North central
    [-33.732, 18.978], // Northeast
    [-33.734, 18.978], // East
    [-33.736, 18.975], // Southeast
    [-33.736, 18.97], // South
    [-33.734, 18.967], // Southwest
    [-33.732, 18.965], // West
    [-33.73, 18.965], // Close polygon
  ],

  denneburg: [
    [-33.736, 18.97], // Northwest
    [-33.736, 18.98], // North central
    [-33.738, 18.983], // Northeast
    [-33.74, 18.983], // East
    [-33.742, 18.98], // Southeast
    [-33.742, 18.975], // South
    [-33.74, 18.972], // Southwest
    [-33.738, 18.97], // West
    [-33.736, 18.97], // Close polygon
  ],

  vrykyk: [
    [-33.738, 18.965], // Northwest
    [-33.738, 18.975], // North central
    [-33.74, 18.978], // Northeast
    [-33.742, 18.978], // East
    [-33.744, 18.975], // Southeast
    [-33.744, 18.97], // South
    [-33.742, 18.967], // Southwest
    [-33.74, 18.965], // West
    [-33.738, 18.965], // Close polygon
  ],

  // Stellenbosch Estates - Detailed irregular boundaries (centered around Stellenbosch -33.9322, 18.8602)
  "de-zalze": [
    [-34.015, 18.855], // Northwest (mountain boundary)
    [-34.015, 18.865], // North central
    [-34.012, 18.87], // Northeast (river boundary)
    [-34.008, 18.872], // East
    [-34.005, 18.87], // Southeast
    [-34.005, 18.865], // South
    [-34.008, 18.86], // Southwest
    [-34.012, 18.855], // West
    [-34.015, 18.855], // Close polygon
  ],

  devonvale: [
    [-33.98, 18.85], // Northwest
    [-33.98, 18.86], // North central
    [-33.978, 18.865], // Northeast
    [-33.975, 18.867], // East
    [-33.972, 18.865], // Southeast
    [-33.972, 18.86], // South
    [-33.975, 18.858], // Southwest
    [-33.978, 18.855], // West
    [-33.98, 18.85], // Close polygon
  ],

  devonbosch: [
    [-33.96, 18.86], // Northwest
    [-33.96, 18.87], // North central
    [-33.958, 18.875], // Northeast
    [-33.955, 18.877], // East
    [-33.952, 18.875], // Southeast
    [-33.952, 18.87], // South
    [-33.955, 18.868], // Southwest
    [-33.958, 18.865], // West
    [-33.96, 18.86], // Close polygon
  ],

  koelenbosch: [
    [-33.975, 18.855], // Northwest
    [-33.975, 18.865], // North central
    [-33.973, 18.87], // Northeast
    [-33.97, 18.872], // East
    [-33.967, 18.87], // Southeast
    [-33.967, 18.865], // South
    [-33.97, 18.863], // Southwest
    [-33.973, 18.855], // West
    [-33.975, 18.855], // Close polygon
  ],

  "devon-valley": [
    [-33.985, 18.845], // Northwest
    [-33.985, 18.855], // North central
    [-33.983, 18.86], // Northeast
    [-33.98, 18.862], // East
    [-33.977, 18.86], // Southeast
    [-33.977, 18.855], // South
    [-33.98, 18.853], // Southwest
    [-33.983, 18.848], // West
    [-33.985, 18.845], // Close polygon
  ],

  // Stellenbosch Suburbs - Detailed irregular boundaries (centered around Stellenbosch -33.9322, 18.8602)
  "stellenbosch-central": [
    [-33.93, 18.855], // Northwest (university area)
    [-33.93, 18.865], // North central
    [-33.932, 18.87], // Northeast (river boundary)
    [-33.935, 18.87], // East
    [-33.937, 18.865], // Southeast
    [-33.937, 18.86], // South
    [-33.935, 18.855], // Southwest
    [-33.932, 18.855], // West
    [-33.93, 18.855], // Close polygon
  ],

  dalsig: [
    [-33.93, 18.85], // Northwest
    [-33.93, 18.86], // North central
    [-33.932, 18.865], // Northeast
    [-33.935, 18.865], // East
    [-33.937, 18.86], // Southeast
    [-33.937, 18.855], // South
    [-33.935, 18.853], // Southwest
    [-33.932, 18.85], // West
    [-33.93, 18.85], // Close polygon
  ],

  welgevonden: [
    [-33.935, 18.86], // Northwest
    [-33.935, 18.87], // North central
    [-33.937, 18.875], // Northeast
    [-33.94, 18.875], // East
    [-33.942, 18.87], // Southeast
    [-33.942, 18.865], // South
    [-33.94, 18.863], // Southwest
    [-33.937, 18.86], // West
    [-33.935, 18.86], // Close polygon
  ],

  mostertsdrift: [
    [-33.928, 18.855], // Northwest
    [-33.928, 18.865], // North central
    [-33.93, 18.87], // Northeast
    [-33.933, 18.87], // East
    [-33.935, 18.865], // Southeast
    [-33.935, 18.86], // South
    [-33.933, 18.858], // Southwest
    [-33.93, 18.855], // West
    [-33.928, 18.855], // Close polygon
  ],

  // Franschhoek Estates - Detailed irregular boundaries (centered around Franschhoek -33.9094, 19.1233)
  "domaine-des-anges": [
    [-33.908, 19.118], // Northwest (mountain boundary)
    [-33.908, 19.128], // North central
    [-33.91, 19.133], // Northeast (valley boundary)
    [-33.912, 19.133], // East
    [-33.912, 19.128], // Southeast
    [-33.91, 19.123], // South
    [-33.908, 19.12], // Southwest
    [-33.906, 19.118], // West
    [-33.908, 19.118], // Close polygon
  ],

  "fransche-hoek": [
    [-33.913, 19.12], // Northwest
    [-33.913, 19.13], // North central
    [-33.915, 19.135], // Northeast
    [-33.917, 19.135], // East
    [-33.917, 19.13], // Southeast
    [-33.915, 19.125], // South
    [-33.913, 19.123], // Southwest
    [-33.911, 19.12], // West
    [-33.913, 19.12], // Close polygon
  ],

  "winelands-estate-franschhoek": [
    [-33.905, 19.118], // Northwest
    [-33.905, 19.128], // North central
    [-33.907, 19.133], // Northeast
    [-33.909, 19.133], // East
    [-33.909, 19.128], // Southeast
    [-33.907, 19.123], // South
    [-33.905, 19.12], // Southwest
    [-33.903, 19.118], // West
    [-33.905, 19.118], // Close polygon
  ],

  "delta-crest": [
    [-33.918, 19.123], // Northwest
    [-33.918, 19.133], // North central
    [-33.92, 19.138], // Northeast
    [-33.922, 19.138], // East
    [-33.922, 19.133], // Southeast
    [-33.92, 19.128], // South
    [-33.918, 19.125], // Southwest
    [-33.916, 19.123], // West
    [-33.918, 19.123], // Close polygon
  ],

  "la-petite-provence": [
    [-33.91, 19.12], // Northwest
    [-33.91, 19.13], // North central
    [-33.912, 19.135], // Northeast
    [-33.914, 19.135], // East
    [-33.914, 19.13], // Southeast
    [-33.912, 19.125], // South
    [-33.91, 19.123], // Southwest
    [-33.908, 19.12], // West
    [-33.91, 19.12], // Close polygon
  ],

  // Franschhoek Suburbs - Detailed irregular boundaries (centered around Franschhoek -33.9094, 19.1233)
  "franschhoek-village": [
    [-33.909, 19.118], // Northwest (main street)
    [-33.909, 19.128], // North central
    [-33.911, 19.133], // Northeast
    [-33.913, 19.133], // East
    [-33.913, 19.128], // Southeast
    [-33.911, 19.123], // South
    [-33.909, 19.12], // Southwest
    [-33.907, 19.118], // West
    [-33.909, 19.118], // Close polygon
  ],

  "franschhoek-rural": [
    [-33.905, 19.11], // Northwest
    [-33.905, 19.12], // North central
    [-33.907, 19.125], // Northeast
    [-33.909, 19.125], // East
    [-33.909, 19.12], // Southeast
    [-33.907, 19.115], // South
    [-33.905, 19.113], // Southwest
    [-33.903, 19.11], // West
    [-33.905, 19.11], // Close polygon
  ],

  "groendal-franschhoek": [
    [-33.908, 19.12], // Northwest
    [-33.908, 19.13], // North central
    [-33.91, 19.135], // Northeast
    [-33.912, 19.135], // East
    [-33.912, 19.13], // Southeast
    [-33.91, 19.125], // South
    [-33.908, 19.123], // Southwest
    [-33.906, 19.12], // West
    [-33.908, 19.12], // Close polygon
  ],

  langrug: [
    [-33.91, 19.128], // Northwest
    [-33.91, 19.138], // North central
    [-33.912, 19.143], // Northeast
    [-33.914, 19.143], // East
    [-33.914, 19.138], // Southeast
    [-33.912, 19.133], // South
    [-33.91, 19.13], // Southwest
    [-33.908, 19.128], // West
    [-33.91, 19.128], // Close polygon
  ],

  "la-motte": [
    [-33.902, 19.11], // Northwest
    [-33.902, 19.12], // North central
    [-33.904, 19.125], // Northeast
    [-33.906, 19.125], // East
    [-33.906, 19.12], // Southeast
    [-33.904, 19.115], // South
    [-33.902, 19.113], // Southwest
    [-33.9, 19.11], // West
    [-33.902, 19.11], // Close polygon
  ],
};

/**
 * Get boundary polygon for an area
 * Returns coordinates in [lat, lng] format for Leaflet
 */
export function getAreaBoundaryPolygon(
  areaSlug: string
): [number, number][] | null {
  return AREA_BOUNDARIES[areaSlug] || null;
}

/**
 * Check if an area has a defined boundary
 */
export function hasAreaBoundary(areaSlug: string): boolean {
  return areaSlug in AREA_BOUNDARIES;
}
