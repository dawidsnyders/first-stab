# Integrating the Promotional Carousel into Another App

Use this guide to run the carousel inside another Next.js app so it **inherits your app's existing styles and fonts**.

---

## 1. Dependencies

In your other app, install:

```bash
npm install framer-motion lucide-react
```

(If the app already uses Next.js, React, and Tailwind, you’re set. If not, add those too.)

---

## 2. Copy these files into your app

Assume your app’s source root is `src/`. Create the same structure and copy the files below.

| Copy from (this repo) | Copy to (your app) |
|----------------------|--------------------|
| `src/components/carousel/*.tsx` (all 5 files) | `src/components/carousel/` |
| `src/components/modal/*.tsx` (all 3 files) | `src/components/modal/` |
| `src/data/announcements.ts` | `src/data/announcements.ts` |
| `src/types/index.ts` | `src/types/index.ts` (or merge `Announcement` types into your existing types) |

**Carousel components:**  
`CarouselDots.tsx`, `CarouselPill.tsx`, `CarouselSlide.tsx`, `PromotionalCarousel.tsx`, `SeeWhatsNew.tsx`

**Modal components:**  
`ModalContent.tsx`, `ModalSideNav.tsx`, `WhatsNewModal.tsx`

**Do not copy** `src/app/globals.css`, `layout.tsx`, or any font setup from this repo—the carousel will use your app's styles and fonts.

---

## 3. Inherit your app's styles and fonts

The carousel and modal do **not** bundle their own theme. They use a small set of CSS variables and Tailwind theme keys. Map your existing design tokens to those names and the components will inherit your colors, radii, and font.

### 3a. CSS variables the components use

Add these in your global CSS (e.g. `:root` or your design-tokens file), **pointing each to your own tokens**:

| Variable | Used for | Example mapping |
|----------|----------|------------------|
| `--kamino-bg-base` | Page/canvas background, focus ring offset | `var(--your-bg)` or `#0f0f0f` |
| `--kamino-bg-card` | Cards, modal, pill background | `var(--your-surface)` |
| `--kamino-bg-elevated` | Hover states, elevated surfaces | `var(--your-surface-hover)` |
| `--kamino-border-subtle` | Borders | `var(--your-border)` |
| `--kamino-radius-sm` through `--kamino-radius-xl` | Border radius | Your radius tokens or e.g. `8px`, `12px` |
| `--kamino-primary` | Focus rings, accents | `var(--your-primary)` |
| `--kamino-success` | Green dot, success state | `var(--your-success)` or `#22c55e` |

Example (in your `globals.css` or tokens file):

```css
:root {
  /* Alias this repo's variable names to your design system */
  --kamino-bg-base: var(--your-page-bg, #0a0a0a);
  --kamino-bg-card: var(--your-card-bg, #141414);
  --kamino-bg-elevated: var(--your-elevated-bg, #1a1a1a);
  --kamino-border-subtle: var(--your-border-color, #262626);
  --kamino-radius-sm: var(--your-radius-sm, 6px);
  --kamino-radius-md: var(--your-radius-md, 8px);
  --kamino-radius-lg: var(--your-radius-lg, 12px);
  --kamino-radius-xl: var(--your-radius-xl, 16px);
  --kamino-primary: var(--your-primary, #3b82f6);
  --kamino-success: var(--your-success, #22c55e);
}
```

Replace `--your-*` with whatever your app already uses.

### 3b. Tailwind theme keys the components use

The components use classes like `bg-bg-base`, `text-text-primary`, `text-text-secondary`, `text-text-muted`, and `border-border-subtle`. Your app needs these theme keys to resolve.

**If you use Tailwind v4 with `@theme`:** extend your existing theme so these names exist and point to your tokens (e.g. `--color-bg-base: var(--kamino-bg-base);` and your text/border colors). **If you use Tailwind v3:** add the same keys under `theme.extend.colors` and `theme.extend.borderRadius` so that `bg-bg-base`, `text-text-primary`, etc. use your existing variables.

Once these aliases are in place, the carousel and modal will use **your** colors, radii, and (via your layout) **your** font—no need to copy any font or full token set from this repo.

---

## 4. Next.js image domains (if you use remote logos)

If `announcements.ts` uses remote image URLs (e.g. `cdn.kamino.com`, `assets.coingecko.com`), add them in your app’s `next.config.ts` (or `next.config.js`):

```ts
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "cdn.kamino.com", pathname: "/assets/**" },
      { hostname: "assets.coingecko.com", pathname: "/coins/images/**" },
      { hostname: "icons.llamao.fi", pathname: "/icons/**" },
    ],
  },
};
```

Adjust or remove patterns if you switch to local assets.

---

## 5. Render the carousel in your app

Use the same state and layout as in this repo’s `src/app/page.tsx`. Minimal version:

```tsx
"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { announcements } from "@/data/announcements";
import { Announcement } from "@/types";
import { PromotionalCarousel } from "@/components/carousel/PromotionalCarousel";
import { CarouselPill } from "@/components/carousel/CarouselPill";
import { WhatsNewModal } from "@/components/modal/WhatsNewModal";

const springBounce = { type: "spring" as const, stiffness: 400, damping: 28 };

export default function YourPage() {
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
      // your router, e.g. router.push(action.target);
    } else if (action.type === "external") {
      window.open(action.target, "_blank", "noopener,noreferrer");
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setModalActiveItem(null);
  }, []);

  const handleMinimizeCarousel = useCallback(() => setIsCarouselMinimized(true), []);
  const handleExpandCarousel = useCallback(() => setIsCarouselMinimized(false), []);

  return (
    <div className="min-h-screen bg-bg-base">
      <div
        className="mx-auto max-w-5xl px-6 py-8"
        style={{ paddingTop: isCarouselMinimized ? "3.5rem" : undefined }}
      >
        <AnimatePresence>
          {!isCarouselMinimized ? (
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
          ) : (
            <motion.div
              key="pill"
              className="fixed left-1/2 top-4 z-40 w-fit -translate-x-1/2"
              style={{
                borderRadius: "9999px",
                boxShadow: "0 10px 40px -12px rgba(0,0,0,0.4)",
              }}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={springBounce}
            >
              <CarouselPill onExpand={handleExpandCarousel} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Your app content below the carousel */}
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
```

Put this on whatever route or layout should show the carousel (e.g. `src/app/page.tsx` or `src/app/dashboard/page.tsx`). The outer div uses `bg-bg-base`—use your own page background class if you prefer; once the tokens in section 3 are aliased, `bg-bg-base` will resolve to your color.

---

## 6. Path aliases

Components use `@/types` and `@/data/announcements` and `@/components/...`. Ensure your app has the same `@` alias (e.g. `"@/*": ["./src/*"]` in `tsconfig.json`). If your structure differs, update the imports in the copied components.

---

## Summary checklist

- [ ] Install `framer-motion` and `lucide-react`
- [ ] Copy `src/components/carousel/`, `src/components/modal/`, `src/data/announcements.ts`, `src/types/index.ts` (or merge types)
- [ ] Map your app's design tokens to the variable names in section 3 (so the carousel inherits your styles and fonts)
- [ ] Add `images.remotePatterns` in `next.config` if using remote logos
- [ ] Add the page/layout snippet above and fix imports/paths
- [ ] Run the app and open the page; carousel and modal should look and behave the same

If you use a different framework (e.g. CRA, Vite), you’ll need to adapt the Next.js-specific parts (`next/font`, `next/image`, and routing) to that setup.
