---
title: Draw pixel-art sprites, tiles and the night-sky background
label: build
status: closed
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

## Resolution

- PNGs in `src/sprites/` (Player, Enemy, Coin, Flag, Bullet, 8×8 Grass and Brick tiles, 240×135 Sky), converted one-off from the prototype's variant B pixel maps. Vite inlines them into the runner worker bundle.
- `src/sprites.ts`: `drawWorld` paints the fixed night sky, then each object through `toScreen` with smoothing off. Ground and Platform repeat Grass, Wall repeats Brick (`tiles()`: 24 world px per tile, rows hang from the top edge so grass stays on top, edge tiles are cropped, not squashed). Tags with no sprite fall back to a `color` box.
- Facing: `GameObject.facing` (1 / -1) is set by `step()` from each object's horizontal movement that frame; it stays when still. The draw flips any sprite with `facing < 0` (in practice Player, Enemy, and a Bullet fired left).
- Tests: facing (flip left, stays when still, flips back) in `engine.test.ts`; tile count and edge cropping in `sprites.test.ts`.
- Not checked in a real browser (none in the sandbox); typecheck, tests and build pass.
