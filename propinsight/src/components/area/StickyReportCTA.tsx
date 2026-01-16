"use client";

import { motion } from "framer-motion";
import { Area } from "@/types";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";

interface StickyReportCTAProps {
  area: Area;
}

export function StickyReportCTA({ area }: StickyReportCTAProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-t border-stone-200/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"></div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Content */}
          <div className="flex-1 min-w-0 flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-sage-500 to-moss-600 flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
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

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-sage-700 uppercase tracking-wider">
                  Premium Report
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-stone-500">10-15 page analysis</span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1 truncate">
                Full Market Analysis for {area.name}
              </h3>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <svg
                    className="w-3.5 h-3.5 text-sage-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>10-Year Trends</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <svg
                    className="w-3.5 h-3.5 text-sage-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Investment Insights</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <svg
                    className="w-3.5 h-3.5 text-sage-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>PDF Download</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pricing & CTA */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Price */}
            <div className="text-right hidden sm:block">
              <div className="text-2xl font-bold text-stone-900 leading-tight">
                {REPORT_PRICE_DISPLAY}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">one-time</div>
            </div>

            {/* CTA Button */}
            <a
              href="#report"
              className="group relative px-6 py-3.5 bg-gradient-to-r from-sage-600 to-moss-600 text-white font-semibold rounded-xl hover:from-sage-700 hover:to-moss-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap flex items-center gap-2 overflow-hidden"
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

              <span className="relative">Buy Full Report</span>
              <svg
                className="w-4 h-4 relative transition-transform duration-200 group-hover:translate-x-0.5"
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
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
