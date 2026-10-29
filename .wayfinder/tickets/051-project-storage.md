---
title: Where do Projects with images live?
label: wayfinder:research
status: closed
blocked_by: [050]
assignee: claude
---

## Question

Projects and progress are saved in localStorage, about 5 MB per site and text only. Own sprites and bigger Levels will not fit well there. Find out: IndexedDB versus localStorage (and the Origin Private File System) for images, how browsers evict site data and how to ask for persistent storage, and whether an export / import file (one Project as a download) is enough backup with no accounts. Also: how to move existing localStorage saves over without losing anyone's progress.

Sizing from [How do students bring their own sprites?](050-own-sprites.md): images belong to one Project, one per tag plus an optional Top image, stored as PNG at most 256×256 each, and travel in the Project's export file.

## Resolution

**Projects move to IndexedDB (via `idb-keyval`); Course progress and settings stay in localStorage; backup is an Export / Import file.**

- **Store**: Projects live in IndexedDB through `idb-keyval` (under 1 KB, stores Blobs as they are). `project:<id>` holds the Project JSON; `image:<id>:<tag>` and `image:<id>:<tag>:top` hold PNG Blobs. Import and Duplicate write in one atomic `setMany`; Delete removes all of the Project's image keys.
- **Not OPFS, not localStorage for Projects**: localStorage is 5 MiB of text only; OPFS is a file API that would need our own index. IndexedDB stores objects and Blobs, shares the same quota, and its transactions keep a Project and its images in step.
- **Course progress and settings stay in localStorage** (`passed:`, `code:`, `hints:`, `snapshot:`, `achievement:`, `code-before-replay`, `editor:fontSize`, `asked-deepseek`): small text read synchronously, and a browser evicts all of a site's storage together, so moving them gains nothing.
- **Space is not the limit**: a Project with 10 images at 256×256 is about 50 KB typically, 2 MB at worst; browsers give a site gigabytes. Writes still catch `QuotaExceededError`.
- **Persistent storage**: call `navigator.storage.persist()` once, on the first Project save or image import (a user gesture), never on page load; check `persisted()` first; remember a "no" and never ask again. Chrome and Safari decide silently, Firefox shows a popup.
- **Export / Import one Project**: a single `.json` file with `format`, `version`, the Project and its images as base64 PNG data URLs; no zip. Save via Blob URL + `<a download>`; load via `<input type=file>` or a file dropped on the Sandbox list. No File System Access pickers (Chromium only). Import always makes a new Project and re-checks format, version and the 256×256 limit.
- **Export everything**: one file with every Project plus Course progress, the only way to change device or browser and the only guard against Safari's 7-day rule. Importing it adds Projects as new ones and keeps Course progress wherever the file is further along.
- **Migration**: a one-time copy of `sandbox:projects` into IndexedDB under `navigator.locks.request("storage-migrate")` (one tab runs it), `put` by existing id (safe to run twice) in one `setMany`, read back, and only then set `localStorage["storage:v2"]`. On failure the flag stays unset, Projects use localStorage that session, and it retries next load.
- **Old key kept**: `sandbox:projects` stays untouched as a fallback for a few releases; old data is never deleted on an error path.
- **Tabs in sync**: after each Project save, post on `BroadcastChannel("projects")` so other open tabs refresh the Sandbox list.
- **Open caveats**: Safari (default tracking prevention) wipes a site's storage after 7 days of Safari use without a visit; Home Screen web apps are not expected to. Private windows lose everything on close. An old-version tab open across a deploy can still write `sandbox:projects` after migration; new code should re-import Projects it hasn't seen while the old key exists. Storage is per origin, so changing the domain (even `www` vs none) resets every student. Safari and Firefox `persist()` heuristics are undocumented.

Details and sources: [research/project-storage.md](../research/project-storage.md)
