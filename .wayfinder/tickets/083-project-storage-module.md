---
title: Deepen the Project storage module
label: build
status: closed
blocked_by: []
assignee:
---

## What

Keep every Sandbox Project operation working as it does today while making Project storage one deep module. A student can create, edit, duplicate, delete, export, import, and restore Projects and their own images without seeing a change in behavior. The module owns the IndexedDB keys, localStorage migration, image blobs, and change notifications behind a small interface used by the page and backup flow.

Give Project file encoding and validation their own pure module. The backup flow uses these modules rather than knowing Project storage keys or parsing individual Project files itself. Keep Course progress and settings in their existing storage. Do not change the student Script API, saved data formats, or the UI.

## Design constraints

- Put the seam where callers request complete Project operations, including images. Do not expose IndexedDB keys, migration flags, or separate low-level storage steps to page code.
- Keep file validation and encoding independent of browser storage so invalid files are rejected before anything is written.
- Preserve the one-time migration and legacy-browser fallback, including the rule that a Project deleted after migration must not reappear.
- Keep duplicate and import writes complete: a Project and its images must either both be saved or neither be saved.
- Keep the existing cross-tab Project refresh and backup reminder signals.
- Prefer the existing IndexedDB test stand-in; add an adapter only if a second real implementation needs the seam.

## Done when

- Create, edit, duplicate, delete, export, and import work with Projects that have Scripts and own images; backup export/import still merges without overwriting existing work.
- Existing Project files and backups still load. Migration can run twice safely, and deleted migrated Projects do not return.
- Tests exercise the storage module through its interface, the pure file-format module, invalid-file no-write behavior, image copy, and backup round trips. Replace tests of moved internal helpers rather than keeping duplicate layers of tests.
- `npm run typecheck` and `npm test` pass. Verify one Project with an own image through duplicate, export, import, and backup in the browser.

## Verified

The implementation moves portable file validation and encoding to `project-file.ts` and complete Project operations to `project-storage.ts`. Level edits save Project JSON and the current image set in one transaction. Existing formats, migration, cross-tab notifications, and backup merge behavior remain covered by tests.

On 2026-10-31, `npm run typecheck` and `npm test` passed (336 passed, 70 skipped). In Chrome, a Project with Scripts and an own Player image retained that image after Duplicate and after Project export/import. The exported backup contained the original, duplicate, and imported Projects with their images; importing it into the same browser showed that nothing would be overwritten. In a fresh standard Safari session, importing that backup restored all three Projects and the Player image. Safari Private did not complete the restore, so the fresh restore check used standard Safari.
