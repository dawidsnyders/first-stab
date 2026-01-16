"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area } from "@/types";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";
import { searchAreas } from "@/data/areas";

interface ReportCTAProps {
  area: Area;
}

export function ReportCTA({ area }: ReportCTAProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Area[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area>(area);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buyingArea, setBuyingArea] = useState<Area | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);

  // Update search results when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const matches = searchAreas(searchQuery).slice(0, 8);
      setSearchResults(matches);
      setIsSearchOpen(matches.length > 0);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
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

  const handlePurchase = async (areaSlug: string, email: string) => {
    setIsSubmitting(true);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          areaSlug,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const handleBuyReport = (area: Area) => {
    setBuyingArea(area);
    setSelectedArea(area);
    setSearchQuery(area.name);
    setIsSearchOpen(false);
  };

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyingArea || !email.trim()) return;
    await handlePurchase(buyingArea.slug, email.trim());
  };

  const getLevelBadge = (level: Area["level"]) => {
    const styles = {
      province: "bg-moss-100 text-moss-700",
      city: "bg-sage-100 text-sage-700",
      suburb: "bg-terracotta-100 text-terracotta-700",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${styles[level]}`}
      >
        {level}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-sage-600 to-moss-600 rounded-2xl overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="max-w-5xl">
          <h2 className="text-2xl md:text-2xl font-bold text-white mb-2">
            Get the Full Market Analysis Report
          </h2>
          <p className="text-sage-50 text-base mb-6">
            A comprehensive 10-15 page market analysis with historical data,
            growth drivers, investment outlook, and actionable insights.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
            {[
              "10-Year Price Analysis",
              "CAGR Calculations",
              "National Benchmarks",
              "Growth Driver Analysis",
              "Risk Assessment",
              "Investment Outlook",
              "Comparable Areas",
              "PDF Download",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-1.5 text-sage-50"
              >
                <svg
                  className="w-4 h-4 text-terracotta-300 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* Search and Pricing - Two column layout */}
          <div className="grid md:grid-cols-2 gap-6 items-end">
            {/* Left: Search bar */}
            <div className="relative">
              <label className="block text-sage-50 text-sm font-medium mb-2">
                Search for an area
              </label>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() =>
                    searchQuery.length >= 2 &&
                    setIsSearchOpen(searchResults.length > 0)
                  }
                  placeholder="Type area name..."
                  className="w-full px-4 py-3 pl-12 pr-4 text-base border border-white/20 bg-white/10 backdrop-blur-sm rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70"
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

                {/* Search results dropdown */}
                <AnimatePresence>
                  {isSearchOpen && searchResults.length > 0 && (
                    <motion.div
                      ref={searchResultsRef}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden"
                    >
                      {searchResults.map((resultArea) => (
                        <div
                          key={resultArea.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 transition-colors duration-200 border-b border-stone-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="font-medium text-stone-900 truncate">
                              {resultArea.name}
                            </span>
                            {getLevelBadge(resultArea.level)}
                          </div>
                          <button
                            onClick={() => handleBuyReport(resultArea)}
                            disabled={isSubmitting}
                            className="px-4 py-1.5 bg-sage-600 text-white text-sm font-semibold rounded-lg hover:bg-sage-700 active:bg-sage-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ml-4 flex-shrink-0"
                          >
                            Buy Report
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Email input form when buying */}
              <AnimatePresence>
                {buyingArea && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleBuySubmit}
                    className="mt-4 flex flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      autoFocus
                      className="flex-1 px-4 py-2.5 rounded-xl text-stone-900 placeholder-stone-400 bg-white/95 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition-all duration-200 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="px-6 py-2.5 bg-white text-sage-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm whitespace-nowrap"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="w-4 h-4 border-2 border-sage-600 border-t-transparent rounded-full"
                          />
                          Processing...
                        </>
                      ) : (
                        `Pay ${REPORT_PRICE_DISPLAY}`
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBuyingArea(null);
                        setEmail("");
                      }}
                      className="px-4 py-2.5 text-white/70 hover:text-white transition-colors duration-200 text-sm"
                    >
                      Cancel
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Pricing info */}
            <div className="text-right">
              <div className="text-white">
                <div className="text-4xl md:text-5xl font-bold mb-1">
                  {REPORT_PRICE_DISPLAY}
                </div>
                <div className="text-sage-100 text-sm">once-off payment</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample report preview */}
      <div className="bg-white/10 px-6 md:px-8 py-3 border-t border-white/10">
        <p className="text-sage-100 text-xs">
          Reports are generated instantly using AI analysis of the latest
          available market data. Delivered via email and available for download.
        </p>
      </div>
    </div>
  );
}
