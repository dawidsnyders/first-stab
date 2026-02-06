'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
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

  // Auto-rotation: 5s timer, pauses on modal open or hover
  useEffect(() => {
    if (isModalOpen || isHovered) return;

    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [isModalOpen, isHovered, nextSlide]);

  const activeAnnouncement = announcements[currentSlide];

  return (
    <div>
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
    </div>
  );
}
