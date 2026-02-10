"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2 } from "lucide-react";
import { Announcement } from "@/types";
import { CarouselSlide } from "./CarouselSlide";
import { CarouselDots } from "./CarouselDots";
import { SeeWhatsNew } from "./SeeWhatsNew";

interface PromotionalCarouselProps {
  announcements: Announcement[];
  isModalOpen: boolean;
  onOpenModal: () => void;
  onSlideClick: (announcement: Announcement) => void;
  currentSlide: number;
  onSlideChange: (index: number) => void;
  onMinimize?: () => void;
}

export function PromotionalCarousel({
  announcements,
  isModalOpen,
  onOpenModal,
  onSlideClick,
  currentSlide,
  onSlideChange,
  onMinimize,
}: PromotionalCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    onSlideChange((currentSlide + 1) % announcements.length);
  }, [currentSlide, announcements.length, onSlideChange]);

  const prevSlide = useCallback(() => {
    onSlideChange(
      (currentSlide - 1 + announcements.length) % announcements.length,
    );
  }, [currentSlide, announcements.length, onSlideChange]);

  // Auto-rotation: 5s timer, pauses on modal open or hover
  useEffect(() => {
    if (isModalOpen || isHovered) return;

    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isModalOpen, isHovered, nextSlide]);

  // Keyboard navigation: arrow keys for slides
  useEffect(() => {
    if (isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      else if (e.key === "ArrowLeft") prevSlide();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, nextSlide, prevSlide]);

  const activeAnnouncement = announcements[currentSlide];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-1">
        <SeeWhatsNew onClick={onOpenModal} />
        {onMinimize ? (
          <motion.button
            type="button"
            onClick={onMinimize}
            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--kamino-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--kamino-bg-base)]"
            style={{ borderRadius: "var(--kamino-radius-xl)" }}
            aria-label="Minimize carousel"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Minimize2 size={16} aria-hidden />
          </motion.button>
        ) : (
          <div />
        )}
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <CarouselSlide
            key={activeAnnouncement.id}
            announcement={activeAnnouncement}
            onClick={() => onSlideClick(activeAnnouncement)}
          />
        </AnimatePresence>
      </div>

      <CarouselDots
        total={announcements.length}
        current={currentSlide}
        onDotClick={onSlideChange}
      />
    </div>
  );
}
