---
title: Add the Console panel with Debug.Log and runtime errors
label: build
status: open
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
