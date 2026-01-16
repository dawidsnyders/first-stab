"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Area } from "@/types";
import { REPORT_PRICE_DISPLAY } from "@/lib/constants";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: Area;
}

export function PurchaseModal({ isOpen, onClose, area }: PurchaseModalProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

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
          email: email.trim(),
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.2,
              }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Compact Header */}
              <div className="relative border-b border-stone-200 p-5">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-stone-100 transition-colors duration-100 group"
                  aria-label="Close modal"
                >
                  <svg
                    className="w-4 h-4 text-stone-500 group-hover:text-stone-900 transition-colors duration-100"
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

                <div className="pr-10">
                  <div className="flex items-center gap-2.5">
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
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold text-stone-900 truncate">
                        Market Analysis Report
                      </h2>
                      <p className="text-xs text-stone-500 truncate">
                        {area.name}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compact Content - No scrolling */}
              <div className="p-5">
                {/* Features - Compact inline */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-600">
                    {[
                      "10-Year Analysis",
                      "CAGR",
                      "Benchmarks",
                      "Risk Assessment",
                      "Investment Outlook",
                      "PDF Download",
                    ].map((feature, index) => (
                      <div key={feature} className="flex items-center gap-1.5">
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

                {/* Pricing and Form - Side by side */}
                <div className="space-y-4">
                  {/* Pricing */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-500 mb-0.5">Total</p>
                      <p className="text-2xl font-bold text-stone-900">
                        {REPORT_PRICE_DISPLAY}
                      </p>
                    </div>
                    <div className="text-xs text-stone-500">one-time</div>
                  </div>

                  {/* Email Form - Compact */}
                  <form onSubmit={handlePurchase} className="space-y-3">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-medium text-stone-700 mb-1.5"
                      >
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        autoFocus
                        className="w-full px-3 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition-all duration-100 text-sm text-stone-900 placeholder-stone-400"
                      />
                    </div>

                    {/* CTA Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !email.trim()}
                      className="w-full group relative px-4 py-3 bg-stone-900 text-white font-semibold text-sm rounded-lg hover:bg-stone-800 transition-all duration-100 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Purchase Report</span>
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
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Payment Methods */}
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500">Payment methods:</span>
                    <div className="flex items-center gap-1.5">
                      {/* Visa */}
                      <div className="w-9 h-5 bg-white border border-stone-200 rounded flex items-center justify-center px-1">
                        <svg
                          className="w-full h-3"
                          viewBox="0 0 84 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M36.4 4.8h-5.6l-3.5 14.4h5.6l3.5-14.4z"
                            fill="#1434CB"
                          />
                          <path
                            d="M53.2 5.6c-1.4 0-2.4.8-3.1 2.2l-11.2 12h6.3l1.4-3.8h8l.7 3.8h5.6l-3.8-14.2h-2.1zm-4.5 11.2l3.1-8.8 1.8 8.8h-4.9z"
                            fill="#1434CB"
                          />
                          <path
                            d="M26.6 5.6l-4.5 13.2-2.1-9c-.4-1.2-1-1.8-2.1-2.1l-3.5-.8-2.1 15.6h5.6l1.4-7.7 1 7.7h4.9l2.8-15.9h-2.1z"
                            fill="#1434CB"
                          />
                        </svg>
                      </div>
                      {/* Mastercard */}
                      <div className="w-9 h-5 bg-white border border-stone-200 rounded flex items-center justify-center px-1">
                        <svg
                          className="w-full h-3"
                          viewBox="0 0 42 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="15.75" cy="12" r="8.75" fill="#EB001B" />
                          <circle cx="26.25" cy="12" r="8.75" fill="#F79E1B" />
                          <path
                            d="M21 6.75c2.1 2.625 3.5 6.125 3.5 10.5s-1.4 7.875-3.5 10.5c-2.1-2.625-3.5-6.125-3.5-10.5s1.4-7.875 3.5-10.5z"
                            fill="#FF5F00"
                          />
                        </svg>
                      </div>
                      {/* PayFast */}
                      <div className="w-9 h-5 bg-white border border-stone-200 rounded flex items-center justify-center px-1">
                        <span className="text-[7px] font-bold text-stone-700 tracking-tight">
                          PayFast
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
