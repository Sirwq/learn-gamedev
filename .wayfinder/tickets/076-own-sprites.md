---
title: Students' own sprites per tag
label: build
status: closed
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

Done. Per Project, per tag, in the Level editor inspector under Tag.

- **Data**: each tag's Draw / Pixel art settings live in `level.art` (so they save, duplicate, export and undo with the Level); images are PNG Blobs under `image:<id>:<tag>[:top]`, the tag escaped with `encodeURIComponent` so any tag name (spaces, colons) makes a safe key. Project import checks `art` and the escaped names.
- **Undo**: the editor's snapshots now hold the boxes, `art` and the image Blobs, so set / replace / reset / Draw / Pixel art / Top are each one Ctrl+Z step. The view writes images to IndexedDB only when they changed (new and replaced set, the rest deleted), which also asks `persist()` once.
- **Drawing**: `drawWorld` takes the decoded own sprites; Stretch flips to face left and never animates; Tile uses `tileCells` (20 px cells, first row from the Top image if any); Pixel art off turns smoothing on for that tag. The Run worker gets the Blobs in its start message, so `Instantiate`d boxes get their tag's image. Palette icons and the thumbnail show the own image.
- **Import**: PNG / JPEG only (by MIME type), decoded, scaled to fit 256×256, stored as PNG. Refused while Projects still live in localStorage.
- **UI**: thumbnail (drop target), Change image…, Reset to default / Remove image, Draw, Match image shape, More (Pixel art, Top image). "+ New tag…" takes an image file or a colour. 📖 Docs (`GameObject.tag`) point to Piskel and Aseprite.

Not done / not checked: no real browser here, so the UI is untested by hand. Sandbox menu cards still draw default art. An image of a tag no box uses any more stays stored until Reset. Images are written in a separate step from the Project JSON (not one transaction).

