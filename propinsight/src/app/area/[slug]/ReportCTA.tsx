"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area } from "@/types";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";

interface ReportCTAProps {
  area: Area;
}

export function ReportCTA({ area }: ReportCTAProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

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

  const handleBuyClick = () => {
    setShowEmailForm(true);
  };

  const handleBuySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await handlePurchase(area.slug, email.trim());
  };

  return (
    <div className="bg-gradient-to-br from-sage-600 to-moss-600 rounded-2xl overflow-hidden">
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Get the Full Market Analysis Report
          </h2>
          <p className="text-sage-50 text-base md:text-lg mb-8 leading-relaxed">
            A comprehensive 10-15 page market analysis with historical data,
            growth drivers, investment outlook, and actionable insights.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
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

          {/* Area name and Buy button */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-8">
            {/* Left: Area name */}
            <div className="flex-shrink-0">
              <div className="text-sage-50 text-sm font-medium mb-2">
                Report for
              </div>
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                {area.name}
              </div>
            </div>

            {/* Right: Pricing and Buy button */}
            <div className="flex flex-col md:items-end gap-4 flex-shrink-0">
              <div className="text-white text-right">
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-1.5">
                  {REPORT_PRICE_DISPLAY}
                </div>
                <div className="text-sage-100 text-sm md:text-base">
                  once-off payment
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {!showEmailForm ? (
                  <motion.button
                    key="buy-button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleBuyClick}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-8 py-4 bg-white text-sage-700 font-bold text-lg rounded-xl hover:bg-stone-50 transition-all duration-200 shadow-lg hover:shadow-2xl hover:shadow-sage-900/20 overflow-hidden"
                  >
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    <span className="relative">Buy Full Report</span>
                  </motion.button>
                ) : (
                  <motion.form
                    key="email-form"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleBuySubmit}
                    className="flex flex-col sm:flex-row gap-2 w-full md:w-auto"
                  >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoFocus
                    className="flex-1 px-4 py-3 rounded-xl text-stone-900 placeholder-stone-400 bg-white border border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/60 transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !email.trim()}
                    className="group relative px-6 py-3 bg-white text-sage-700 font-semibold rounded-xl hover:bg-stone-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                  >
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-sage-600 border-t-transparent rounded-full relative z-10"
                        />
                        <span className="relative z-10">Processing...</span>
                      </>
                    ) : (
                      <span className="relative z-10">Pay {REPORT_PRICE_DISPLAY}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmailForm(false);
                      setEmail("");
                    }}
                    className="px-4 py-3 text-white/70 hover:text-white transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Sample report preview */}
      <div className="bg-white/10 px-6 md:px-8 lg:px-10 py-4 border-t border-white/10">
        <p className="text-sage-100 text-xs md:text-sm text-center max-w-3xl mx-auto">
          Reports are generated instantly using AI analysis of the latest
          available market data. Delivered via email and available for download.
        </p>
      </div>
    </div>
  );
}
