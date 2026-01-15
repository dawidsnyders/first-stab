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

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-stone-900 hover:text-sage-600 transition-colors duration-200">
              {APP_NAME}
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-stone-500 hover:text-sage-600 transition-colors duration-200">
              Home
            </Link>
            <span className="text-stone-400">/</span>
            <span className="text-stone-900 font-medium">{area.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="bg-white pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <span className="text-sm text-sage-600 font-medium uppercase tracking-wide">
                {area.level}
              </span>
              <h1 className="text-4xl font-bold text-stone-900 mt-1">
                {area.name}
              </h1>
              <p className="text-stone-500 mt-2">
                Property market analysis and insights
              </p>
            </div>
            {stats && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm text-stone-500">Average Price</div>
                  <div className="text-3xl font-bold text-stone-900">
                    {formatPrice(stats.avgPrice)}
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl text-lg font-semibold ${
                    isPositive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {formatPriceChange(stats.priceChangeYoY)} YoY
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats grid */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StatsGrid stats={stats} areaName={area.name} />
        </section>
      )}

      {/* Price chart placeholder */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="text-xl font-bold text-stone-900 mb-4">
            Price Trend (3 Years)
          </h2>
          <div className="h-64 bg-stone-50 rounded-lg flex items-center justify-center border border-stone-200">
            <div className="text-center text-stone-500">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
              <p className="text-sm">Interactive price chart</p>
              <p className="text-xs text-stone-400 mt-1">
                Available in full report
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Property type breakdown */}
      {stats?.propertyTypeBreakdown && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <h2 className="text-xl font-bold text-stone-900 mb-4">
              Property Types
            </h2>
            <div className="flex gap-4">
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
      <div className="flex justify-between text-sm mb-1">
        <span className="text-stone-600">{label}</span>
        <span className="font-medium text-stone-900">{percentage}%</span>
      </div>
      <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
