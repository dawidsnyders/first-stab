"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  MapIcon,
  DocumentTextIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { SearchBar } from "@/components/ui/SearchBar";
import { MapModal } from "@/components/ui/MapModal";
import { MapView } from "@/components/map/MapView";
import { AreaCard } from "@/components/area/AreaCard";
import { AreaPreviewCard } from "@/components/area/AreaPreviewCard";
import { getAreasByLevel } from "@/data/areas";
import {
  APP_NAME,
  REPORT_PRICE_DISPLAY,
  NATIONAL_BENCHMARKS,
} from "@/lib/constants";
import { formatNumber } from "@/types";

export default function Home() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const featuredSuburbs = getAreasByLevel("suburb").slice(0, 6);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 500;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    }
  };
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

      {/* Hero section - Left-aligned title, right-aligned search */}
      <section className="relative bg-white text-stone-900 min-h-screen flex flex-col overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sage-100/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-moss-100/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Title and Subtitle */}
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.1,
                }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-stone-900"
              >
                Property Intelligence
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.3,
                  }}
                  className="text-sage-600"
                >
                  for South Africa
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.5,
                }}
                className="text-xl md:text-2xl text-stone-600 font-light leading-relaxed"
              >
                Make informed property decisions with comprehensive market
                insights and data-driven analysis across the Western Cape.
              </motion.p>
            </div>

            {/* Right: Search bar with visual enhancements */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.4,
              }}
              className="flex justify-center lg:justify-end relative"
            >
              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-sage-100/40 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-moss-100/30 rounded-full blur-2xl"></div>

              <div className="relative w-full max-w-lg">
                <SearchBar onMapClick={() => setIsMapModalOpen(true)} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Showcase - Ondo-Style Carousel */}
      <section
        id="features"
        className="relative bg-gradient-to-b from-white to-stone-100 pt-8 md:pt-12 pb-12 md:pb-16 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] bg-[size:32px_32px]"></div>

        <div className="relative">
          {/* Carousel Container */}
          <div className="relative">
            {/* Edge Gradients */}
            <div className="absolute left-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-r from-stone-100 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-8 md:w-24 bg-gradient-to-l from-stone-50 to-transparent z-10 pointer-events-none"></div>

            {/* Scrollable Cards */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex items-stretch gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 md:px-6 lg:px-12 pb-4"
            >
              {/* Card 1: Market Data */}
              <ProductCard
                bgColor="bg-gradient-to-br from-sage-100 to-sage-200"
                icon={
                  <div className="w-12 h-12 rounded-xl bg-sage-600/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-sage-700"
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
                  </div>
                }
                label="For Investors"
                title="Market Data"
                subtitle="Live Property Prices"
                metric="150+"
                metricLabel="Suburbs Tracked"
                description="Real-time market data updated daily across the Western Cape"
              />

              {/* Card 2: Growth Analytics */}
              <ProductCard
                bgColor="bg-gradient-to-br from-terracotta-100 to-terracotta-200"
                icon={
                  <div className="w-12 h-12 rounded-xl bg-terracotta-600/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-terracotta-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                }
                label="For Planning"
                title="Growth Analytics"
                subtitle="Historical Performance"
                metric="10yr"
                metricLabel="Price History"
                description="Track growth trends and compare against national benchmarks"
              />

              {/* Card 3: Reports */}
              <ProductCard
                bgColor="bg-gradient-to-br from-stone-100 to-stone-200"
                icon={
                  <div className="w-12 h-12 rounded-xl bg-stone-600/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-stone-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                }
                label="For Due Diligence"
                title="Area Reports"
                subtitle="Comprehensive Analysis"
                metric={REPORT_PRICE_DISPLAY}
                metricLabel="per Report"
                description="10-15 page reports with investment outlook and risk assessment"
              />

              {/* Card 4: Interactive Maps */}
              <ProductCard
                bgColor="bg-gradient-to-br from-moss-100 to-moss-200"
                icon={
                  <div className="w-12 h-12 rounded-xl bg-moss-600/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-moss-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  </div>
                }
                label="For Exploration"
                title="Interactive Maps"
                subtitle="Click & Discover"
                metric="Free"
                metricLabel="to Explore"
                description="Navigate suburbs visually and discover market insights instantly"
              />

              {/* Card 5: Investment Intelligence */}
              <ProductCard
                bgColor="bg-gradient-to-br from-sand-100 to-sand-200"
                icon={
                  <div className="w-12 h-12 rounded-xl bg-sand-500/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-sand-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                }
                label="For Smart Decisions"
                title="ROI Calculator"
                subtitle="Investment Analysis"
                metric="AI"
                metricLabel="Powered Insights"
                description="Risk assessments, ROI projections, and comparable analysis"
              />

              {/* End spacer */}
              <div className="flex-shrink-0 w-4 md:w-8"></div>
            </div>
          </div>

          {/* Controls: Navigation + Progress */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="flex items-center gap-6">
              {/* Navigation Arrows - Left aligned */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollCarousel("left")}
                  className="w-10 h-10 rounded-full bg-white border border-stone-200 flex items-center justify-center hover:bg-stone-50 hover:border-stone-300 transition-all duration-200 shadow-sm hover:shadow group"
                  aria-label="Previous"
                >
                  <svg
                    className="w-4 h-4 text-stone-600 group-hover:text-stone-900 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => scrollCarousel("right")}
                  className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center hover:bg-stone-800 transition-all duration-200 shadow-sm hover:shadow group"
                  aria-label="Next"
                >
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>

              {/* Scroll track with fixed-size thumb */}
              <div className="flex-1 h-1.5 bg-stone-200 rounded-full relative">
                <motion.div
                  className="absolute top-0 h-full w-16 bg-stone-900 rounded-full"
                  style={{
                    left: `calc(${scrollProgress}% - ${
                      scrollProgress * 0.16
                    }%)`,
                  }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Areas - Map Preview Cards */}
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
              Discover market insights for top-performing suburbs across Cape
              Town
            </p>
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white font-semibold rounded-xl hover:bg-sage-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <MapIcon className="w-5 h-5" />
              Open Full Map
            </button>
          </div>

          {/* Area Preview Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getAreasByLevel("suburb")
              .filter((area) => area.stats) // Only show areas with stats
              .slice(0, 4)
              .map((area, index) => (
                <AreaPreviewCard
                  key={area.id}
                  area={area}
                  delay={index * 0.1}
                />
              ))}
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

interface ProductCardProps {
  bgColor: string;
  icon: React.ReactNode;
  label: string;
  title: string;
  subtitle: string;
  metric: string;
  metricLabel: string;
  description: string;
  textDark?: boolean;
}

function ProductCard({
  bgColor,
  icon,
  label,
  title,
  subtitle,
  metric,
  metricLabel,
  description,
  textDark = false,
}: ProductCardProps) {
  const textColor = textDark ? "text-stone-800" : "text-stone-900";
  const textMuted = textDark ? "text-stone-600" : "text-stone-700";
  const textSubtle = textDark ? "text-stone-500" : "text-stone-600";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex-shrink-0 w-[340px] md:w-[400px] lg:w-[440px] h-[420px] md:h-[480px]"
    >
      <div
        className={`${bgColor} rounded-2xl p-6 md:p-8 h-full flex flex-col relative overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-stone-200/60`}
      >
        {/* Decorative circles */}
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/30"></div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/20"></div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          {icon}
          <span
            className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}
          >
            {label}
          </span>
        </div>

        {/* Title Section */}
        <div className="mb-4 relative z-10">
          <h4 className={`text-xl md:text-2xl font-bold ${textColor} mb-1`}>
            {title}
          </h4>
          <p className={`text-sm ${textMuted}`}>{subtitle}</p>
        </div>

        {/* Big Metric */}
        <div className="flex-grow flex items-center relative z-10 my-2">
          <div>
            <div
              className={`text-4xl md:text-5xl font-bold ${textColor} tracking-tight`}
            >
              {metric}
            </div>
            <div className={`text-sm ${textMuted} mt-1`}>{metricLabel}</div>
          </div>
        </div>

        {/* Description & Arrow */}
        <div className="flex items-end justify-between gap-4 relative z-10 mt-auto pt-4">
          <p className={`text-sm ${textSubtle} leading-relaxed flex-1`}>
            {description}
          </p>
          <div className="w-10 h-10 rounded-full bg-stone-900 flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
