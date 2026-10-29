---
title: Animate sprites from box movement
label: build
status: closed
blocked_by: [066-claude-player-sprite]
assignee:
---

## What

The engine picks animation frames from box movement each frame, with no student API: walk cycle while a box moves sideways, jump pose while it moves up, idle otherwise, at about 8–10 fps. Only frames that really exist: the critter Player (idle, walk1, walk2, jump) and whatever Kenney's Pixel Platformer pack has for Enemy, Coin, Flag. Tags without frames and own sprites stay still. Every frame is stretched onto the box.

Sandbox and Chapter 2 only: Lessons 1–15 keep drawing still sprites. Reduced motion does not stop sprite animation.

## Spec

- [054-sound-animation.md](054-sound-animation.md): "Animation is the engine's, with no API"
- [058-claude-player-sprite.md](058-claude-player-sprite.md): frames
- [062-teaching-v2.md](062-teaching-v2.md): Chapter 2 amends "Sandbox only"

## Done when

- A pure function maps (tag, movement this frame, time) to a frame name, with tests for idle, walk, jump and a tag with no frames.
- Lessons 1–15 still draw a single still frame (test).
- `npm run typecheck` and `npm test` pass.

## Resolution

`frameOf(tag, moved, time)` in `src/sprites.ts` picks the frame: jump while moving up, walk while moving sideways, idle otherwise, cycling at 8 fps. A missing walk or jump falls back to idle; a tag with no sprite gets `undefined`. The engine records `GameObject.moved` (how far the object moved during the frame's Updates) next to `facing`. `drawWorld` animates only when the worker passes a time. The worker counts drawn frames as the clock, so the animation stops on pause. `animates()` in `src/run-utils.ts` turns animation on for Sandbox and Lesson 16+, and off for Lessons 1–15 (tested).

Frames from Kenney's Pixel Platformer pack (CC0; zip from opengameart.org/node/126068). The existing sprites were matched against the pack by pixel: Enemy = character tile_0015, Coin = tile_0151, Flag = tile_0111 over the pole.
- `EnemyWalk.png`: tile_0016 cropped to its content (15×19). Enemy walks Enemy ↔ EnemyWalk and has no jump frame.
- `CoinSpin.png`: tile_0152 cropped with Coin's rect, so it reads as turning. Coin idles Coin ↔ CoinSpin.
- `FlagWave.png`: tile_0112 over Flag's pole. Flag idles Flag ↔ FlagWave.
- Player: idle, walk1/walk2, jump. Bullet: still.

Falling uses idle, as the spec says ("jump pose while it moves up"). Own sprites don't exist yet (ticket 076). When they land, they must skip `frameOf`.

