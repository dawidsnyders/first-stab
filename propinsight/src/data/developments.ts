import { Development } from "@/types";

// Sample development data for Western Cape areas
export const sampleDevelopments: Development[] = [
  // Camps Bay
  {
    id: "camps-bay-ocean-view",
    name: "Ocean View Residences",
    developer: {
      name: "Berman Group",
      slug: "berman",
      logo: "https://via.placeholder.com/120x40?text=Berman",
    },
    areaId: "camps-bay",
    estimatedCompletion: "2026-06-30",
    averageApartmentPrice: 12_500_000,
    website: "https://www.bermangroup.co.za/ocean-view",
    status: "ongoing",
  },
  // Sea Point
  {
    id: "sea-point-coastal-living",
    name: "Coastal Living Apartments",
    developer: {
      name: "Rawson Properties",
      slug: "rawson",
      logo: "https://via.placeholder.com/120x40?text=Rawson",
    },
    areaId: "sea-point",
    estimatedCompletion: "2025-12-31",
    averageApartmentPrice: 4_800_000,
    website: "https://www.rawson.co.za/coastal-living",
    status: "ongoing",
  },
  {
    id: "sea-point-modern-heights",
    name: "Modern Heights",
    developer: {
      name: "Revo Group",
      slug: "revo",
      logo: "https://via.placeholder.com/120x40?text=Revo",
    },
    areaId: "sea-point",
    estimatedCompletion: "2026-03-15",
    averageApartmentPrice: 5_200_000,
    website: "https://www.revogroup.co.za/modern-heights",
    status: "upcoming",
  },
  // Green Point
  {
    id: "green-point-urban-core",
    name: "Urban Core Development",
    developer: {
      name: "Aquacor",
      slug: "aquacor",
      logo: "https://via.placeholder.com/120x40?text=Aquacor",
    },
    areaId: "green-point",
    estimatedCompletion: "2025-09-30",
    averageApartmentPrice: 6_500_000,
    website: "https://www.aquacor.co.za/urban-core",
    status: "ongoing",
  },
  {
    id: "green-point-harbour-view",
    name: "Harbour View Residences",
    developer: {
      name: "Berman Group",
      slug: "berman",
      logo: "https://via.placeholder.com/120x40?text=Berman",
    },
    areaId: "green-point",
    estimatedCompletion: "2026-12-31",
    averageApartmentPrice: 7_200_000,
    website: "https://www.bermangroup.co.za/harbour-view",
    status: "upcoming",
  },
  // Claremont
  {
    id: "claremont-garden-estate",
    name: "Garden Estate",
    developer: {
      name: "Rawson Properties",
      slug: "rawson",
      logo: "https://via.placeholder.com/120x40?text=Rawson",
    },
    areaId: "claremont",
    estimatedCompletion: "2025-11-30",
    averageApartmentPrice: 5_800_000,
    website: "https://www.rawson.co.za/garden-estate",
    status: "ongoing",
  },
  // Constantia
  {
    id: "constantia-vineyard-heights",
    name: "Vineyard Heights",
    developer: {
      name: "Aquacor",
      slug: "aquacor",
      logo: "https://via.placeholder.com/120x40?text=Aquacor",
    },
    areaId: "constantia",
    estimatedCompletion: "2026-08-31",
    averageApartmentPrice: 15_500_000,
    website: "https://www.aquacor.co.za/vineyard-heights",
    status: "upcoming",
  },
  // Woodstock
  {
    id: "woodstock-creative-quarter",
    name: "Creative Quarter",
    developer: {
      name: "Revo Group",
      slug: "revo",
      logo: "https://via.placeholder.com/120x40?text=Revo",
    },
    areaId: "woodstock",
    estimatedCompletion: "2025-10-15",
    averageApartmentPrice: 3_200_000,
    website: "https://www.revogroup.co.za/creative-quarter",
    status: "ongoing",
  },
];

export function getDevelopmentsByArea(areaId: string): Development[] {
  return sampleDevelopments.filter((dev) => dev.areaId === areaId);
}

export function getDevelopmentsByDeveloper(
  developerSlug: string
): Development[] {
  return sampleDevelopments.filter(
    (dev) => dev.developer.slug === developerSlug
  );
}
