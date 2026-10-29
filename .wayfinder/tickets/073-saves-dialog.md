---
title: 💾 Saves dialog with Export / Import everything
label: build
status: closed
blocked_by: [072-project-export-import]
assignee:
---

## How

UI ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill, as the [v2 map](../map-v2.md) notes say. Desktop only: no phone or small-screen layout work.

## What

- A **💾 Saves** button beside the `🏆 n / 21 ✓ n / 15` menu stats, from Lesson 1, in `src/menu.ts`. The dialog: Export everything, Import everything, "Last backup: …", one sentence on why backups matter. Before Sandbox unlocks it backs up Course progress only.
- **Export everything**: one `learn-dev-backup-YYYY-MM-DD.json` with every Project plus Course progress (`passed:`, `code:`, `hints:`, `snapshot:`, `achievement:` keys and settings). Never includes `dev:sandbox-unlocked`.
- **Import everything** merges and never overwrites: per Lesson, take the file's code, hints and snapshot only if the file has it passed and the browser doesn't; Achievements are the union; same Project id + same content is skipped, same id + different content comes in as "<name> (imported)"; the rest is added. A one-line summary first ("Adds 3 Lessons passed, 2 Projects. Nothing here is overwritten.") with Import / Cancel.
- The same Import (and dropping a file on the menu) also takes a single Project file, told apart by `format`. Before unlock: store it and say "Saved. This is a Sandbox Project; you'll find it in Sandbox after Lesson 15."
- **Reminder**: when the menu opens, if 7+ days since the last Export everything and something new was saved since, one quiet line: "💾 Your last backup was 12 days ago · Back up now · Not now". "Not now" hides it for 7 days. With no backup yet, "never backed up", only after Lesson 1 is passed. Never a dialog, never mid-Lesson.
- Extra lines in the dialog: on Safari only, the 7-day / Home Screen line from the spec; if `navigator.storage.persisted()` is false, the "may clear these saves" line.

## Spec

- [059-backup-ux.md](059-backup-ux.md)
- [060-share-project.md](060-share-project.md): "Before Sandbox unlocks"
- [051-project-storage.md](051-project-storage.md): "Export everything"

## Done when

- Tests: the merge rules (each case above), the summary text, the reminder's 7-day and "something new" rules, single-Project file accepted before unlock.
- `npm run typecheck` and `npm test` pass.

## Resolution
**Done.** `src/backup.ts` holds the pure parts; `src/menu.ts` + `index.html` the 💾 Saves button, dialog and reminder line.

- **Export everything**: `learn-dev-backup-YYYY-MM-DD.json` = `{format: "learn-dev-backup", version: 1, progress, projects}`. `progress` is a fixed list of known keys (`passed:`/`hints:`/`snapshot:` per Lesson, `code:` per Course Script, `achievement:` per Achievement, settings `theme`, `editor:fontSize`, `sound:muted`), so `dev:sandbox-unlocked` can never get in. `projects` are the single-Project export objects plus `id`. Any Projects that exist are included even before unlock (normally none; a single Project imported before unlock would otherwise be lost). Writes `backup:last`.
- **Import everything** (`planImport`) reads and checks the whole file first, writes nothing, and returns the summary plus `apply`. A Lesson the file has passed and the browser doesn't brings in its `passed:`, `hints:`, `snapshot:`, and the `code:` of every Script up to the furthest such Lesson (code is stored per Script, not per Lesson). Achievements are the union. Settings only fill gaps. Projects: if the id isn't here, it's added under its own id, so importing the same file twice adds nothing. Same id + same content is skipped. Same id + different content comes in as "<name> (imported)" with a new id, unless that copy is already here. After a backup import the page reloads.
- Single Project files go through the same Import, and so does a file dropped on the menu (now in either mode). Before unlock: "Saved. This is a Sandbox Project; you'll find it in Sandbox after Lesson 15." After unlock it opens the Project. `importProject` was split into `checkProjectFile` + `addProjectFile(…, id?)` so both paths share the checks.
- **Reminder**: `saves:changed` is stamped by `markPassed`, `saveEarned` and every Project write. The line shows when the menu opens: 7+ days since `backup:last` with `saves:changed` newer, or "never backed up" once Lesson 1 is passed. "Not now" sets `backup:snoozed` 7 days ahead.
- Safari line (UA test) and `navigator.storage.persisted()` line are in the dialog.
- Not checked in a real browser (none in this environment).
