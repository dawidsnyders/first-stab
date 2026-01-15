"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import InteractiveMapView for modal use
const InteractiveMapView = dynamic(
  () => import("@/components/map/InteractiveMapView"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-stone-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-sage-200 border-t-sage-600 rounded-full animate-spin" />
          <span className="text-stone-500 text-sm">Loading map...</span>
        </div>
      </div>
    ),
  }
);

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  useInteractiveMap?: boolean;
}

export function MapModal({ isOpen, onClose, children, useInteractiveMap = true }: MapModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal - Fullscreen for map */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.3,
              }}
              className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] overflow-hidden pointer-events-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-stone-200 flex-shrink-0">
                <h2 className="text-xl md:text-2xl font-bold text-stone-900">
                  Explore the Western Cape
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-stone-100 transition-colors duration-200 group"
                  aria-label="Close map"
                >
                  <svg
                    className="w-5 h-5 text-stone-500 group-hover:text-stone-900 transition-colors duration-200"
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
              </div>

              {/* Map Content */}
              <div className="flex-1 overflow-hidden relative min-h-0">
                <div className="absolute inset-0 w-full h-full">
                  {useInteractiveMap ? <InteractiveMapView /> : children}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
