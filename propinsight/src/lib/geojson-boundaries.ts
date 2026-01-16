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

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch boundaries: ${response.status} ${response.statusText}`
      );
      throw new Error(`Failed to fetch boundaries: ${response.statusText}`);
    }

    const data: GeoJSONResponse = await response.json();
    const boundariesMap = new Map<string, [number, number][]>();

    if (data.features && Array.isArray(data.features)) {
      console.log(
        `Fetched ${data.features.length} suburb boundaries from City of Cape Town API`
      );
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
            // Only store if boundary has sufficient detail (more than 10 points)
            if (boundary.length > 10) {
              boundariesMap.set(normalizedName, boundary);
              // Also store with original name for exact matching
              boundariesMap.set(suburbName.toLowerCase(), boundary);
              // Store with original name exactly as provided
              boundariesMap.set(suburbName, boundary);
            } else {
              console.warn(
                `Boundary for ${suburbName} has only ${boundary.length} points, skipping`
              );
            }
          }
        }
      });
      console.log(
        `Successfully loaded ${boundariesMap.size} detailed boundaries`
      );
    } else {
      console.warn("No features found in API response");
    }

    return boundariesMap;
  } catch (error) {
    console.error(
      "Error fetching suburb boundaries from City of Cape Town API:",
      error
    );
    console.error(
      "This may be due to CORS issues or network problems. Falling back to static boundaries."
    );
    return new Map();
  }
}

/**
 * Get boundary for a specific area slug
 * Uses server-side API route to avoid CORS issues and ensure accurate data
 */
const boundariesCache: Map<string, [number, number][]> = new Map();

export async function getBoundaryForArea(
  slug: string
): Promise<[number, number][] | null> {
  try {
    // Check cache first
    if (boundariesCache.has(slug)) {
      return boundariesCache.get(slug)!;
    }

    // Fetch from our server-side API route (avoids CORS, ensures accuracy)
    const response = await fetch(
      `/api/boundaries?slug=${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Boundary not found for ${slug} via API`);
        return null;
      }
      throw new Error(
        `API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success || !data.boundary || !Array.isArray(data.boundary)) {
      console.error(`Invalid boundary data for ${slug}:`, data);
      return null;
    }

    // Validate boundary has sufficient detail
    if (data.boundary.length < 10) {
      console.warn(
        `Boundary for ${slug} has only ${data.boundary.length} points - may be inaccurate`
      );
    } else {
      console.log(
        `Successfully loaded boundary for ${slug} with ${data.boundary.length} points`
      );
    }

    // Cache the result
    boundariesCache.set(slug, data.boundary);

    return data.boundary;
  } catch (error) {
    console.error(`Error getting boundary for ${slug}:`, error);
    return null;
  }
}

/**
 * Pre-fetch all boundaries (call this early if needed)
 */
export async function prefetchBoundaries(): Promise<void> {
  if (boundariesCache.size === 0) {
    await fetchSuburbBoundaries();
  }
}
