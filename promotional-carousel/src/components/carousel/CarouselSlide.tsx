'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Announcement } from '@/types';

interface CarouselSlideProps {
  announcement: Announcement;
  onClick: () => void;
}

export function CarouselSlide({ announcement, onClick }: CarouselSlideProps) {
  const { logo, headline, subtitle, stat, accentColor, cta } = announcement;

  return (
    <motion.div
      className="relative w-full cursor-pointer overflow-hidden rounded-xl border border-border-subtle bg-bg-card px-6 py-5 md:px-8 md:py-6"
      onClick={onClick}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      whileHover={{ filter: 'brightness(1.05)' }}
      style={{
        boxShadow: `0 0 60px -12px ${accentColor}20, 0 0 30px -8px ${accentColor}15`,
      }}
    >
      {/* Accent glow background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, ${accentColor}, transparent 70%)`,
        }}
      />

      {/* Hover glow intensifier */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          background: `radial-gradient(ellipse at 20% 50%, ${accentColor}10, transparent 70%)`,
        }}
      />

      <div className="relative flex items-center gap-4 md:gap-6">
        {/* Logo */}
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg md:h-12 md:w-12"
          style={{ backgroundColor: `${accentColor}15` }}
        >
          <Image
            src={logo}
            alt=""
            width={32}
            height={32}
            className="h-6 w-6 md:h-8 md:w-8"
          />
        </div>

        {/* Text content */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-text-primary md:text-lg">
            {headline}
          </h3>
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

      {/* Stat badge — top right */}
      <motion.div
        className="absolute right-4 top-3 rounded-full px-3 py-1 text-xs font-semibold md:right-6 md:top-4"
        style={{
          backgroundColor: `${accentColor}15`,
          color: accentColor,
          border: `1px solid ${accentColor}30`,
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeInOut', delay: 0.2 }}
      >
        {stat.value} {stat.label}
      </motion.div>
    </motion.div>
  );
}
