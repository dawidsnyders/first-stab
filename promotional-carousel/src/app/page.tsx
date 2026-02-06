'use client';

import { useState, useCallback } from 'react';
import { announcements } from '@/data/announcements';
import { Announcement } from '@/types';
import { PromotionalCarousel } from '@/components/carousel/PromotionalCarousel';

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActiveItem, setModalActiveItem] = useState<string | null>(null);

  const handleOpenModal = useCallback(() => {
    setModalActiveItem(announcements[currentSlide].id);
    setIsModalOpen(true);
  }, [currentSlide]);

  const handleSlideClick = useCallback((announcement: Announcement) => {
    const { action } = announcement.cta;
    if (action.type === 'modal') {
      setModalActiveItem(action.target);
      setIsModalOpen(true);
    } else if (action.type === 'route') {
      // In a real app: router.push(action.target)
      console.log('Navigate to:', action.target);
    } else if (action.type === 'external') {
      window.open(action.target, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalActiveItem(null);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <PromotionalCarousel
          announcements={announcements}
          isModalOpen={isModalOpen}
          onOpenModal={handleOpenModal}
          onSlideClick={handleSlideClick}
          currentSlide={currentSlide}
          onSlideChange={setCurrentSlide}
        />

        {/* Placeholder for rest of app */}
        <div className="mt-12 rounded-xl border border-border-subtle bg-bg-card p-12 text-center">
          <p className="text-text-muted text-sm">Your app content goes here</p>
        </div>
      </div>

      {/* Modal will be wired in Phase 3 */}
    </div>
  );
}
