---
title: Level editor, part 2: palette, new tags and Scripts, pan, zoom, keyboard
label: build
status: closed
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

- **Pure parts** in `src/level-editor.ts` (tested): `zoomed` (zoom by a factor about a world point, clamped to 25–200 %, 100 % = size 270), `fitView` (every sized box on a 16:9 view, 10 % margin), `cameraStart` (the view in whole pixels), `nudged` (arrows move by 20 onto the grid, Alt by 1; Shift resizes from the top-right corner in the tag's size steps; snap off moves freely), `paletteTags` (art tags, then the Level's own tags in their first box's colour) and `dropped` (a box centred on a point, on the grid, Player / Enemy with their Script when the Project has it). `addScript` in `sandbox.ts` (tested) validates with `scriptNameError` and adds the `Start()` / `Update()` stub; both "+ Script" and "+ New Script…" use it via `newScript` in `main.ts`.
- **Page side** in `src/level-view.ts` and `index.html`: a `#level-area` (palette bar, view bar with − / % / + / Fit Level / Set camera start here, the stage, the minimap strip) replaces the editor while the 🗺 Level tab is open. Palette buttons draw their tag with `drawWorld`; press or Enter drops at the view centre, a pointer drag drops where released on the game view. Drag empty sky pans, wheel pans (Shift: sideways), Ctrl+wheel zooms about the cursor. Minimap: click or drag to recentre. Keys (only when focus is on the page, the Level area or the inspector, never in inputs, selects or dialogs): arrows, Shift / Alt arrows, Del, Ctrl+D, Esc; arrows pan with nothing selected. "+ New tag…" opens a small dialog (name + colour) and gives the selected box that tag and colour; own tags then show in the palette and Tag list because they are read from the boxes.
- Not checked in a real browser (none here). The camera start is not an undo step (the spec lists undo for box changes only).
