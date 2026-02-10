"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Announcement } from "@/types";

interface CarouselSlideProps {
  announcement: Announcement;
  onClick: () => void;
}

const ICON_4PX_ROUNDED_IDS = new Set([
  "sp500-exposure",
  "prime-boost",
  "kamino-credit",
  "gauntlet-vault",
]);

export function CarouselSlide({ announcement, onClick }: CarouselSlideProps) {
  const { logo, headline, subtitle, stat, accentColor, cta } = announcement;
  const iconRounded = ICON_4PX_ROUNDED_IDS.has(announcement.id);

  return (
    <motion.div
      className="relative w-full cursor-pointer overflow-hidden border bg-bg-card px-6 py-5 md:px-8 md:py-6"
      style={{
        borderRadius: "var(--kamino-radius-lg)",
        borderColor: "var(--kamino-border-subtle)",
        boxShadow: `0 0 24px -8px ${accentColor}12, 0 0 12px -6px ${accentColor}08`,
      }}
      onClick={onClick}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      whileHover={{
        scale: 1.01,
        filter: "brightness(1.03)",
        transition: { duration: 0.05 },
      }}
      whileTap={{
        scale: 0.995,
        filter: "brightness(0.98)",
        transition: { duration: 0.05 },
      }}
    >
      {/* Accent glow background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, ${accentColor}, transparent 70%)`,
        }}
      />

      {/* Hover glow intensifier */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.05 }}
        style={{
          background: `radial-gradient(ellipse at 20% 50%, ${accentColor}08, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center gap-4 md:gap-6">
        {/* Logo */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden md:h-12 md:w-12"
          style={{
            backgroundColor: `${accentColor}15`,
            borderRadius: iconRounded ? "4px" : "var(--kamino-radius-md)",
          }}
        >
          <Image
            src={logo}
            alt=""
            width={32}
            height={32}
            className="h-7 w-7 md:h-9 md:w-9"
          />
        </div>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-nowrap items-center gap-2">
            <h3 className="min-w-0 truncate text-base font-medium text-text-primary md:text-lg">
              {headline}
            </h3>
            <motion.span
              className="flex-shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${accentColor}15`,
                color: accentColor,
                border: `1px solid ${accentColor}30`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {stat.value} {stat.label}
            </motion.span>
          </div>
          <p className="mt-0.5 truncate text-sm text-text-secondary">
            {subtitle}
          </p>
        </div>

        {/* CTA hint */}
        <span
          className="hidden text-sm font-medium md:block"
          style={{ color: accentColor }}
        >
          {cta.label} &rarr;
        </span>
      </div>
    </motion.div>
  );
}
