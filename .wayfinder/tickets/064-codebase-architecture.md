---
title: Codebase architecture pass before v2
label: build
status: closed
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

## Resolution

The `improve-codebase-architecture` skill isn't installed in this environment, so the pass was done by hand against the same list. Structure only; no behaviour change.

Done:

- **Page ↔ worker messages**: new `src/runner-protocol.ts` holds `ToWorker` and `FromWorker`, the typed union of every message each side sends. `runner.worker.ts` and `main.ts` post through typed `send` / `post` helpers, so v2's clip names and `GUI` labels become one new union member that both sides then have to handle. The start message now carries `type: "start"` (the worker read it as "anything else" before).
- **`main.ts` split**: the Course menu (carousel, Sandbox tab, replay / new-Project dialogs, keys, wheel, swipe) moved to `src/menu.ts` as `courseMenu({ lessonIndex, project, askedProject, earned, images, focusEditor })`. It returns `{ menu, openMenu, setMode }`. `toast` moved to `src/toast.ts`, since both use it. `main.ts` went from 864 to about 600 lines. 💾 Saves and the backup reminder (ticket 059) belong in `menu.ts`.
- **Shared test helpers**: `src/test-helpers.ts` has `memoryStore()` (seven copies before, across five test files) and `loadScript()` (one copy each in `course.test.ts` and `sandbox.test.ts`). `a11y.test.ts` now checks `main.ts` and `menu.ts` together, so its source checks still pass after the move.

Left alone, with reasons:

- **Lesson view, editor, Run driver and Compare stay in `main.ts`.** They all share the Monaco `models`, the `editor` and the open `project`. Splitting them now would mean passing that state through new interfaces that the Level editor (049) is about to reshape anyway. Do it with the 🗺 Level tab, which changes the same code.
- **Achievement map stays in `main.ts`.** It is about 50 lines, and `earn` is called by the Run driver. Nothing in v2 grows it apart from the count.
- **The `world` view (`World` in `engine.ts`) is still an array.** Adding `sounds`, `labels` and `keysDown` means choosing a shape, either `World` as an object or extra fields on `Run` / the checker. That choice touches every Lesson's Goals, so it belongs to tickets 054, 055 and 056, where the fields arrive. The seam already exists: `worldView()` is the one producer, and `checker` / `achievementChecker` are the only consumers.
- **Storage**: every saved thing already goes through a module function with a `store` parameter. Projects are only in `sandbox.ts` (`loadProjects` / `saveProject` / `deleteProject` / `createProject` / `duplicateProject`). The IndexedDB move (051) replaces those five functions and makes them async. That change ripples into `menu.ts` and `main.ts` on purpose, so it was not done ahead of time. Course progress and settings stay in localStorage, as 051 decided.
- **Key plans in `course.test.ts`** stay there. Only that file uses them. Chapter 2 tests can move them into `test-helpers.ts` when they need them.
