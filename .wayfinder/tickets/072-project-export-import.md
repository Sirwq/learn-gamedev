---
title: Export and Import one Project as a file
label: build
status: closed
blocked_by: [071-project-storage]
assignee:
---

## How

UI ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill, as the [v2 map](../map-v2.md) notes say. Desktop only: no phone or small-screen layout work.

## What

- **Export**: a fourth button in the Project strip, Rename / Duplicate / Export / Delete, tooltip "Save this Project as a file: to keep, or to send to a friend." One `.json` file with `format`, `version`, the Project and its images as base64 PNG data URLs, saved via Blob URL + `<a download>` as `<Project name>.learn-dev.json` (characters not allowed in file names replaced).
- **Import**: a third choice "From a file…" in the "+ New" dialog (`<input type=file>`), and dropping a file on the Sandbox menu. Always a new Project; re-check `format`, `version` and the 256×256 image limit, with a plain error for a bad file. Import is a trust boundary: never run or render anything from the file before it validates.
- 📖 Docs gets one line: "Share a Project: Export it and send the file. Your friend opens it with + New → From a file…."

## Spec

- [051-project-storage.md](051-project-storage.md): "Export / Import one Project"
- [059-backup-ux.md](059-backup-ux.md): where the buttons sit, file names
- [060-share-project.md](060-share-project.md)

## Done when

- Tests: export → import round-trips a Project with images into a new id; bad `format`, newer `version`, oversized image and broken JSON are refused without writing anything; file name sanitising.
- `npm run typecheck` and `npm test` pass.

## Resolution
Done. `src/sandbox.ts` has `exportProject`, `importProject` and `exportFileName`.

- **Export**: a fourth button in the Project strip with the spec's tooltip. It downloads `{ format: "learn-dev-project", version: 1, project (without id), images: { "<tag>[:top]": "data:image/png;base64,…" } }` through a Blob URL and `<a download>`, as `exportFileName(name)`. Characters `\ / : * ? " < > |` and control characters become `_`; a blank name becomes `Project`.
- **Import**: "+ New → From a file…" (a hidden `<input type=file>`) or a file dropped on the menu while the Sandbox tab is open. Everything is checked before anything is written: the JSON, `format`, `version` ≤ 1, the Project's shape (Script names are class names, boxes have numeric x/y/w/h), and each image's key and PNG header, with width and height ≤ 256 read from IHDR. No image is decoded or drawn. One `setMany` writes the new id with its images. A bad file throws "This file can't be opened: …", which shows as a toast.
- Before the IndexedDB migration, a file without images goes to localStorage. A file with images is refused with a "reload and try again" message, because Blobs can't be kept there.
- 📖 Docs: the share line sits under the page list in the Docs nav.
- Tests: round trip into a new id with byte-identical images; broken JSON, wrong format, newer version, oversized image, non-PNG, bad box and bad Script name are all refused with no keys written; file-name sanitising.
