---
title: Redraw the Player as a Claude sprite
label: design
status: open
blocked_by: []
assignee:
---

## How

Design ticket: keep the pixel-art style of the other sprites ([What is the art style?](014-art-style.md)), same palette feel against the night sky. Use the `frontend-design` skill for the look.

## What

- Replace `src/sprites/Player.png` (now 20×23) with Claude's pixel character: the orange Claude mascot, drawn as a small pixel sprite.
- Keep the drawn shape = hitbox rule: the sprite is stretched exactly onto the Player box, so keep its proportions close to the Player boxes in the Lessons (no big empty margins, nothing sticking out), or the character looks squashed.
- It must read well flipped (`facing < 0`) and at Lesson-cover zoom on the Course menu; both go through `drawWorld` in `src/sprites.ts`, so the PNG swap covers the game, the static Level preview and the covers.
- Same file name and tag, so nothing else changes; `color` stays the fallback.

## Done when

- The Player is the Claude sprite in Lessons, Sandbox and on the Course menu covers, facing both ways, sharp (no smoothing).
- `npm run typecheck`, `npm test` and `npm run build` pass.
