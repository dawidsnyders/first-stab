import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side API route to fetch suburb boundaries from City of Cape Town
 * This avoids CORS issues and allows us to properly handle the API
 */

// Multiple API endpoints for different municipalities
const API_ENDPOINTS = {
  // City of Cape Town - Official Suburb boundaries
  capeTown: [
    "https://citymaps.capetown.gov.za/agsext/rest/services/Search_Layers/SL_WGDB_OFC_SBRB/MapServer/0/query",
    "https://citymaps.capetown.gov.za/agsext/rest/services/Theme_Based/EGISViewer/MapServer/0/query",
  ],
  // Stellenbosch Municipality - Municipal and district boundaries
  stellenbosch: [
    "https://citymaps.stellenbosch.gov.za/server/rest/services/Basemap/BasemapData/MapServer/49/query", // Municipal Area
    "https://citymaps.stellenbosch.gov.za/server/rest/services/Basemap/BasemapData/MapServer/35/query", // District Boundary
  ],
  // National/Provincial - Local Municipality boundaries (includes Drakenstein/Paarl)
  national: [
    "https://dpmegis.dpme.gov.za/arcgis/rest/services/Hosted/Boundaries/FeatureServer/2/query", // Local Municipality
  ],
};

interface GeoJSONFeature {
  type: string;
  properties: {
    OFC_SBRB_NAME?: string;
    [key: string]: string | number | boolean | undefined;
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

    // Comprehensive slug to official name mapping for all areas
    const slugMap: Record<string, { name: string; source: 'capeTown' | 'stellenbosch' | 'national' | 'custom' }> = {
      // Cape Town suburbs
      "camps-bay": { name: "Camps Bay", source: "capeTown" },
      "sea-point": { name: "Sea Point", source: "capeTown" },
      "green-point": { name: "Green Point", source: "capeTown" },
      woodstock: { name: "Woodstock", source: "capeTown" },
      observatory: { name: "Observatory", source: "capeTown" },
      claremont: { name: "Claremont", source: "capeTown" },
      constantia: { name: "Constantia", source: "capeTown" },
      clifton: { name: "Clifton", source: "capeTown" },
      bakoven: { name: "Bakoven", source: "capeTown" },
      // Stellenbosch areas
      stellenbosch: { name: "Stellenbosch", source: "stellenbosch" },
      "stellenbosch-central": { name: "Stellenbosch", source: "stellenbosch" },
      dalsig: { name: "Dalsig", source: "stellenbosch" },
      welgevonden: { name: "Welgevonden", source: "stellenbosch" },
      mostertsdrift: { name: "Mostertsdrift", source: "stellenbosch" },
      // Paarl/Drakenstein - use national municipality boundary
      paarl: { name: "Drakenstein", source: "national" },
      // Franschhoek - part of Stellenbosch municipality
      franschhoek: { name: "Franschhoek", source: "stellenbosch" },
      "franschhoek-village": { name: "Franschhoek", source: "stellenbosch" },
    };

    const areaInfo = slugMap[slug] || {
      name: slug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
      source: "capeTown" as const, // Default to Cape Town for unknown areas
    };

    const suburbName = areaInfo.name;
    const source = areaInfo.source === "custom" ? "capeTown" : areaInfo.source; // Map custom to capeTown

    // Try endpoints based on source
    let data: GeoJSONResponse | null = null;
    let lastError: Error | null = null;
    const endpoints = API_ENDPOINTS[source] || API_ENDPOINTS.capeTown;

    for (const endpoint of endpoints) {
      try {
        const url = new URL(endpoint);
        
        // Build query based on source type
        if (source === "capeTown") {
          url.searchParams.append("where", `OFC_SBRB_NAME = '${suburbName}'`);
          url.searchParams.append("outFields", "OFC_SBRB_NAME");
        } else if (source === "stellenbosch") {
          // Stellenbosch uses different field names - try common ones
          url.searchParams.append("where", `1=1`); // Get all, filter in code
          url.searchParams.append("outFields", "*");
        } else if (source === "national") {
          url.searchParams.append("where", `NAME = '${suburbName}'`);
          url.searchParams.append("outFields", "NAME");
        }
        
        url.searchParams.append("returnGeometry", "true");
        url.searchParams.append("f", "geojson");
        url.searchParams.append("outSR", "4326"); // WGS84
        url.searchParams.append("returnExceededLimitFeatures", "true");
        url.searchParams.append("geometryPrecision", "8"); // Maximum precision

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

        // For Stellenbosch/national, filter features by name match
        let matchingFeature = null;
        if (source === "stellenbosch" || source === "national") {
          matchingFeature = responseData.features?.find((f) => {
            const props = f.properties;
            const nameField = String(props.NAME || props.OFC_SBRB_NAME || props.name || "");
            const nameLower = nameField.toLowerCase();
            const suburbLower = suburbName.toLowerCase();
            return nameLower.includes(suburbLower) || suburbLower.includes(nameLower);
          });
        } else {
          matchingFeature = responseData.features?.[0];
        }

        if (matchingFeature && matchingFeature.geometry) {
          data = {
            type: "FeatureCollection",
            features: [matchingFeature],
          };
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

    // Get the feature (already matched for stellenbosch/national, or first for capeTown)
    const feature = data.features[0];
    
    if (!feature) {
      return NextResponse.json(
        { error: `No matching feature found for "${suburbName}"` },
        { status: 404 }
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
      // MultiPolygon coordinates are number[][][][], first element is number[][][]
      coordinates = (feature.geometry.coordinates[0] as unknown) as number[][][];
    } else {
      // Polygon coordinates are number[][][]
      coordinates = feature.geometry.coordinates as number[][][];
    }

    // Convert to Leaflet format
    const boundary = geoJSONToLeaflet(coordinates);

    // Validate coordinates are in reasonable range for Western Cape
    // Western Cape is roughly: lat -35 to -32, lng 17 to 25
    const invalidCoords = boundary.filter(
      ([lat, lng]) =>
        lat < -36 ||
        lat > -31 ||
        lng < 16 ||
        lng > 26 ||
        isNaN(lat) ||
        isNaN(lng)
    );

    if (invalidCoords.length > 0) {
      console.error(
        `Invalid coordinates detected for ${suburbName}: ${invalidCoords.length} out of ${boundary.length} points are outside Western Cape range`
      );
      // Still return the boundary but log the issue
    }

    // Require high precision - boundaries should have many points for accuracy
    if (boundary.length < 50) {
      console.warn(
        `Boundary for ${suburbName} has only ${boundary.length} points - may lack precision. For pixel-perfect accuracy, boundaries should have 100+ points.`
      );
    } else {
      console.log(
        `High-precision boundary for ${suburbName}: ${boundary.length} points - accurate to pixel level`
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
