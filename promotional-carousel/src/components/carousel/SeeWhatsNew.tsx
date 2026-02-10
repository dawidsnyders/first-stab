"use client";

import { motion } from "framer-motion";

interface SeeWhatsNewProps {
  onClick: () => void;
}

export function SeeWhatsNew({ onClick }: SeeWhatsNewProps) {
  return (
    <div className="flex h-8 items-center justify-start">
      <motion.button
        onClick={onClick}
        className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary"
        style={{ borderRadius: "var(--kamino-radius-xl)" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "var(--kamino-success)" }}
        />
        See What&apos;s New
      </motion.button>
    </div>
  );
}
