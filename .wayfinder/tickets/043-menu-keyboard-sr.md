---
title: Course menu: keyboard and screen reader
label: design
status: open
blocked_by: [042-sandbox-chip-hidden]
assignee:
---

## How

Design ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill. Keep the existing dark look of the Course menu. User-friendliness first, looks second. Out of scope: the cover art on the cards and the blurred background (the user has its own plan for those).

## What

Found on the Course menu with a keyboard and in the accessibility tree:

- **Focus escapes the menu.** Tab after **Play** lands on the hidden-behind Lesson header (`#menu-open`). While the menu is open, make the page behind it `inert` (`header`, `main`) and remove that on close. Esc / Back keep working.
- **The carousel is silent.** ← → change the focused card, but nothing announces it. Each card is `tabIndex=-1` and only `aria-current` changes. Use a polite live region (or move real focus onto the card) so "1. Move right, up next, Lesson 1 of 15" is read. Follow the WAI-ARIA carousel pattern.
- **No visible focus on the card.** Arrow-key focus shows only the purple "selected" outline, which is the same as for mouse use. Fine as long as the next point holds: menu-bar buttons need the same `:focus-visible` ring as the header (`#9cf`). Right now they fall back to the browser's default ring.
- `<kbd>Q</kbd>` / `<kbd>E</kbd>` next to the chips are read as stray letters. Mark them `aria-hidden` and put the shortcut in the chip's `aria-keyshortcuts`. Do the same for Esc / A / Enter on the bottom-bar buttons.
- The menu has no heading. Add a visually hidden `<h1>` ("Choose a Lesson"), and keep `#card-title` as `h2`.
- `document.title` still says "1. Move right · learn-dev" while the menu is open. While it's open, use "Lessons · learn-dev" ("Projects · learn-dev" on the Sandbox tab).
- Stats `🏆 0 / 18   ✓ 0 / 15 passed`: give the numbers words for screen readers ("0 of 18 Achievements, 0 of 15 Lessons passed") and use tabular numbers.
- Card meta icons 🧩 📄 ▶ 🔒 are only decoration. Mark them `aria-hidden` or add a text label ("New idea:", "Scripts:", "State:").

## Done when

- A keyboard-only pass: Tab cycles only inside the menu. ← → and Enter play a Lesson. Esc goes back, and focus lands on the button that opened the menu.
- VoiceOver (or the accessibility tree) reads the focused card when it changes.
- `npm run typecheck` and `npm test` pass.
