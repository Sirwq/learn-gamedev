---
title: Draw pixel-art sprites, tiles and the night-sky background
label: build
status: open
blocked_by: [016-engine-core]
assignee:
---

## What

- One small pixel-art PNG per tag (Player, Enemy, Coin, Flag, Bullet) plus 8×8 tiles for Ground, Platform, Wall, shipped in the app (not in Lesson folders).
- A sprite is stretched exactly onto its box with image smoothing off; tiled tags repeat their tile across the box. Drawn shape = hitbox.
- Player and Enemy flip to face their last horizontal movement (engine does this).
- `color` stays the fallback for a tag with no sprite.
- One fixed pixel night-sky background behind every Level.

The prototype (variant B) is on a local branch: `git show prototype/art-style:prototypes/art-style.prototype.html`. Reuse its art; turn it into PNG files if it's drawn in code. Don't merge that branch.

## Spec

- [014-art-style.md](014-art-style.md)

## Done when

- Tests cover facing (flip after moving left, stays flipped when still) and tile count for a box.
- `npm run typecheck`, `npm test` and `npm run build` pass.
