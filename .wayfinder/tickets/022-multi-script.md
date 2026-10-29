---
title: Support many Scripts, Instantiate / Destroy, and saved code
label: build
status: closed
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

## Resolution

- Engine (`src/engine.ts`): `GameObject` is now a class (`tag`, `transform`, `w`/`h`/`color`/`script` at runtime) with `static FindGameObjectsWithTag`. `Instantiate(prefab, position)` takes a box without x/y (`{ tag, w, h, color, script? }`, Script by file name); its Start runs before its first Update, on the next frame. `Destroy(obj)` marks the object, which is removed at the end of the frame like Unity. Level boxes are spawned through the same `Instantiate`. `MonoBehaviour.gameObject` added. Typings + doc comments in `engine-api.d.ts` (a `Prefab` type, with a note that Unity uses editor prefabs).
- Saved code (`src/lesson.ts`): `saveScript` stores each file under `code:<Script>`; `loadScripts(course, upTo)` returns every Script up to that Lesson, saved code first, else the stub of the first Lesson that adds it. A later Lesson's stub never replaces an existing file.
- Editor (`src/main.ts`): one tab (a `button role="tab"`) and one Monaco model per Script; models share the TS project so files type-check against each other. Edits save on change. Run sends every Script; type errors in any file block Run; a runtime error opens the right tab and puts the marker there.
- Worker: loads every Script (Instantiate may attach one no box uses) and makes the classes global, matching what the editor type-checks.
- Not done: `Debug.Log` lines don't carry a Script/line prefix (runtime errors do, as before). The page still always opens Lesson 1 (Lesson choice is the Course menu ticket).
