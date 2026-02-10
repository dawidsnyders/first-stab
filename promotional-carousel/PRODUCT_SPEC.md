# What's New Carousel — Frontend Behaviour Spec

**Context:** Static screens are designed in Figma. This spec describes **interactions and behaviour** so the FE engineer can build the feature to match the designs.

**Goal:** Implement the “What’s New” promotional carousel and modal so that all user flows, state changes, and transitions behave as specified below. Use Figma for layout, typography, colours, and spacing; use this doc for what happens when the user does something.

---

## 1. What the user can do (overview)

- **View the carousel** — Header (“See What’s New”), one slide at a time, dots to switch slides. Carousel auto-advances every 5s unless the user hovers or the modal is open.
- **Minimize the carousel** — A control (e.g. minimize icon) collapses the carousel into a small “What’s New” pill fixed at top-center. Page content stays below; no layout jump.
- **Expand from the pill** — Clicking the pill brings the full carousel back.
- **Open the modal** — Clicking “See What’s New” or a slide opens the “What’s New” modal: side list of announcements + detail (description, stat boxes, CTA). Which announcement is shown depends on context (current slide vs clicked slide).
- **Use the modal** — Switch items via the side list; click CTA (navigate or external link); close via X or backdrop or Escape.
- **Navigate slides** — Dots or keyboard (Arrow Left/Right) when the modal is closed.

---

## 2. Screens / states (match Figma)

- **Expanded carousel** — Full carousel visible: “See What’s New” (left), minimize control (right), one slide card, then dots. Match Figma for this view.
- **Minimized** — Only the “What’s New” pill at top-center; main page content below. Match Figma for pill and spacing.
- **Modal open** — Overlay with backdrop; modal panel with close (X), side nav (list of announcements), and main content (selected announcement’s detail). Match Figma for layout and content structure.

Use Figma for: component layout, type scale, colours, radii, iconography, stat box look (border, radius, no fill, white value text), and any responsive layout (e.g. side nav horizontal on small, vertical on desktop).

---

## 3. Interactions and behaviour

### 3.1 Carousel (expanded)

- **Auto-advance:** Every **5 seconds** move to the next slide (wrap to first after last). **Pause** when: (a) the modal is open, or (b) the user is hovering over the slide area. Resume when both are false.
- **Dots:** Clicking a dot switches to that slide immediately. Active dot should be visually distinct (e.g. pill vs circle); match Figma.
- **Keyboard:** When the modal is **closed**, **Arrow Right** → next slide, **Arrow Left** → previous slide (wrap at ends). Do nothing when modal is open.
- **Slide click:** The whole slide card is clickable. Behaviour depends on the slide’s CTA action (see §5).
- **“See What’s New” click:** Opens the modal with the **current** slide’s announcement selected.
- **Minimize control click:** Hides the carousel and shows the pill (see §3.2). Page content gets top padding so it doesn’t sit under the pill (exact value from Figma or e.g. 3.5rem).

### 3.2 Minimized (pill)

- **Pill position:** Fixed, top-center. Match Figma for size and spacing from top.
- **Pill click:** Hides the pill and shows the full carousel again. No need to “morph” between pill and carousel; a simple swap with enter/exit animation is enough.
- **Green dot:** Optional subtle pulse (scale/opacity loop) so the pill is noticeable; match Figma or keep very subtle.

### 3.3 Modal

- **Open:** When the user opens the modal (from “See What’s New” or from a slide whose CTA is “open modal”), set the **selected announcement** to the current slide’s announcement or the clicked slide’s announcement (depending on entry point). Modal shows side list + detail for that announcement.
- **Side list:** Clicking an item in the list switches the detail view to that announcement. The active item should be clearly indicated; animating the active indicator between items (e.g. with a shared layoutId) is desirable.
- **Detail content:** Description, stat boxes (full-width row; boxes share space equally), and CTA button. If there is no selected item (e.g. edge case), show a neutral empty state (“Select an item to view details” or similar).
- **Stat boxes:** One box per stat; row spans full width of the content area; stat value text is always white (not per-slide accent). For the S&P 500 announcement only, hide the stat whose label is “Strategy” (so 3 boxes instead of 4). Rest of styling from Figma.
- **CTA in modal:** Primary button; click navigates (in-app route or external link) per data. Match Figma for style.
- **Close:** Clicking the **X**, the **backdrop**, or pressing **Escape** closes the modal and clears the selection. When open, lock body scroll.

---

## 4. State (who owns what)

- **Page / parent** owns:
  - `currentSlide` (index)
  - `isModalOpen` (boolean)
  - `modalActiveItem` (announcement id or null)
  - `isCarouselMinimized` (boolean)
