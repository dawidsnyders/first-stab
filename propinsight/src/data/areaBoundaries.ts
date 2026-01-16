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

  // Paarl - Wine region city
  paarl: [
    [-33.76, 18.93], // Northwest
    [-33.76, 19.02], // Northeast
    [-33.71, 19.02], // Southeast
    [-33.71, 18.93], // Southwest
    [-33.76, 18.93], // Close polygon
  ],

  // Stellenbosch - Wine region city
  stellenbosch: [
    [-33.96, 18.81], // Northwest
    [-33.96, 18.91], // Northeast
    [-33.9, 18.91], // Southeast
    [-33.9, 18.81], // Southwest
    [-33.96, 18.81], // Close polygon
  ],

  // Franschhoek - Wine region town
  franschhoek: [
    [-33.92, 19.1], // Northwest
    [-33.92, 19.15], // Northeast
    [-33.89, 19.15], // Southeast
    [-33.89, 19.1], // Southwest
    [-33.92, 19.1], // Close polygon
  ],

  // Paarl Estates
  "val-de-vie": [
    [-33.745, 18.955], // Northwest
    [-33.745, 18.975], // Northeast
    [-33.725, 18.975], // Southeast
    [-33.725, 18.955], // Southwest
    [-33.745, 18.955], // Close polygon
  ],

  "pearl-valley": [
    [-33.76, 18.97], // Northwest
    [-33.76, 18.995], // Northeast
    [-33.745, 18.995], // Southeast
    [-33.745, 18.97], // Southwest
    [-33.76, 18.97], // Close polygon
  ],

  boschendal: [
    [-33.72, 18.94], // Northwest
    [-33.72, 18.955], // Northeast
    [-33.705, 18.955], // Southeast
    [-33.705, 18.94], // Southwest
    [-33.72, 18.94], // Close polygon
  ],

  boschenmeer: [
    [-33.74, 18.955], // Northwest
    [-33.74, 18.97], // Northeast
    [-33.725, 18.97], // Southeast
    [-33.725, 18.955], // Southwest
    [-33.74, 18.955], // Close polygon
  ],

  "winelands-estate-paarl": [
    [-33.73, 18.945], // Northwest
    [-33.73, 18.96], // Northeast
    [-33.715, 18.96], // Southeast
    [-33.715, 18.945], // Southwest
    [-33.73, 18.945], // Close polygon
  ],

  "sante-wine-estate": [
    [-33.725, 18.95], // Northwest
    [-33.725, 18.965], // Northeast
    [-33.71, 18.965], // Southeast
    [-33.71, 18.95], // Southwest
    [-33.725, 18.95], // Close polygon
  ],

  "kleine-parys": [
    [-33.735, 18.935], // Northwest
    [-33.735, 18.95], // Northeast
    [-33.72, 18.95], // Southeast
    [-33.72, 18.935], // Southwest
    [-33.735, 18.935], // Close polygon
  ],

  "paarl-valleij": [
    [-33.745, 18.975], // Northwest
    [-33.745, 18.99], // Northeast
    [-33.73, 18.99], // Southeast
    [-33.73, 18.975], // Southwest
    [-33.745, 18.975], // Close polygon
  ],

  // Paarl Suburbs
  courtrai: [
    [-33.72, 18.965], // Northwest
    [-33.72, 18.98], // Northeast
    [-33.705, 18.98], // Southeast
    [-33.705, 18.965], // Southwest
    [-33.72, 18.965], // Close polygon
  ],

  lemoenkloof: [
    [-33.73, 18.97], // Northwest
    [-33.73, 18.985], // Northeast
    [-33.715, 18.985], // Southeast
    [-33.715, 18.97], // Southwest
    [-33.73, 18.97], // Close polygon
  ],

  groenvlei: [
    [-33.74, 18.96], // Northwest
    [-33.74, 18.975], // Northeast
    [-33.725, 18.975], // Southeast
    [-33.725, 18.96], // Southwest
    [-33.74, 18.96], // Close polygon
  ],

  "charleston-hill": [
    [-33.725, 18.955], // Northwest
    [-33.725, 18.97], // Northeast
    [-33.71, 18.97], // Southeast
    [-33.71, 18.955], // Southwest
    [-33.725, 18.955], // Close polygon
  ],

  "de-zoete-inval": [
    [-33.732, 18.95], // Northwest
    [-33.732, 18.965], // Northeast
    [-33.717, 18.965], // Southeast
    [-33.717, 18.95], // Southwest
    [-33.732, 18.95], // Close polygon
  ],

  "klein-nederburg": [
    [-33.728, 18.945], // Northwest
    [-33.728, 18.96], // Northeast
    [-33.713, 18.96], // Southeast
    [-33.713, 18.945], // Southwest
    [-33.728, 18.945], // Close polygon
  ],

  denneburg: [
    [-33.735, 18.94], // Northwest
    [-33.735, 18.955], // Northeast
    [-33.72, 18.955], // Southeast
    [-33.72, 18.94], // Southwest
    [-33.735, 18.94], // Close polygon
  ],

  vrykyk: [
    [-33.738, 18.935], // Northwest
    [-33.738, 18.95], // Northeast
    [-33.723, 18.95], // Southeast
    [-33.723, 18.935], // Southwest
    [-33.738, 18.935], // Close polygon
  ],

  // Stellenbosch Estates
  "de-zalze": [
    [-34.025, 18.845], // Northwest
    [-34.025, 18.885], // Northeast
    [-34.005, 18.885], // Southeast
    [-34.005, 18.845], // Southwest
    [-34.025, 18.845], // Close polygon
  ],

  devonvale: [
    [-33.98, 18.845], // Northwest
    [-33.98, 18.865], // Northeast
    [-33.96, 18.865], // Southeast
    [-33.96, 18.845], // Southwest
    [-33.98, 18.845], // Close polygon
  ],

  devonbosch: [
    [-33.96, 18.865], // Northwest
    [-33.96, 18.885], // Northeast
    [-33.94, 18.885], // Southeast
    [-33.94, 18.865], // Southwest
    [-33.96, 18.865], // Close polygon
  ],

  koelenbosch: [
    [-33.975, 18.85], // Northwest
    [-33.975, 18.87], // Northeast
    [-33.955, 18.87], // Southeast
    [-33.955, 18.85], // Southwest
    [-33.975, 18.85], // Close polygon
  ],

  "devon-valley": [
    [-33.985, 18.84], // Northwest
    [-33.985, 18.86], // Northeast
    [-33.965, 18.86], // Southeast
    [-33.965, 18.84], // Southwest
    [-33.985, 18.84], // Close polygon
  ],

  // Stellenbosch Suburbs
  "stellenbosch-central": [
    [-33.932, 18.855], // Northwest
    [-33.932, 18.875], // Northeast
    [-33.912, 18.875], // Southeast
    [-33.912, 18.855], // Southwest
    [-33.932, 18.855], // Close polygon
  ],

  dalsig: [
    [-33.93, 18.85], // Northwest
    [-33.93, 18.87], // Northeast
    [-33.91, 18.87], // Southeast
    [-33.91, 18.85], // Southwest
    [-33.93, 18.85], // Close polygon
  ],

  welgevonden: [
    [-33.935, 18.86], // Northwest
    [-33.935, 18.88], // Northeast
    [-33.915, 18.88], // Southeast
    [-33.915, 18.86], // Southwest
    [-33.935, 18.86], // Close polygon
  ],

  mostertsdrift: [
    [-33.928, 18.845], // Northwest
    [-33.928, 18.865], // Northeast
    [-33.908, 18.865], // Southeast
    [-33.908, 18.845], // Southwest
    [-33.928, 18.845], // Close polygon
  ],

  // Franschhoek Estates
  "domaine-des-anges": [
    [-33.91, 19.115], // Northwest
    [-33.91, 19.13], // Northeast
    [-33.895, 19.13], // Southeast
    [-33.895, 19.115], // Southwest
    [-33.91, 19.115], // Close polygon
  ],

  "fransche-hoek": [
    [-33.915, 19.12], // Northwest
    [-33.915, 19.135], // Northeast
    [-33.9, 19.135], // Southeast
    [-33.9, 19.12], // Southwest
    [-33.915, 19.12], // Close polygon
  ],

  "winelands-estate-franschhoek": [
    [-33.905, 19.11], // Northwest
    [-33.905, 19.125], // Northeast
    [-33.89, 19.125], // Southeast
    [-33.89, 19.11], // Southwest
    [-33.905, 19.11], // Close polygon
  ],

  "delta-crest": [
    [-33.92, 19.125], // Northwest
    [-33.92, 19.14], // Northeast
    [-33.905, 19.14], // Southeast
    [-33.905, 19.125], // Southwest
    [-33.92, 19.125], // Close polygon
  ],

  "la-petite-provence": [
    [-33.912, 19.113], // Northwest
    [-33.912, 19.128], // Northeast
    [-33.897, 19.128], // Southeast
    [-33.897, 19.113], // Southwest
    [-33.912, 19.113], // Close polygon
  ],

  // Franschhoek Suburbs
  "franschhoek-village": [
    [-33.909, 19.118], // Northwest
    [-33.909, 19.133], // Northeast
    [-33.894, 19.133], // Southeast
    [-33.894, 19.118], // Southwest
    [-33.909, 19.118], // Close polygon
  ],

  "franschhoek-rural": [
    [-33.9, 19.105], // Northwest
    [-33.9, 19.12], // Northeast
    [-33.885, 19.12], // Southeast
    [-33.885, 19.105], // Southwest
    [-33.9, 19.105], // Close polygon
  ],

  "groendal-franschhoek": [
    [-33.908, 19.123], // Northwest
    [-33.908, 19.138], // Northeast
    [-33.893, 19.138], // Southeast
    [-33.893, 19.123], // Southwest
    [-33.908, 19.123], // Close polygon
  ],

  langrug: [
    [-33.91, 19.13], // Northwest
    [-33.91, 19.145], // Northeast
    [-33.895, 19.145], // Southeast
    [-33.895, 19.13], // Southwest
    [-33.91, 19.13], // Close polygon
  ],

  "la-motte": [
    [-33.902, 19.1], // Northwest
    [-33.902, 19.115], // Northeast
    [-33.887, 19.115], // Southeast
    [-33.887, 19.1], // Southwest
    [-33.902, 19.1], // Close polygon
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
