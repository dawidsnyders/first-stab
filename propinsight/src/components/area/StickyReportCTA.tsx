"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Area } from "@/types";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";
import { PurchaseModal } from "./PurchaseModal";

interface StickyReportCTAProps {
  area: Area;
  isReportSectionVisible?: boolean;
}

export function StickyReportCTA({
  area,
  isReportSectionVisible = false,
}: StickyReportCTAProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{
          y: isReportSectionVisible ? 200 : 0,
          opacity: isReportSectionVisible ? 0 : 1,
        }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/* Floating container with rounded corners - fully clickable */}
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.01, y: -2 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full relative bg-white/90 backdrop-blur-xl border border-stone-200/60 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden max-h-[100px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] hover:border-sage-300/60 hover:bg-white transition-all duration-200 cursor-pointer group text-left"
        >
          <div className="px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Left: Content */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-sage-500 to-moss-600 flex items-center justify-center shadow-md">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold text-sage-700 uppercase tracking-wider">
                      Premium Report
                    </span>
                    <span className="text-[10px] text-stone-400">•</span>
                    <span className="text-[10px] text-stone-500">
                      {area.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 text-[10px] text-stone-600">
                      <svg
                        className="w-3 h-3 text-sage-600"
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
                    <div className="flex items-center gap-1 text-[10px] text-stone-600">
                      <svg
                        className="w-3 h-3 text-sage-600"
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
                    <div className="flex items-center gap-1 text-[10px] text-stone-600">
                      <svg
                        className="w-3 h-3 text-sage-600"
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
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Price */}
                <div className="text-right hidden sm:block">
                  <div className="text-lg font-bold text-stone-900 leading-tight">
                    {REPORT_PRICE_DISPLAY}
                  </div>
                  <div className="text-[10px] text-stone-500">one-time</div>
                </div>

                {/* CTA Button */}
                <div className="relative px-5 py-2.5 bg-gradient-to-r from-sage-600 to-moss-600 text-white font-semibold text-sm rounded-lg shadow-md group-hover:shadow-lg group-hover:from-sage-700 group-hover:to-moss-700 transition-all duration-100 whitespace-nowrap flex items-center gap-1.5 overflow-hidden pointer-events-none">
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

                  <span className="relative">Buy Report</span>
                  <svg
                    className="w-3.5 h-3.5 relative transition-transform duration-100 group-hover:translate-x-0.5"
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
                </div>
              </div>
            </div>
          </div>
        </motion.button>
      </motion.div>

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        area={area}
      />
    </>
  );
}
