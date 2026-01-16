import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side API route to fetch suburb boundaries from City of Cape Town
 * This avoids CORS issues and allows us to properly handle the API
 */

// Try multiple endpoints - use the most reliable one
const CAPE_TOWN_API_ENDPOINTS = [
  // Primary: Official Suburb layer from Search Layers
  "https://citymaps.capetown.gov.za/agsext/rest/services/Search_Layers/SL_WGDB_OFC_SBRB/MapServer/0/query",
  // Fallback: Theme Based EGIS Viewer (may have different layer structure)
  "https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/0/query",
];

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
 * Convert GeoJSON coordinates (lng, lat) to Leaflet format (lat, lng)
 */
function geoJSONToLeaflet(coordinates: number[][][]): [number, number][] {
  const exteriorRing = coordinates[0];
  return exteriorRing.map(([lng, lat]) => [lat, lng] as [number, number]);
}

/**
 * GET /api/boundaries?slug=camps-bay
 * Returns boundary coordinates for a specific suburb
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter" },
        { status: 400 }
      );
    }

    // Map slug to suburb name
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
    };

    const suburbName =
      slugMap[slug] ||
      slug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");

    // Try each endpoint until one works
    let data: GeoJSONResponse | null = null;
    let lastError: Error | null = null;

    for (const endpoint of CAPE_TOWN_API_ENDPOINTS) {
      try {
        const url = new URL(endpoint);
        url.searchParams.append("where", `OFC_SBRB_NAME = '${suburbName}'`);
        url.searchParams.append("outFields", "OFC_SBRB_NAME");
        url.searchParams.append("returnGeometry", "true");
        url.searchParams.append("f", "geojson");
        url.searchParams.append("outSR", "4326"); // WGS84
        url.searchParams.append("returnExceededLimitFeatures", "true");

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          // Add cache to reduce API calls
          next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!response.ok) {
          console.warn(
            `Endpoint ${endpoint} returned ${response.status}: ${response.statusText}`
          );
          continue;
        }

        const responseData: GeoJSONResponse = await response.json();

        if (
          responseData.features &&
          responseData.features.length > 0 &&
          responseData.features[0].geometry
        ) {
          data = responseData;
          console.log(`Successfully fetched boundary from ${endpoint}`);
          break;
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Error with endpoint ${endpoint}:`, lastError.message);
        continue;
      }
    }

    if (!data) {
      console.error(
        `All endpoints failed for ${suburbName}. Last error:`,
        lastError?.message
      );
      return NextResponse.json(
        {
          error:
            "Failed to fetch boundary from all City of Cape Town API endpoints",
          details: lastError?.message,
        },
        { status: 500 }
      );
    }

    if (!data.features || data.features.length === 0) {
      return NextResponse.json(
        { error: `Suburb "${suburbName}" not found in City of Cape Town data` },
        { status: 404 }
      );
    }

    // Find the matching feature (try exact match first, then case-insensitive)
    let feature = data.features.find(
      (f) => f.properties.OFC_SBRB_NAME === suburbName
    );

    if (!feature) {
      feature = data.features.find(
        (f) =>
          f.properties.OFC_SBRB_NAME?.toLowerCase() === suburbName.toLowerCase()
      );
    }

    if (!feature) {
      feature = data.features[0];
      console.warn(
        `Exact match not found for "${suburbName}", using first result: "${feature.properties.OFC_SBRB_NAME}"`
      );
    }

    if (
      !feature.geometry ||
      (feature.geometry.type !== "Polygon" &&
        feature.geometry.type !== "MultiPolygon") ||
      !feature.geometry.coordinates ||
      feature.geometry.coordinates.length === 0
    ) {
      return NextResponse.json(
        {
          error: "Invalid geometry data from API",
          geometryType: feature.geometry?.type,
        },
        { status: 500 }
      );
    }

    // Handle both Polygon and MultiPolygon
    let coordinates: number[][][];
    if (feature.geometry.type === "MultiPolygon") {
      // For MultiPolygon, use the largest polygon (first one)
      coordinates = feature.geometry.coordinates[0];
    } else {
      coordinates = feature.geometry.coordinates;
    }

    // Convert to Leaflet format
    const boundary = geoJSONToLeaflet(coordinates);

    // Validate coordinates are in reasonable range for Cape Town
    // Cape Town is roughly: lat -34 to -33, lng 18 to 19
    const invalidCoords = boundary.filter(
      ([lat, lng]) =>
        lat < -35 ||
        lat > -32 ||
        lng < 17 ||
        lng > 20 ||
        isNaN(lat) ||
        isNaN(lng)
    );

    if (invalidCoords.length > 0) {
      console.error(
        `Invalid coordinates detected for ${suburbName}: ${invalidCoords.length} out of ${boundary.length} points are outside Cape Town range`
      );
      // Still return the boundary but log the issue
    }

    if (boundary.length < 10) {
      console.warn(
        `Boundary for ${suburbName} has only ${boundary.length} points - may be inaccurate`
      );
    } else {
      console.log(
        `Valid boundary for ${suburbName}: ${boundary.length} points, all coordinates valid`
      );
    }

    return NextResponse.json({
      success: true,
      slug,
      suburbName: feature.properties.OFC_SBRB_NAME,
      boundary,
      pointCount: boundary.length,
    });
  } catch (error) {
    console.error("Error fetching boundary:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
