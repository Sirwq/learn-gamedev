---
title: Build the Unity-style engine core in the game worker
label: build
status: open
blocked_by: []
assignee:
---

## What

Replace the bare `ctx` / `keys` globals in `src/runner.worker.ts` (the `shortcut:` comment there) with the student API from the spec: `MonoBehaviour` with `Start()` / `Update()`, `this.transform.position` as a read-only `Vector2` (`Add`, `Scale`), `Time.deltaTime` fixed at 1/60, `Input.GetKey` / `GetKeyDown` / `GetKeyUp` with `KeyCode` (arrows, WASD, Space). Objects are axis-aligned boxes drawn as filled rects in their `color`; origin bottom-left, y up, the engine flips when drawing. Canvas 960×540.

For now the Level is hard-coded in `src/main.ts`: one Player box (`script: "Player"`) and a ground box. The editor starts with a `Player.ts` stub: `class Player extends MonoBehaviour { Update() {} }`. Add Monaco typings (`addExtraLib`) for the API, with a one-line doc comment on every member (ticket 028 builds the Docs tab from these comments).

## Spec

- [002-game-api.md](002-game-api.md): API shape and names
- [004-lesson-format.md](004-lesson-format.md): Level box shape `{ tag, x, y, w, h, color, script? }`
- [001-run-student-ts.md](001-run-student-ts.md): worker + Sucrase pipeline (already built, keep it)

## Done when

- Writing `this.transform.position = this.transform.position.Add(new Vector2(100 * Time.deltaTime, 0))` in `Update()` moves the box right.
- `this.transform.position.x += 5` is a Monaco type error.
- Engine logic (Vector2 maths, key down/up/held per frame, y-flip, finding the class the student exported) has vitest tests that don't need a browser.
- `npm run typecheck` and `npm test` pass.