- **Carousel** receives: `announcements`, `currentSlide`, `onSlideChange`, `onSlideClick`, `onOpenModal`, `onMinimize?`, and knows if modal is open (to pause auto-advance and keyboard).
- **Modal** receives: `isOpen`, `onClose`, `announcements`, `activeItemId`, `onSelectItem`.
- **Slide click** is handled by the parent: depending on the announcement’s CTA action, either open modal (with that announcement), run in-app navigation, or open external link. Carousel only reports “this slide was clicked” and which announcement.

Keep a single source of truth for “which slide” and “which modal item” at the page level so the carousel and modal stay in sync.

---

## 5. Data and CTA rules

- **Data shape:** Each announcement has at least: `id`, `logo`, `headline`, `subtitle`, a single `stat` (label + value for the slide), `accentColor`, `cta` (label + action), and `detail` (description, list of stats, ctaLabel, ctaLink). Match your API or copy from existing types.
- **CTA action types:**
  - **modal:** Open the “What’s New” modal with the announcement whose `id` equals `action.target` (usually the same slide).
  - **route:** In-app navigation to `action.target` (e.g. `router.push`).
  - **external:** `window.open(action.target, '_blank', 'noopener,noreferrer')`.

Implement slide click and modal CTA button so they respect these three types.

---

## 6. Animation and transition intent

- **Carousel ↔ pill:** When minimizing, the carousel can exit (e.g. fade + move up) and the pill can enter (e.g. fade + slight move down). When expanding, the pill exits (e.g. fade + slight scale down) and the carousel enters (e.g. fade + move up into place). Use a spring or short ease; avoid morph or height animation.
- **Slide change:** Slide content can transition horizontally (e.g. outgoing left, incoming from right) with a short duration (~0.2s). Subtle hover on the slide card is fine.
- **Modal:** Backdrop fades in/out; panel can scale slightly (e.g. 0.95 → 1) and fade. When switching the selected item in the modal, the detail block can cross-fade or slide slightly (~0.25s).
- **Pill green dot:** If you add a pulse, keep it very subtle (e.g. gentle scale and opacity loop, ~2.5s).

Exact keyframes and easing can follow your design system; the above describes the intended feel.

---

## 7. Responsive behaviour

- **Breakpoint:** Use a single breakpoint (e.g. `md` at 768px) for layout and scaling.
- **Carousel (expanded):** On **desktop (md+)** the whole carousel (header + slide + dots) is scaled down (e.g. to 80%) so it doesn’t dominate the page. On smaller viewports, no scaling (100%). Match Figma if a different scale or breakpoint is specified.
- **Pill:** Shown at a fixed scale (e.g. 80% of the Figma pill size); no need to change scale by viewport.
- **Modal:** On **desktop (md+)** the modal panel can be scaled down (e.g. to 80%) for consistency with the carousel. On smaller viewports, full size. Side nav: horizontal scroll on small screens; vertical list with fixed width on desktop. Match Figma for layout.

---

## 8. Edge cases and decisions

- **No shared layoutId** between carousel and pill — avoids layout morph issues; a simple mount/unmount with enter/exit is enough.
- **Stats row in modal** — Use flex (e.g. `flex-1 basis-0` per box) so the row always spans full width and boxes share space equally, regardless of how many stats there are.
- **S&P 500 stats** — Omit the stat with label “Strategy” for that announcement only.
- **Escape** — Always closes the modal when it’s open.
- **Focus and a11y** — Buttons (dots, minimize, pill, close, side list items, CTA) should be focusable and have clear labels (e.g. “Minimize carousel”, “Expand What’s New carousel”, “Go to slide N”). Match Figma for focus styles.

---

## 9. Checklist for the FE engineer

- [ ] Expanded carousel matches Figma (header, slide, dots).
- [ ] Minimized state shows only the pill; pill click expands carousel; no layout jump.
- [ ] Auto-advance every 5s, paused on hover and when modal is open.
- [ ] Dots and Arrow Left/Right change slide when modal is closed.
- [ ] “See What’s New” and slide click open modal; correct announcement is selected.
- [ ] Modal: side list switches detail view; active item is clear; CTA does route / external / or modal as per data.
- [ ] Modal: X, backdrop, Escape close; body scroll locked when open.
- [ ] Stat boxes: full-width row, equal width, value text white; “Strategy” hidden for S&P 500.
- [ ] Desktop: carousel and modal panel scaled down per spec/Figma; pill and responsive nav match Figma.
- [ ] Animations feel smooth and match the intent in §6.

---

**Reference:** For a full data model (TypeScript interfaces) and optional implementation details (e.g. file structure, token names), see the repo code and `INTEGRATION.md`. This spec is intentionally lean and goal-oriented so the engineer can rely on Figma for visuals and this doc for behaviour.
