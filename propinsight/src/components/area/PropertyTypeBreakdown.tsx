"use client";

import { AreaStats } from "@/types";
import { formatPrice, formatPriceChange, formatNumber } from "@/types";
import { HomeIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

interface PropertyTypeBreakdownProps {
  stats: AreaStats;
  areaName: string;
}

export function PropertyTypeBreakdown({
  stats,
  areaName,
}: PropertyTypeBreakdownProps) {
  // If we don't have detailed breakdown, calculate estimates from overall stats
  const details = stats.propertyTypeDetails || calculateEstimatedDetails(stats);

  const totalSales = details.houses.salesCount + details.apartments.salesCount;
  const housesPercentage =
    totalSales > 0 ? (details.houses.salesCount / totalSales) * 100 : 0;
  const apartmentsPercentage =
    totalSales > 0 ? (details.apartments.salesCount / totalSales) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Houses Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-sage-100 rounded-xl flex items-center justify-center">
              <HomeIcon className="w-6 h-6 text-sage-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Houses</h3>
              <p className="text-sm text-stone-500">
                {housesPercentage.toFixed(1)}% of sales
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">Sales (12 months)</span>
              <span className="text-lg font-semibold text-stone-900">
                {formatNumber(details.houses.salesCount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">Average Price</span>
              <span className="text-lg font-semibold text-stone-900">
                {formatPrice(details.houses.avgPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">Median Price</span>
              <span className="text-lg font-semibold text-stone-900">
                {formatPrice(details.houses.medianPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-stone-100">
              <span className="text-sm text-stone-600">YoY Change</span>
              <span
                className={`text-lg font-semibold ${
                  details.houses.priceChangeYoY >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPriceChange(details.houses.priceChangeYoY)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">Total Volume</span>
              <span className="text-lg font-semibold text-stone-900">
                {formatPrice(details.houses.volume)}
              </span>
            </div>
          </div>
        </div>

        {/* Apartments Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-terracotta-100 rounded-xl flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-terracotta-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900">Apartments</h3>
              <p className="text-sm text-stone-500">
                {apartmentsPercentage.toFixed(1)}% of sales
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">Sales (12 months)</span>
              <span className="text-lg font-semibold text-stone-900">
                {formatNumber(details.apartments.salesCount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">Average Price</span>
              <span className="text-lg font-semibold text-stone-900">
                {formatPrice(details.apartments.avgPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">Median Price</span>
              <span className="text-lg font-semibold text-stone-900">
                {formatPrice(details.apartments.medianPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-stone-100">
              <span className="text-sm text-stone-600">YoY Change</span>
              <span
                className={`text-lg font-semibold ${
                  details.apartments.priceChangeYoY >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPriceChange(details.apartments.priceChangeYoY)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-600">Total Volume</span>
              <span className="text-lg font-semibold text-stone-900">
                {formatPrice(details.apartments.volume)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Bar */}
      <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
        <h4 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-4">
          Market Composition Comparison
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm text-stone-600 mb-2">
              <span>Houses</span>
              <span>{housesPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sage-500 rounded-full transition-all duration-500"
                style={{ width: `${housesPercentage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm text-stone-600 mb-2">
              <span>Apartments</span>
              <span>{apartmentsPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-terracotta-500 rounded-full transition-all duration-500"
                style={{ width: `${apartmentsPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to estimate details if not provided
function calculateEstimatedDetails(stats: AreaStats) {
  const breakdown = stats.propertyTypeBreakdown || {
    houses: 50,
    apartments: 45,
    land: 5,
  };

  const housesRatio = breakdown.houses / 100;
  const apartmentsRatio = breakdown.apartments / 100;

  // Estimate prices: houses typically more expensive
  const houseMultiplier = 1.3; // Houses are typically 30% more expensive
  const apartmentMultiplier = 0.85; // Apartments are typically 15% cheaper

  const housesSales = Math.round(stats.salesCount * housesRatio);
  const apartmentsSales = Math.round(stats.salesCount * apartmentsRatio);

  const housesAvgPrice = Math.round(stats.avgPrice * houseMultiplier);
  const apartmentsAvgPrice = Math.round(stats.avgPrice * apartmentMultiplier);

  return {
    houses: {
      salesCount: housesSales,
      avgPrice: housesAvgPrice,
      medianPrice: Math.round(stats.medianPrice * houseMultiplier),
      priceChangeYoY: stats.priceChangeYoY * 0.9, // Houses grow slightly slower
      volume: housesSales * housesAvgPrice,
    },
    apartments: {
      salesCount: apartmentsSales,
      avgPrice: apartmentsAvgPrice,
      medianPrice: Math.round(stats.medianPrice * apartmentMultiplier),
      priceChangeYoY: stats.priceChangeYoY * 1.1, // Apartments grow slightly faster
      volume: apartmentsSales * apartmentsAvgPrice,
    },
  };
}
