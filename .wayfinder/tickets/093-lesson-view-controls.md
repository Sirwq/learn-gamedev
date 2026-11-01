---
title: Distinguish the Explanation and Objects view controls
label: build
status: closed
blocked_by: []
assignee:
---

## What

Style **Explanation** and **Objects** as a clear pair of view controls so students can tell which panel is open and switch confidently.

## Design constraints

- Follow an Impeccable refinement pass on the existing Lesson visual style. Make the selected state clear without relying on color alone, with visible hover and keyboard focus states.
- Preserve the panel behavior, labels, `aria-pressed` state, and read-only Objects view. Work in both themes and at narrow widths; allow longer Russian labels from ticket 087.

## Done when

- The active view is obvious at a glance and to a screen reader, and switching views keeps focus sensible.
- Browser-check both states in light and dark themes at desktop and narrow widths. `npm run typecheck` and `npm test` pass.

## Resolution

Refined Explanation and Objects into a segmented pair using the Lesson's existing colors and tokens. The selected control has a raised border, shadow, and heavier type as well as a distinct surface; hover and keyboard focus are visible. At phone widths the controls stack so longer Russian labels remain legible. Existing labels, `aria-pressed`, panel switching, and read-only Objects behavior are unchanged.

Verified both views in light and dark themes at desktop, intermediate, and phone widths in Chromium, including mouse switching, keyboard focus, and label fit. `npm run typecheck` and `npm test` pass. The Impeccable detector was run; its whole-file warnings did not point to the changed controls.
