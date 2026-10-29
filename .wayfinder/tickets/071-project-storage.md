---
title: Move Sandbox Projects to IndexedDB
label: build
status: closed
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

Projects now live in IndexedDB through `idb-keyval` (`project:<id>`, `image:<id>:<tag>[:top]`); `src/sandbox.ts`'s five Project functions are async and `main.ts` / `menu.ts` await them.

- `migrateProjects()` runs at start under `navigator.locks.request("storage-migrate")`: one `setMany` of every Project by id plus a `migrated-ids` list, read back with `getMany`, then `storage:v2 = 1`. Any failure leaves the flag unset, so that session keeps using localStorage and the next load retries. `sandbox:projects` is never deleted.
- When `sandbox:projects` holds an id that isn't in `migrated-ids` (an old tab wrote it after the migration), `loadProjects` imports it. Projects deleted in IndexedDB don't come back.
- Ids begin with a strictly increasing base-36 timestamp, so IndexedDB's sorted keys keep the list oldest first.
- Duplicate writes the Project and its images in one `setMany`. Delete removes the Project's image keys as well.
- `navigator.storage.persist()` is asked for once, on the first save, after `persisted()`. The `storage:persist-asked` flag makes sure it is never asked again.
- Every save posts on `BroadcastChannel("projects")`. The menu takes its starting list from `main.ts`, reloads on a message, and redraws when the Sandbox tab is open.
- `main.ts` catches `QuotaExceededError` from Project writes with an `unhandledrejection` handler and shows a toast.
- Tests use `fake-indexeddb` and cover: create / duplicate / delete with images, localStorage before migration, migration (flag after read-back, safe twice, old key kept), a failed migration, and old-tab re-import.

