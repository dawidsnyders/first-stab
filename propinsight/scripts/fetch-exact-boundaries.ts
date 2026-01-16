/**
 * Automated script to fetch EXACT boundaries from OpenStreetMap
 * This script extracts pixel-perfect boundaries for all areas and updates the hardcoded boundaries
 */

import fs from "fs";
import path from "path";

interface Area {
  slug: string;
  name: string;
  query: string;
  osmType?: "relation" | "way" | "node";
  osmId?: number;
}

const AREAS: Area[] = [
  // Cities - try multiple queries
  { slug: "cape-town", name: "Cape Town", query: "Cape Town, South Africa" },
  { slug: "paarl", name: "Paarl", query: "Paarl, Drakenstein, South Africa" },
  { slug: "stellenbosch", name: "Stellenbosch", query: "Stellenbosch, South Africa" },
  { slug: "franschhoek", name: "Franschhoek", query: "Franschhoek, South Africa" },
  // Suburbs - these are working well
  { slug: "camps-bay", name: "Camps Bay", query: "Camps Bay, Cape Town, South Africa" },
  { slug: "sea-point", name: "Sea Point", query: "Sea Point, Cape Town, South Africa" },
  { slug: "green-point", name: "Green Point", query: "Green Point, Cape Town, South Africa" },
  { slug: "woodstock", name: "Woodstock", query: "Woodstock, Cape Town, South Africa" },
  { slug: "observatory", name: "Observatory", query: "Observatory, Cape Town, South Africa" },
  { slug: "claremont", name: "Claremont", query: "Claremont, Cape Town, South Africa" },
  { slug: "constantia", name: "Constantia", query: "Constantia, Cape Town, South Africa" },
  // Estates - try different search terms
  { slug: "val-de-vie", name: "Val de Vie", query: "Val de Vie, Paarl" },
  { slug: "boschendal", name: "Boschendal", query: "Boschendal, Franschhoek" },
  { slug: "de-zalze", name: "De Zalze", query: "De Zalze Golf Estate, Stellenbosch" },
];

/**
 * Fetch boundary from OpenStreetMap Overpass API (most accurate)
 */
