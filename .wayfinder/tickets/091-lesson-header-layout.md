---
title: Improve the Lesson header layout
label: build
status: open
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
