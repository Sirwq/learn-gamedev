---
title: Move Sandbox Projects to IndexedDB
label: build
status: open
blocked_by: []
assignee:
---

## What

- Add `idb-keyval`. `project:<id>` holds the Project JSON; `image:<id>:<tag>` and `image:<id>:<tag>:top` hold PNG Blobs (used by ticket 076). Duplicate writes in one `setMany`; Delete removes the Project's image keys too.
- The five Project functions in `src/sandbox.ts` (`loadProjects` / `saveProject` / `createProject` / `duplicateProject` / `deleteProject`) become async; update `menu.ts` and `main.ts`. Course progress and settings stay in localStorage.
- **Migration**: one-time copy of `sandbox:projects` under `navigator.locks.request("storage-migrate")`, `put` by existing id in one `setMany`, read back, then set `localStorage["storage:v2"]`. On failure the flag stays unset, that session uses localStorage, and it retries next load. Never delete `sandbox:projects`. Re-import Projects not yet seen while the old key exists (an old tab may still write it).
- `navigator.storage.persist()` once, on the first Project save (a user gesture), after checking `persisted()`; remember a "no".
- Writes catch `QuotaExceededError` and tell the student; no silent data loss.
- After each save, post on `BroadcastChannel("projects")` so other tabs refresh the Sandbox list.

## Spec

- [051-project-storage.md](051-project-storage.md)
- [../research/project-storage.md](../research/project-storage.md)

## Done when

- Tests (with an in-memory IndexedDB such as `fake-indexeddb`): create / duplicate / delete; migration copies, sets the flag only after read-back, is safe to run twice, and leaves `sandbox:projects` in place; a failed migration keeps Projects usable.
- `npm run typecheck` and `npm test` pass.

## Resolution
