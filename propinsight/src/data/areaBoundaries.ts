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

  // Paarl - Wine region city (irregular shape following Berg River and mountain boundaries)
  paarl: [
    [-33.755, 18.925], // Northwest (mountain boundary)
    [-33.755, 18.965], // North central
    [-33.75, 18.985], // Northeast (river boundary)
    [-33.735, 19.005], // East (river curves)
    [-33.72, 19.01], // Southeast
    [-33.705, 18.995], // South (mountain base)
    [-33.71, 18.95], // Southwest
    [-33.725, 18.935], // West (mountain slope)
    [-33.755, 18.925], // Close polygon
  ],

  // Stellenbosch - Wine region city (irregular shape following Eerste River and mountain ranges)
  stellenbosch: [
    [-33.955, 18.805], // Northwest (mountain boundary)
    [-33.955, 18.835], // North central
    [-33.95, 18.865], // Northeast (river valley)
    [-33.94, 18.885], // East (river curves)
    [-33.925, 18.895], // Southeast
    [-33.91, 18.88], // South (mountain base)
    [-33.905, 18.85], // Southwest
    [-33.92, 18.825], // West (mountain slope)
    [-33.955, 18.805], // Close polygon
  ],

  // Franschhoek - Wine region town (irregular shape following valley and mountain boundaries)
  franschhoek: [
    [-33.915, 19.095], // Northwest (mountain pass)
    [-33.915, 19.12], // North central
    [-33.91, 19.14], // Northeast (valley)
    [-33.9, 19.145], // East (valley curves)
    [-33.89, 19.14], // Southeast
    [-33.888, 19.12], // South (valley floor)
    [-33.892, 19.105], // Southwest
    [-33.905, 19.095], // West (mountain slope)
    [-33.915, 19.095], // Close polygon
  ],

  // Paarl Estates - Detailed irregular boundaries
  "val-de-vie": [
    [-33.742, 18.952], // Northwest (mountain boundary)
    [-33.742, 18.968], // North central
    [-33.738, 18.978], // Northeast (river boundary)
    [-33.73, 18.98], // East (estate boundary)
    [-33.722, 18.975], // Southeast
    [-33.72, 18.965], // South (road boundary)
    [-33.725, 18.955], // Southwest
    [-33.735, 18.952], // West (mountain slope)
    [-33.742, 18.952], // Close polygon
  ],

  "pearl-valley": [
    [-33.758, 18.968], // Northwest (golf course boundary)
    [-33.758, 18.985], // North central
    [-33.752, 18.992], // Northeast (river curves)
    [-33.745, 18.995], // East
    [-33.738, 18.992], // Southeast
    [-33.735, 18.985], // South (estate boundary)
    [-33.74, 18.975], // Southwest
    [-33.75, 18.97], // West
    [-33.758, 18.968], // Close polygon
  ],

  boschendal: [
    [-33.718, 18.938], // Northwest (mountain base)
    [-33.718, 18.95], // North central
    [-33.715, 18.958], // Northeast (vineyard boundary)
    [-33.708, 18.96], // East
    [-33.702, 18.955], // Southeast
    [-33.702, 18.945], // South (road boundary)
    [-33.708, 18.94], // Southwest
    [-33.715, 18.938], // West
    [-33.718, 18.938], // Close polygon
  ],

  boschenmeer: [
    [-33.738, 18.952], // Northwest (golf course)
    [-33.738, 18.965], // North central
    [-33.732, 18.972], // Northeast
    [-33.725, 18.975], // East (estate boundary)
    [-33.72, 18.972], // Southeast
    [-33.718, 18.965], // South
    [-33.722, 18.958], // Southwest
    [-33.73, 18.955], // West
    [-33.738, 18.952], // Close polygon
  ],

  "winelands-estate-paarl": [
    [-33.728, 18.943], // Northwest
    [-33.728, 18.955], // North central
    [-33.722, 18.962], // Northeast
    [-33.715, 18.963], // East
    [-33.71, 18.958], // Southeast
    [-33.71, 18.948], // South
    [-33.715, 18.943], // Southwest
    [-33.722, 18.943], // West
    [-33.728, 18.943], // Close polygon
  ],

  "sante-wine-estate": [
    [-33.723, 18.948], // Northwest
    [-33.723, 18.96], // North central
    [-33.718, 18.968], // Northeast
    [-33.71, 18.97], // East
    [-33.705, 18.965], // Southeast
    [-33.705, 18.955], // South
    [-33.71, 18.95], // Southwest
    [-33.718, 18.948], // West
    [-33.723, 18.948], // Close polygon
  ],

  "kleine-parys": [
    [-33.733, 18.933], // Northwest
    [-33.733, 18.945], // North central
    [-33.728, 18.952], // Northeast
    [-33.72, 18.953], // East
    [-33.715, 18.95], // Southeast
    [-33.715, 18.94], // South
    [-33.72, 18.935], // Southwest
    [-33.728, 18.933], // West
    [-33.733, 18.933], // Close polygon
  ],

  "paarl-valleij": [
    [-33.743, 18.973], // Northwest
    [-33.743, 18.985], // North central
    [-33.738, 18.992], // Northeast
    [-33.73, 18.995], // East
    [-33.722, 18.992], // Southeast
    [-33.72, 18.985], // South
    [-33.725, 18.978], // Southwest
    [-33.735, 18.975], // West
    [-33.743, 18.973], // Close polygon
  ],

  // Paarl Suburbs - Detailed irregular boundaries
  courtrai: [
    [-33.718, 18.962], // Northwest
    [-33.718, 18.975], // North central
    [-33.712, 18.982], // Northeast
    [-33.705, 18.985], // East
    [-33.698, 18.982], // Southeast
    [-33.695, 18.975], // South
    [-33.698, 18.968], // Southwest
    [-33.708, 18.965], // West
    [-33.718, 18.962], // Close polygon
  ],

  lemoenkloof: [
    [-33.728, 18.968], // Northwest
    [-33.728, 18.98], // North central
    [-33.722, 18.987], // Northeast
    [-33.715, 18.99], // East
    [-33.708, 18.987], // Southeast
    [-33.705, 18.98], // South
    [-33.708, 18.973], // Southwest
    [-33.718, 18.97], // West
    [-33.728, 18.968], // Close polygon
  ],

  groenvlei: [
    [-33.738, 18.958], // Northwest
    [-33.738, 18.97], // North central
    [-33.732, 18.977], // Northeast
    [-33.725, 18.98], // East
    [-33.718, 18.977], // Southeast
    [-33.715, 18.97], // South
    [-33.718, 18.963], // Southwest
    [-33.728, 18.96], // West
    [-33.738, 18.958], // Close polygon
  ],

  "charleston-hill": [
    [-33.723, 18.953], // Northwest
    [-33.723, 18.965], // North central
    [-33.718, 18.972], // Northeast
    [-33.71, 18.975], // East
    [-33.703, 18.972], // Southeast
    [-33.7, 18.965], // South
    [-33.703, 18.958], // Southwest
    [-33.713, 18.955], // West
    [-33.723, 18.953], // Close polygon
  ],

  "de-zoete-inval": [
    [-33.73, 18.948], // Northwest
    [-33.73, 18.96], // North central
    [-33.725, 18.967], // Northeast
    [-33.717, 18.97], // East
    [-33.71, 18.967], // Southeast
    [-33.707, 18.96], // South
    [-33.71, 18.953], // Southwest
    [-33.72, 18.95], // West
    [-33.73, 18.948], // Close polygon
  ],

  "klein-nederburg": [
    [-33.726, 18.943], // Northwest
    [-33.726, 18.955], // North central
    [-33.721, 18.962], // Northeast
    [-33.713, 18.965], // East
    [-33.706, 18.962], // Southeast
    [-33.703, 18.955], // South
    [-33.706, 18.948], // Southwest
    [-33.716, 18.945], // West
    [-33.726, 18.943], // Close polygon
  ],

  denneburg: [
    [-33.733, 18.938], // Northwest
    [-33.733, 18.95], // North central
    [-33.728, 18.957], // Northeast
    [-33.72, 18.96], // East
    [-33.713, 18.957], // Southeast
    [-33.71, 18.95], // South
    [-33.713, 18.943], // Southwest
    [-33.723, 18.94], // West
    [-33.733, 18.938], // Close polygon
  ],

  vrykyk: [
    [-33.736, 18.933], // Northwest
    [-33.736, 18.945], // North central
    [-33.731, 18.952], // Northeast
    [-33.723, 18.955], // East
    [-33.716, 18.952], // Southeast
    [-33.713, 18.945], // South
    [-33.716, 18.938], // Southwest
    [-33.726, 18.935], // West
    [-33.736, 18.933], // Close polygon
  ],

  // Stellenbosch Estates - Detailed irregular boundaries
  "de-zalze": [
    [-34.022, 18.842], // Northwest (mountain boundary)
    [-34.022, 18.865], // North central
    [-34.018, 18.88], // Northeast (river boundary)
    [-34.01, 18.885], // East
    [-34.002, 18.88], // Southeast
    [-34.0, 18.865], // South
    [-34.002, 18.85], // Southwest
    [-34.01, 18.845], // West
    [-34.022, 18.842], // Close polygon
  ],

  devonvale: [
    [-33.978, 18.842], // Northwest
    [-33.978, 18.858], // North central
    [-33.973, 18.868], // Northeast
    [-33.965, 18.872], // East
    [-33.958, 18.868], // Southeast
    [-33.955, 18.858], // South
    [-33.958, 18.848], // Southwest
    [-33.968, 18.845], // West
    [-33.978, 18.842], // Close polygon
  ],

  devonbosch: [
    [-33.958, 18.862], // Northwest
    [-33.958, 18.878], // North central
    [-33.953, 18.888], // Northeast
    [-33.945, 18.892], // East
    [-33.938, 18.888], // Southeast
    [-33.935, 18.878], // South
    [-33.938, 18.868], // Southwest
    [-33.948, 18.865], // West
    [-33.958, 18.862], // Close polygon
  ],

  koelenbosch: [
    [-33.973, 18.848], // Northwest
    [-33.973, 18.863], // North central
    [-33.968, 18.873], // Northeast
    [-33.96, 18.877], // East
    [-33.953, 18.873], // Southeast
    [-33.95, 18.863], // South
    [-33.953, 18.853], // Southwest
    [-33.963, 18.85], // West
    [-33.973, 18.848], // Close polygon
  ],

  "devon-valley": [
    [-33.983, 18.838], // Northwest
    [-33.983, 18.853], // North central
    [-33.978, 18.863], // Northeast
    [-33.97, 18.867], // East
    [-33.963, 18.863], // Southeast
    [-33.96, 18.853], // South
    [-33.963, 18.843], // Southwest
    [-33.973, 18.84], // West
    [-33.983, 18.838], // Close polygon
  ],

  // Stellenbosch Suburbs - Detailed irregular boundaries
  "stellenbosch-central": [
    [-33.93, 18.852], // Northwest (university area)
    [-33.93, 18.868], // North central
    [-33.925, 18.878], // Northeast (river boundary)
    [-33.918, 18.882], // East
    [-33.91, 18.878], // Southeast
    [-33.908, 18.868], // South
    [-33.91, 18.858], // Southwest
    [-33.92, 18.855], // West
    [-33.93, 18.852], // Close polygon
  ],

  dalsig: [
    [-33.928, 18.848], // Northwest
    [-33.928, 18.863], // North central
    [-33.923, 18.873], // Northeast
    [-33.915, 18.877], // East
    [-33.908, 18.873], // Southeast
    [-33.905, 18.863], // South
    [-33.908, 18.853], // Southwest
    [-33.918, 18.85], // West
    [-33.928, 18.848], // Close polygon
  ],

  welgevonden: [
    [-33.933, 18.858], // Northwest
    [-33.933, 18.873], // North central
    [-33.928, 18.883], // Northeast
    [-33.92, 18.887], // East
    [-33.913, 18.883], // Southeast
    [-33.91, 18.873], // South
    [-33.913, 18.863], // Southwest
    [-33.923, 18.86], // West
    [-33.933, 18.858], // Close polygon
  ],

  mostertsdrift: [
    [-33.926, 18.843], // Northwest
    [-33.926, 18.858], // North central
    [-33.921, 18.868], // Northeast
    [-33.913, 18.872], // East
    [-33.906, 18.868], // Southeast
    [-33.903, 18.858], // South
    [-33.906, 18.848], // Southwest
    [-33.916, 18.845], // West
    [-33.926, 18.843], // Close polygon
  ],

  // Franschhoek Estates - Detailed irregular boundaries
  "domaine-des-anges": [
    [-33.908, 19.112], // Northwest (mountain boundary)
    [-33.908, 19.125], // North central
    [-33.903, 19.133], // Northeast (valley boundary)
    [-33.895, 19.135], // East
    [-33.888, 19.133], // Southeast
    [-33.885, 19.125], // South
    [-33.888, 19.118], // Southwest
    [-33.898, 19.115], // West
    [-33.908, 19.112], // Close polygon
  ],

  "fransche-hoek": [
    [-33.913, 19.118], // Northwest
    [-33.913, 19.13], // North central
    [-33.908, 19.138], // Northeast
    [-33.9, 19.14], // East
    [-33.893, 19.138], // Southeast
    [-33.89, 19.13], // South
    [-33.893, 19.123], // Southwest
    [-33.903, 19.12], // West
    [-33.913, 19.118], // Close polygon
  ],

  "winelands-estate-franschhoek": [
    [-33.903, 19.108], // Northwest
    [-33.903, 19.12], // North central
    [-33.898, 19.128], // Northeast
    [-33.89, 19.13], // East
    [-33.883, 19.128], // Southeast
    [-33.88, 19.12], // South
    [-33.883, 19.113], // Southwest
    [-33.893, 19.11], // West
    [-33.903, 19.108], // Close polygon
  ],

  "delta-crest": [
    [-33.918, 19.123], // Northwest
    [-33.918, 19.135], // North central
    [-33.913, 19.143], // Northeast
    [-33.905, 19.145], // East
    [-33.898, 19.143], // Southeast
    [-33.895, 19.135], // South
    [-33.898, 19.128], // Southwest
    [-33.908, 19.125], // West
    [-33.918, 19.123], // Close polygon
  ],

  "la-petite-provence": [
    [-33.91, 19.111], // Northwest
    [-33.91, 19.123], // North central
    [-33.905, 19.131], // Northeast
    [-33.897, 19.133], // East
    [-33.89, 19.131], // Southeast
    [-33.887, 19.123], // South
    [-33.89, 19.116], // Southwest
    [-33.9, 19.113], // West
    [-33.91, 19.111], // Close polygon
  ],

  // Franschhoek Suburbs - Detailed irregular boundaries
  "franschhoek-village": [
    [-33.907, 19.116], // Northwest (main street)
    [-33.907, 19.128], // North central
    [-33.902, 19.136], // Northeast
    [-33.894, 19.138], // East
    [-33.887, 19.136], // Southeast
    [-33.884, 19.128], // South
    [-33.887, 19.121], // Southwest
    [-33.897, 19.118], // West
    [-33.907, 19.116], // Close polygon
  ],

  "franschhoek-rural": [
    [-33.898, 19.103], // Northwest
    [-33.898, 19.115], // North central
    [-33.893, 19.123], // Northeast
    [-33.885, 19.125], // East
    [-33.878, 19.123], // Southeast
    [-33.875, 19.115], // South
    [-33.878, 19.108], // Southwest
    [-33.888, 19.105], // West
    [-33.898, 19.103], // Close polygon
  ],

  "groendal-franschhoek": [
    [-33.906, 19.121], // Northwest
    [-33.906, 19.133], // North central
    [-33.901, 19.141], // Northeast
    [-33.893, 19.143], // East
    [-33.886, 19.141], // Southeast
    [-33.883, 19.133], // South
    [-33.886, 19.126], // Southwest
    [-33.896, 19.123], // West
    [-33.906, 19.121], // Close polygon
  ],

  langrug: [
    [-33.908, 19.128], // Northwest
    [-33.908, 19.14], // North central
    [-33.903, 19.148], // Northeast
    [-33.895, 19.15], // East
    [-33.888, 19.148], // Southeast
    [-33.885, 19.14], // South
    [-33.888, 19.133], // Southwest
    [-33.898, 19.13], // West
    [-33.908, 19.128], // Close polygon
  ],

  "la-motte": [
    [-33.9, 19.098], // Northwest
    [-33.9, 19.11], // North central
    [-33.895, 19.118], // Northeast
    [-33.887, 19.12], // East
    [-33.88, 19.118], // Southeast
    [-33.877, 19.11], // South
    [-33.88, 19.103], // Southwest
    [-33.89, 19.1], // West
    [-33.9, 19.098], // Close polygon
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
