---
title: DEV toggle that unlocks Sandbox
label: build
status: open
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
