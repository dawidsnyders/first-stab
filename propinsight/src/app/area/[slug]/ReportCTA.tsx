"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area } from "@/types";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";

interface ReportCTAProps {
  area: Area;
}

export function ReportCTA({ area }: ReportCTAProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create Stripe checkout session
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          areaSlug: area.slug,
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

  return (
    <div className="bg-gradient-to-br from-sage-600 to-moss-600 rounded-2xl overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl md:text-2xl font-bold text-white mb-2">
            Get the Full {area.name} Report
          </h2>
          <p className="text-sage-50 text-base mb-4">
            A comprehensive 10-15 page market analysis with historical data,
            growth drivers, investment outlook, and actionable insights.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
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

          {/* Price and CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-white">
              <span className="text-3xl font-bold">{REPORT_PRICE_DISPLAY}</span>
              <span className="text-sage-100 ml-2 text-sm">once-off</span>
            </div>

            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <motion.button
                  key="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsExpanded(true)}
                  className="px-6 py-2.5 bg-white text-sage-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors duration-200 text-sm"
                >
                  Get Report Now
                </motion.button>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handlePurchase}
                  className="flex-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="px-3 py-2 rounded-xl text-stone-900 placeholder-stone-400 w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-sage-300 transition-all duration-200 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-white text-sage-700 font-semibold rounded-xl hover:bg-stone-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
                          className="w-5 h-5 border-2 border-sage-600 border-t-transparent rounded-full"
                        />
                        Processing...
                      </>
                    ) : (
                      `Pay ${REPORT_PRICE_DISPLAY}`
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsExpanded(false)}
                    className="px-3 py-2 text-white/70 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Cancel
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
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
