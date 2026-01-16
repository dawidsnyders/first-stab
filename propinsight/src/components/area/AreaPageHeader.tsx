"use client";

import { useState } from "react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { MapModal } from "@/components/ui/MapModal";
import { MapView } from "@/components/map/MapView";

interface AreaPageHeaderProps {
  areaName: string;
}

export function AreaPageHeader({ areaName }: AreaPageHeaderProps) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-xl border border-stone-200/60 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo - Left */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-sage-600 to-moss-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-200">
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
              <span className="text-lg font-semibold text-stone-900 group-hover:text-sage-600 transition-colors duration-200">
                {APP_NAME}
              </span>
            </Link>

            {/* Breadcrumb - Centered */}
            <nav className="hidden md:flex items-center gap-2 text-sm absolute left-1/2 -translate-x-1/2">
              <Link
                href="/"
                className="text-stone-500 hover:text-stone-900 transition-colors duration-200"
              >
                Home
              </Link>
              <span className="text-stone-300">/</span>
              <span className="text-stone-900 font-medium">{areaName}</span>
            </nav>

            {/* View Insights Button - Right */}
            <button
              onClick={() => setIsMapModalOpen(true)}
              className="px-4 py-2 bg-sage-600 text-white text-sm font-semibold rounded-lg hover:bg-sage-700 active:bg-sage-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              View Insights
            </button>
          </div>
        </div>
      </header>

      {/* Map Modal */}
      <MapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
      >
        <MapView initialLevel="suburb" />
      </MapModal>
    </>
  );
}
