'use client';

import { motion } from 'framer-motion';

interface CarouselDotsProps {
  total: number;
  current: number;
  accentColor: string;
  onDotClick: (index: number) => void;
}

export function CarouselDots({ total, current, accentColor, onDotClick }: CarouselDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className="relative flex h-5 w-5 items-center justify-center"
          aria-label={`Go to slide ${i + 1}`}
        >
          <motion.div
            className="rounded-full"
            animate={{
              width: i === current ? 24 : 8,
              height: 8,
              backgroundColor: i === current ? accentColor : '#555a6e',
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
          />
        </button>
      ))}
    </div>
  );
}
