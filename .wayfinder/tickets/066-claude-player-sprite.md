---
title: Draw the orange critter Player sprite
label: build
status: open
blocked_by: []
assignee:
---

## How

UI ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill, as the [v2 map](../map-v2.md) notes say. Desktop only: no phone or small-screen layout work.

## What

Replace the Kenney Player sprite everywhere (Lessons, Sandbox, Lesson covers) with our own original orange critter from the prototype (branch `prototype/claude-player`, commit `3c1740b`, page `prototype/claude-player.html`; read it with `git show`, never merge the branch).

- 16×16 pixel art drawn at 2× onto the 32×32 Player box, filling it from antenna to feet (drawn shape = hitbox).
- Palette: orange `#D97757`, shade `#A9583E`, highlight `#F2A98A`, eyes `#1F1A17` with white. Darken the shade or add an outline if it blends into the Brick wall.
- Four frames: idle, walk1, walk2, jump (feet tucked). Lessons draw idle only; animation is ticket 067.
- Flipped to face left by the engine as today.
- Not Anthropic's mascot: no logo, no "Claude" name on it. Enemy and other tags stay Kenney.

## Spec

- [058-claude-player-sprite.md](058-claude-player-sprite.md)
- [014-art-style.md](014-art-style.md)

## Done when

- The Player draws as the critter's idle frame in Lessons and Sandbox, facing the way it moves.
- The four frames exist in `src/sprites` and are loadable by name (test).
- `npm run typecheck` and `npm test` pass.

## Resolution
