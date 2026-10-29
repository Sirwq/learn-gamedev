# Where do Projects with images live?

Researched 2026-10-29. Ticket: [051](../tickets/051-project-storage.md).

## TL;DR

- **Projects move to IndexedDB, through `idb-keyval`** (under 1 KB brotli'd, stores Blobs directly). Each Project's JSON and each image Blob get their own key. **Course progress and settings stay in localStorage**: they are small text, the code reads them synchronously, and all of an origin's data is evicted together anyway, so splitting them buys nothing.
- **Not OPFS.** It is Baseline and shares the same quota, but it is a file API. We would build our own index and JSON on top of it. IndexedDB already stores objects and Blobs, and its transactions keep a Project and its images consistent.
- **Space is not the problem.** A Project with 10 images at 256×256 is roughly 50 KB to 2 MB. Every browser gives an origin gigabytes. The risks are **eviction** and **the student clearing site data**.
- **Call `navigator.storage.persist()` once, on the first Project save or image import** (a user gesture), never on page load. Chrome and Safari decide silently. Firefox shows a permission popup, so ask only when there is something to keep. Never ask again after a "no".
- **Backup = Export / Import of one Project as a single `.json` file**, images as base64 data URLs inside. Plain `<a download>` and `<input type=file>` work everywhere; the File System Access pickers are Chromium-only. Add **"Export everything"** (all Projects + Course progress) as one file too: it is cheap and is the only way to move between devices or survive Safari's 7-day rule.
- **Migration**: a one-time, idempotent copy of `sandbox:projects` into IndexedDB under a Web Lock, a `storage:v2` flag written only after the copy is read back, and the old key **kept** (not deleted) for a few releases.

## 1. Where to store: localStorage vs IndexedDB vs OPFS

| | localStorage | IndexedDB | OPFS |
|---|---|---|---|
| Quota per origin | 5 MiB, strings only | Chrome/Edge: up to 60% of disk. Firefox: 10% of disk or 10 GiB per site group (50% if persistent). Safari 17+/iOS 17+: ~60% of disk (WKWebView apps ~15%) | Same quota as IndexedDB |
| Images | Only as base64 text (+33%), eats the 5 MiB fast | **Blobs stored as-is** (structured clone) | Files |
| API | Sync, blocks the main thread | Async; raw API is verbose, a wrapper fixes that | Async on main thread; sync only in workers |
| Consistency | One `setItem` per key | Transactions, `setMany` is atomic | None across files |
| Support | Everywhere | Everywhere | Baseline since March 2023, HTTPS only |

Pick IndexedDB. `idb-keyval` gives `get / set / setMany / del / keys / update`, which maps one to one onto today's `getItem / setItem` style with key prefixes. Suggested keys: `project:<id>` (the Project JSON, as now), `image:<id>:<tag>` and `image:<id>:<tag>:top` (PNG Blob). Import and Duplicate write a Project and its images with one `setMany`, so a half-copied Project cannot exist. Delete removes all `image:<id>:*` keys with it. Tests (Vitest) can use `fake-indexeddb`, or keep the injected-store pattern with an async interface.

Safari before 14 had bugs storing Blobs in IndexedDB. Safari 17+ is fine, and that is far below any version we would support.

## 2. Eviction and persistent storage

- **Default is best-effort.** Data stays until the disk is low or the browser's own cap is hit. Then Chrome, Firefox and Safari delete whole origins, **least recently used first**. An origin is deleted all at once (IndexedDB, localStorage, OPFS together), never partly. Chrome's research says best-effort data of frequently used sites is "very rarely deleted".
- **Persistent** origins are skipped by that eviction; only the user can clear them.
- **`persist()` granting**: Chrome decides silently from engagement, install or bookmark, and notification permission; a denied request can be retried later. Safari decides silently too (heuristics such as being a Home Screen web app). **Firefox shows a popup** asking the user.
- **When to call**: on a meaningful save, in a user gesture, once. web.dev advises against calling it on page load. Check `persisted()` first; remember a "no" in localStorage and do not ask again.
- **`estimate()`** gives approximate usage and quota. Use it only for a "storage used" line in settings, not for logic; always handle `QuotaExceededError` on writes instead.
- **Safari's 7-day cap (ITP)**: with tracking prevention on (the default), Safari deletes **all script-writable storage of a site**, localStorage and IndexedDB included, after seven days of Safari use without the user interacting with that site. It applies to normal first-party sites, so it applies to us. **Home Screen web apps** have their own day counter that only runs while the app is used, so their data is not expected to be deleted. Persistent mode is also excluded from eviction per WebKit's 2023 policy. A student who opens the site every week is fine; one who comes back after a month on Safari may find nothing. That is why "Export everything" matters.

## 3. Export / import as backup

- **Format: one JSON file**, `{ format: "learn-gamedev-project", version: 1, project, images: { [tag]: { main, top? } } }`, images as `data:image/png;base64,…`. Readable, diffable, no library. A zip would save little (PNG is already compressed) and needs a dependency (e.g. fflate); `CompressionStream` makes gzip, not zip.
- **Size**: a 256×256 pixel-art PNG is typically 2–20 KB; a photo-like PNG up to ~150–200 KB (raw RGBA is 256 KB). Ten images: ~50 KB typical, ~2 MB worst case, plus 33% for base64. Small enough for a download and for `JSON.parse`.
- **Saving**: `URL.createObjectURL(blob)` + `<a download="name.json">` works in all current browsers including iOS Safari. `showSaveFilePicker` / `showOpenFilePicker` (File System Access) work only in Chrome and Edge, not Firefox or Safari, and need a user gesture. Not worth a second code path.
- **Loading**: `<input type=file accept=".json,application/json">` (plus drop onto the Sandbox list). Import always creates a **new** Project with a new id, so it never overwrites. Validate `format` and `version`, re-check image sizes (≤256×256) on import.
- **Is it enough with no accounts?** For one Project, yes: it is also how students share work. As a full backup, only with **"Export everything"**: all Projects plus Course progress (`passed:`, `code:`, `hints:`, `snapshot:`, `achievement:`). One file, same format with a list. It is the only way to change device or browser, and the only cure for Safari's 7-day rule. Importing it merges: Projects added as new, Course progress taken where the file is further along.

## 4. Migrating existing saves

Today's keys (from `src/`): `sandbox:projects` (all Projects in one JSON array), `passed:<lesson>`, `code:<script>`, `hints:<lesson>`, `snapshot:<lesson>`, `code-before-replay`, `achievement:<id>`, `editor:fontSize`, `asked-deepseek`. Only `sandbox:projects` moves.

1. On start, if `localStorage["storage:v2"]` is missing, take `navigator.locks.request("storage-migrate", …)` so only one tab migrates; others wait, then see the flag and skip.
2. Inside the lock, check the flag again. Read `sandbox:projects`, write each Project with `put` by its existing id (re-running is harmless: same ids, same data). Use one `setMany` so it is all or nothing.
3. Read back the ids from IndexedDB. Only if every Project is there, set `storage:v2 = 1`.
4. **Keep `sandbox:projects`** untouched for a few releases as a fallback; remove it in a later version once IndexedDB has been the source of truth for a while. It is at most 5 MB.
5. On any failure (IndexedDB unavailable, quota, private-mode quirk): leave the flag unset, keep using localStorage for Projects this session, show nothing scary, try again next load. Never delete the old data on an error path.
6. **Other open old tabs**: an old-version tab still writing `sandbox:projects` after migration would be lost. Accept this (rare, a deploy while a tab is open), or have new code re-import any localStorage Project whose id is new or whose JSON changed on later loads, while the old key still exists.
7. **Multiple tabs after migration**: IndexedDB has no `storage` event. Post on a `BroadcastChannel("projects")` after each save so other tabs refresh the Sandbox list; handle `versionchange` by closing the DB (idb-keyval opens once and is fine at version 1).

## 5. Things that could change the decision

- **Private windows**: data is deleted when the window closes in every browser. Firefox supports IndexedDB in private windows since 2023 (encrypted on disk, wiped at the end). Safari keeps private storage in memory only. Chrome Incognito has a much smaller quota. A one-line note ("Private window: your work is lost when you close it, use Export") is enough; detection is unreliable, so it can only be a hint after a failed `persist()`.
- **"Clear cookies and site data on close"** settings wipe everything; Export is the only answer.
- **Safari 7-day cap**, see section 2. If many students are on iPads, suggesting "Add to Home Screen" is the strongest fix, and it also makes `persist()` likely to be granted.
- **Multiple origins**: storage is per origin. Moving the site to another domain (or `www` vs bare) starts every student from zero. Pick the final domain before launch, or plan an Export/Import move.

Sources:
- MDN, Storage quotas and eviction criteria: <https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria>
- web.dev, Storage for the web (2024-09-23): <https://web.dev/articles/storage-for-the-web>
- web.dev, Persistent storage: <https://web.dev/articles/persistent-storage>
- WHATWG Storage Standard: <https://storage.spec.whatwg.org/>
- WebKit, Updates to Storage Policy (Safari 17): <https://webkit.org/blog/14403/updates-to-storage-policy/>
- WebKit, Full third-party cookie blocking and more (7-day cap, Home Screen apps): <https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/>
- WebKit bug on private-mode storage being in memory: <https://bugs.webkit.org/show_bug.cgi?id=266559>
- MDN, Origin private file system: <https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system>
- MDN, showSaveFilePicker: <https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker>; support: <https://caniuse.com/native-filesystem-api>
- MDN, Web Locks API: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API>
- idb-keyval: <https://github.com/jakearchibald/idb-keyval>
- Firefox private-mode IndexedDB (secondary, DFRWS): <https://dfrws.org/?p=11917>
