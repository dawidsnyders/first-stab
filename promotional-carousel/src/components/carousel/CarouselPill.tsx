"use client";

import { motion } from "framer-motion";

interface CarouselPillProps {
  onExpand: () => void;
}

export function CarouselPill({ onExpand }: CarouselPillProps) {
  return (
    <motion.button
      type="button"
      onClick={onExpand}
      className="flex h-full w-full min-h-[2.5rem] min-w-[8rem] cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-left backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kamino-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--kamino-bg-base)]"
      style={{
        backgroundColor: "rgba(11, 22, 42, 0.92)",
        borderColor: "var(--kamino-border-subtle)",
      }}
      whileHover={{
        scale: 1.06,
        transition: { duration: 0.2 },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.05 },
      }}
      aria-label="Expand What's New carousel"
    >
      <motion.span
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: "var(--kamino-success)" }}
        animate={{ scale: [1, 1.12, 1], opacity: [1, 0.9, 1] }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <span className="text-sm font-medium text-text-primary">
        What&apos;s New
      </span>
    </motion.button>
  );
}
