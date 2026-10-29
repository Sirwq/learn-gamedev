---
title: Course menu: motion and layout without JS measuring
label: design
status: open
blocked_by: [044-menu-pointer-nav]
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark look of the Course menu. User-friendliness first, looks second. Out of scope: the cover art on the cards and the blurred background (the user has its own plan for those).

## What

- `.cover` animates `left, top, width, height` (layout properties), and `layoutMenu()` measures `rail.clientWidth` in JS on every resize. Move the cards with `transform` (translate + scale), and let CSS size the card (for example `height: min(60vh, …)`, `aspect-ratio: 3 / 4`) so resize needs no JS.
- No `prefers-reduced-motion` anywhere. Under reduce: switch cards without the slide, skip the 350 ms tab slide in `setMode`, and stop toasts flying in from the side (fade only).
- New input cancels a running slide (`Animation.cancel()` / finish before starting the next one), so holding → doesn't queue up motion.

## Done when

- With reduced motion turned on in macOS / DevTools, nothing slides.
- Resizing the window keeps the big card centred without `layoutMenu()` measuring.
- `npm run typecheck` and `npm test` pass.
