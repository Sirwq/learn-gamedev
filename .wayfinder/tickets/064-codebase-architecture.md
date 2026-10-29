---
title: Codebase architecture pass before v2
label: build
status: open
blocked_by: []
assignee:
---

## How

Build ticket: run the `improve-codebase-architecture` skill over the whole repo (`src/`, tests, `index.html`, Vite config). Work through what it finds with the developer. Change structure only: the app looks and behaves exactly as it does now.

## What

- The MVP grew one ticket at a time, and `src/main.ts` (about 835 lines) holds most of the page: the Lesson view, Sandbox, Compare, 📖 Docs, Achievements, the Course menu. v2 adds a lot to it: the Level editor, own sprites, IndexedDB storage, sound, `GUI` labels, 💾 Saves and Chapter 2 ([learn-dev v2 map](../map-v2.md)). Find the seams those will need before they're built.
- Look in particular at:
  - how `main.ts` splits into modules;
  - the page ↔ worker messages in `runner.worker.ts`, which v2 grows with clip names and `GUI` labels;
  - the read-only `world` view the checker and Achievements share, which gains `sounds`, `labels` and `keysDown`;
  - where storage lives, since Projects move to IndexedDB;
  - shared test helpers, like the key plans in `course.test.ts`.
- Record what was changed and what was left alone (and why) in the Resolution.

## Done when

- The skill's findings are worked through: each one is done, or left with a reason.
- No visible change: every Lesson, Sandbox, Compare, Docs and the Course menu work as before.
- `npm run typecheck` and `npm test` pass.
