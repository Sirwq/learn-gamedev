---
title: Read-only Object Inspector for Lessons and Sandbox
label: build
status: closed
blocked_by: [080-lessons-20-21]
assignee:
---

## What

Give students a separate **Objects** view on the Lesson and Sandbox page. After reading the Explanation, they can open it to see the objects in the current Level and inspect how each one is built, like selecting a GameObject in Unity's Hierarchy and seeing its components in the Inspector. Keep Explanation one click away; opening Objects never marks an explanation as understood or changes Lesson progress.

- Use an in-page view alongside the existing Explanation, not a browser popup. Show an object list and the selected object's read-only details. Select from the list with mouse or keyboard; clicking an object in the game view may select it too if this does not interfere with Run input.
- Show the actual properties this engine has: tag; **Transform** position (`x`, `y`); **Box / hitbox** width and height; attached Script name (or “No Script”); and its colour or image where applicable. For example, Player shows its position, 32×32 box, and `Player.ts`; Ground has no Script. Give a short “In code” hint or Docs link for `transform.position`, `gameObject.tag`, and `gameObject.w` / `h`.
- Before Run, show the Level's starting objects. During Run, show current values and objects created by `Instantiate`; remove objects destroyed during Run. Stop returns to the starting Level. Keep selection on the same runtime object while it exists; if it disappears, show a clear empty selection state. Objects with the same tag must stay distinguishable.
- Keep this view read-only in both Lessons and Sandbox. Sandbox's existing 🗺 Level inspector remains the place to edit saved Level boxes. Do not add fake Unity components: this engine's `Transform` has position but no rotation or scale, and box size is exposed as `GameObject.w` / `h` rather than a `BoxCollider2D` component.
- Keep live updates lightweight and do not announce every frame to screen readers or rebuild the focused object-list button on each update.

## Context

- `index.html` has the Explanation in `#lesson`; `src/level-view.ts` has a separate editable inspector only for the Sandbox 🗺 Level tab.
- `src/engine.ts` defines `GameObject`, `Transform`, and `worldView`; `src/runner.worker.ts` owns the live objects. If the page needs live object snapshots, extend `src/runner-protocol.ts` without changing the student's code API.
- Unity reference: [Inspector window](https://docs.unity.com/en-us/engine/6000.6/manual/unity-editor/editor-windows-views-reference/using-the-inspector) and [components](https://docs.unity.com/en-us/engine/6000.3/manual/working-with-gameobjects/unity-components/components).

## Done when

- On a Lesson and a Sandbox Project, students can switch between Explanation and Objects and inspect Player, Ground, and another object without changing code, Level data, or progress.
- A running Player's position changes in the Inspector; an instantiated object appears; a destroyed object disappears; Stop restores starting values. Duplicate tags remain individually selectable.
- The Objects view works with keyboard and screen reader labels, keeps focus stable during live updates, and has a useful empty state.
- Tests cover snapshot identity and lifecycle, and the view's stopped/running data flow. `npm run typecheck` and `npm test` pass; verify the actual page layout and selection in a browser.

## Resolution

- Added an in-page, read-only Objects view beside Explanation on Lessons and Sandbox Projects. It lists individually identified objects and shows tag, Transform position, box size, Script, colour, image type and short code hints.
- Added worker snapshots only while Objects is open, at most every six frames. Runtime object IDs survive movement; created and destroyed objects update the list. Stop restores the saved Level and its starting values. The focused list button is reused during updates.
- Kept the Sandbox 🗺 Level editor separate. Added snapshot lifecycle and selection tests.
- Verified with `npm run typecheck` and `npm test` (320 passed, 70 skipped). In Chromium, checked Lesson and Sandbox layout, keyboard selection, live Player movement, Coin creation and destruction, and Stop restoration.
