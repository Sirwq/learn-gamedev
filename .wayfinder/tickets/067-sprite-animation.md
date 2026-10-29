---
title: Animate sprites from box movement
label: build
status: open
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
