---
title: Lesson text moves to the left column above the game
label: design
status: open
blocked_by: [036-editor-fill-zoom]
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark IDE look. User-friendliness first, looks second.

## What

- Today `#lesson` is a full-width strip capped at `max-height: 140px`: the line to type is cut off at the fold, and Hints and "Still stuck?" sit hidden below. The game, meanwhile, has empty black bars above and below it.
- New layout: left column = Lesson text (top, scrolls on its own) + game (below, 16:9, scales to the space left). Right column = file tabs, editor, Console (see 036).
  - The Lesson text gets the height it needs up to a sensible share (the game must stay playable, e.g. at least ~40% of the column); its scroll area shows a fade or shadow when there is more below.
  - Explanation, Hints, "Still stuck?" and the Sandbox Project actions (Rename / Duplicate / Delete) move with it.
  - Code lines in the Explanation wrap or scroll inside their own block, never the whole panel.
- Lesson text uses `scroll-margin-top`, readable line length and spacing; headings stay hierarchical.
- Sandbox (no Lesson parts): the game takes the whole left column.

## Done when

- At 1280×720 and 1440×900 the whole Lesson 1 Explanation, including the line to type, is readable without scrolling a tiny box, and the game is still fully visible.
- Hints and "Still stuck?" are reachable without hunting; keyboard focus order: header → Lesson → game → editor.
- Sandbox layout still works.
- `npm run typecheck` and `npm test` pass; screenshots at both sizes in Resolution.
