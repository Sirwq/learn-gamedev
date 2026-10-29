---
title: Lesson text moves to the left column above the game
label: design
status: closed
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

## Resolution

- `#lesson` moved into a new `#left` column in `<main>`, above `#stage`. Right column (tabs, editor, Console) unchanged. DOM order gives focus order header → Lesson (scroll area is `tabindex="0"`, labelled by the title, with a focus ring) → its links and Hint button → game → editor.
- The Lesson text takes the height it needs up to 60% of the column. The game gets the rest (`flex: 1`), so it always has at least ~40%. A sticky `::after` fade at the bottom edge shows there is more to read. At the end of the text it is just blank space.
- Explanation, Hints, "Still stuck?" and the Sandbox Project actions moved with it. Code blocks wrap (`pre-wrap`) inside their own shaded block, so the line to type is fully readable. Text: line-height 1.5, 72ch max line length, `scroll-margin-top` on the title, Hints and "Still stuck?". The empty `<p>` around a hidden Hint button collapses.
- Sandbox: only the Project name and Rename / Duplicate / Delete strip sits above the game, which fills the rest of the column.
- Checked in headless Chromium. At 1440×900 the whole Lesson 1 Explanation and the Hint button fit without scrolling, and the game is 615×346. At 1280×720 the Explanation through "Differs from Unity C#" (including the line to type) is visible, and the game is 461×259. The AI note and the Hint button need one short scroll. No page errors. Screenshots: `.wayfinder/assets/037-lesson1-1280x720.png`, `.wayfinder/assets/037-lesson1-1440x900.png`, `.wayfinder/assets/037-sandbox-1280x720.png`.
- `npm run typecheck` and `npm test` pass. This is a markup/CSS-only change, so there is no new unit test.
