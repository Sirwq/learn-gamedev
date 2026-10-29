---
title: Level editor, part 2: palette, new tags and Scripts, pan, zoom, keyboard
label: build
status: open
blocked_by: [074-level-editor-core]
assignee:
---

## How

UI ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill, as the [v2 map](../map-v2.md) notes say. Desktop only: no phone or small-screen layout work.

## What

The rest of the Level editor from the spec, on top of part 1:

- **Palette** of tags with their sprites above the view: drag one in, or click / Enter to drop it in the middle of the view. Player and Enemy come with their Script set.
- **"+ New tag…"** (Colour only here: a plain box in a picked colour; Image is ticket 076) and **"+ New Script…"** (a `Start()` / `Update()` stub with its own file tab) at the bottom of the inspector dropdowns.
- **Moving around**: drag empty sky or wheel to pan; Ctrl+wheel or − / + to zoom 25 %–200 %; Fit Level; a minimap strip of the whole Level under the view (click or drag to jump).
- **Keyboard**: arrows move the selection by 20 (Alt: 1), Shift+arrows resize; with nothing selected, arrows pan. Del deletes, Ctrl+D duplicates, Esc deselects. Object list and palette work with Tab and Enter.
- **"Set camera start here"** saves the current view as the Level's `camera: { x, y, size }`.
- Built on pointer events; no phone or tablet layout.

## Spec

- [049-level-editor.md](049-level-editor.md)

## Done when

- Tests: zoom clamps to 25–200 %, keyboard moves and resizes respect snap, a new Script gets the stub and a valid name (`scriptNameError`), a palette drop lands in the view centre, camera start is saved.
- `npm run typecheck` and `npm test` pass.

## Resolution
