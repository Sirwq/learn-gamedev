---
title: Add Achievements, toasts and the achievement map
label: build
status: open
blocked_by: [018-checks, 020-app-shell]
assignee:
---

## What

- An Achievement is `{ id, after, message, test(world) }`, checked every frame by the Check machinery in any Lesson. Only ones whose `after` is earned are checked. Earned once, saved in localStorage.
- The 18-Achievement tree from the spec (First steps root → …).
- Top-right toast: square bevelled frame, "Achievement unlocked" + icon + title, slides in, stacks, gone after ~4 s.
- `🏆 n / 18` top-bar button opens the full-window map; ✕ or Esc closes it. Tiles: earned (gold), locked (grey, can be earned now), hidden (`?`). Right-angled arrows, green once the target is earned. Hover shows title and how to earn it. Tile positions hand-placed.

The prototype is on a local branch: `git show prototype/achievement-map:prototypes/achievement-map.prototype.html` (round 2 is the answer). Reference screenshot: `.wayfinder/assets/achievement-map-reference.png`. Don't merge that branch.

## Spec

- [011-achievement-map.md](011-achievement-map.md)

## Done when

- Tests cover: only unlocked-next Achievements are checked, earning is saved, the tree has 18 entries with one root and no cycles.
- `npm run typecheck` and `npm test` pass.