async function fetchBoundaryFromOverpass(area: Area): Promise<number[][] | null> {
  // First, get the OSM ID from Nominatim
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(area.query)}&format=json&limit=5&polygon_geojson=1`;
  
  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "PropInsight-Boundary-Fetcher/1.0",
      },
    });
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return null;
    }

    // Try all results to find the best polygon
    for (const result of data) {
      // If we have polygon_geojson, use it directly
      if (result.geojson) {
        if (result.geojson.type === "Polygon") {
          const coords = result.geojson.coordinates[0];
          console.log(`✓ Found polygon for ${area.name} with ${coords.length} points`);
          return coords;
        } else if (result.geojson.type === "MultiPolygon") {
          // Use the largest polygon
          const polygons = result.geojson.coordinates;
          const largest = polygons.reduce((max: number[][], poly: number[][][]) => 
            poly[0].length > max.length ? poly[0] : max, polygons[0][0]);
          console.log(`✓ Found MultiPolygon for ${area.name} with ${largest.length} points`);
          return largest;
        }
      }

      // Otherwise, query Overpass API for the full geometry
      const osmType = result.osm_type; // "relation", "way", or "node"
      const osmId = result.osm_id;

      if (osmType && osmId && (osmType === "relation" || osmType === "way")) {
        const overpassQuery = `
          [out:json][timeout:25];
          ${osmType}(id:${osmId});
          (._;>;);
          out geom;
        `;

        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
        
        const overpassResponse = await fetch(overpassUrl, {
          headers: {
            "User-Agent": "PropInsight-Boundary-Fetcher/1.0",
          },
        });

        if (overpassResponse.ok) {
          const overpassData = await overpassResponse.json();
          if (overpassData.elements && overpassData.elements.length > 0) {
            const element = overpassData.elements[0];
            if (element.geometry && Array.isArray(element.geometry)) {
              // Convert geometry to coordinates
              const coords = element.geometry.map((point: { lat: number; lon: number }) => [
                point.lon,
                point.lat,
              ]);
              // Close the polygon
              if (coords.length > 0 && (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1])) {
                coords.push(coords[0]);
              }
              if (coords.length > 3) {
                console.log(`✓ Found geometry for ${area.name} with ${coords.length} points`);
                return coords;
              }
            }
          }
        }
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch boundary with multiple fallback strategies
 */
async function fetchBoundaryWithFallback(area: Area): Promise<number[][] | null> {
  // Try multiple search queries for better results
  const queries = [
    area.query,
    `${area.name}, Western Cape, South Africa`,
    `${area.name}, South Africa`,
    area.name,
    // Special cases with more specific queries
    ...(area.slug === "cape-town" ? [
      "City of Cape Town",
      "Cape Town municipality",
      "Cape Town, City of Cape Town",
      "Cape Town metropolitan",
    ] : []),
    ...(area.slug === "paarl" ? [
      "Paarl town",
      "Paarl municipality",
      "Paarl, Drakenstein Municipality",
      "Paarl, Drakenstein",
      "Paarl urban area",
    ] : []),
    ...(area.slug === "de-zalze" ? [
      "De Zalze Golf & Wine Estate",
      "De Zalze Estate Stellenbosch",
      "De Zalze Golf Estate",
      "De Zalze, Stellenbosch",
    ] : []),
  ];

  for (const query of queries) {
    // Try Overpass first (most accurate)
    const areaWithQuery = { ...area, query };
    let boundary = await fetchBoundaryFromOverpass(areaWithQuery);
    
    if (boundary) {
      return boundary;
    }

    // Fallback to Nominatim GeoJSON - try with different parameters
    const nominatimUrls = [
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=geojson&polygon_geojson=1&limit=10`,
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=geojson&polygon_geojson=1&limit=10&addressdetails=1`,
    ];
    
    for (const nominatimUrl of nominatimUrls) {
      try {
        const response = await fetch(nominatimUrl, {
          headers: {
            "User-Agent": "PropInsight-Boundary-Fetcher/1.0",
          },
        });

        if (!response.ok) {
          continue;
        }

        const data = await response.json();
        if (data.features && data.features.length > 0) {
          // Try to find the best match (prefer Polygon over Point, prefer larger polygons)
          let bestBoundary: number[][] | null = null;
          let bestSize = 0;

          for (const feature of data.features) {
            if (feature.geometry) {
              if (feature.geometry.type === "Polygon") {
                const coords = feature.geometry.coordinates[0];
                // Prefer larger polygons (more detailed)
                if (coords.length > bestSize) {
                  bestBoundary = coords;
                  bestSize = coords.length;
                }
              } else if (feature.geometry.type === "MultiPolygon") {
                // Use the largest polygon from MultiPolygon
                const polygons = feature.geometry.coordinates;
                for (const poly of polygons) {
                  const coords = poly[0];
                  if (coords.length > bestSize) {
                    bestBoundary = coords;
                    bestSize = coords.length;
                  }
                }
              }
            }
          }

          if (bestBoundary && bestBoundary.length > 0) {
            console.log(`✓ Found GeoJSON polygon for ${area.name} with ${bestBoundary.length} points (query: "${query}")`);
            return bestBoundary;
          }
        }
      } catch (error) {
        // Continue to next URL
        continue;
      }
    }

    // Rate limit between queries
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

/**
 * Format coordinates for TypeScript code
 */
function formatCoordinates(coords: number[][]): string {
  return coords
    .map(([lng, lat]) => `        [${lng}, ${lat}],`)
    .join("\n");
}

/**
 * Main function to fetch all boundaries and update the file
 */
async function main() {
  console.log("🚀 Starting automated boundary extraction...\n");

  const boundaries: Record<string, { type: "Polygon"; coordinates: number[][][] }> = {};

  for (const area of AREAS) {
    console.log(`Fetching boundary for ${area.name}...`);
    const boundary = await fetchBoundaryWithFallback(area);
    
    if (boundary && boundary.length > 0) {
      boundaries[area.slug] = {
        type: "Polygon",
        coordinates: [boundary],
      };
      console.log(`✅ ${area.name}: ${boundary.length} points\n`);
    } else {
      console.log(`❌ ${area.name}: No boundary found\n`);
    }

    // Rate limiting - be respectful to OSM servers
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Generate the TypeScript code
  const boundariesCode = Object.entries(boundaries)
    .map(([slug, boundary]) => {
      const area = AREAS.find((a) => a.slug === slug);
      const coords = formatCoordinates(boundary.coordinates[0]);
      return `  ${slug}: {
    type: "Polygon",
    coordinates: [
      [
${coords}
      ],
    ],
  },`;
    })
    .join("\n\n");

  const fullCode = `/**
 * Hardcoded boundaries from OpenStreetMap (EXACT coordinates)
 * These boundaries are automatically extracted from OpenStreetMap Overpass API
 * Format: [lng, lat] coordinates in GeoJSON format
 * 
 * Last updated: ${new Date().toISOString()}
 * Total areas: ${Object.keys(boundaries).length}
 */
const HARDCODED_BOUNDARIES: Record<
  string,
  { type: "Polygon"; coordinates: number[][][] }
> = {
${boundariesCode}
};
`;

  // Read the current boundaries file
  const boundariesPath = path.join(
    process.cwd(),
    "src/app/api/boundaries/route.ts"
  );
  const currentFile = fs.readFileSync(boundariesPath, "utf-8");

  // Replace the HARDCODED_BOUNDARIES constant
  const startMarker = "const HARDCODED_BOUNDARIES: Record<";
  const endMarker = "};";
  
  const startIndex = currentFile.indexOf(startMarker);
  if (startIndex === -1) {
    console.error("Could not find HARDCODED_BOUNDARIES in file");
    process.exit(1);
  }

  // Find the end of the HARDCODED_BOUNDARIES constant (look for the closing brace after the object)
  let braceCount = 0;
  let inObject = false;
  let endIndex = startIndex;
  
  for (let i = startIndex; i < currentFile.length; i++) {
    if (currentFile[i] === "{") {
      braceCount++;
      inObject = true;
    } else if (currentFile[i] === "}") {
      braceCount--;
      if (inObject && braceCount === 0) {
        endIndex = i + 1;
        break;
      }
    }
  }

  // Replace the boundaries section
  const before = currentFile.substring(0, startIndex);
  const after = currentFile.substring(endIndex);
  const newFile = before + fullCode + "\n\n" + after;

  // Write the updated file
  fs.writeFileSync(boundariesPath, newFile, "utf-8");

  console.log(`\n✅ Successfully updated boundaries for ${Object.keys(boundaries).length} areas!`);
  console.log(`📝 Updated file: ${boundariesPath}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
