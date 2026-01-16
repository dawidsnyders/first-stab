import { Area } from "@/types";

// Sample data for Western Cape MVP
// In production, this would come from a database

// Get current date in YYYY-MM-DD format for up-to-date timestamps
const getCurrentDate = (): string => {
  return new Date().toISOString().split("T")[0];
};

const TODAY = getCurrentDate();

export const sampleAreas: Area[] = [
  // Province
  {
    id: "wc",
    name: "Western Cape",
    slug: "western-cape",
    level: "province",
    stats: {
      avgPrice: 2_450_000,
      medianPrice: 1_850_000,
      priceChangeYoY: 4.2,
      salesCount: 45_000,
      lastUpdated: TODAY,
    },
  },
  // Cities
  {
    id: "cpt",
    name: "Cape Town",
    slug: "cape-town",
    level: "city",
    parentId: "wc",
    stats: {
      avgPrice: 3_200_000,
      medianPrice: 2_400_000,
      priceChangeYoY: 5.8,
      salesCount: 28_000,
      lastUpdated: TODAY,
    },
  },
  {
    id: "paarl",
    name: "Paarl",
    slug: "paarl",
    level: "city",
    parentId: "wc",
    stats: {
      avgPrice: 4_100_000,
      medianPrice: 3_200_000,
      priceChangeYoY: 8.5,
      salesCount: 1_200,
      lastUpdated: TODAY,
    },
  },
  {
    id: "stellenbosch",
    name: "Stellenbosch",
    slug: "stellenbosch",
    level: "city",
    parentId: "wc",
    stats: {
      avgPrice: 4_800_000,
      medianPrice: 3_800_000,
      priceChangeYoY: 7.2,
      salesCount: 950,
      lastUpdated: TODAY,
    },
  },
  {
    id: "franschhoek",
    name: "Franschhoek",
    slug: "franschhoek",
    level: "city",
    parentId: "wc",
    stats: {
      avgPrice: 6_950_000,
      medianPrice: 5_200_000,
      priceChangeYoY: 13.8,
      salesCount: 180,
      lastUpdated: TODAY,
    },
  },
  {
    id: "hout-bay",
    name: "Hout Bay",
    slug: "hout-bay",
    level: "city",
    parentId: "wc",
    stats: {
      avgPrice: 8_200_000,
      medianPrice: 6_500_000,
      priceChangeYoY: 9.2,
      salesCount: 145,
      lastUpdated: TODAY,
    },
  },
  {
    id: "somerset-west",
    name: "Somerset West",
    slug: "somerset-west",
    level: "city",
    parentId: "wc",
    stats: {
      avgPrice: 4_500_000,
      medianPrice: 3_600_000,
      priceChangeYoY: 6.8,
      salesCount: 420,
      lastUpdated: TODAY,
    },
  },
  {
    id: "simonstown",
    name: "Simon's Town",
    slug: "simonstown",
    level: "city",
    parentId: "wc",
    stats: {
      avgPrice: 5_800_000,
      medianPrice: 4_500_000,
      priceChangeYoY: 7.5,
      salesCount: 95,
      lastUpdated: TODAY,
    },
  },
  {
    id: "strand",
    name: "Strand",
    slug: "strand",
    level: "city",
    parentId: "wc",
    stats: {
      avgPrice: 3_200_000,
      medianPrice: 2_600_000,
      priceChangeYoY: 5.5,
      salesCount: 280,
      lastUpdated: TODAY,
    },
  },
  // Cape Town Suburbs
  {
    id: "camps-bay",
    name: "Camps Bay",
    slug: "camps-bay",
    level: "suburb",
    parentId: "cpt",
    stats: {
      avgPrice: 18_500_000,
      medianPrice: 15_000_000,
      priceChangeYoY: 12.5,
      salesCount: 85,
      avgPricePerSqm: 65_000,
      propertyTypeBreakdown: {
        houses: 70,
        apartments: 28,
        land: 2,
      },
      lastUpdated: TODAY,
    },
  },
  {
    id: "sea-point",
    name: "Sea Point",
    slug: "sea-point",
    level: "suburb",
    parentId: "cpt",
    stats: {
      avgPrice: 4_200_000,
      medianPrice: 3_500_000,
      priceChangeYoY: 6.8,
      salesCount: 320,
      avgPricePerSqm: 42_000,
      propertyTypeBreakdown: {
        houses: 15,
        apartments: 82,
        land: 3,
      },
      lastUpdated: TODAY,
    },
  },
  {
    id: "green-point",
    name: "Green Point",
    slug: "green-point",
    level: "suburb",
    parentId: "cpt",
    stats: {
      avgPrice: 4_800_000,
      medianPrice: 4_100_000,
      priceChangeYoY: 7.2,
      salesCount: 180,
      avgPricePerSqm: 48_000,
      propertyTypeBreakdown: {
        houses: 20,
        apartments: 78,
        land: 2,
      },
      lastUpdated: TODAY,
    },
  },
  {
    id: "woodstock",
    name: "Woodstock",
    slug: "woodstock",
    level: "suburb",
    parentId: "cpt",
    stats: {
      avgPrice: 2_100_000,
      medianPrice: 1_800_000,
      priceChangeYoY: 9.5,
      salesCount: 145,
      avgPricePerSqm: 28_000,
      propertyTypeBreakdown: {
        houses: 35,
        apartments: 60,
        land: 5,
      },
      lastUpdated: TODAY,
    },
  },
  {
    id: "observatory",
    name: "Observatory",
    slug: "observatory",
    level: "suburb",
    parentId: "cpt",
    stats: {
      avgPrice: 2_400_000,
      medianPrice: 2_100_000,
      priceChangeYoY: 5.2,
      salesCount: 98,
      avgPricePerSqm: 26_000,
      propertyTypeBreakdown: {
        houses: 55,
        apartments: 42,
        land: 3,
      },
      lastUpdated: TODAY,
    },
  },
  {
    id: "claremont",
    name: "Claremont",
    slug: "claremont",
    level: "suburb",
    parentId: "cpt",
    stats: {
      avgPrice: 5_200_000,
      medianPrice: 4_500_000,
      priceChangeYoY: 4.8,
      salesCount: 210,
      avgPricePerSqm: 38_000,
      propertyTypeBreakdown: {
        houses: 45,
        apartments: 52,
        land: 3,
      },
      lastUpdated: TODAY,
    },
  },
  {
    id: "constantia",
    name: "Constantia",
    slug: "constantia",
    level: "suburb",
    parentId: "cpt",
    stats: {
      avgPrice: 12_500_000,
      medianPrice: 9_800_000,
      priceChangeYoY: 6.5,
      salesCount: 125,
      avgPricePerSqm: 42_000,
      propertyTypeBreakdown: {
        houses: 85,
        apartments: 10,
        land: 5,
      },
      lastUpdated: TODAY,
    },
  },
  // Estates
  {
    id: "val-de-vie",
    name: "Val de Vie",
    slug: "val-de-vie",
    level: "suburb",
    parentId: "paarl",
    stats: {
      // Merged data from Val de Vie and Pearl Valley
      avgPrice: 10_025_000, // Average of both
      medianPrice: 8_150_000, // Average of both
      priceChangeYoY: 14.05, // Average of both
      salesCount: 174, // Combined
      avgPricePerSqm: 53_000, // Average of both
      propertyTypeBreakdown: {
        houses: 67, // Average
        apartments: 7, // Average
        land: 25, // Average
      },
      lastUpdated: TODAY,
    },
  },
  {
    id: "boschendal",
    name: "Boschendal Estate",
    slug: "boschendal",
    level: "suburb",
    parentId: "paarl",
    stats: {
      avgPrice: 18_500_000,
      medianPrice: 15_000_000,
      priceChangeYoY: 18.2,
      salesCount: 24,
      avgPricePerSqm: 72_000,
      propertyTypeBreakdown: {
        houses: 85,
        apartments: 0,
        land: 15,
      },
      lastUpdated: TODAY,
    },
  },
  {
    id: "de-zalze",
    name: "De Zalze Golf & Wine Estate",
    slug: "de-zalze",
    level: "suburb",
    parentId: "stellenbosch",
    stats: {
      avgPrice: 9_500_000,
      medianPrice: 7_800_000,
      priceChangeYoY: 10.2,
      salesCount: 52,
      avgPricePerSqm: 45_000,
      propertyTypeBreakdown: {
        houses: 75,
        apartments: 10,
        land: 15,
      },
      lastUpdated: TODAY,
    },
  },
];

// Helper functions
export const getAreaBySlug = (slug: string): Area | undefined => {
  return sampleAreas.find((a) => a.slug === slug);
};

export const getAreasByLevel = (level: Area["level"]): Area[] => {
  return sampleAreas.filter((a) => a.level === level);
};

export const getChildAreas = (parentId: string): Area[] => {
  return sampleAreas.filter((a) => a.parentId === parentId);
};

export const searchAreas = (query: string): Area[] => {
  const lowerQuery = query.toLowerCase();
  return sampleAreas.filter((a) => a.name.toLowerCase().includes(lowerQuery));
};
