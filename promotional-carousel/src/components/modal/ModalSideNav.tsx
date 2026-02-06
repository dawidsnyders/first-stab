'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Announcement } from '@/types';

interface ModalSideNavProps {
  announcements: Announcement[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ModalSideNav({ announcements, activeId, onSelect }: ModalSideNavProps) {
  return (
    <nav className="flex w-full flex-col gap-1 border-r border-border-subtle p-3 md:w-72 md:flex-shrink-0">
      <h2 className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-text-muted">
        What&apos;s New
      </h2>
      {announcements.map((item) => {
        const isActive = item.id === activeId;
        return (
          <motion.button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
              isActive
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            whileHover={{ x: isActive ? 0 : 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                layoutId="activeNavItem"
                style={{
                  backgroundColor: `${item.accentColor}10`,
                  border: `1px solid ${item.accentColor}20`,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <div className="relative flex items-center gap-3">
              <Image
                src={item.logo}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 flex-shrink-0"
              />
              <span className="truncate text-sm font-medium">{item.headline}</span>
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
}
