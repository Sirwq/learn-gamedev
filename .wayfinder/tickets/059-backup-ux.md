---
title: How do students keep their saves safe?
label: wayfinder:grilling
status: closed
blocked_by: [051]
assignee: claude
---

## Question

[Where do Projects with images live?](051-project-storage.md) settled the store (IndexedDB for Projects, localStorage for Course progress) and the backup format (Export / Import one Project, plus Export everything), but saves can still vanish: Safari wipes a site after 7 days without a visit, private windows lose everything on close, and clearing site data or changing device loses all of it. What does the student see? Cover: where Export, Import and Export everything sit in the UI; whether and when to remind students to export (after N days, after a session with no export); whether to suggest Add to Home Screen on iPad / iPhone; whether to warn when storage is not persistent or looks like a private window, and in what words; how Export everything merges Course progress and duplicate Projects on import (per Lesson "further along", or ask); the export file's name and extension.

## Resolution

**A 💾 Saves dialog on the menu from Lesson 1, Export / Import beside the Project's other actions, one quiet reminder line, no popups or private-window detection, and a merge that never overwrites.**

- **Where the buttons sit**: one Project's **Export** is a fourth button in the Project strip: Rename / Duplicate / Export / Delete. One Project's **Import** is a third choice in the "+ New" dialog, "From a file…" (dropping a file on the Sandbox menu still works). **Export everything / Import everything** live in a **💾 Saves** dialog opened from a button beside the `🏆 n / 21 ✓ n / 15` menu stats. The dialog has both buttons, a "Last backup: …" line and one sentence on why backups matter.
- **From Lesson 1**: 💾 Saves is there before Sandbox unlocks, because Course progress, code and Achievements are just as easy to lose. Before Sandbox it backs up Course progress only.
- **Reminder**: when the menu opens, if 7+ days have passed since the last Export everything and something new was saved since then (a Lesson passed, an Achievement earned, a Project saved), one quiet line shows on the menu: "💾 Your last backup was 12 days ago · Back up now · Not now". "Not now" hides it for 7 days. It never shows as a dialog or mid-Lesson. A single Project's Export doesn't count as a full backup. With no backup yet, the line says "never backed up", but only once the first Lesson is passed.
- **Add to Home Screen**: no prompt. On Safari only, the Saves dialog has one line: "Safari clears sites you haven't visited in 7 days. Back up regularly, or add learn-dev to your Home Screen (export first, then import there)." This is because iOS Home Screen apps have their own storage, separate from Safari's.
- **Persistence and private windows**: no banners and no private-window detection (browsers don't expose it). If `navigator.storage.persisted()` is false, the Saves dialog adds one line: "Your browser may clear these saves if it runs low on space. A backup file keeps them safe."
- **Import everything merge**: Lessons are compared one at a time. If the file has a Lesson passed and the browser doesn't, the file's code, hints and snapshot for that Lesson are taken; otherwise the browser's are kept. Achievements are the union of both. A Project whose id exists with identical content is skipped. Same id with different content comes in as a new Project named "<name> (imported)". Everything else is added as new. A one-line summary comes first ("Adds 3 Lessons passed, 2 Projects. Nothing here is overwritten.") with Import / Cancel.
- **File names**: both are `.json`. One Project: `<Project name>.learn-dev.json`, with characters not allowed in file names replaced. Everything: `learn-dev-backup-YYYY-MM-DD.json`.
