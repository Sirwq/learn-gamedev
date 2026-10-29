---
title: Add Achievements, toasts and the achievement map
label: build
status: closed
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

## Resolution

- `src/achievements.ts`: the 18 Achievements as `{ id, after, icon, title, message, test(world, run), col, row, vertical? }`, with hand-placed map cells from prototype round 2. `run` gives a test the Level's start boxes, last frame's world, whether Debug logged this frame, and a per-Run `seen` set (Both ways, Platform hopper). `achievementChecker(start, earned)` is made once per Run and checks only **locked** ones (`after` earned); a child unlocked this frame is checked from the next. `stateOf` gives earned / locked / hidden. Saved per id as `achievement:<id>` in localStorage.
- There are no object ids in `World`, so "an enemy died" means the Enemy count dropped; Stomp looks at where the Player was the frame before, and Sharpshooter checks for a Bullet near the enemy that frame. Off the edge reads `Camera.main` (centre past x 960).
- Worker: gets `earned` with the Run, checks Achievements after the Goals on every frame (including the frame the game stops on a Lose event or a pass), and posts `achievements` with new ids.
- Page: `🏆 n / 18` button after the progress pips; it opens the full-window map (SVG right-angled arrows, green once the target is earned; earned, locked and hidden tiles; native tooltip shows the title and how to earn it). ✕ or Esc closes. Top-right toast with a bevelled frame stacks and goes away after 4 s, using the existing `#toasts`.
- Tests: tree of 18, one root, no cycles; only unlocked-next ones are checked; earning is saved; and `course.test.ts` plays each Lesson's Reference code and expects the matching Achievements (with every one unlocked).
- Not checked in a real browser (none in the sandbox). Hello Console, Long way down and Ouch have no playthrough test.
