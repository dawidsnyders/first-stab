/**
 * Fetch and process real suburb boundaries from City of Cape Town ArcGIS REST API
 * Uses the official Official Suburb (SL_WGDB_OFC_SBRB) layer for precise boundaries
 */

const CAPE_TOWN_GEOJSON_API =
  "https://citymaps.capetown.gov.za/agsext/rest/services/Search_Layers/SL_WGDB_OFC_SBRB/MapServer/0/query";

interface GeoJSONFeature {
  type: string;
  properties: {
    OFC_SBRB_NAME?: string;
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface GeoJSONResponse {
  type: string;
  features: GeoJSONFeature[];
}

/**
 * Normalize suburb name for matching (removes special chars, lowercases)
 */
function normalizeSuburbName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

/**
 * Normalize area slug to match suburb names in GeoJSON
 * Maps our slug format to actual suburb names
 */
function slugToSuburbName(slug: string): string {
  // Map our slugs to actual suburb names in the GeoJSON
  const slugMap: Record<string, string> = {
    "camps-bay": "Camps Bay",
    "sea-point": "Sea Point",
    "green-point": "Green Point",
    woodstock: "Woodstock",
    observatory: "Observatory",
    claremont: "Claremont",
    constantia: "Constantia",
    clifton: "Clifton",
    bakoven: "Bakoven",
    "val-de-vie": "Val de Vie", // May not be in city data
    "pearl-valley": "Pearl Valley", // May not be in city data
    "de-zalze": "De Zalze", // May not be in city data
  };

  return (
    slugMap[slug] ||
    slug
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ")
  );
}

/**
 * Convert GeoJSON coordinates (lng, lat) to Leaflet format (lat, lng)
 * GeoJSON uses [lng, lat] but Leaflet uses [lat, lng]
 */
function geoJSONToLeaflet(coordinates: number[][][]): [number, number][] {
  // GeoJSON Polygon coordinates are an array of rings
  // First ring is the exterior boundary
  const exteriorRing = coordinates[0];
  return exteriorRing.map(([lng, lat]) => [lat, lng] as [number, number]);
}

/**
 * Fetch suburb boundaries from City of Cape Town API
 * Returns a map of suburb name -> boundary coordinates in Leaflet format [lat, lng][]
 */
export async function fetchSuburbBoundaries(): Promise<
  Map<string, [number, number][]>
> {
  try {
    const url = new URL(CAPE_TOWN_GEOJSON_API);
    url.searchParams.append("where", "1=1"); // Get all suburbs
    url.searchParams.append("outFields", "OFC_SBRB_NAME"); // Get suburb name field
    url.searchParams.append("returnGeometry", "true");
    url.searchParams.append("f", "geojson");
    url.searchParams.append("outSR", "4326"); // WGS84 coordinate system
    url.searchParams.append("geometryPrecision", "6"); // High precision for granular boundaries

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch boundaries: ${response.statusText}`);
    }

    const data: GeoJSONResponse = await response.json();
    const boundariesMap = new Map<string, [number, number][]>();

    if (data.features && Array.isArray(data.features)) {
      data.features.forEach((feature) => {
        if (feature.properties.OFC_SBRB_NAME && feature.geometry?.coordinates) {
          const suburbName = feature.properties.OFC_SBRB_NAME;
          const normalizedName = normalizeSuburbName(suburbName);

          // Convert GeoJSON coordinates to Leaflet format
          if (
            feature.geometry.type === "Polygon" &&
            feature.geometry.coordinates.length > 0
          ) {
            const boundary = geoJSONToLeaflet(feature.geometry.coordinates);
            boundariesMap.set(normalizedName, boundary);
            // Also store with original name for exact matching
            boundariesMap.set(suburbName.toLowerCase(), boundary);
            // Store with original name exactly as provided
            boundariesMap.set(suburbName, boundary);
          }
        }
      });
    }

    return boundariesMap;
  } catch (error) {
    console.error("Error fetching suburb boundaries:", error);
    return new Map();
  }
}

/**
 * Get boundary for a specific area slug
 * Fetches boundaries if not already cached, or uses cache
 */
let boundariesCache: Map<string, [number, number][]> | null = null;
let fetchPromise: Promise<Map<string, [number, number][]>> | null = null;

export async function getBoundaryForArea(
  slug: string
): Promise<[number, number][] | null> {
  // Ensure boundaries are loaded
  if (!boundariesCache && !fetchPromise) {
    fetchPromise = fetchSuburbBoundaries().then((boundaries) => {
      boundariesCache = boundaries;
      fetchPromise = null;
      return boundaries;
    });
  }

  // Wait for fetch to complete if needed
  const boundaries = boundariesCache || (await fetchPromise);
  if (!boundaries) return null;

  const suburbName = slugToSuburbName(slug);
  const normalizedSlug = normalizeSuburbName(slug);
  const normalizedSuburb = normalizeSuburbName(suburbName);

  // Try multiple matching strategies
  return (
    boundaries.get(suburbName) || // Exact match with mapped name
    boundaries.get(suburbName.toLowerCase()) || // Lowercase mapped name
    boundaries.get(normalizedSlug) || // Normalized slug
    boundaries.get(normalizedSuburb) || // Normalized mapped name
    // Try finding by substring match (case-insensitive)
    Array.from(boundaries.entries()).find(
      ([name]) => name.includes(normalizedSlug) || normalizedSlug.includes(name)
    )?.[1] ||
    null
  );
}

/**
 * Pre-fetch all boundaries (call this early if needed)
 */
export async function prefetchBoundaries(): Promise<void> {
  if (!boundariesCache && !fetchPromise) {
    boundariesCache = await fetchSuburbBoundaries();
  }
}
