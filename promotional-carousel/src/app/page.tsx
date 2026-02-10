"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { announcements } from "@/data/announcements";
import { Announcement } from "@/types";
import { PromotionalCarousel } from "@/components/carousel/PromotionalCarousel";
import { CarouselPill } from "@/components/carousel/CarouselPill";
import { WhatsNewModal } from "@/components/modal/WhatsNewModal";

const springBounce = { type: "spring" as const, stiffness: 400, damping: 28 };

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActiveItem, setModalActiveItem] = useState<string | null>(null);
  const [isCarouselMinimized, setIsCarouselMinimized] = useState(false);

  const handleOpenModal = useCallback(() => {
    setModalActiveItem(announcements[currentSlide].id);
    setIsModalOpen(true);
  }, [currentSlide]);

  const handleSlideClick = useCallback((announcement: Announcement) => {
    const { action } = announcement.cta;
    if (action.type === "modal") {
      setModalActiveItem(action.target);
      setIsModalOpen(true);
    } else if (action.type === "route") {
      console.log("Navigate to:", action.target);
    } else if (action.type === "external") {
      window.open(action.target, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalActiveItem(null);
  }, []);

  const handleMinimizeCarousel = useCallback(() => {
    setIsCarouselMinimized(true);
  }, []);

  const handleExpandCarousel = useCallback(() => {
    setIsCarouselMinimized(false);
  }, []);

  return (
    <div className="min-h-screen bg-bg-base">
      <div
        className="mx-auto max-w-5xl px-6 py-8"
        style={{ paddingTop: isCarouselMinimized ? "3.5rem" : undefined }}
      >
        <AnimatePresence>
          {!isCarouselMinimized ? (
            <div className="w-full origin-top md:scale-[0.8]">
              <motion.div
                key="carousel"
                className="mx-auto max-w-[800px]"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={springBounce}
              >
                <PromotionalCarousel
                  announcements={announcements}
                  isModalOpen={isModalOpen}
                  onOpenModal={handleOpenModal}
                  onSlideClick={handleSlideClick}
                  currentSlide={currentSlide}
                  onSlideChange={setCurrentSlide}
                  onMinimize={handleMinimizeCarousel}
                />
              </motion.div>
            </div>
          ) : (
            <motion.div
              key="pill"
              className="fixed left-1/2 top-4 z-40 w-fit -translate-x-1/2 origin-center"
              style={{
                borderRadius: "9999px",
                boxShadow: "0 10px 40px -12px rgba(0,0,0,0.4)",
              }}
              initial={{ opacity: 0, y: -12, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 0.8 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={springBounce}
            >
              <CarouselPill onExpand={handleExpandCarousel} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Placeholder for rest of app */}
        <div
          className="mt-12 border bg-bg-card p-12 text-center"
          style={{
            borderRadius: "var(--kamino-radius-lg)",
            borderColor: "var(--kamino-border-subtle)",
          }}
        >
          <p className="text-text-muted text-sm">Your app content goes here</p>
        </div>
      </div>

      <WhatsNewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        announcements={announcements}
        activeItemId={modalActiveItem}
        onSelectItem={setModalActiveItem}
      />
    </div>
  );
}
