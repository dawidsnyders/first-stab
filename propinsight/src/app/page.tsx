"use client";

import { useState, useRef, useEffect } from "react";
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
import { getAreasByLevel, searchAreas } from "@/data/areas";
import { PurchaseModal } from "@/components/area/PurchaseModal";
import { Area } from "@/types";
import { AnimatePresence } from "framer-motion";
import {
  APP_NAME,
  REPORT_PRICE_DISPLAY,
  NATIONAL_BENCHMARKS,
} from "@/lib/constants";
import { formatNumber } from "@/types";

export default function Home() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Area[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
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

  // Handle search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      const matches = searchAreas(query).slice(0, 8);
      setSearchResults(matches);
      setIsSearchOpen(matches.length > 0);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  // Handle area selection from search
  const handleAreaSelect = (area: Area) => {
    setSelectedArea(area);
    setSearchQuery(area.name);
    setIsSearchOpen(false);
  };

  // Handle buy click
  const handleBuyClick = () => {
    if (selectedArea) {
      setIsPurchaseModalOpen(true);
    }
  };

  // Close search on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getLevelBadge = (level: Area["level"]) => {
    const styles = {
      province: "bg-moss-100 text-moss-700",
      city: "bg-sage-100 text-sage-700",
      suburb: "bg-terracotta-100 text-terracotta-700",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${styles[level]}`}>
        {level}
      </span>
    );
  };

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
      <section className="relative bg-white text-stone-900 flex flex-col overflow-hidden min-h-screen z-20">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sage-100/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-moss-100/20 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[400px] pb-8">
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
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-stone-900"
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
                className="text-base md:text-lg text-stone-600 font-light leading-relaxed"
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
        className="relative bg-gradient-to-b from-white to-stone-100 pt-0 pb-12 md:pb-16 overflow-visible -mt-[85vh] z-0"
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

          {/* Navigation Arrows - Left aligned */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
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

      {/* Professional Market Analysis - Redesigned */}
      <section id="pricing" className="relative bg-gradient-to-b from-sand-50 to-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-100 overflow-hidden">
            {/* Subtle gradient accent with earthy tones */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage-500 via-sand-500 to-moss-500"></div>

            <div className="px-4 sm:px-6 lg:px-8 py-5 md:py-6">
              {/* Compact Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sage-100 to-sand-100 flex items-center justify-center flex-shrink-0 border border-sage-200/50">
                      <svg
                        className="w-4 h-4 text-sage-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="text-[10px] font-semibold text-sage-600 uppercase tracking-wider">
                      Premium Report
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-stone-900 mb-1.5 tracking-tight">
                    Professional Market Analysis
                  </h3>
                  <p className="text-sm text-stone-600 leading-snug">
                    Comprehensive 10-15 page analysis with historical data,
                    growth drivers, and actionable insights
                  </p>
                </div>
              </div>

              {/* Compact Features - Inline */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-stone-600">
                  {[
                    "10-Year Analysis",
                    "CAGR",
                    "Benchmarks",
                    "Risk Assessment",
                    "Investment Outlook",
                    "PDF Download",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-1">
                      <svg
                        className="w-3 h-3 text-sage-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-stone-200 my-4"></div>

              {/* Search and Pricing Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Left: Compact Search Bar */}
                <div className="flex-1 min-w-0 max-w-md">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onFocus={() =>
                        searchQuery.length >= 2 &&
                        setIsSearchOpen(searchResults.length > 0)
                      }
                      placeholder={selectedArea ? selectedArea.name : "Search area..."}
                      className="w-full px-3 py-2 pl-9 pr-3 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 transition-all duration-100 text-stone-900 placeholder-stone-400 shadow-sm hover:shadow-md hover:border-stone-400"
                    />
                    <svg
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    {selectedArea && (
                      <button
                        onClick={() => {
                          setSelectedArea(null);
                          setSearchQuery("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-stone-100 transition-colors duration-100"
                        aria-label="Clear selection"
                      >
                        <svg
                          className="w-3 h-3 text-stone-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}

                    {/* Search Results Dropdown - Compact */}
                    <AnimatePresence>
                      {isSearchOpen && searchResults.length > 0 && (
                        <motion.div
                          ref={searchResultsRef}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.1 }}
                          className="absolute z-50 w-full mt-1.5 bg-white border border-stone-200 rounded-lg shadow-lg overflow-hidden"
                        >
                          {searchResults.map((area) => (
                            <button
                              key={area.id}
                              onClick={() => handleAreaSelect(area)}
                              className="w-full flex items-center justify-between px-3 py-2 hover:bg-sand-50 transition-colors duration-100 text-left border-b border-stone-100 last:border-b-0 group"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="font-medium text-sm text-stone-900 truncate">
                                  {area.name}
                                </span>
                                {getLevelBadge(area.level)}
                              </div>
                              <svg
                                className="w-3.5 h-3.5 text-stone-400 group-hover:text-sage-600 flex-shrink-0 transition-colors duration-100"
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
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right: Pricing and CTA */}
                <div className="flex-shrink-0 flex flex-col sm:items-end gap-3">
                  <div>
                    <div className="text-xs text-stone-500 mb-0.5">
                      One-time payment
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                      {REPORT_PRICE_DISPLAY}
                    </div>
                  </div>
                  <motion.button
                    onClick={handleBuyClick}
                    disabled={!selectedArea}
                    whileHover={{ scale: selectedArea ? 1.01 : 1 }}
                    whileTap={{ scale: selectedArea ? 0.99 : 1 }}
                    className="group relative px-6 py-3 bg-stone-900 text-white font-semibold text-sm rounded-xl hover:bg-stone-800 transition-all duration-100 shadow-sm hover:shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Buy Report</span>
                    <svg
                      className="w-4 h-4 transition-transform duration-100 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Compact Trust indicators */}
              <div className="mt-4 pt-3 border-t border-stone-100">
                <div className="flex flex-wrap items-center gap-4 text-[10px] text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3 h-3 text-sage-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3 h-3 text-sage-600"
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
                    <span>Instant delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-3 h-3 text-sage-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>AI-powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Modal */}
        {selectedArea && (
          <PurchaseModal
            isOpen={isPurchaseModalOpen}
            onClose={() => {
              setIsPurchaseModalOpen(false);
              setSelectedArea(null);
              setSearchQuery("");
            }}
            area={selectedArea}
          />
        )}
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
