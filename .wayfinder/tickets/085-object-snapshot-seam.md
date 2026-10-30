---
title: Separate runtime object snapshots from the Objects view
label: build
status: open
blocked_by: []
assignee:
---

## What

Keep the read-only Objects view behaving the same while giving runtime object identity and DOM rendering separate modules. The worker produces small serializable snapshots; the page consumes them to update the list and details. A worker import must not bring in the DOM view implementation.

## Design constraints

- Keep stable identity for a moving object, distinct identity for duplicate tags, and correct additions and removals during Run. Stop restores the saved Level's starting objects.
- Keep selection, keyboard navigation, focus recovery, and the current lightweight list updates in the page module. Do not announce every frame to screen readers.
- Keep the page ↔ worker message shape stable. Make selection helpers private to the view module if callers do not need them; tests should exercise selection through the view interface.
- Preserve the existing read-only scope of Objects and the separate editable Sandbox Level inspector.

## Done when

- The worker imports only the snapshot module and shared snapshot type; the page imports the view module. There is no DOM dependency in the worker's snapshot module.
- Existing Objects behavior works before Run, during movement and creation/destruction, and after Stop, including duplicate tags and keyboard focus.
- Tests cover snapshot lifecycle and visible selection behavior through the two module interfaces. `npm run typecheck` and `npm test` pass; verify the Objects view in a Lesson and Sandbox Project in the browser.
