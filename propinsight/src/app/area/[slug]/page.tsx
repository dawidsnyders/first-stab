import { notFound } from "next/navigation";
import Link from "next/link";
import { getAreaBySlug, getChildAreas, sampleAreas } from "@/data/areas";
import { formatPrice, formatPriceChange, formatNumber } from "@/types";
import {
  APP_NAME,
  REPORT_PRICE_DISPLAY,
  NATIONAL_BENCHMARKS,
} from "@/lib/constants";
import { AreaCard } from "@/components/area/AreaCard";
import { ReportCTA } from "./ReportCTA";
import { StatsGrid } from "@/components/area/StatsGrid";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return sampleAreas.map((area) => ({
    slug: area.slug,
  }));
}

export default async function AreaPage({ params }: PageProps) {
  const { slug } = await params;
  const area = getAreaBySlug(slug);

  if (!area) {
    notFound();
  }

  const { stats } = area;
  const childAreas = getChildAreas(area.id);
  const isPositive = stats && stats.priceChangeYoY >= 0;

  // Calculate outperformance vs national benchmark
  const outperformance = stats
    ? stats.priceChangeYoY - NATIONAL_BENCHMARKS.avgPropertyGrowth
    : 0;

  // Calculate market velocity (sales per month) for interesting info
  const marketVelocity = stats ? Math.round(stats.salesCount / 12) : 0;

  // Calculate average days on market (estimated based on sales velocity and market activity)
  const avgDaysOnMarket = stats
    ? marketVelocity > 20
      ? Math.round(45 - marketVelocity / 5)
      : Math.round(90 - marketVelocity)
    : null;

  // Generate interesting area info based on stats
  const getInterestingInfo = () => {
    if (!stats) return [];
    const info = [];

    // Days on market estimate
    if (avgDaysOnMarket) {
      info.push({
        label: "Avg Days on Market",
        value: avgDaysOnMarket.toString(),
        icon: "📅",
      });
    }

    // Sales velocity
    if (marketVelocity > 0) {
      info.push({
        label: "Sales/Month",
        value: marketVelocity.toString(),
        icon: "⚡",
      });
    }

    return info;
  };

  const interestingInfo = getInterestingInfo();

  // Generate compelling description based on stats
  const getDescription = () => {
    if (!stats) return "Property market analysis and insights";

    const outperformanceText =
      outperformance > 0
        ? `${outperformance.toFixed(1)}% above the national average`
        : outperformance < 0
        ? `${Math.abs(outperformance).toFixed(1)}% below the national average`
        : "in line with the national average";

    const growthContext =
      stats.priceChangeYoY > 7
        ? "experiencing strong growth"
        : stats.priceChangeYoY > 4
        ? "showing steady appreciation"
        : stats.priceChangeYoY > 0
        ? "maintaining positive momentum"
        : "facing market adjustments";

    return `${
      area.name
    } is ${growthContext}, with property values ${formatPriceChange(
      stats.priceChangeYoY
    )} year-over-year — ${outperformanceText}. Explore comprehensive market data, trends, and investment insights below.`;
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold text-stone-900 hover:text-sage-600 transition-colors duration-200"
            >
              {APP_NAME}
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-stone-500 hover:text-sage-600 transition-colors duration-200"
            >
              Home
            </Link>
            <span className="text-stone-400">/</span>
            <span className="text-stone-900 font-medium">{area.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-stone-50 pb-12 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Title and Description */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-sage-600 font-semibold uppercase tracking-wider bg-sage-50 px-3 py-1.5 rounded-full">
                  {area.level}
                </span>
                {stats && (
                  <div
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      isPositive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isPositive ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                        />
                      )}
                    </svg>
                    {formatPriceChange(stats.priceChangeYoY)} YoY
                  </div>
                )}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-stone-900 leading-tight">
                {area.name}
                {stats && (
                  <span
                    className={`ml-4 text-3xl md:text-4xl font-normal ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatPriceChange(stats.priceChangeYoY)}
                  </span>
                )}
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed max-w-2xl">
                {getDescription()}
              </p>
            </div>

            {/* Right: Key Stats and Interesting Info */}
            {stats && (
              <div className="lg:col-span-1 space-y-6">
                {/* Key Stats Card */}
                <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">
                        Average Price
                      </div>
                      <div className="text-3xl font-bold text-stone-900">
                        {formatPrice(stats.avgPrice)}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-stone-100">
                      <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">
                        Median Price
                      </div>
                      <div className="text-2xl font-semibold text-stone-800">
                        {formatPrice(stats.medianPrice)}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-stone-100">
                      <div className="text-xs text-stone-500 uppercase tracking-wide mb-1">
                        Sales (12 months)
                      </div>
                      <div className="text-2xl font-semibold text-stone-800">
                        {formatNumber(stats.salesCount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interesting Info */}
                {interestingInfo.length > 0 && (
                  <div className="bg-sage-50/50 rounded-2xl border border-sage-100 p-5">
                    <div className="text-xs text-sage-700 uppercase tracking-wide font-semibold mb-4">
                      Market Activity
                    </div>
                    <div className="space-y-3">
                      {interestingInfo.map((info, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{info.icon}</span>
                            <span className="text-sm text-stone-600">
                              {info.label}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-stone-900">
                            {info.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats grid */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              Key Market Metrics
            </h2>
            <p className="text-stone-600">
              Interactive metrics with detailed charts. Click any card to
              explore historical trends and performance data.
            </p>
          </div>
          <StatsGrid stats={stats} areaName={area.name} />
        </section>
      )}

      {/* Price chart placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-stone-900 mb-2">
              3-Year Price Trend Analysis
            </h2>
            <p className="text-stone-600">
              Deep dive into price movements, seasonal patterns, and market
              cycles over the past 36 months with interactive charts and
              annotations.
            </p>
          </div>
          <div className="h-80 bg-gradient-to-br from-stone-50 to-stone-100 rounded-xl flex items-center justify-center border-2 border-dashed border-stone-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-stone-200/50 opacity-20" />
            <div className="text-center text-stone-500 relative z-10">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-base font-medium text-stone-700 mb-1">
                Interactive price chart with annotations
              </p>
              <p className="text-sm text-stone-500">
                Available in the full market report
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-sage-600 font-medium">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Includes 10-year historical data
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property type breakdown */}
      {stats?.propertyTypeBreakdown && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">
                Property Type Distribution
              </h2>
              <p className="text-stone-600">
                Market composition by property type, showing the relative
                proportion of houses, apartments, and land sales in {area.name}.
              </p>
            </div>
            <div className="flex gap-6">
              <PropertyTypeBar
                label="Houses"
                percentage={stats.propertyTypeBreakdown.houses}
                color="bg-sage-500"
              />
              <PropertyTypeBar
                label="Apartments"
                percentage={stats.propertyTypeBreakdown.apartments}
                color="bg-terracotta-500"
              />
              <PropertyTypeBar
                label="Land"
                percentage={stats.propertyTypeBreakdown.land}
                color="bg-stone-400"
              />
            </div>
          </div>
        </section>
      )}

      {/* Child areas */}
      {childAreas.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-xl font-bold text-stone-900 mb-6">
            Areas in {area.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {childAreas.map((child) => (
              <AreaCard key={child.id} area={child} />
            ))}
          </div>
        </section>
      )}

      {/* Report CTA */}
      <section
        id="report"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <ReportCTA area={area} />
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-stone-500 text-sm text-center">
            Data last updated: {stats?.lastUpdated || "N/A"}. For informational
            purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}

function PropertyTypeBar({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: string;
}) {
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        <span className="text-lg font-bold text-stone-900">{percentage}%</span>
      </div>
      <div className="h-4 bg-stone-100 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${color} rounded-full transition-all duration-500 shadow-sm`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
