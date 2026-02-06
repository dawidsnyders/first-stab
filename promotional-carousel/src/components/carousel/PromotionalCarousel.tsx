'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Announcement } from '@/types';
import { CarouselSlide } from './CarouselSlide';
import { CarouselDots } from './CarouselDots';
import { SeeWhatsNew } from './SeeWhatsNew';

interface PromotionalCarouselProps {
  announcements: Announcement[];
  isModalOpen: boolean;
  onOpenModal: () => void;
  onSlideClick: (announcement: Announcement) => void;
  currentSlide: number;
  onSlideChange: (index: number) => void;
}

export function PromotionalCarousel({
  announcements,
  isModalOpen,
  onOpenModal,
  onSlideClick,
  currentSlide,
  onSlideChange,
}: PromotionalCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    onSlideChange((currentSlide + 1) % announcements.length);
  }, [currentSlide, announcements.length, onSlideChange]);

  const prevSlide = useCallback(() => {
    onSlideChange((currentSlide - 1 + announcements.length) % announcements.length);
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
      if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, nextSlide, prevSlide]);

  const activeAnnouncement = announcements[currentSlide];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <SeeWhatsNew onClick={onOpenModal} />

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
        accentColor={activeAnnouncement.accentColor}
        onDotClick={onSlideChange}
      />
    </motion.div>
  );
}
