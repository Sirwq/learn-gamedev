---
title: Docs Sandbox page and the Example Sandbox tour Project
label: build
status: open
blocked_by: [076-own-sprites, 078-lessons-16-17, 073-saves-dialog]
assignee:
---

## How

UI ticket: follow the Vercel Web Interface Guidelines (https://vercel.com/design/guidelines) and use the `frontend-design` skill, as the [v2 map](../map-v2.md) notes say. Desktop only: no phone or small-screen layout work.

## What

- **📖 Docs → Sandbox** page, shown after unlock: a few sentences each on the Level editor, own sprites (Piskel / Aseprite), sound (the ten clip names), screen text (`OnGUI`, y-down) and sharing / backups, each linking its class page.
- **Example: Sandbox tour**: a third "+ New" choice next to Blank and My platformer. A small Level, a Player Script that plays `Jump` and `Coin`, a `HUD.ts` coin counter with `GUI.Label`, one own-sprite slot left empty with a comment saying where to set it, short plain comments. An ordinary Project. No tutorial popups or coach marks.
- The empty Sandbox menu shows one line beside "+ New": "New here? Try Example: Sandbox tour, or carry on with Chapter 2 in the Course."

## Spec

- [062-teaching-v2.md](062-teaching-v2.md): "Not Lessons"
- [060-share-project.md](060-share-project.md): the Docs share line

## Done when

- Tests: the tour Project's Scripts type-check against the student API and Run without errors headlessly; the Docs Sandbox page is hidden before unlock; the empty-menu line shows only with no Projects.
- `npm run typecheck` and `npm test` pass.

## Resolution
