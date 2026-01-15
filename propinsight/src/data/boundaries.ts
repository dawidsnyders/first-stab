import { Feature, FeatureCollection, Polygon } from 'geojson';

// GeoJSON polygon boundaries for Western Cape areas
// These are approximate boundaries for MVP - in production, use official census data

export interface AreaBoundary extends Feature<Polygon> {
  properties: {
    id: string;
    name: string;
    slug: string;
    level: 'province' | 'city' | 'suburb';
    avgPrice?: number;
    priceChangeYoY?: number;
  };
}

// Helper to create a rough polygon around a center point (available for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createPolygon(
  centerLng: number,
  centerLat: number,
  radiusKm: number = 1.5
): Polygon['coordinates'] {
  const points: [number, number][] = [];
  const numPoints = 8;
  
  // Approximate degrees per km at this latitude
  const latDegPerKm = 1 / 111;
  const lngDegPerKm = 1 / (111 * Math.cos((centerLat * Math.PI) / 180));
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    // Add some randomness to make it look more natural
    const r = radiusKm * (0.8 + Math.random() * 0.4);
    const lng = centerLng + r * lngDegPerKm * Math.cos(angle);
    const lat = centerLat + r * latDegPerKm * Math.sin(angle);
    points.push([lng, lat]);
  }
  // Close the polygon
  points.push(points[0]);
  
  return [points];
}

// Area coordinates and boundaries
export const areaBoundaries: AreaBoundary[] = [
  // Cape Town Suburbs
  {
    type: 'Feature',
    properties: {
      id: 'camps-bay',
      name: 'Camps Bay',
      slug: 'camps-bay',
      level: 'suburb',
      avgPrice: 18_500_000,
      priceChangeYoY: 12.5,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.3656, -33.9458],
          [18.3806, -33.9408],
          [18.3906, -33.9508],
          [18.3856, -33.9608],
          [18.3706, -33.9608],
          [18.3606, -33.9558],
          [18.3656, -33.9458],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'sea-point',
      name: 'Sea Point',
      slug: 'sea-point',
      level: 'suburb',
      avgPrice: 4_200_000,
      priceChangeYoY: 6.8,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.3789, -33.9067],
          [18.3989, -33.9067],
          [18.4039, -33.9167],
          [18.3989, -33.9267],
          [18.3789, -33.9267],
          [18.3739, -33.9167],
          [18.3789, -33.9067],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'green-point',
      name: 'Green Point',
      slug: 'green-point',
      level: 'suburb',
      avgPrice: 4_800_000,
      priceChangeYoY: 7.2,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.3956, -33.9002],
          [18.4156, -33.9002],
          [18.4206, -33.9092],
          [18.4156, -33.9182],
          [18.3956, -33.9182],
          [18.3906, -33.9092],
          [18.3956, -33.9002],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'woodstock',
      name: 'Woodstock',
      slug: 'woodstock',
      level: 'suburb',
      avgPrice: 2_100_000,
      priceChangeYoY: 9.5,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.4344, -33.9178],
          [18.4544, -33.9178],
          [18.4594, -33.9278],
          [18.4544, -33.9378],
          [18.4344, -33.9378],
          [18.4294, -33.9278],
          [18.4344, -33.9178],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'observatory',
      name: 'Observatory',
      slug: 'observatory',
      level: 'suburb',
      avgPrice: 2_400_000,
      priceChangeYoY: 5.2,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.4622, -33.9289],
          [18.4822, -33.9289],
          [18.4872, -33.9389],
          [18.4822, -33.9489],
          [18.4622, -33.9489],
          [18.4572, -33.9389],
          [18.4622, -33.9289],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'claremont',
      name: 'Claremont',
      slug: 'claremont',
      level: 'suburb',
      avgPrice: 5_200_000,
      priceChangeYoY: 4.8,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.4622, -33.9706],
          [18.4822, -33.9706],
          [18.4872, -33.9806],
          [18.4822, -33.9906],
          [18.4622, -33.9906],
          [18.4572, -33.9806],
          [18.4622, -33.9706],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'constantia',
      name: 'Constantia',
      slug: 'constantia',
      level: 'suburb',
      avgPrice: 12_500_000,
      priceChangeYoY: 6.5,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.4017, -34.0128],
          [18.4317, -34.0128],
          [18.4417, -34.0278],
          [18.4317, -34.0428],
          [18.4017, -34.0428],
          [18.3917, -34.0278],
          [18.4017, -34.0128],
        ],
      ],
    },
  },
  // Paarl Suburbs
  {
    type: 'Feature',
    properties: {
      id: 'val-de-vie',
      name: 'Val de Vie Estate',
      slug: 'val-de-vie',
      level: 'suburb',
      avgPrice: 11_850_000,
      priceChangeYoY: 15.3,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.9467, -33.7183],
          [18.9867, -33.7183],
          [19.0017, -33.7333],
          [18.9867, -33.7483],
          [18.9467, -33.7483],
          [18.9317, -33.7333],
          [18.9467, -33.7183],
        ],
      ],
    },
  },
  {
    type: 'Feature',
    properties: {
      id: 'pearl-valley',
      name: 'Pearl Valley',
      slug: 'pearl-valley',
      level: 'suburb',
      avgPrice: 8_200_000,
      priceChangeYoY: 12.8,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.9633, -33.7350],
          [19.0033, -33.7350],
          [19.0183, -33.7500],
          [19.0033, -33.7650],
          [18.9633, -33.7650],
          [18.9483, -33.7500],
          [18.9633, -33.7350],
        ],
      ],
    },
  },
  // Stellenbosch Suburbs
  {
    type: 'Feature',
    properties: {
      id: 'de-zalze',
      name: 'De Zalze',
      slug: 'de-zalze',
      level: 'suburb',
      avgPrice: 9_500_000,
      priceChangeYoY: 10.2,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [18.8467, -34.0017],
          [18.8867, -34.0017],
          [18.9017, -34.0167],
          [18.8867, -34.0317],
          [18.8467, -34.0317],
          [18.8317, -34.0167],
          [18.8467, -34.0017],
        ],
      ],
    },
  },
];

