---
title: Improve the Lesson header layout
label: build
status: closed
blocked_by: []
assignee:
---

## What

Make the Lesson header easy to scan and use: navigation and progress are clear, Run or Stop is prominent, and secondary actions have room at normal and narrow widths.

## Design constraints

- Preserve the existing controls, keyboard shortcuts, focus order, and Run/Stop swap. Include the future language picker from ticket 087 in the layout.
- Keep status and error text readable without pushing important controls off screen. Use the current light and dark themes; do not redesign the rest of the app.
- Treat this as an Impeccable layout refinement: inspect the rendered header, then verify desktop and narrow widths with long translated labels.

## Done when

- No header controls overlap, clip, or become unreachable in a Lesson or Sandbox at common desktop and narrow browser widths.
- Keyboard and screen-reader navigation follows the visible order; Run/Stop stays in a stable place.
- Browser-check both themes and English, plus Russian when ticket 087 is available. `npm run typecheck` and `npm test` pass.

## Resolution

- The header is now two groups, in the same DOM order as before: `.header-nav` (Back, brand, progress, Achievements) and `.header-actions` (language, theme, Run/Stop, Ask DeepSeek). The groups wrap whole and the actions line up on the right, so controls keep their full labels instead of being squeezed into two lines. The language picker from ticket 087 sits before the theme in the actions group.
- Controls and the progress pips no longer shrink. Progress pips go from 12×10 to 8×8 below 1200 px, gaps tighten below 900 px, the Back label becomes the arrow below 720 px, and the brand steps aside below 480 px. Nothing overlaps, clips, or scrolls sideways from 1440 down to 360 px.
- Status and errors get a full-width row under the controls (`#status`), so a long message wraps without moving Run, Stop, or any other control. The row is hidden while the status is empty.
- Run and Stop still share one grid cell. Browser measurements before and after Run were identical at every width in both languages, and the header did not move.
- Keyboard order is unchanged: Back → progress → Achievements → language → theme → Run → Ask. The Tab sequence measured identically at 1280, 720, and 360 px in English and Russian, and the visual order matches it at every width.
- Added two static tests in `src/a11y.test.ts` for reading order and the group/no-shrink rules. `npm run typecheck` and `npm test` pass (351 tests).
- Browser-checked Lesson 1 and a Sandbox Project in English and Russian at 1440, 1280, 1100, 1024, 900, 768, 720, 600, 480, and 360 px, in dark and light themes, with a long runtime status line. Screenshots: `.wayfinder/assets/091-header-en-1280-dark.png`, `091-header-ru-480-dark.png`, `091-header-ru-1280-light.png`, `091-header-status-ru-480-dark.png`.
- Not verified: screen-reader speech output; the DOM/ARIA order and Tab sequence were checked directly.
