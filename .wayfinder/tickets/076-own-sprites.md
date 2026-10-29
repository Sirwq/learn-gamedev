---
title: Students' own sprites per tag
label: build
status: open
blocked_by: [075-level-editor-tools]
assignee:
---

## How

UI ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill, as the [v2 map](../map-v2.md) notes say. Desktop only: no phone or small-screen layout work.

## What

Sandbox only, per Project, per tag, all in the Level editor inspector under Tag:

- Thumbnail, **Change image…** (file picker, or drop a file on the thumbnail), **Reset to default** for built-in tags (back to the Kenney art, or the critter for Player), **Remove image** for new tags. "+ New tag…" now offers **Image…** or **Colour**.
- **Draw: Stretch / Tile**. Tile = one 20×20 world-px cell repeated, with an optional **Top** image for the first row. Built-in tags start in today's mode. Spikes' one-row style stays built-in only.
- **Match image shape**: keep width, set height from the image's aspect ratio.
- "More" button holds **Pixel art** (on by default, smoothing off) and the Top slot.
- PNG and JPEG only; over 256×256 is scaled down on import; stored as PNG Blobs under `image:<id>:<tag>` (ticket 071). Replacing drops the old Blob. Duplicate and Export carry images.
- Drawn shape = hitbox: the image is stretched onto the box. Own sprites flip to face left and never animate. `Instantiate`d boxes get their tag's image.
- Every image change is one undo step. 📖 Docs point to Piskel or Aseprite.
- Asks `navigator.storage.persist()` on the first image import if not asked yet.

## Spec

- [050-own-sprites.md](050-own-sprites.md)
- [051-project-storage.md](051-project-storage.md)

## Done when

- Tests: wrong file types refused; a 512×300 image scales to fit 256×256; Tile cell maths with and without Top; Match image shape; Reset restores the default; Duplicate copies image Blobs to the new id; undo restores the previous image.
- `npm run typecheck` and `npm test` pass.

## Resolution
