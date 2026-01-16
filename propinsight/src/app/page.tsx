"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  MapIcon,
  DocumentTextIcon,
  BoltIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { SearchBar } from "@/components/ui/SearchBar";
import { MapView } from "@/components/map/MapView";
import { MapModal } from "@/components/ui/MapModal";
import { AreaCard } from "@/components/area/AreaCard";
import { getAreasByLevel } from "@/data/areas";
import {
  APP_NAME,
  REPORT_PRICE_DISPLAY,
  NATIONAL_BENCHMARKS,
} from "@/lib/constants";
import { formatNumber } from "@/types";

export default function Home() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const featuredSuburbs = getAreasByLevel("suburb").slice(0, 6);
  const allSuburbs = getAreasByLevel("suburb");
  const totalSales = allSuburbs.reduce(
    (sum, area) => sum + (area.stats?.salesCount || 0),
    0
  );
  const avgPriceGrowth =
    allSuburbs.reduce(
      (sum, area) => sum + (area.stats?.priceChangeYoY || 0),
      0
    ) / allSuburbs.length;

  return (
    <div className="min-h-screen bg-white">
      {/* Floating Header - Raycast Style */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-2xl shadow-lg"
        >
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo - Left */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-sage-600 to-moss-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h1 className="text-lg font-semibold text-stone-900">
                {APP_NAME}
              </h1>
            </div>

            {/* Navigation - Centered */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              <a
                href="#features"
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all duration-200"
              >
                Features
              </a>
              <a
                href="#explore"
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all duration-200"
              >
                Explore
              </a>
              <a
                href="#pricing"
                className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-all duration-200"
              >
                Pricing
              </a>
            </nav>

            {/* CTA Button - Right */}
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="px-4 py-2 bg-sage-600 text-white text-sm font-semibold rounded-lg hover:bg-sage-700 active:bg-sage-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              View Insights
            </button>
          </div>
        </motion.div>
      </header>

      {/* Hero section - Enhanced */}
      <section className="relative bg-gradient-to-br from-white via-stone-50 to-sage-50 text-stone-900 pt-28 pb-24 md:pt-36 md:pb-32 overflow-hidden">
        {/* Enhanced decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sage-200/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-moss-200/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-terracotta-100/20 rounded-full blur-3xl"></div>
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-full shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-stone-700">
                  Live market data • Updated daily
                </span>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1] tracking-tight">
                <span className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 bg-clip-text text-transparent">
                  Property Intelligence
                </span>
                <span className="block mt-3 bg-gradient-to-r from-sage-600 via-sage-500 to-moss-600 bg-clip-text text-transparent">
                  for South Africa
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-stone-600 mb-4 font-light leading-relaxed max-w-3xl mx-auto">
                Unlock comprehensive market insights for every suburb. Make
                informed property decisions with
                <span className="font-semibold text-stone-900">
                  {" "}
                  data-driven analysis
                </span>
                .
              </p>
              <p className="text-lg text-stone-500 mb-10">
                Access real-time prices, growth trends, and market analytics
                across the Western Cape
              </p>
            </div>

            {/* Search bar with map button */}
            <div className="flex justify-center mb-8">
              <SearchBar onMapClick={() => setIsMapModalOpen(true)} />
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
              <StatBox
                value={`${avgPriceGrowth.toFixed(1)}%`}
                label="Avg Growth YoY"
                Icon={ArrowTrendingUpIcon}
              />
              <StatBox
                value={formatNumber(totalSales)}
                label="Total Sales (12m)"
                Icon={HomeIcon}
              />
              <StatBox
                value={formatNumber(allSuburbs.length)}
                label="Active Areas"
                Icon={MapPinIcon}
              />
              <StatBox
                value={`+${(
                  avgPriceGrowth - NATIONAL_BENCHMARKS.avgPropertyGrowth
                ).toFixed(1)}%`}
                label="vs National"
                Icon={BoltIcon}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section
        id="features"
        className="relative bg-white py-24 border-b border-stone-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Everything you need to
              <span className="text-sage-600"> make informed decisions</span>
            </h3>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Comprehensive market intelligence at your fingertips
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              Icon={ChartBarIcon}
              title="Real-Time Market Data"
              description="Access up-to-date property prices, sales volumes, and market trends for any suburb in the Western Cape."
            />
            <FeatureCard
              Icon={ArrowTrendingUpIcon}
              title="Growth Analytics"
              description="See year-over-year growth rates, price trends, and performance comparisons against national benchmarks."
            />
            <FeatureCard
              Icon={MapIcon}
              title="Interactive Maps"
              description="Explore areas visually with our interactive map. Click on regions to see detailed statistics instantly."
            />
            <FeatureCard
              Icon={DocumentTextIcon}
              title="Comprehensive Reports"
              description="Get 10-15 page in-depth analysis reports with historical data, growth drivers, and investment outlook."
            />
            <FeatureCard
              Icon={BoltIcon}
              title="Instant Insights"
              description="Quick stats and key metrics displayed beautifully. No need to dig through spreadsheets."
            />
            <FeatureCard
              Icon={AcademicCapIcon}
              title="Investment Intelligence"
              description="Understand market dynamics, risk factors, and opportunities to make smarter property investments."
            />
          </div>
        </div>
      </section>

      {/* Map section - Preview */}
      <section
        id="explore"
        className="relative bg-gradient-to-b from-white to-stone-50 py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Explore the Western Cape
            </h3>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto mb-6">
              Navigate our interactive map to discover market insights for any
              suburb. Click on areas to see instant statistics and trends.
            </p>
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white font-semibold rounded-xl hover:bg-sage-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <MapIcon className="w-5 h-5" />
              Open Full Map
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
            <MapView initialLevel="suburb" />
          </div>
        </div>
      </section>

      {/* Featured suburbs */}
      <section className="bg-white py-24 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Popular Areas
            </h3>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Discover insights for some of the most sought-after suburbs in the
              Western Cape
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSuburbs.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-stone-50 to-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              How It Works
            </h3>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Get comprehensive property insights in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <StepCard
              number={1}
              title="Search or Browse"
              description="Find your area of interest using our powerful search or explore the interactive map"
              Icon={MagnifyingGlassIcon}
            />
            <StepCard
              number={2}
              title="View Free Insights"
              description="See average prices, trends, sales volume, and key metrics at a glance"
              Icon={ChartBarIcon}
            />
            <StepCard
              number={3}
              title="Get Full Report"
              description={`Purchase a comprehensive 10-15 page analysis report for just ${REPORT_PRICE_DISPLAY}`}
              Icon={DocumentTextIcon}
            />
          </div>
        </div>
      </section>

      {/* Report preview */}
      <section
        id="pricing"
        className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white py-24 overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sage-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-moss-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">
              Professional Market Analysis
            </h3>
            <p className="text-stone-300 text-xl mb-2">
              Comprehensive reports with actionable insights
            </p>
            <p className="text-stone-400">
              Each report includes 10-15 pages of in-depth analysis, charts, and
              market intelligence
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 text-left shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <ReportFeature
                title="10-Year Price Analysis"
                description="Year-by-year breakdown with CAGR calculations and trend analysis"
              />
              <ReportFeature
                title="National Benchmarks"
                description="Compare performance to South African property market averages"
              />
              <ReportFeature
                title="Growth Drivers"
                description="Understand what factors are driving property prices in the area"
              />
              <ReportFeature
                title="Investment Outlook"
                description="Forward-looking scenarios and strategic recommendations"
              />
              <ReportFeature
                title="Comparable Areas"
                description="See how the area stacks up against neighboring suburbs"
              />
              <ReportFeature
                title="Risk Assessment"
                description="Identify factors that could affect property values and returns"
              />
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 text-center">
              <div className="mb-4">
                <span className="text-5xl md:text-6xl font-bold">
                  {REPORT_PRICE_DISPLAY}
                </span>
                <span className="text-stone-400 ml-3 text-lg">per report</span>
              </div>
              <p className="text-stone-400 text-sm">
                Instant delivery via email • PDF download included
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-sage-600 to-moss-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <p className="text-stone-500 text-sm">
                © 2026 {APP_NAME}. Data for informational purposes only.
              </p>
            </div>
            <div className="flex gap-6 text-sm text-stone-500">
              <a
                href="#"
                className="hover:text-sage-600 transition-colors duration-200"
              >
                Terms
              </a>
              <a
                href="#"
                className="hover:text-sage-600 transition-colors duration-200"
              >
                Privacy
              </a>
              <a
                href="#"
                className="hover:text-sage-600 transition-colors duration-200"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      >
        <MapView initialLevel="suburb" />
      </MapModal>
    </div>
  );
}

interface StatBoxProps {
  value: string;
  label: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function StatBox({ value, label, Icon }: StatBoxProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-stone-200 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <Icon className="w-6 h-6 text-sage-600 mb-3" />
      <div className="text-2xl md:text-3xl font-bold text-stone-900 mb-1">
        {value}
      </div>
      <div className="text-sm text-stone-600">{label}</div>
    </div>
  );
}

interface FeatureCardProps {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

function FeatureCard({ Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 md:p-8 hover:shadow-lg hover:border-sage-200 transition-all duration-200">
      <div className="w-12 h-12 bg-sage-50 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-sage-600" />
      </div>
      <h4 className="text-xl font-bold text-stone-900 mb-3">{title}</h4>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </div>
  );
}

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

function StepCard({ number, title, description, Icon }: StepCardProps) {
  return (
    <div className="text-center relative">
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="absolute inset-0 bg-sage-100 rounded-full blur-xl opacity-50"></div>
        <div className="relative w-16 h-16 bg-gradient-to-br from-sage-600 to-moss-600 text-white rounded-full flex items-center justify-center shadow-lg">
          <Icon className="w-7 h-7" />
        </div>
      </div>
      <div className="absolute top-8 left-1/2 -translate-x-1/2 -z-10 text-6xl font-bold text-stone-100">
        {number}
      </div>
      <h4 className="text-xl font-bold text-stone-900 mb-3">{title}</h4>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ReportFeature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <svg
        className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <div>
        <h5 className="font-semibold text-white text-lg mb-1">{title}</h5>
        <p className="text-sm text-stone-300 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
