"use client";

import { motion } from "framer-motion";

interface CarouselDotsProps {
  total: number;
  current: number;
  onDotClick: (index: number) => void;
}

export function CarouselDots({
  total,
  current,
  onDotClick,
}: CarouselDotsProps) {
  return (
    <div
      className="flex items-center justify-center pt-1"
      style={{ gap: "2px" }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onDotClick(i)}
          className="relative flex h-8 w-8 min-w-8 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kamino-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--kamino-bg-base)]"
          aria-label={`Go to slide ${i + 1}`}
          aria-current={i === current ? "true" : undefined}
        >
          <motion.div
            className="rounded-full pointer-events-none"
            animate={{
              width: i === current ? 24 : 8,
              height: 8,
              backgroundColor:
                i === current
                  ? "var(--kamino-text-primary)"
                  : "var(--kamino-text-muted)",
            }}
            transition={{ duration: 0.05, ease: "easeOut" }}
          />
        </button>
      ))}
    </div>
  );
}
