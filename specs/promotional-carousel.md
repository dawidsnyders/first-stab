# Promotional Carousel + What's New Modal — Specification

## Overview

A two-part promotional system for a fintech/DeFi web application: a dark-mode, SaaS-style carousel banner at the top of the page promoting new launches, features, and partnerships, paired with a "What's New" modal that provides expanded detail on all current announcements. Built as a standalone Next.js project with Framer Motion-driven animations.

## Problem Statement

- **What:** Users need a prominent, polished way to discover new assets, features, and partnerships as they land on the app
- **Who:** End users of a fintech/DeFi product (crypto-native, yield-focused audience)
- **Pain point:** Without a centralized promotional surface, new launches get buried and users miss opportunities — reducing engagement and TVL

## Goals

- **Primary:** A visually premium, dark-mode carousel that communicates new offerings at a glance
- **Secondary:** A detail modal that lets curious users explore all announcements with richer context
- **Success metric:** Users interact with carousel slides and click through to promoted content

## Requirements

### Must Have (P0)

- [ ] **Carousel component** — full-width, single-slide view, dark background with accent glow effects
- [ ] **Slide content** — Logo (left-aligned, first element), headline, subtitle, stat badge (top-right), lean CTA
- [ ] **Entire slide is clickable** — configurable action per slide (open modal, in-app route, or external link)
- [ ] **Auto-rotation** — 5-second interval timer
- [ ] **Pause on modal open** — carousel stops rotating when the What's New modal is visible
- [ ] **Dot navigation** — active dot uses slide accent color, inactive dots are muted
- [ ] **"See What's New" button** — minimal, right-aligned above the carousel, opens the modal
- [ ] **What's New modal** — fade + scale-up entrance with backdrop blur
- [ ] **Modal side nav** — flat list of all announcements on the left
- [ ] **Modal content panel** — right side, shows: 1-2 paragraphs of description, key stats, CTA button
- [ ] **Content-dependent accent colors** — each slide/item has its own accent, base color is consistent across all
- [ ] **Framer Motion animations** — slide transitions, modal entrance/exit, hover states, dot indicators
- [ ] **Hardcoded data** — array of typed objects as the data source
- [ ] **Fully responsive** — works on desktop and mobile viewports

### Should Have (P1)

- [ ] **Hover pause** — carousel pauses auto-rotation on mouse hover
- [ ] **Keyboard navigation** — arrow keys to navigate slides, Escape to close modal
- [ ] **Smooth slide transitions** — crossfade or slide animation between carousel items via Framer Motion AnimatePresence
- [ ] **Active item sync** — clicking a carousel slide that opens the modal scrolls/selects that item in the side nav

### Nice to Have (P2)

- [ ] **Swipe gestures** — touch/drag to change slides on mobile
- [ ] **Reduced motion support** — respect `prefers-reduced-motion` media query
- [ ] **Entrance animation** — carousel animates in on first page load

### Out of Scope

- CMS or API integration (hardcoded data only for now)
- Authentication or user-specific content
- Analytics/tracking instrumentation
- Backend or database
- Deployment configuration

## User Stories

- As a **user landing on the app**, I want to see what's new at a glance so I can discover new opportunities immediately
- As a **curious user**, I want to click "See What's New" and browse all announcements with more detail so I can make informed decisions
- As a **user interested in a specific launch**, I want to click a carousel slide and be taken directly to the relevant page or detail view

## Technical Requirements

### Stack
- **Framework:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (heavy usage — transitions, presence, layout animations, gestures)
- **Data:** Typed array of objects in a dedicated data file

### Data Shape (per announcement)

```typescript
interface Announcement {
  id: string;
  logo: string;                    // path or URL to logo image
  headline: string;                // e.g. "Get 2x S&P500 Exposure"
  subtitle: string;                // e.g. "Now available on Kamino Vaults"
  stat: { label: string; value: string }; // e.g. { label: "APY", value: "7%" }
  accentColor: string;             // Tailwind color or hex value
  cta: {
    label: string;                 // e.g. "Learn More"
    action: {
      type: 'modal' | 'route' | 'external';
      target: string;              // modal item ID, route path, or URL
    };
  };
  // Extended content for the What's New modal
  detail: {
    description: string;           // 1-2 paragraphs
    stats: { label: string; value: string }[];
    ctaLabel: string;
    ctaLink: string;
  };
}
```

