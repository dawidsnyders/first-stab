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
    [18.2, -34.1], // Northwest
    [18.7, -34.1], // Northeast
    [18.7, -33.7], // Southeast
    [18.2, -33.7], // Southwest
    [18.2, -34.1], // Close polygon
  ],

  // Camps Bay - Coastal suburb along the Atlantic seaboard
  "camps-bay": [
    [-33.9508, 18.3700], // Northwest (coastal, near Clifton)
    [-33.9508, 18.3800], // North central
    [-33.9480, 18.3850], // Northeast (inland boundary)
    [-33.9450, 18.3850], // East
    [-33.9420, 18.3780], // Southeast
    [-33.9400, 18.3700], // South (coastal road)
    [-33.9450, 18.3650], // Southwest
    [-33.9508, 18.3700], // Close polygon
  ],

  // Sea Point - Elongated coastal suburb between Clifton and Green Point
  "sea-point": [
    [-33.9167, 18.3800], // Northwest (Lion's Head/Clifton side)
    [-33.9167, 18.3980], // North (coastal stretch)
    [-33.9120, 18.4000], // Northeast
    [-33.9080, 18.4000], // East (Beach Road)
    [-33.9040, 18.3950], // Southeast
    [-33.9080, 18.3880], // South (Main Road area)
    [-33.9100, 18.3850], // Southwest
    [-33.9167, 18.3800], // Close polygon
  ],

  // Green Point - Compact area between Sea Point and V&A Waterfront
  "green-point": [
    [-33.9092, 18.4000], // Northwest (border with Sea Point)
    [-33.9092, 18.4130], // North (near Waterfront)
    [-33.9070, 18.4150], // Northeast (Waterfront boundary)
    [-33.9040, 18.4130], // East
    [-33.9030, 18.4080], // Southeast (near stadium)
    [-33.9040, 18.4050], // South
    [-33.9070, 18.4020], // Southwest
    [-33.9092, 18.4000], // Close polygon
  ],

  // Woodstock - Inner city industrial/residential area near the mountain
  "woodstock": [
    [-33.9278, 18.4380], // Northwest (mountain side)
    [-33.9278, 18.4520], // North
    [-33.9220, 18.4560], // Northeast
    [-33.9180, 18.4540], // East (towards Observatory)
    [-33.9170, 18.4480], // Southeast
    [-33.9200, 18.4420], // South (lower Woodstock)
    [-33.9240, 18.4380], // Southwest
    [-33.9278, 18.4380], // Close polygon
  ],

  // Observatory - Compact inner city area
  "observatory": [
    [-33.9389, 18.4680], // Northwest
    [-33.9389, 18.4770], // North
    [-33.9360, 18.4800], // Northeast
    [-33.9330, 18.4780], // East
    [-33.9320, 18.4730], // Southeast (Lower Main Road)
    [-33.9340, 18.4700], // South
    [-33.9360, 18.4680], // Southwest
    [-33.9389, 18.4680], // Close polygon
  ],

  // Claremont - Larger southern suburbs area, quite extensive
  "claremont": [
    [-33.9806, 18.4650], // Northwest (Newlands border)
    [-33.9806, 18.4850], // North
    [-33.9750, 18.4900], // Northeast (Wynberg side)
    [-33.9700, 18.4880], // East
    [-33.9680, 18.4820], // Southeast (Lower Claremont)
    [-33.9700, 18.4780], // South
    [-33.9750, 18.4720], // Southwest
    [-33.9806, 18.4650], // Close polygon
  ],

  // Constantia - Large wine estate area, southern suburbs
  "constantia": [
    [-34.0278, 18.3950], // Northwest (Newlands/Plumstead border)
    [-34.0278, 18.4400], // North (stretches east)
    [-34.0180, 18.4450], // Northeast
    [-34.0100, 18.4400], // East
    [-34.0080, 18.4300], // Southeast (lower Constantia)
    [-34.0100, 18.4150], // South
    [-34.0150, 18.4050], // Southwest
    [-34.0278, 18.3950], // Close polygon
  ],

  // Paarl - Wine region city
  paarl: [
    [18.93, -33.76], // Northwest
    [19.02, -33.76], // Northeast
    [19.02, -33.71], // Southeast
    [18.93, -33.71], // Southwest
    [18.93, -33.76], // Close polygon
  ],

  // Stellenbosch - Wine region city
  stellenbosch: [
    [18.81, -33.96], // Northwest
    [18.91, -33.96], // Northeast
    [18.91, -33.90], // Southeast
    [18.81, -33.90], // Southwest
    [18.81, -33.96], // Close polygon
  ],

  // Val de Vie Estate - Large estate in Paarl
  "val-de-vie": [
    [18.955, -33.745], // Northwest
    [18.975, -33.745], // Northeast
    [18.975, -33.725], // Southeast
    [18.955, -33.725], // Southwest
    [18.955, -33.745], // Close polygon
  ],

  // Pearl Valley - Estate in Paarl
  "pearl-valley": [
    [18.970, -33.760], // Northwest
    [18.995, -33.760], // Northeast
    [18.995, -33.745], // Southeast
    [18.970, -33.745], // Southwest
    [18.970, -33.760], // Close polygon
  ],

  // De Zalze - Estate in Stellenbosch
  "de-zalze": [
    [18.845, -34.025], // Northwest
    [18.885, -34.025], // Northeast
    [18.885, -34.005], // Southeast
    [18.845, -34.005], // Southwest
    [18.845, -34.025], // Close polygon
  ],
};

/**
 * Get boundary polygon for an area
 * Returns coordinates in [lat, lng] format for Leaflet
 */
export function getAreaBoundaryPolygon(areaSlug: string): [number, number][] | null {
  return AREA_BOUNDARIES[areaSlug] || null;
}

/**
 * Check if an area has a defined boundary
 */
export function hasAreaBoundary(areaSlug: string): boolean {
  return areaSlug in AREA_BOUNDARIES;
}
