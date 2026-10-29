---
title: DEV toggle that unlocks Sandbox
label: build
status: closed
blocked_by: []
assignee:
---

## What

In the dev build only (`import.meta.env.DEV`), the Course menu gets a labelled toggle "DEV: Unlock Sandbox" / "DEV: Lock Sandbox". It sets a separate `dev:sandbox-unlocked` flag in localStorage. It never marks Lesson 15 passed, is never exported, and skips the "🔓 Sandbox unlocked" toast and slide. Locking again hides Sandbox but keeps its Projects. Later v2 tickets use it to check Sandbox screens without passing the Course.

## Spec

- [060-share-project.md](060-share-project.md): "Dev unlock"
- [015-sandbox-mode.md](015-sandbox-mode.md)

## Done when

- `sandboxUnlocked` (or its caller) is true when the dev flag is set, and the flag alone never marks any Lesson passed (test).
- The toggle is absent from `npm run build` output (a test or a check on the built files).
- `npm run typecheck` and `npm test` pass.

## Resolution

`sandboxUnlocked` in `src/sandbox.ts` is also true when `import.meta.env.DEV` and `dev:sandbox-unlocked` is `"1"`; `setDevUnlock(on)` sets or removes that key. In the dev build, `courseMenu` adds a "DEV: Unlock Sandbox" / "DEV: Lock Sandbox" chip before the menu stats. It flips the flag, shows or hides the Sandbox chip, and switches back to the Course tab when locking. It never calls `markPassed`, so there is no toast, no slide and no Lesson passed, and Projects stay in storage. The toggle is made in JS inside an `import.meta.env.DEV` block, so Vite drops it from production.

- Test: `src/sandbox.test.ts` "opens with the dev flag without passing any Lesson".
- Built-files check: after `npm run build`, `grep -r "DEV: \|dev:sandbox" dist/` finds nothing. This was a manual check, not an automated test, so the test suite doesn't run a Vite build.
