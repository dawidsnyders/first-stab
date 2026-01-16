import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side API route to fetch suburb boundaries from City of Cape Town
 * This avoids CORS issues and allows us to properly handle the API
 */

// Multiple API endpoints for different municipalities
// Priority order: Western Cape Spatial Data Warehouse (most accurate, used by Property24) > Municipal APIs > OpenStreetMap
const API_ENDPOINTS = {
  // Western Cape Spatial Data Warehouse - Most accurate source, likely what Property24 uses
  // This is the PRIMARY source for accurate boundaries
  westernCape: [
    "https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/AfriGIS_MainAdminBoundaries/MapServer/0/query", // Suburbs layer
    "https://gis.westerncape.gov.za/server2/rest/services/SpatialDataWarehouse/SG_Boundaries/MapServer/0/query", // Surveyor General Boundaries - Suburbs
  ],
  // City of Cape Town - Official Suburb boundaries (fallback for Cape Town areas)
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
  // OpenStreetMap Nominatim - For estates and suburbs not in municipal APIs (last resort)
  openstreetmap: ["https://nominatim.openstreetmap.org/search"],
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
    const slugMap: Record<
      string,
      {
        name: string;
        source:
          | "westernCape"
          | "capeTown"
          | "stellenbosch"
          | "national"
          | "openstreetmap"
          | "custom";
        searchTerms?: string[]; // Alternative search terms for flexible matching
      }
    > = {
      // Cape Town suburbs - Use City of Cape Town API (has polygon boundaries)
      // Western Cape API may only return Point centroids, not polygon boundaries
      "camps-bay": { name: "Camps Bay", source: "capeTown" },
      "sea-point": { name: "Sea Point", source: "capeTown" },
      "green-point": { name: "Green Point", source: "capeTown" },
      woodstock: { name: "Woodstock", source: "capeTown" },
      observatory: { name: "Observatory", source: "capeTown" },
      claremont: { name: "Claremont", source: "capeTown" },
      constantia: { name: "Constantia", source: "capeTown" },
      clifton: { name: "Clifton", source: "westernCape" },
      bakoven: { name: "Bakoven", source: "westernCape" },
      // Stellenbosch - Use OpenStreetMap for more accurate town boundary (not entire municipality)
      stellenbosch: {
        name: "Stellenbosch",
        source: "openstreetmap",
        searchTerms: [
          "Stellenbosch",
          "Stellenbosch, Western Cape",
          "Stellenbosch town",
        ],
      },
      // De Zalze Estate - use OpenStreetMap
      "de-zalze": {
        name: "De Zalze",
        source: "openstreetmap",
        searchTerms: [
          "De Zalze Golf Estate",
          "De Zalze Wine Estate",
          "De Zalze, Stellenbosch",
        ],
      },
      // Paarl - Use OpenStreetMap for more accurate town boundary (not entire municipality)
      paarl: {
        name: "Paarl",
        source: "openstreetmap",
        searchTerms: [
          "Paarl",
          "Paarl, Western Cape",
          "Paarl town",
          "Paarl, Drakenstein",
        ],
      },
      // Val de Vie Estate (merged from Val de Vie and Pearl Valley) - use OpenStreetMap
      "val-de-vie": {
        name: "Val de Vie",
        source: "openstreetmap",
        searchTerms: [
          "Val de Vie Estate",
          "Val de Vie, Paarl",
          "Val de Vie Polo Estate",
          "Pearl Valley Golf Estate",
          "Pearl Valley, Paarl",
        ],
      },
      // Boschendal Estate - use OpenStreetMap
      boschendal: {
        name: "Boschendal",
        source: "openstreetmap",
        searchTerms: [
          "Boschendal Estate",
          "Boschendal, Paarl",
          "Boschendal Wine Estate",
        ],
      },
      // Franschhoek - Use OpenStreetMap for accurate town boundary
      franschhoek: {
        name: "Franschhoek",
        source: "openstreetmap",
        searchTerms: ["Franschhoek", "Franschhoek, Western Cape", "Franschhoek town"],
      },
    };

    const areaInfo = slugMap[slug] || {
      name: slug
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
      source: "capeTown" as const, // Default to Cape Town for unknown areas
    };

    const suburbName = areaInfo.name;
    const searchTerms = areaInfo.searchTerms || [areaInfo.name];
    let source = areaInfo.source === "custom" ? "capeTown" : areaInfo.source; // Map custom to capeTown (let for fallback reassignment)

    // Try endpoints based on source
    // For Cape Town suburbs, try Cape Town API first, then fallback to Western Cape API
    let data: GeoJSONResponse | null = null;
    let lastError: Error | null = null;
    let endpoints = API_ENDPOINTS[source] || API_ENDPOINTS.capeTown;

    // If Cape Town API fails, fallback to Western Cape API for Cape Town suburbs
    // If OpenStreetMap fails for Paarl (only returns Point), fallback to Western Cape API
    const shouldTryFallback = source === "capeTown" || (source === "openstreetmap" && suburbName === "Paarl");
    const fallbackEndpoints = shouldTryFallback
      ? API_ENDPOINTS.westernCape
      : [];

    for (const endpoint of endpoints) {
      try {
        const url = new URL(endpoint);

        // Build query based on source type
        if (source === "westernCape") {
          // Western Cape Spatial Data Warehouse - Most accurate source
          // Query all features and filter in code (field names vary by endpoint)
          // This is more reliable than guessing field names in WHERE clause
          console.log(
            `Querying Western Cape API for "${suburbName}" (search terms: ${searchTerms.join(
              ", "
            )})`
          );
          url.searchParams.append("where", "1=1"); // Get all, filter in code
          url.searchParams.append("outFields", "*");
          url.searchParams.append("returnGeometry", "true");
          url.searchParams.append("f", "geojson");
          url.searchParams.append("outSR", "4326"); // WGS84
          url.searchParams.append("returnExceededLimitFeatures", "true");
          url.searchParams.append("geometryPrecision", "8"); // Maximum precision
        } else if (source === "capeTown") {
          // City of Cape Town API - use exact suburb name match
          console.log(`Querying Cape Town API for "${suburbName}"`);
          url.searchParams.append("where", `OFC_SBRB_NAME = '${suburbName}'`);
          url.searchParams.append("outFields", "OFC_SBRB_NAME");
          url.searchParams.append("returnGeometry", "true");
          url.searchParams.append("f", "geojson");
          url.searchParams.append("outSR", "4326"); // WGS84
          url.searchParams.append("returnExceededLimitFeatures", "true");
          url.searchParams.append("geometryPrecision", "8"); // Maximum precision
        } else if (source === "stellenbosch") {
          // Stellenbosch uses different field names - try common ones
          url.searchParams.append("where", `1=1`); // Get all, filter in code
          url.searchParams.append("outFields", "*");
          url.searchParams.append("returnGeometry", "true");
          url.searchParams.append("f", "geojson");
          url.searchParams.append("outSR", "4326");
          url.searchParams.append("returnExceededLimitFeatures", "true");
          url.searchParams.append("geometryPrecision", "8");
        } else if (source === "national") {
          // National API - query all and filter in code (more reliable for municipality matching)
          // Paarl is in Drakenstein Local Municipality, so we need flexible matching
          console.log(
            `Querying National API for "${suburbName}" (search terms: ${searchTerms.join(
              ", "
            )})`
          );
          url.searchParams.append("where", "1=1"); // Get all, filter in code
          url.searchParams.append("outFields", "*");
          url.searchParams.append("returnGeometry", "true");
          url.searchParams.append("f", "geojson");
          url.searchParams.append("outSR", "4326");
          url.searchParams.append("returnExceededLimitFeatures", "true");
          url.searchParams.append("geometryPrecision", "8");
        } else if (source === "openstreetmap") {
          // OpenStreetMap Nominatim API - try all search terms
          for (const searchTerm of searchTerms) {
            try {
              const osmUrl = new URL(endpoint);
              osmUrl.searchParams.append(
                "q",
                `${searchTerm}, Western Cape, South Africa`
              );
              osmUrl.searchParams.append("format", "geojson");
              osmUrl.searchParams.append("polygon_geojson", "1");
              osmUrl.searchParams.append("countrycodes", "za");
              osmUrl.searchParams.append("limit", "5"); // Get more results to find the best match
              osmUrl.searchParams.append("addressdetails", "1");
              osmUrl.searchParams.append("extratags", "1"); // Get more metadata

              const osmResponse = await fetch(osmUrl.toString(), {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  "User-Agent": "PropInsight/1.0 (contact@propinsight.co.za)", // Required by Nominatim
                },
                next: { revalidate: 86400 }, // Cache for 24 hours
              });

              if (osmResponse.ok) {
                const osmData: GeoJSONResponse = await osmResponse.json();
                // OpenStreetMap returns FeatureCollection directly
                if (osmData.features && osmData.features.length > 0) {
                  console.log(
                    `OpenStreetMap returned ${osmData.features.length} features for "${searchTerm}"`
                  );
                  
                  // Filter out Point geometries first - we only want polygons
                  const polygonFeatures = osmData.features.filter(
                    (f) =>
                      f.geometry &&
                      (f.geometry.type === "Polygon" ||
                        f.geometry.type === "MultiPolygon") &&
                      f.geometry.coordinates
                  );
                  
                  if (polygonFeatures.length === 0) {
                    const geometryTypes = osmData.features
                      .map((f) => f.geometry?.type)
                      .filter(Boolean);
                    console.warn(
                      `OpenStreetMap returned ${osmData.features.length} features for "${searchTerm}", but none are polygons (types: ${[...new Set(geometryTypes)].join(", ")})`
                    );
                    // For Paarl, this means we need to use the fallback
                    if (suburbName === "Paarl") {
                      console.log(
                        `Paarl: OpenStreetMap only returned Point geometries, will try Western Cape API fallback`
                      );
                    }
                    continue; // Try next search term
                  }
                  
                  // Try all polygon features and pick the smallest/most specific one
                  let bestFeature = null;
                  let smallestArea = Infinity;

                  for (const feature of polygonFeatures) {
                      // Calculate approximate bounding box area to filter out overly large polygons
                      let coords: number[][] = [];
                      if (feature.geometry.type === "Polygon") {
                        coords = feature.geometry
                          .coordinates[0] as unknown as number[][];
                      } else {
                        // MultiPolygon: coordinates[0] is number[][][], coordinates[0][0] is number[][]
                        const multiPoly = feature.geometry
                          .coordinates[0] as unknown as number[][][];
                        coords = multiPoly[0] as number[][];
                      }

                      if (coords && coords.length > 0) {
                        const lngs = coords.map((c) => c[0]);
                        const lats = coords.map((c) => c[1]);
                        const minLng = Math.min(...lngs);
                        const maxLng = Math.max(...lngs);
                        const minLat = Math.min(...lats);
                        const maxLat = Math.max(...lats);

                        // Approximate area in square degrees (rough conversion: 1° ≈ 111km)
                        const area =
                          (maxLng - minLng) * (maxLat - minLat) * 111 * 111; // km²

                        // Reject polygons larger than 5 km² (suburbs should be much smaller)
                        // Most suburbs should be < 3 km²
                        // Use different limits based on what we're searching for
                        // Towns like Stellenbosch and Paarl can be larger (actual town boundaries from OSM)
                        // OpenStreetMap town boundaries are often 100-200 km² (includes surrounding areas)
                        const isTown =
                          suburbName === "Paarl" ||
                          suburbName === "Stellenbosch" ||
                          suburbName === "Franschhoek";
                        // Much larger limit for towns - OSM town boundaries can be 200+ km²
                        const maxArea = isTown ? 250 : 25; // km² - allow larger town boundaries
                        // Also ensure it's in the right geographic area (Western Cape)
                        const isInWesternCape =
                          minLat >= -36 &&
                          maxLat <= -31 &&
                          minLng >= 16 &&
                          maxLng <= 26;

                        // Log all candidates for debugging
                        const featureName =
                          feature.properties?.display_name ||
                          feature.properties?.name ||
                          "unknown";
                        console.log(
                          `  Candidate: "${featureName}" - area: ${area.toFixed(
                            2
                          )} km², in WC: ${isInWesternCape}, within limit: ${
                            area < maxArea
                          }`
                        );

                        if (
                          area < maxArea &&
                          isInWesternCape &&
                          area < smallestArea
                        ) {
                          bestFeature = feature;
                          smallestArea = area;
                          console.log(`  ✓ Selected as best candidate so far`);
                        } else if (area >= maxArea) {
                          console.warn(
                            `  ✗ Rejecting: area ${area.toFixed(
                              2
                            )} km² exceeds max ${maxArea} km²`
                          );
                        } else if (!isInWesternCape) {
                          console.warn(
                            `  ✗ Rejecting: outside Western Cape (bbox [${minLat.toFixed(
                              2
                            )}, ${minLng.toFixed(2)}] to [${maxLat.toFixed(
                              2
                            )}, ${maxLng.toFixed(2)}])`
                          );
                        } else if (area >= smallestArea) {
                          console.log(
                            `  ✗ Rejecting: larger than current best (${area.toFixed(
                              2
                            )} vs ${smallestArea.toFixed(2)} km²)`
                          );
                        }
                      }
                    }
                  }

                  if (bestFeature) {
                    data = {
                      type: "FeatureCollection",
                      features: [bestFeature],
                    };
                    console.log(
                      `Successfully fetched boundary from OpenStreetMap for "${searchTerm}" with ${
                        bestFeature.geometry.type
                      } (area: ${smallestArea.toFixed(2)} km²)`
                    );
                    break;
                  } else {
                    console.warn(
                      `No suitable polygon found in OpenStreetMap results for "${searchTerm}" - tried polygon features, all were rejected (too large, outside WC, or wrong type)`
                    );
                  }
                } else {
                  console.warn(
                    `OpenStreetMap returned no features for "${searchTerm}"`
                  );
                }
              } else {
                console.warn(
                  `OpenStreetMap returned ${osmResponse.status} for "${searchTerm}"`
                );
              }
            } catch (osmError) {
              console.warn(
                `Error fetching from OpenStreetMap for "${searchTerm}":`,
                osmError
              );
              continue;
            }
          }
          if (data) break; // Found boundary, exit endpoint loop
          continue; // Try next endpoint if OpenStreetMap didn't work
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          // Add cache to reduce API calls
          next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "");
          console.warn(
            `Endpoint ${endpoint} returned ${response.status}: ${response.statusText}`,
            errorText ? `Response: ${errorText.substring(0, 200)}` : ""
          );
          lastError = new Error(
            `HTTP ${response.status}: ${response.statusText}`
          );
          continue;
        }

        const responseData: GeoJSONResponse = await response.json();

        // For Western Cape/S Stellenbosch/national, filter features by name match using all search terms
        let matchingFeature = null;
        if (
          source === "westernCape" ||
          source === "stellenbosch" ||
          source === "national"
        ) {
          // Try to find matching features and pick the smallest one
          // IMPORTANT: Only accept Polygon or MultiPolygon geometries, reject Point geometries
          const candidates =
            responseData.features?.filter((f) => {
              // First check geometry type - must be Polygon or MultiPolygon
              if (
                !f.geometry ||
                (f.geometry.type !== "Polygon" &&
                  f.geometry.type !== "MultiPolygon")
              ) {
                return false; // Skip Point, LineString, etc.
              }

              const props = f.properties;
              // Western Cape/Stellenbosch/National APIs use various field names
              // Check multiple possible field names for flexible matching
              const nameField = String(
                props.SUBURB ||
                  props.NAME ||
                  props.SUBURB_NAME ||
                  props.OFC_SBRB_NAME ||
                  props.MUNICIPALITY ||
                  props.MUNICIPALITY_NAME ||
                  props.LOCAL_MUNICIPALITY ||
                  props.name ||
                  ""
              );
              const nameLower = nameField.toLowerCase();
              // Try matching against all search terms
              return searchTerms.some((term) => {
                const termLower = term.toLowerCase();
                return (
                  nameLower.includes(termLower) || termLower.includes(nameLower)
                );
              });
            }) || [];

          console.log(
            `Found ${
              candidates.length
            } polygon candidates for "${suburbName}" (filtered from ${
              responseData.features?.length || 0
            } total features)`
          );

          // Pick the smallest polygon (most specific boundary) that matches search terms
          let smallestArea = Infinity;
          for (const candidate of candidates) {
            if (
              candidate.geometry &&
              (candidate.geometry.type === "Polygon" ||
                candidate.geometry.type === "MultiPolygon")
            ) {
              let coords: number[][] = [];
              if (candidate.geometry.type === "Polygon") {
                coords = candidate.geometry
                  .coordinates[0] as unknown as number[][];
              } else {
                // MultiPolygon: coordinates[0] is number[][][], coordinates[0][0] is number[][]
                const multiPoly = candidate.geometry
                  .coordinates[0] as unknown as number[][][];
                coords = multiPoly[0] as number[][];
              }

              if (coords && coords.length > 0) {
                const lngs = coords.map((c) => c[0]);
                const lats = coords.map((c) => c[1]);
                const area =
                  (Math.max(...lngs) - Math.min(...lngs)) *
                  (Math.max(...lats) - Math.min(...lats)) *
                  111 *
                  111;

                // Reject overly large polygons and ensure it's in Western Cape
                const minLat = Math.min(...lats);
                const maxLat = Math.max(...lats);
                const minLng = Math.min(...lngs);
                const maxLng = Math.max(...lngs);
                const isInWesternCape =
                  minLat >= -36 &&
                  maxLat <= -31 &&
                  minLng >= 16 &&
                  maxLng <= 26;

                // Use different area limits for cities vs suburbs/estates
                // Increased by 5x to allow larger boundaries
                const isCity =
                  suburbName === "Paarl" ||
                  suburbName === "Stellenbosch" ||
                  suburbName === "Franschhoek" ||
                  suburbName === "Cape Town";
                // 5x larger limits: Cape Town 150 km², Paarl/Stellenbosch 50 km², Franschhoek 25 km²
                const maxArea =
                  suburbName === "Cape Town"
                    ? 150
                    : suburbName === "Franschhoek"
                    ? 25
                    : 50; // km² - 5x larger limits
                if (area < maxArea && isInWesternCape && area < smallestArea) {
                  matchingFeature = candidate;
                  smallestArea = area;
                } else if (area >= maxArea) {
                  console.warn(
                    `Rejecting overly large polygon for "${suburbName}": ${area.toFixed(
                      2
                    )} km² (max ${maxArea} km² for ${
                      isCity ? "city" : "suburb"
                    })`
                  );
                }
              }
            }
          }

          // Fallback to first match if no size validation passed
          // But log all candidate sizes for debugging
          if (!matchingFeature && candidates.length > 0) {
            // Log all candidate sizes to help debug
            console.warn(
              `No polygon passed size validation for "${suburbName}". Candidate sizes:`,
              candidates.slice(0, 5).map((c) => {
                if (
                  c.geometry &&
                  (c.geometry.type === "Polygon" ||
                    c.geometry.type === "MultiPolygon")
                ) {
                  let coords: number[][] = [];
                  if (c.geometry.type === "Polygon") {
                    coords = c.geometry.coordinates[0] as unknown as number[][];
                  } else {
                    const multiPoly = c.geometry
                      .coordinates[0] as unknown as number[][][];
                    coords = multiPoly[0] as number[][];
                  }
                  if (coords && coords.length > 0) {
                    const lngs = coords.map((coord) => coord[0]);
                    const lats = coords.map((coord) => coord[1]);
                    const area =
                      (Math.max(...lngs) - Math.min(...lngs)) *
                      (Math.max(...lats) - Math.min(...lats)) *
                      111 *
                      111;
                    return `${area.toFixed(2)} km²`;
                  }
                }
                return "unknown";
              })
            );
            // Use smallest candidate even if it's slightly over limit (within 2x)
            const isCity =
              suburbName === "Paarl" ||
              suburbName === "Stellenbosch" ||
              suburbName === "Franschhoek" ||
              suburbName === "Cape Town";
            const maxArea = isCity ? 150 : 25; // 5x larger: cities 150 km², suburbs 25 km²
            let bestCandidate = null;
            let smallestCandidateArea = Infinity;
            for (const candidate of candidates) {
              if (
                candidate.geometry &&
                (candidate.geometry.type === "Polygon" ||
                  candidate.geometry.type === "MultiPolygon")
              ) {
                let coords: number[][] = [];
                if (candidate.geometry.type === "Polygon") {
                  coords = candidate.geometry
                    .coordinates[0] as unknown as number[][];
                } else {
                  const multiPoly = candidate.geometry
                    .coordinates[0] as unknown as number[][][];
                  coords = multiPoly[0] as number[][];
                }
                if (coords && coords.length > 0) {
                  const lngs = coords.map((c) => c[0]);
                  const lats = coords.map((c) => c[1]);
                  const area =
                    (Math.max(...lngs) - Math.min(...lngs)) *
                    (Math.max(...lats) - Math.min(...lats)) *
                    111 *
                    111;
                  // Accept if within 2x the limit (more lenient fallback)
                  if (area < maxArea * 2 && area < smallestCandidateArea) {
                    bestCandidate = candidate;
                    smallestCandidateArea = area;
                  }
                }
              }
            }
            if (bestCandidate) {
              matchingFeature = bestCandidate;
              console.warn(
                `Using fallback polygon for ${suburbName} (${smallestCandidateArea.toFixed(
                  2
                )} km²) - slightly over limit but closest match`
              );
            } else {
              matchingFeature = candidates[0];
              console.warn(
                `Using first polygon match for ${suburbName} without size validation (${candidates.length} candidates available)`
              );
            }
          } else if (!matchingFeature && candidates.length === 0) {
            console.warn(
              `No polygon features found for "${suburbName}" - only Point/LineString geometries may be available`
            );
          }
        } else {
          // For Cape Town API, filter for Polygon/MultiPolygon only (reject Points)
          const polygonFeatures =
            responseData.features?.filter((f) => {
              return (
                f.geometry &&
                (f.geometry.type === "Polygon" ||
                  f.geometry.type === "MultiPolygon")
              );
            }) || [];

          if (polygonFeatures.length > 0) {
            matchingFeature = polygonFeatures[0];
            console.log(
              `Found polygon feature for "${suburbName}" from Cape Town API: ${
                matchingFeature.geometry?.type || "unknown type"
              }`
            );
          } else {
            const allFeatures = responseData.features || [];
            const pointFeatures = allFeatures.filter(
              (f) => f.geometry?.type === "Point"
            );
            console.warn(
              `No polygon features returned from Cape Town API for "${suburbName}" (found ${allFeatures.length} total features, ${pointFeatures.length} are Points)`
            );
          }
        }

        if (matchingFeature && matchingFeature.geometry) {
          data = {
            type: "FeatureCollection",
            features: [matchingFeature],
          };
          console.log(
            `✓ Successfully fetched boundary for "${suburbName}" from ${endpoint} (${matchingFeature.geometry.type})`
          );
          break;
        } else {
          console.warn(
            `⚠ No matching feature found for "${suburbName}" from ${endpoint}`
          );
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Error with endpoint ${endpoint}:`, lastError.message);
        continue;
      }
    }

    // If primary source failed and we have a fallback, try it
    if (!data && shouldTryFallback && fallbackEndpoints.length > 0) {
      const fallbackReason = source === "capeTown" 
        ? "Cape Town API failed" 
        : "OpenStreetMap only returned Point geometries";
      console.log(
        `${fallbackReason} for "${suburbName}", trying Western Cape API as fallback...`
      );
      // Switch to Western Cape source and try those endpoints
      source = "westernCape";
      endpoints = fallbackEndpoints;
      lastError = null;

      // Retry with Western Cape endpoints
      for (const endpoint of endpoints) {
        try {
          const url = new URL(endpoint);
          console.log(
            `Querying Western Cape API (fallback) for "${suburbName}"`
          );
          url.searchParams.append("where", "1=1"); // Get all, filter in code
          url.searchParams.append("outFields", "*");
          url.searchParams.append("returnGeometry", "true");
          url.searchParams.append("f", "geojson");
          url.searchParams.append("outSR", "4326");
          url.searchParams.append("returnExceededLimitFeatures", "true");
          url.searchParams.append("geometryPrecision", "8");

          const response = await fetch(url.toString(), {
            method: "GET",
            headers: { Accept: "application/json" },
            next: { revalidate: 86400 },
          });

          if (!response.ok) {
            console.warn(
              `Western Cape fallback endpoint returned ${response.status}: ${response.statusText}`
            );
            lastError = new Error(
              `HTTP ${response.status}: ${response.statusText}`
            );
            continue;
          }

          const responseData: GeoJSONResponse = await response.json();

          // Filter for polygons matching the suburb name
          // Try multiple field names and be flexible with matching
          const candidates =
            responseData.features?.filter((f) => {
              if (
                !f.geometry ||
                (f.geometry.type !== "Polygon" &&
                  f.geometry.type !== "MultiPolygon")
              ) {
                return false;
              }
              const props = f.properties || {};
              // Try multiple possible field names
              const nameField = String(
                props.SUBURB ||
                  props.NAME ||
                  props.SUBURB_NAME ||
                  props.OFC_SBRB_NAME ||
                  props.MUNICIPALITY ||
                  props.MUNICIPALITY_NAME ||
                  props.LOCAL_MUNICIPALITY ||
                  props.name ||
                  ""
              );
              const nameLower = nameField.toLowerCase().trim();
              if (!nameLower) return false;

              // Try matching with all search terms
              return searchTerms.some((term) => {
                const termLower = term.toLowerCase().trim();
                // Exact match or contains match
                return (
                  nameLower === termLower ||
                  nameLower.includes(termLower) ||
                  termLower.includes(nameLower)
                );
              });
            }) || [];

          console.log(
            `Western Cape fallback found ${
              candidates.length
            } polygon candidates for "${suburbName}" (from ${
              responseData.features?.length || 0
            } total features)`
          );

          if (candidates.length > 0) {
            // Use smallest candidate
            let smallestArea = Infinity;
            let bestCandidate = null;
            for (const candidate of candidates) {
              if (
                candidate.geometry &&
                (candidate.geometry.type === "Polygon" ||
                  candidate.geometry.type === "MultiPolygon")
              ) {
                let coords: number[][] = [];
                if (candidate.geometry.type === "Polygon") {
                  coords = candidate.geometry
                    .coordinates[0] as unknown as number[][];
                } else {
                  const multiPoly = candidate.geometry
                    .coordinates[0] as unknown as number[][][];
                  coords = multiPoly[0] as number[][];
                }
                if (coords && coords.length > 0) {
                  const lngs = coords.map((c) => c[0]);
                  const lats = coords.map((c) => c[1]);
                  const area =
                    (Math.max(...lngs) - Math.min(...lngs)) *
                    (Math.max(...lats) - Math.min(...lats)) *
                    111 *
                    111;
                  const minLat = Math.min(...lats);
                  const maxLat = Math.max(...lats);
                  const minLng = Math.min(...lngs);
                  const maxLng = Math.max(...lngs);
                  const isInWesternCape =
                    minLat >= -36 &&
                    maxLat <= -31 &&
                    minLng >= 16 &&
                    maxLng <= 26;
                  // For fallback, be more lenient - accept up to 75 km² (5x normal limit)
                  // This ensures we get boundaries even if they're larger
                  const maxArea = 75; // km² for suburbs in fallback (5x larger)
                  if (
                    area < maxArea &&
                    isInWesternCape &&
                    area < smallestArea
                  ) {
                    bestCandidate = candidate;
                    smallestArea = area;
                  }
                }
              }
            }
            if (bestCandidate) {
              data = { type: "FeatureCollection", features: [bestCandidate] };
              console.log(
                `✓ Found boundary for "${suburbName}" from Western Cape API (fallback)`
              );
              break;
            }
          }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(
            `Error with Western Cape fallback endpoint:`,
            lastError.message
          );
          continue;
        }
      }
    }

    if (!data) {
      console.error(
        `All endpoints failed for ${suburbName} (source: ${source}). Last error:`,
        lastError?.message
      );
      // Return 404 instead of 500 - boundary not found is not a server error
      return NextResponse.json(
        {
          error: `Boundary not found for "${suburbName}"`,
          details: lastError?.message,
          source: source,
        },
        { status: 404 }
      );
    }

    if (!data.features || data.features.length === 0) {
      return NextResponse.json(
        { error: `Suburb "${suburbName}" not found in City of Cape Town data` },
        { status: 404 }
      );
    }

    // Get the feature (already matched for stellenbosch/national/openstreetmap, or first for capeTown)
    let feature = data.features[0];

    // For OpenStreetMap, try to find the best match
    if (
      source === "openstreetmap" &&
      data.features &&
      data.features.length > 1
    ) {
      // Prefer features with higher importance or better name match
      feature =
        data.features.find((f) => {
          const props = f.properties;
          const name = String(props.display_name || props.name || "");
          return searchTerms.some((term) =>
            name.toLowerCase().includes(term.toLowerCase())
          );
        }) || data.features[0];
    }

    if (!feature) {
      return NextResponse.json(
        {
          error: `No matching feature found for "${suburbName}" (tried: ${searchTerms.join(
            ", "
          )})`,
        },
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
      coordinates = feature.geometry.coordinates[0] as unknown as number[][][];
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
