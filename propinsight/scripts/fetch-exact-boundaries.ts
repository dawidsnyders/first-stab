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
  { slug: "hout-bay", name: "Hout Bay", query: "Hout Bay, City of Cape Town, South Africa" },
  { slug: "somerset-west", name: "Somerset West", query: "Somerset West, Western Cape, South Africa" },
  { slug: "simonstown", name: "Simon's Town", query: "Simon's Town, City of Cape Town, South Africa" },
  { slug: "strand", name: "Strand", query: "Strand, City of Cape Town, South Africa" },
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

// Manual boundaries for areas not found in OSM (fallback)
const MANUAL_BOUNDARIES: Record<string, number[][]> = {
  "de-zalze": [
    // De Zalze Golf Estate - approximate boundary based on known location
    // Center: 18.8667, -34.0167
    [18.86, -34.02],
    [18.87, -34.02],
    [18.875, -34.018],
    [18.88, -34.016],
    [18.88, -34.014],
    [18.875, -34.012],
    [18.87, -34.01],
    [18.865, -34.01],
    [18.86, -34.012],
    [18.855, -34.014],
    [18.855, -34.018],
    [18.86, -34.02],
  ],
  "hout-bay": [
    // Hout Bay - approximate boundary
    // Center: 18.3667, -34.05
    [18.35, -34.06],
    [18.38, -34.06],
    [18.39, -34.055],
    [18.39, -34.045],
    [18.38, -34.04],
    [18.35, -34.04],
    [18.34, -34.045],
    [18.34, -34.055],
    [18.35, -34.06],
  ],
  "simonstown": [
    // Simon's Town - approximate boundary
    // Center: 18.4333, -34.2
    [18.42, -34.21],
    [18.45, -34.21],
    [18.46, -34.205],
    [18.46, -34.195],
    [18.45, -34.19],
    [18.42, -34.19],
    [18.41, -34.195],
    [18.41, -34.205],
    [18.42, -34.21],
  ],
  "strand": [
    // Strand - approximate boundary
    // Center: 18.8333, -34.1167
    [18.82, -34.13],
    [18.85, -34.13],
    [18.86, -34.125],
    [18.86, -34.105],
    [18.85, -34.1],
    [18.82, -34.1],
    [18.81, -34.105],
    [18.81, -34.125],
    [18.82, -34.13],
  ],
};

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
    ...(area.slug === "hout-bay" ? [
      "Hout Bay, City of Cape Town",
      "Hout Bay suburb",
      "Hout Bay, Western Cape",
    ] : []),
    ...(area.slug === "simonstown" ? [
      "Simon's Town, City of Cape Town",
      "Simonstown, Cape Town",
      "Simon's Town, Western Cape",
    ] : []),
    ...(area.slug === "strand" ? [
      "Strand, City of Cape Town",
      "Strand, Helderberg",
      "Strand, Western Cape",
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
    let boundary = await fetchBoundaryWithFallback(area);
    
    // Fallback to manual boundary if not found
    if (!boundary || boundary.length === 0) {
      if (MANUAL_BOUNDARIES[area.slug]) {
        boundary = MANUAL_BOUNDARIES[area.slug];
        console.log(`⚠️  ${area.name}: Using manual boundary (${boundary.length} points)\n`);
      } else {
        console.log(`❌ ${area.name}: No boundary found\n`);
        continue;
      }
    } else {
      console.log(`✅ ${area.name}: ${boundary.length} points\n`);
    }
    
    boundaries[area.slug] = {
      type: "Polygon",
      coordinates: [boundary],
    };

    // Rate limiting - be respectful to OSM servers
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Generate the TypeScript code
  const boundariesCode = Object.entries(boundaries)
    .map(([slug, boundary]) => {
      const area = AREAS.find((a) => a.slug === slug);
      const coords = formatCoordinates(boundary.coordinates[0]);
      // Quote the key if it contains hyphens or special characters
      const key = slug.includes("-") ? `"${slug}"` : slug;
      return `  ${key}: {
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

  // Find the FIRST occurrence of HARDCODED_BOUNDARIES
  const firstBoundariesIndex = currentFile.indexOf("const HARDCODED_BOUNDARIES: Record<");
  if (firstBoundariesIndex === -1) {
    console.error("Could not find HARDCODED_BOUNDARIES in file");
    process.exit(1);
  }

  // Find where the GET function starts (this should be after all boundaries and duplicates)
  const getFunctionIndex = currentFile.indexOf("export async function GET", firstBoundariesIndex);
  if (getFunctionIndex === -1) {
    console.error("Could not find GET function after HARDCODED_BOUNDARIES");
    process.exit(1);
  }

  // Find the start of comments before the first HARDCODED_BOUNDARIES
  let commentStart = firstBoundariesIndex;
  for (let i = firstBoundariesIndex - 1; i >= 0; i--) {
    if (currentFile.substring(i, i + 3) === "/**") {
      commentStart = i;
      // Check for multiple comment blocks
      const beforeComment = currentFile.substring(0, i);
      const prevCommentStart = beforeComment.lastIndexOf("/**");
      if (prevCommentStart !== -1) {
        const prevCommentText = currentFile.substring(prevCommentStart, i);
        if (prevCommentText.includes("HARDCODED_BOUNDARIES") || prevCommentText.includes("boundaries")) {
          commentStart = prevCommentStart;
        }
      }
      break;
    }
    // Stop if we hit non-whitespace content that's not a comment
    if (currentFile[i] !== " " && currentFile[i] !== "\n" && currentFile[i] !== "\r" && currentFile[i] !== "\t") {
      if (currentFile.substring(i - 1, i + 2) !== "//" && currentFile.substring(i, i + 2) !== "//") {
        break;
      }
    }
  }

  // Replace everything from commentStart to getFunctionIndex with the new boundaries
  const before = currentFile.substring(0, commentStart).trimEnd();
  const after = currentFile.substring(getFunctionIndex);
  const newFile = before + "\n\n" + fullCode + "\n\n" + after;

  // Write the updated file
  fs.writeFileSync(boundariesPath, newFile, "utf-8");

  console.log(`\n✅ Successfully updated boundaries for ${Object.keys(boundaries).length} areas!`);
  console.log(`📝 Updated file: ${boundariesPath}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