// Convert to FeatureCollection for Mapbox
export function getAreaBoundariesGeoJSON(): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: areaBoundaries,
  };
}

// Get boundary by area ID
export function getBoundaryById(id: string): AreaBoundary | undefined {
  return areaBoundaries.find((b) => b.properties.id === id);
}

// Get center point of a boundary
export function getBoundaryCenter(boundary: AreaBoundary): [number, number] {
  const coords = boundary.geometry.coordinates[0];
  let sumLng = 0;
  let sumLat = 0;
  const n = coords.length - 1; // Exclude closing point
  
  for (let i = 0; i < n; i++) {
    sumLng += coords[i][0];
    sumLat += coords[i][1];
  }
  
  return [sumLng / n, sumLat / n];
}

// Color scale for choropleth based on price
export function getPriceColor(price: number): string {
  // Price ranges and corresponding colors (green to red scale)
  if (price >= 15_000_000) return '#1e3a5f'; // Deep blue - ultra premium
  if (price >= 10_000_000) return '#2563eb'; // Blue - premium
  if (price >= 7_000_000) return '#3b82f6';  // Light blue - high-end
  if (price >= 5_000_000) return '#10b981';  // Green - upper mid
  if (price >= 3_000_000) return '#22c55e';  // Light green - mid
  if (price >= 2_000_000) return '#fbbf24';  // Yellow - entry
  return '#f97316'; // Orange - affordable
}

// Color scale for choropleth based on growth
export function getGrowthColor(growth: number): string {
  if (growth >= 12) return '#15803d';  // Dark green - strong growth
  if (growth >= 8) return '#22c55e';   // Green - good growth
  if (growth >= 5) return '#84cc16';   // Lime - moderate growth
  if (growth >= 2) return '#fbbf24';   // Yellow - low growth
  if (growth >= 0) return '#f97316';   // Orange - flat
  return '#ef4444'; // Red - declining
}

// Legend items for price
export const priceLegendItems = [
  { color: '#1e3a5f', label: 'R15M+', min: 15_000_000 },
  { color: '#2563eb', label: 'R10M - R15M', min: 10_000_000 },
  { color: '#3b82f6', label: 'R7M - R10M', min: 7_000_000 },
  { color: '#10b981', label: 'R5M - R7M', min: 5_000_000 },
  { color: '#22c55e', label: 'R3M - R5M', min: 3_000_000 },
  { color: '#fbbf24', label: 'R2M - R3M', min: 2_000_000 },
  { color: '#f97316', label: 'Under R2M', min: 0 },
];

// Legend items for growth
export const growthLegendItems = [
  { color: '#15803d', label: '12%+ YoY', min: 12 },
  { color: '#22c55e', label: '8% - 12%', min: 8 },
  { color: '#84cc16', label: '5% - 8%', min: 5 },
  { color: '#fbbf24', label: '2% - 5%', min: 2 },
  { color: '#f97316', label: '0% - 2%', min: 0 },
  { color: '#ef4444', label: 'Negative', min: -100 },
];
