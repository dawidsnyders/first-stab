"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Area } from "@/types";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";
import { PurchaseModal } from "@/components/area/PurchaseModal";

interface ReportCTAProps {
  area: Area;
}

export function ReportCTA({ area }: ReportCTAProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="relative bg-white border border-stone-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-100 overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage-500 via-moss-500 to-sage-500"></div>

      <div className="px-4 sm:px-6 lg:px-8 py-5 md:py-6">
          {/* Compact Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center flex-shrink-0">
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
              <h2 className="text-xl md:text-2xl font-bold text-stone-900 mb-1.5 tracking-tight">
                Full Market Analysis Report
              </h2>
              <p className="text-sm text-stone-600 leading-snug">
                Comprehensive analysis for{" "}
                <span className="font-semibold text-stone-900">{area.name}</span>
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

          {/* Compact CTA Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Pricing */}
            <div>
              <div className="text-xs text-stone-500 mb-0.5">One-time payment</div>
              <div className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">
                {REPORT_PRICE_DISPLAY}
              </div>
            </div>

            {/* Right: CTA Button */}
            <div className="flex-shrink-0">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group relative px-6 py-3 bg-stone-900 text-white font-semibold text-sm rounded-xl hover:bg-stone-800 transition-all duration-100 shadow-sm hover:shadow-md flex items-center gap-2"
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

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        area={area}
      />
    </div>
  );
}
