---
title: Support many Scripts, Instantiate / Destroy, and saved code
label: build
status: open
blocked_by: [017-lesson-loader]
assignee:
---

## What

- One editor tab per Script file (`Player.ts`, `Enemy.ts`, `Bullet.ts`). Each file is its own Monaco model and type-checks against the others.
- Engine: `Instantiate(...)`, `Destroy(obj)`, `GameObject.FindGameObjectsWithTag(tag)`. A box's `script` field attaches a Script by file name.
- The student's code is saved in localStorage and carries over between Lessons. A new Lesson may add a new Script with its stub; it never edits existing files.
- Runtime errors and Console lines name the right Script and line.

## Spec

- [002-game-api.md](002-game-api.md): Growth across Lessons, Objects
- [004-lesson-format.md](004-lesson-format.md)

## Done when

- Tests cover: Instantiate / Destroy / FindGameObjectsWithTag in the engine; a new Lesson adding a Script without touching existing files; saved code restoring after reload.
- `npm run typecheck` and `npm test` pass.
