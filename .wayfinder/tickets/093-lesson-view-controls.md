---
title: Distinguish the Explanation and Objects view controls
label: build
status: open
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
