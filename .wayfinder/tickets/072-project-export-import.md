---
title: Export and Import one Project as a file
label: build
status: open
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