### Component Architecture

```
src/
├── app/
│   ├── page.tsx                   # Demo page with carousel at top
│   ├── layout.tsx                 # Root layout (dark theme)
│   └── globals.css                # Tailwind + custom dark theme vars
├── components/
│   ├── carousel/
│   │   ├── PromotionalCarousel.tsx  # Main carousel container
│   │   ├── CarouselSlide.tsx        # Individual slide
│   │   ├── CarouselDots.tsx         # Dot navigation
│   │   └── SeeWhatsNew.tsx          # "See What's New" button
│   └── modal/
│       ├── WhatsNewModal.tsx        # Modal container with backdrop
│       ├── ModalSideNav.tsx         # Left-side announcement list
│       └── ModalContent.tsx         # Right-side detail panel
├── data/
│   └── announcements.ts            # Hardcoded announcement data
└── types/
    └── index.ts                     # TypeScript interfaces
```

### Design Tokens

- **Base background:** Near-black (e.g. `#0a0a0f` or `#0d0f1a`)
- **Card/slide background:** Slightly lighter dark (e.g. `#12141f` or `#161825`)
- **Text primary:** White or near-white
- **Text secondary:** Muted gray (e.g. `#8a8f9e`)
- **Accent colors (per slide):**
  - Blue (`#3b82f6`) — for index/exposure products
  - Green (`#10b981`) — for yield products
  - Purple (`#8b5cf6`) — for new features
  - Amber (`#f59e0b`) — for lending/vaults
  - Cyan (`#06b6d4`) — for partnerships
- **Glow effect:** Accent color at low opacity as box-shadow or radial gradient behind slide

### Animation Spec

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Slide transition | Crossfade + subtle horizontal slide | 500ms | easeInOut |
| Modal enter | Fade in (0→1) + scale (0.95→1) | 300ms | easeOut |
| Modal exit | Fade out (1→0) + scale (1→0.95) | 200ms | easeIn |
| Backdrop | Fade in blur overlay | 300ms | easeOut |
| Dot active state | Scale pulse + color transition | 200ms | spring |
| Slide hover | Subtle brightness lift + glow intensify | 200ms | easeOut |
| Side nav item hover | Background highlight + slide right | 150ms | easeOut |
| Stat badge | Subtle pulse/glow on slide enter | 600ms | easeInOut |

## Constraints

- **Scope:** Standalone project — no integration with existing propinsight codebase
- **Data:** Hardcoded only, structured for easy future migration to API/CMS
- **Performance:** Lightweight — no heavy image assets for initial build (logos can be SVG placeholders)

## Risks

- **Risk:** Carousel auto-rotation can frustrate users if transitions are too fast or distracting
  - **Mitigation:** 5s timer, pause on hover (P1), pause on modal open (P0), respect reduced motion (P2)
- **Risk:** Modal side-nav gets unwieldy with many items
  - **Mitigation:** Start with 5 items; design can accommodate scroll for more

## Sample Data

| # | Headline | Subtitle | Stat | Accent |
|---|----------|----------|------|--------|
| 1 | Get 2x S&P500 Exposure | Leveraged index vaults now live | 2x Leverage | Blue |
| 2 | Multiply PRIME for Boosted RWA Yield | Stake and earn boosted rewards | 12.5% APY | Green |
| 3 | Collateral Swap Now Live | Swap collateral without closing positions | 0 Downtime | Purple |
| 4 | Gauntlet RWA Lending Vault Live | Institutional-grade lending | $2.4M TVL | Amber |
| 5 | Kamino Private Credit | BTC-Backed Institutional Yield | 7% Yield | Cyan |

## Open Questions

- Should dot indicators be clickable to jump to a specific slide?
- Should the modal side-nav highlight which item corresponds to the currently visible carousel slide when opened via "See What's New"?
- Should there be a close animation on the carousel when navigating away from the page?

## Approvals

- [ ] User approved this specification
