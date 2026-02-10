"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Announcement } from "@/types";

const ICON_4PX_ROUNDED_IDS = new Set([
  "sp500-exposure",
  "prime-boost",
  "kamino-credit",
  "gauntlet-vault",
]);

interface ModalSideNavProps {
  announcements: Announcement[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export function ModalSideNav({
  announcements,
  activeId,
  onSelect,
}: ModalSideNavProps) {
  return (
    <nav
      className="flex w-full flex-shrink-0 flex-row gap-1 overflow-x-auto border-b border-border-subtle p-2 md:w-72 md:flex-col md:overflow-x-visible md:overflow-y-auto md:border-b-0 md:border-r md:p-3"
      style={{ borderColor: "var(--kamino-border-subtle)" }}
    >
      <h2 className="hidden px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-text-muted md:block">
        What&apos;s New
      </h2>
      {announcements.map((item) => {
        const isActive = item.id === activeId;
        return (
          <motion.button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`relative flex flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors md:gap-3 md:py-2.5 ${
              isActive
                ? "text-text-primary"
                : "text-text-secondary hover:text-text-primary"
            }`}
            whileHover={{ x: isActive ? 0 : 4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                  borderRadius: "var(--kamino-radius-md)",
                  backgroundColor: `${item.accentColor}10`,
                  border: `1px solid ${item.accentColor}20`,
                }}
                layoutId="activeNavItem"
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            )}
            <div className="relative flex items-center gap-2 md:gap-3">
              <div
                className={
                  ICON_4PX_ROUNDED_IDS.has(item.id)
                    ? "flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden rounded"
                    : "flex h-6 w-6 flex-shrink-0 items-center justify-center overflow-hidden"
                }
              >
                <Image
                  src={item.logo}
                  alt=""
                  width={24}
                  height={24}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className="whitespace-nowrap text-xs font-medium md:whitespace-normal md:text-sm">
                {item.headline}
              </span>
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
}
