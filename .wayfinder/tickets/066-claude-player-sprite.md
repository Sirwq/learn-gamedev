---
title: Draw the orange critter Player sprite
label: build
status: closed
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
The Kenney `Player.png` is gone. The Player tag now draws `src/sprites/PlayerIdle.png`, our own 16×16 orange critter, stretched onto its 32×32 box (2×) and flipped by `drawWorld` as before. That covers Lessons, Sandbox and Lesson covers, because they all go through `drawWorld`. `PlayerWalk1`, `PlayerWalk2` and `PlayerJump` (feet tucked) are also in `src/sprites`. They are exported as `playerFrames` and loaded into `Images` by name, ready for ticket 067.

- The prototype branch `prototype/claude-player` (commit `3c1740b`) isn't in this clone, so the critter was redrawn from the ticket 058 description: round body, two eyes looking the way it faces, an antenna nub and stubby feet, in the given palette.
- It has a dark brown outline (`#5A2B1E`) so it doesn't blend into the Brick wall.
- The pixel art is kept as text in `scripts/draw-player.mjs`, which writes the four PNGs (`node scripts/draw-player.mjs`), so ticket 067 can tweak the frames.
- Test: `src/sprites.test.ts` checks that the four frames are in `urls` by name, are 16×16, and that the Player tag uses idle.
