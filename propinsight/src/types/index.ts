// Area types
export type AreaLevel = "province" | "city" | "suburb";

export interface Area {
  id: string;
  name: string;
  slug: string;
  level: AreaLevel;
  parentId?: string;
  // GeoJSON polygon for map display
  boundary?: GeoJSON.Polygon;
  // Stats
  stats?: AreaStats;
}

export interface AreaStats {
  avgPrice: number;
  medianPrice: number;
  priceChangeYoY: number; // percentage
  salesCount: number; // last 12 months
  avgPricePerSqm?: number;
  propertyTypeBreakdown?: {
    houses: number;
    apartments: number;
    land: number;
  };
  propertyTypeDetails?: {
    houses: {
      salesCount: number;
      avgPrice: number;
      medianPrice: number;
      priceChangeYoY: number;
      volume: number; // total sales volume
    };
    apartments: {
      salesCount: number;
      avgPrice: number;
      medianPrice: number;
      priceChangeYoY: number;
      volume: number; // total sales volume
    };
  };
  lastUpdated: string;
}

export interface Development {
  id: string;
  name: string;
  developer: {
    name: string;
    slug: string;
    logo?: string; // URL to logo
  };
  areaId: string; // Which area this development is in
  estimatedCompletion: string; // ISO date string
  averageApartmentPrice: number;
  website: string; // URL to development website
  status: "ongoing" | "upcoming" | "completed";
}

// Report types
export interface Report {
  id: string;
  areaId: string;
  areaName: string;
  content: string; // Markdown
  htmlContent?: string;
  pdfUrl?: string;
  stripeSessionId: string; // Stripe checkout session ID - critical for security
  email: string; // Customer email who purchased this report
  createdAt: string;
}

export interface ReportPurchase {
  id: string;
  reportId: string;
  email: string;
  amount: number;
  currency: "ZAR";
  stripePaymentId?: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Price formatting
export const formatPrice = (price: number): string => {
  if (price >= 1_000_000) {
    return `R${(price / 1_000_000).toFixed(1)}M`;
  }
  if (price >= 1_000) {
    return `R${(price / 1_000).toFixed(0)}K`;
  }
  return `R${price.toFixed(0)}`;
};

export const formatPriceChange = (change: number): string => {
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
};

export const formatNumber = (num: number): string => {
  // Use consistent formatting that works the same on server and client
  // en-ZA uses space as thousands separator, but Node.js might use comma
  // Use explicit options to ensure consistency
  return new Intl.NumberFormat("en-ZA", {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};
