import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarIcon, BoltIcon, CurrencyDollarIcon, SparklesIcon, ChartBarIcon, TrendingUpIcon, HomeIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { getAreaBySlug, getChildAreas, sampleAreas } from "@/data/areas";
import { getDevelopmentsByArea } from "@/data/developments";
import { formatPrice, formatPriceChange, formatNumber, Area } from "@/types";
import {
  APP_NAME,
  REPORT_PRICE_DISPLAY,
  NATIONAL_BENCHMARKS,
} from "@/lib/constants";
import { AreaCard } from "@/components/area/AreaCard";
import { StatsGrid } from "@/components/area/StatsGrid";
import { PriceTrendChartSection } from "@/components/charts/PriceTrendChartSection";
import { PropertyTypeBreakdown } from "@/components/area/PropertyTypeBreakdown";
import { DevelopmentsSection } from "@/components/area/DevelopmentsSection";
import { AreaMapWithButton } from "@/components/area/AreaMapWithButton";
import { AreaPageHeader } from "@/components/area/AreaPageHeader";
import { AreaPageClient } from "./AreaPageClient";

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
  const developments = getDevelopmentsByArea(area.id);
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

  // Generate rich market insights based on stats
  const getInterestingInfo = () => {
    if (!stats) return [];
    const info = [];

    // Market Velocity with context
    if (marketVelocity > 0) {
      const velocityContext = marketVelocity > 30 ? "Very Active" : marketVelocity > 15 ? "Active" : "Moderate";
      info.push({
        label: "Market Velocity",
        value: `${marketVelocity} sales/month`,
        subtitle: velocityContext,
        Icon: BoltIcon,
        color: marketVelocity > 30 ? "green" : marketVelocity > 15 ? "sage" : "stone",
      });
    }

    // Price per sqm comparison (if available)
    if (stats.avgPricePerSqm) {
      const pricePerSqm = stats.avgPricePerSqm;
      const affordability = pricePerSqm > 20000 ? "Premium" : pricePerSqm > 12000 ? "Moderate" : "Affordable";
      info.push({
        label: "Price per m²",
        value: formatPrice(pricePerSqm),
        subtitle: affordability,
        Icon: HomeIcon,
        color: "terracotta",
      });
    }

    // Days on market with trend
    if (avgDaysOnMarket) {
      const marketSpeed = avgDaysOnMarket < 45 ? "Fast-moving" : avgDaysOnMarket < 70 ? "Steady" : "Slower";
      info.push({
        label: "Days on Market",
        value: `${avgDaysOnMarket} days`,
        subtitle: marketSpeed,
        Icon: CalendarIcon,
        color: avgDaysOnMarket < 45 ? "green" : "stone",
      });
    }

    // Annual Sales Volume
    const annualSalesVolume = stats.medianPrice * stats.salesCount;
    if (annualSalesVolume > 0) {
      const volumeLabel = annualSalesVolume > 500000000 ? "High Volume" : annualSalesVolume > 200000000 ? "Moderate" : "Growing";
      info.push({
        label: "Annual Sales Volume",
        value: formatPrice(annualSalesVolume),
        subtitle: volumeLabel,
        Icon: CurrencyDollarIcon,
        color: "sage",
      });
    }

    // Growth trend indicator
    const growthTrend = stats.priceChangeYoY > 7 ? "Strong Growth" : stats.priceChangeYoY > 4 ? "Steady Growth" : stats.priceChangeYoY > 0 ? "Moderate" : "Declining";
    info.push({
      label: "Growth Trend",
      value: formatPriceChange(stats.priceChangeYoY),
      subtitle: growthTrend,
      Icon: TrendingUpIcon,
      color: stats.priceChangeYoY > 7 ? "green" : stats.priceChangeYoY > 0 ? "sage" : "red",
    });

    // Property type distribution (if available)
    if (stats.propertyTypeBreakdown) {
      const { houses, apartments } = stats.propertyTypeBreakdown;
      const total = (houses || 0) + (apartments || 0);
      if (total > 0) {
        const dominantType = (houses || 0) > (apartments || 0) ? "Houses" : "Apartments";
        const housePercent = total > 0 ? Math.round(((houses || 0) / total) * 100) : 0;
        info.push({
          label: "Market Composition",
          value: `${housePercent}% houses`,
          subtitle: `${dominantType} dominant`,
          Icon: BuildingOfficeIcon,
          color: "moss",
        });
      }
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
      {/* Floating Header - Raycast Style */}
      <AreaPageHeader areaName={area.name} />

      {/* Mobile Breadcrumb */}
      <div className="md:hidden bg-white border-b border-stone-100 pt-28">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-24">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Title, Description, and Key Stats */}
            <div className="lg:col-span-2 space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-stone-900 leading-tight mb-3">
                {area.name}
              </h1>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-terracotta-50 text-terracotta-700 border border-terracotta-200 capitalize">
                  {area.level}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-sage-50 text-sage-700 border border-sage-200">
                  Western Cape
                </span>
              </div>
              {/* Quick Insight Box */}
              <div className="bg-gradient-to-br from-sage-50/50 to-moss-50/30 border border-sage-200/60 rounded-xl p-5 flex gap-4 max-w-2xl">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-sage-600" />
                  </div>
                </div>
                <p className="text-lg text-stone-700 leading-relaxed flex-1">
                  {getDescription()}
                </p>
              </div>
              
              {/* Key Market Metrics */}
              {stats && (
                <div className="pt-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-stone-900 mb-2">
                      Key Market Metrics
                    </h2>
                    <p className="text-stone-600">
                      Interactive metrics with detailed charts. Click any card to
                      explore historical trends and performance data.
                    </p>
                  </div>
                  <StatsGrid stats={stats} areaName={area.name} />
                </div>
              )}
            </div>

            {/* Right: Map and Market Activity */}
            {stats && (
              <div className="lg:col-span-1 space-y-6">
                {/* Location Map */}
                <AreaMapWithButton area={area} />

                {/* Market Insights */}
                {interestingInfo.length > 0 && (
                  <div className="bg-gradient-to-br from-sage-50/50 to-moss-50/30 rounded-2xl border border-sage-100/60 p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <ChartBarIcon className="w-4 h-4 text-sage-600" />
                      <h3 className="text-xs text-sage-700 uppercase tracking-wide font-semibold">
                        Market Insights
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {interestingInfo.map((info, idx) => {
                        const Icon = info.Icon;
                        const colorClasses = {
                          green: "bg-green-100 text-green-700",
                          sage: "bg-sage-100 text-sage-700",
                          stone: "bg-stone-100 text-stone-700",
                          terracotta: "bg-terracotta-100 text-terracotta-700",
                          moss: "bg-moss-100 text-moss-700",
                          red: "bg-red-100 text-red-700",
                        };
                        const colorClass = colorClasses[info.color as keyof typeof colorClasses] || colorClasses.stone;
                        
                        return (
                          <div
                            key={idx}
                            className="bg-white/60 backdrop-blur-sm rounded-lg border border-sage-100/60 p-3 hover:bg-white/80 hover:border-sage-200 transition-all duration-200"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center mt-0.5`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs text-stone-500 mb-0.5">
                                    {info.label}
                                  </div>
                                  <div className="text-sm font-semibold text-stone-900 mb-0.5">
                                    {info.value}
                                  </div>
                                  {info.subtitle && (
                                    <div className="text-[10px] text-stone-500 font-medium">
                                      {info.subtitle}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>


      {/* Price chart */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PriceTrendChartSection stats={stats} areaName={area.name} />
        </section>
      )}

      {/* Property Type Breakdown - Houses vs Apartments */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">
                Houses vs Apartments Breakdown
              </h2>
              <p className="text-stone-600">
                A detailed comparison showing how houses and apartments perform
                differently in {area.name}. These property types have distinct
                market dynamics, prices, and growth patterns.
              </p>
            </div>
            <PropertyTypeBreakdown stats={stats} areaName={area.name} />
          </div>
        </section>
      )}

      {/* Developments Section */}
      {developments.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">
                Ongoing & Upcoming Developments
              </h2>
              <p className="text-stone-600">
                Track new developments in {area.name} from leading property
                developers. Click on any development to learn more.
              </p>
            </div>
            <DevelopmentsSection
              developments={developments}
              areaName={area.name}
            />
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

      {/* Report CTA with Intersection Observer for Sticky Footer */}
      <AreaPageClient area={area} />

      {/* Footer - Add padding bottom to account for floating CTA */}
      <footer className="bg-white border-t border-stone-200 py-8 mt-12 pb-32">
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
