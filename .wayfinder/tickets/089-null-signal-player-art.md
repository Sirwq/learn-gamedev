---
title: Redraw the Player as the Null Signal Codex pet
label: build
status: open
blocked_by: []
assignee:
---

## What

Replace the current orange Player critter with a pixel-art adaptation of the user's active built-in Codex pet, **Null Signal** (stable pet ID `null-signal`). Its dark monitor head, red `NULL` screen, antenna, small body, and expressive poses should be recognizable at the game's 32×32 Player size. Redraw the art for the game and animate it while the Player moves; keep the tag `Player`, Scripts, hitbox, controls, and Lesson mechanics unchanged.

## Visual reference

- The built-in pet's [sprite sheet](https://cdn.openai.com/c6d7b0d0-3abf-40b5-9d0c-ecd2b9364692/null-signal-spritesheet-v4.webp) shows idle, walking, antenna/screen expression, and other poses. Use `null-signal` as the identity if the image URL changes. Do not use the full sheet directly as the in-game sprite.
- Keep crisp pixels and a readable silhouette against the dark stage, Brick, and Sky. The red screen detail should read at actual game size; simplify it if needed rather than shrinking the source art until it blurs.

## Design constraints

- Provide frame art for idle (including a subtle blink or antenna motion), a walking cycle, and jump. Map frames to the existing movement-based animation. Do not invent gameplay events merely to display the pet sheet's `ERROR` or `?` poses.
- Preserve horizontal facing, 32×32 box alignment, and the rule that Lessons 1–15 show a still Player while Sandbox and Chapter 2 animate. The Player must look like Null Signal in Lessons, Sandbox, and Course covers.
- Keep the Player art reproducible from its source artwork/generator and update sprite references and tests. Other tags and a Sandbox Project's own sprites remain as they are.

## Done when

- The Player is visibly Null Signal at normal game zoom, with clean idle, walk, and jump frames and no clipping or jitter against its hitbox.
- Sprite tests cover frame loading and movement-to-frame selection; `npm run typecheck` and `npm test` pass.
- Browser-check a Chapter 1 Lesson, a Chapter 2 Lesson, Sandbox, left/right movement, jump, pause, and a Course cover at normal size.

## Progress (2026-10-30)

The preserved worker draft now contains reproducible 32×32 idle, blink, walk, and jump art, sprite wiring, and tests. Typecheck and all 321 active tests pass. A host browser check showed Null Signal on the Lesson 1 stage, Course cover, and Sandbox stage. Still verify a Chapter 2 Lesson and live left/right, jump, and pause behavior before closing this ticket.
