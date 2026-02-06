# Implementation Plan: Promotional Carousel + What's New Modal

## Overview

Build a standalone Next.js project from scratch with a dark-mode promotional carousel and detail modal. Implementation is split into 4 phases: project scaffolding, carousel core, modal system, and polish/interactions. Each phase produces a working, verifiable state.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  page.tsx (demo page)                               │
│  ┌───────────────────────────────────────────────┐  │
│  │  "See What's New" button (right-aligned)      │  │
│  ├───────────────────────────────────────────────┤  │
│  │  PromotionalCarousel                          │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  CarouselSlide (single, full-width)     │  │  │
│  │  │  [Logo] [Headline / Subtitle]  [Badge]  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  [ ● ○ ○ ○ ○ ] CarouselDots                  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  (rest of page content placeholder)                 │
└─────────────────────────────────────────────────────┘

┌─────────────── WhatsNewModal ───────────────────────┐
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │ SideNav  │  │  ModalContent                    │ │
│  │          │  │                                   │ │
│  │ • Item 1 │  │  Logo + Headline                 │ │
│  │   Item 2 │  │  Description (1-2 paragraphs)    │ │
│  │   Item 3 │  │  Stats grid                      │ │
│  │   Item 4 │  │  CTA button                      │ │
│  │   Item 5 │  │                                   │ │
│  └──────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**State flow:** The parent `page.tsx` owns:
- `currentSlide` (number) — which carousel slide is active
- `isModalOpen` (boolean) — whether the What's New modal is visible
- `modalActiveItem` (string | null) — which item is selected in the modal side-nav

These are passed down as props. The carousel auto-rotation timer lives inside `PromotionalCarousel` and reacts to `isModalOpen` to pause/resume.

## Phases

### Phase 1: Project Scaffolding
**Goal:** A running Next.js project with Tailwind, Framer Motion, dark theme, types, and sample data.

- [ ] 1.1: Initialize Next.js project with TypeScript + Tailwind CSS inside a new `promotional-carousel/` directory (at repo root, separate from propinsight)
- [ ] 1.2: Install Framer Motion
- [ ] 1.3: Set up `globals.css` with dark theme design tokens (base background, card background, text colors, accent CSS variables)
- [ ] 1.4: Set up root `layout.tsx` with dark background, Inter/system font
- [ ] 1.5: Create `types/index.ts` with `Announcement` interface
- [ ] 1.6: Create `data/announcements.ts` with 5 hardcoded sample items (matching spec sample data)
- [ ] 1.7: Create placeholder `page.tsx` that imports data and renders a basic dark page
- [ ] 1.8: Verify the dev server runs clean — `npm run dev`

### Phase 2: Carousel Core
**Goal:** A fully functional carousel with slides, auto-rotation, dot navigation, and click handling.

- [ ] 2.1: Build `CarouselSlide.tsx` — renders logo, headline, subtitle, stat badge (top-right), accent glow background. Entire slide is a clickable surface. Uses Framer Motion for hover brightness/glow.
- [ ] 2.2: Build `CarouselDots.tsx` — dot indicators, active dot uses accent color with scale animation, clickable to jump to slide.
- [ ] 2.3: Build `PromotionalCarousel.tsx` — container that manages auto-rotation (5s timer), wraps slides in `AnimatePresence` for crossfade+horizontal slide transitions, renders dots below. Accepts `isModalOpen` prop to pause timer.
- [ ] 2.4: Build `SeeWhatsNew.tsx` — minimal right-aligned button above carousel, triggers `onOpenModal` callback.
- [ ] 2.5: Wire carousel into `page.tsx` with state management (`currentSlide`, `isModalOpen`). Verify auto-rotation, dot clicking, slide transitions, hover pause.

### Phase 3: What's New Modal
**Goal:** A fully functional modal with side-nav, content panel, and proper enter/exit animations.

- [ ] 3.1: Build `ModalSideNav.tsx` — flat list of announcement items, active item highlighted with accent color, hover animation (background highlight + slide right). Calls `onSelectItem` on click.
- [ ] 3.2: Build `ModalContent.tsx` — displays selected announcement's logo, headline, description, stats grid, and CTA button. Content transitions with AnimatePresence when selected item changes.
- [ ] 3.3: Build `WhatsNewModal.tsx` — modal container with backdrop blur overlay, fade+scale entrance/exit animations. Renders side-nav (left) + content (right) in a flex layout. Handles Escape key to close.
- [ ] 3.4: Wire modal into `page.tsx`. "See What's New" button opens modal with the currently active carousel slide pre-selected. Clicking a carousel slide with `action.type === 'modal'` opens modal and selects that item. Verify carousel pauses while modal is open.

### Phase 4: Polish & Interactions
**Goal:** All P1 features, visual refinements, and responsiveness.

- [ ] 4.1: Add hover pause — carousel stops auto-rotation on mouse enter, resumes on mouse leave
- [ ] 4.2: Add keyboard navigation — left/right arrows for carousel slides, Escape to close modal
- [ ] 4.3: Add stat badge pulse/glow animation on slide enter
- [ ] 4.4: Responsive layout — carousel adapts for mobile (smaller text, stacked layout if needed), modal goes full-screen on small viewports with side-nav as a horizontal top bar or collapsible
- [ ] 4.5: Add entrance animation — carousel fades/slides in on first page load
- [ ] 4.6: Final visual pass — glow effects, spacing, typography, color consistency, transition timings per the animation spec table
- [ ] 4.7: Verify full flow end-to-end: auto-rotation → hover pause → click slide → modal opens with correct item → navigate side-nav → close modal → carousel resumes

## File Structure

```
promotional-carousel/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Demo page — state owner
│   │   ├── layout.tsx            # Root layout, dark theme, fonts
│   │   └── globals.css           # Tailwind + design token CSS vars
│   ├── components/
│   │   ├── carousel/
│   │   │   ├── PromotionalCarousel.tsx
│   │   │   ├── CarouselSlide.tsx
│   │   │   ├── CarouselDots.tsx
│   │   │   └── SeeWhatsNew.tsx
│   │   └── modal/
│   │       ├── WhatsNewModal.tsx
│   │       ├── ModalSideNav.tsx
│   │       └── ModalContent.tsx
│   ├── data/
│   │   └── announcements.ts
│   └── types/
│       └── index.ts
├── public/                       # SVG placeholder logos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## Testing Strategy

Each phase is verified before moving on:

- **Phase 1:** `npm run dev` boots clean, page renders dark background, no type errors
- **Phase 2:** Carousel auto-rotates, dots are clickable and sync, slides transition smoothly, hover brightens
- **Phase 3:** Modal opens/closes with correct animation, side-nav selects items, content panel updates, carousel pauses
- **Phase 4:** Hover pause works, keyboard nav works, responsive at 375px/768px/1440px viewports, full flow is seamless

Verification is manual/visual — no automated test suite needed for this UI-focused build.

## Rollback Plan

- Each phase is a separate commit, so `git revert` to any phase boundary is trivial
- The project lives in its own `promotional-carousel/` directory — zero risk to existing `propinsight/` code
