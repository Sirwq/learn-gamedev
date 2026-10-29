---
title: Add the Console panel with Debug.Log and runtime errors
label: build
status: closed
blocked_by: [016-engine-core]
assignee:
---

## What

Add Unity's `Debug.Log`, `Debug.LogWarning`, `Debug.LogError` to the engine and a Console panel under the editor.

- Identical consecutive lines collapse into one with a count (`coins: 3 ×120`).
- Keep only the last 500 lines. Each Run clears it.
- Runtime errors show in red with the Script name and line (the editor marker stays as it is today).
- Type errors stay as Monaco squiggles only.

## Spec

- [005-first-course.md](005-first-course.md): the Debug.Log section
- [006-app-shell.md](006-app-shell.md): Console sits under the editor

## Done when

- Tests cover collapsing, the 500-line cap and clearing on Run, without a browser.
- `npm run typecheck` and `npm test` pass.

## Resolution

- `src/console.ts`: `addLine` collapses an identical consecutive line (same level and text) into a count and keeps the last 500. `clearLines` empties the list, and `run()` calls it at the start of every Run. `lineText` renders `coins: 3 ×120`.
- Engine: `Debug.Log` / `LogWarning` / `LogError` take any value (`String(message)`). `Vector2` prints as `(x, y)`. Calls go into a worker-side buffer that uses the same `addLine`, so a `while` loop full of logs can't grow memory without limit. The worker sends the buffer once per frame, and also just before an error so earlier lines show above it.
- Runtime errors: `errorLine` now also returns the blob URL. The worker maps it back to the Script name, and the Console shows `Player.ts:6 message` in red. The editor marker is unchanged. The error no longer goes to the header status.
- Console is a `<pre>` under the editor (yellow warnings, red errors). It follows new lines unless the student has scrolled up.
- Not done: logs from a Run the watchdog kills (endless loop) are lost with the worker.
