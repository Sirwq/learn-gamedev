---
title: Build the Unity-style engine core in the game worker
label: build
status: closed
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

## Resolution

- `src/engine.ts`: runtime for `Vector2` (`Add`, `Scale`), `Transform`, `MonoBehaviour`, `Time.deltaTime = 1/60`, `Input` + `KeyCode` (values are `KeyboardEvent.code`, so WASD ignores keyboard layout), per-frame key down/up via `keyEvent` / `nextFrame`, `flipY`, and `scriptSource` / `findScript`, which append a last-line export of the Script's class so the stub needs no `export` and error line numbers stay put.
- `src/engine-api.d.ts`: the student-facing typings with a one-line doc comment on every member, loaded into Monaco with `?raw` + `addExtraLib`. It is kept out of the app's tsconfig so the ambient globals don't leak into engine code; the tests compile student snippets against it with the TypeScript API instead.
- `transform.position` is the box's bottom-left corner (same as the Level box `x, y`).
- `src/runner.worker.ts` builds objects from the Level, attaches Scripts by name, runs `Start` once and then `Update` every frame, and draws filled rects with the y-flip. `src/main.ts` hard-codes the Player + ground Level and the `Player.ts` stub, and forwards `e.code`. The canvas is now 960×540.
- Tests (`src/engine.test.ts`): Vector2 maths, key held/down/up across frames including OS key repeat, flipY, finding the class, the move-right example type-checks, `position.x += 5` is a read-only error, and every typing member has a doc comment.
