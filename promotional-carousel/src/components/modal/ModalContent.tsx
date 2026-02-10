"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Announcement } from "@/types";

const ICON_4PX_ROUNDED_IDS = new Set([
  "sp500-exposure",
  "prime-boost",
  "kamino-credit",
  "gauntlet-vault",
]);

interface ModalContentProps {
  announcement: Announcement | undefined;
}

export function ModalContent({ announcement }: ModalContentProps) {
  if (!announcement) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-text-muted text-sm">
          Select an item to view details
        </p>
      </div>
    );
  }

  const { logo, headline, subtitle, accentColor, detail } = announcement;

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6 md:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={announcement.id}
          className="w-full min-w-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden"
              style={{
                backgroundColor: `${accentColor}15`,
                borderRadius: ICON_4PX_ROUNDED_IDS.has(announcement.id)
                  ? "4px"
                  : "var(--kamino-radius-lg)",
              }}
            >
              <Image
                src={logo}
                alt=""
                width={32}
                height={32}
                className="h-9 w-9 max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-medium text-text-primary">
                {headline}
              </h2>
              <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-6 leading-relaxed text-text-secondary">
            {detail.description}
          </p>

          {/* Stats row – always spans full width, boxes share space equally */}
          <div className="mt-6 flex w-full flex-wrap gap-3">
            {detail.stats
              .filter(
                (s) =>
                  !(announcement.id === "sp500-exposure" && s.label === "Strategy")
              )
              .map((s) => (
              <div
                key={s.label}
                className="min-w-0 flex-1 basis-0 px-4 py-3 text-center"
                style={{
                  border: "1pt solid #212C42",
                  borderRadius: "12px",
                  backgroundColor: "transparent",
                }}
              >
                <div className="text-lg font-medium text-white">{s.value}</div>
                <div className="mt-0.5 text-xs text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.a
            href={detail.ctaLink}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kamino-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--kamino-bg-card)]"
            style={{
              backgroundColor: accentColor,
              borderRadius: "var(--kamino-radius-md)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.05 }}
          >
            {detail.ctaLabel}
            <span>&rarr;</span>
          </motion.a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
