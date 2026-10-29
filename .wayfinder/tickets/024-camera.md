---
title: Add Camera.main
label: build
status: open
blocked_by: [016-engine-core]
assignee:
---

## What

Unity-style camera: `Camera.main.transform.position` (a `Vector2`, the view centre in pixels) and `Camera.main.orthographicSize` (half the view height, default 270; changing it zooms). The on-screen viewport stays 960×540. **No auto-follow**: following the player is student code. A Level may set a start camera `camera: { x, y, size }`.

## Spec

- [004-lesson-format.md](004-lesson-format.md): Camera section

## Done when

- Tests cover the world-to-screen transform for position and zoom, including the y-flip.
- Typings + doc comments for `Camera` added.
- `npm run typecheck` and `npm test` pass.
