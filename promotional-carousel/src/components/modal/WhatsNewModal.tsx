'use client';

import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Announcement } from '@/types';
import { ModalSideNav } from './ModalSideNav';
import { ModalContent } from './ModalContent';

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export function WhatsNewModal({
  isOpen,
  onClose,
  announcements,
  activeItemId,
  onSelectItem,
}: WhatsNewModalProps) {
  const activeAnnouncement = announcements.find((a) => a.id === activeItemId);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 flex h-[80vh] w-[90vw] max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-card shadow-2xl md:flex-row"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4l8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <ModalSideNav
              announcements={announcements}
              activeId={activeItemId}
              onSelect={onSelectItem}
            />
            <ModalContent announcement={activeAnnouncement} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
