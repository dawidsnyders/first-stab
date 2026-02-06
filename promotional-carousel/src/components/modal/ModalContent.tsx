'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Announcement } from '@/types';

interface ModalContentProps {
  announcement: Announcement | undefined;
}

export function ModalContent({ announcement }: ModalContentProps) {
  if (!announcement) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-text-muted text-sm">Select an item to view details</p>
      </div>
    );
  }

  const { logo, headline, subtitle, accentColor, detail } = announcement;

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={announcement.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Image src={logo} alt="" width={32} height={32} className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{headline}</h2>
              <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-6 leading-relaxed text-text-secondary">
            {detail.description}
          </p>

          {/* Stats grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {detail.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border-subtle bg-bg-elevated px-4 py-3 text-center"
              >
                <div
                  className="text-lg font-bold"
                  style={{ color: accentColor }}
                >
                  {s.value}
                </div>
                <div className="mt-0.5 text-xs text-text-muted">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <motion.a
            href={detail.ctaLink}
            className="mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: accentColor }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
          >
            {detail.ctaLabel}
            <span>&rarr;</span>
          </motion.a>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
